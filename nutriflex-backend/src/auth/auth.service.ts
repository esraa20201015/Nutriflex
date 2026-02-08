import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService, normalizeEmail } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { ProfilesService } from '../profiles/profiles.service';
import { EmailService } from '../common/services/email.service';
import { User } from '../users/entities/user.entity';
import { UserStatus } from '../users/enums/user-status.enum';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly profilesService: ProfilesService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(dto: SignUpDto) {
    const email = normalizeEmail(dto.email);
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException({
        status: HttpStatus.CONFLICT,
        messageEn: 'Email already registered',
        messageAr: 'البريد الإلكتروني مسجل مسبقاً',
      });
    }

    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        messageEn: 'Password and confirm password do not match',
        messageAr: 'كلمة المرور وتأكيد كلمة المرور غير متطابقين',
        message: ['Password and confirm password do not match'],
      });
    }

    const role = await this.rolesService.findByName(dto.role);
    if (!role) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        messageEn: 'Invalid role. Use COACH or TRAINEE',
        messageAr: 'الدور غير صالح. استخدم COACH أو TRAINEE',
        message: ['Invalid role. Use COACH or TRAINEE.'],
      });
    }

    if (dto.role === 'COACH' && !dto.coachProfile) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        messageEn: 'Coach profile is required for COACH sign-up',
        messageAr: 'ملف المدرب مطلوب للتسجيل كمدرب',
        message: ['Coach profile (fullName) is required for COACH sign-up.'],
      });
    }

    if (dto.role === 'TRAINEE' && !dto.traineeProfile) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        messageEn: 'Trainee profile is required for TRAINEE sign-up',
        messageAr: 'ملف المتدرب مطلوب للتسجيل كمتدرب',
        message: ['Trainee profile (age, gender, height, weight, fitnessGoals) is required for TRAINEE sign-up.'],
      });
    }

    // Combine firstName and lastName if fullName is not provided
    let fullName = dto.fullName?.trim();
    if (!fullName || fullName === '') {
      const firstName = dto.firstName?.trim() || '';
      const lastName = dto.lastName?.trim() || '';
      fullName = [firstName, lastName].filter((part) => !!part).join(' ').trim();
    }

    // Ensure fullName is not empty
    if (!fullName || fullName === '') {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        messageEn: 'Full name is required. Please provide fullName or both firstName and lastName',
        messageAr: 'الاسم الكامل مطلوب. يرجى تقديم الاسم الكامل أو الاسم الأول والأخير',
        message: ['Full name is required'],
      });
    }

    // Check if email verification is enabled (default: true, can be disabled via env)
    const enableEmailVerification = process.env.ENABLE_EMAIL_VERIFICATION !== 'false';

    const createResult = await this.usersService.create({
      fullName,
      email: dto.email,
      password: dto.password,
      roleId: role.id,
      isEmailVerified: !enableEmailVerification, // If verification disabled, mark as verified immediately
      status: UserStatus.ACTIVE,
    });

    const createdUser = (createResult as { data?: User }).data;
    if (!createdUser?.id) {
      throw new BadRequestException({
        message: ['User creation failed'],
      });
    }

    // Generate and save verification token if email verification is enabled
    if (enableEmailVerification) {
      const verificationToken = this.usersService.generateVerificationToken();
      await this.usersService.saveVerificationToken(createdUser.id, verificationToken, 24);
      // Send verification email (non-blocking - won't fail sign-up if email fails)
      await this.emailService.sendVerificationEmail(
        createdUser.email,
        createdUser.fullName,
        verificationToken,
      );
    }

    if (dto.role === 'COACH') {
      const cp = dto.coachProfile!;
      await this.profilesService.createCoachProfile(createdUser.id, {
        full_name: cp.fullName || fullName, // Use coach profile fullName or fallback to user fullName
        bio: cp.bio ?? null,
        specialization: cp.specialization ?? null,
        years_of_experience: cp.yearsOfExperience ?? null,
        certifications: cp.certifications ?? null,
        profile_image_url: cp.profileImageUrl ?? null,
        status: true, // Default to active for new signups
      });
    } else {
      const tp = dto.traineeProfile!;
      await this.profilesService.createTraineeProfile(createdUser.id, {
        full_name: tp.fullName || fullName,
        gender: tp.gender,
        date_of_birth: tp.dateOfBirth,
        height_cm: tp.heightCm ?? null,
        weight_kg: tp.weightKg ?? null,
        fitness_goal: tp.fitnessGoal ?? null,
        activity_level: tp.activityLevel ?? null,
        medical_notes: tp.medicalNotes ?? null,
      });
    }

    const responseMessage = enableEmailVerification
      ? 'User registered successfully. Please check your email to verify your account.'
      : 'User registered successfully';

    return {
      status: HttpStatus.CREATED,
      messageEn: responseMessage,
      messageAr: enableEmailVerification
        ? 'تم التسجيل بنجاح. يرجى التحقق من بريدك الإلكتروني للتحقق من حسابك.'
        : 'تم التسجيل بنجاح',
      data: {
        id: createdUser.id,
        fullName: createdUser.fullName || createdUser.email?.split('@')[0] || 'User',
        email: createdUser.email,
        role: dto.role,
        isEmailVerified: !enableEmailVerification,
      },
    };
  }

  async signIn(dto: SignInDto) {
    try {
      const email = normalizeEmail(dto.email);
      const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException({
        status: HttpStatus.UNAUTHORIZED,
        messageEn: 'Invalid credentials',
        messageAr: 'بيانات الدخول غير صحيحة',
      });
    }

    const match = await bcrypt.compare(dto.password, user.passwordHash);
    if (!match) {
      throw new UnauthorizedException({
        status: HttpStatus.UNAUTHORIZED,
        messageEn: 'Invalid credentials',
        messageAr: 'بيانات الدخول غير صحيحة',
      });
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenException({
        status: HttpStatus.FORBIDDEN,
        messageEn: 'Email not verified',
        messageAr: 'يرجى تأكيد البريد الإلكتروني',
      });
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException({
        status: HttpStatus.FORBIDDEN,
        messageEn: 'Account inactive',
        messageAr: 'الحساب غير نشط',
      });
    }

    // Get role name - role should be loaded from findByEmail
    let roleName = 'USER';
    if (user.role && typeof user.role === 'object' && 'name' in user.role) {
      roleName = (user.role as { name: string }).name;
    } else {
      // Fallback: load role if not already loaded
      try {
        const userWithRole = await this.usersService.findUserByIdWithRole(user.id);
        roleName = userWithRole?.role?.name ?? 'USER';
      } catch (error) {
        console.error('Error loading user role:', error);
        // Use default role if loading fails
        roleName = 'USER';
      }
    }

    const payload = { sub: user.id, role: roleName };
    let access_token: string;
    try {
      // Verify payload is valid
      if (!user.id) {
        throw new Error('User ID is missing');
      }
      if (!roleName) {
        roleName = 'USER'; // Default role
      }
      
      // Get JWT secret from config service
      const jwtSecret = this.configService.get<string>('JWT_SECRET') || 'change-me-in-production';
      const jwtExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN')
        ? Number(this.configService.get<string>('JWT_EXPIRES_IN')) || 604800
        : 604800;
      
      if (!jwtSecret || jwtSecret === 'change-me-in-production') {
        console.warn('⚠️  WARNING: Using default JWT_SECRET. Set JWT_SECRET in .env!');
      }
      
      // Sign the token with explicit secret (fallback if global config doesn't work)
      access_token = this.jwtService.sign(payload, {
        secret: jwtSecret,
        expiresIn: jwtExpiresIn,
      });
    } catch (error) {
      console.error('JWT Signing Error Details:');
      console.error('- Error:', error);
      console.error('- Error message:', error instanceof Error ? error.message : 'Unknown');
      console.error('- Error stack:', error instanceof Error ? error.stack : 'No stack');
      console.error('- Payload:', JSON.stringify(payload));
      console.error('- User ID:', user.id);
      console.error('- Role Name:', roleName);
      console.error('- JWT_SECRET from config:', this.configService.get<string>('JWT_SECRET') ? '***' : 'NOT SET');
      console.error('- JWT_SECRET from env:', process.env.JWT_SECRET ? '***' : 'NOT SET');
      
      throw new BadRequestException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Failed to generate access token: ' + (error instanceof Error ? error.message : 'Unknown error'),
        messageAr: 'فشل في إنشاء رمز الوصول',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    try {
      await this.usersService.updateLastLoginAt(user.id);
    } catch (error) {
      // Log but don't fail sign-in if last login update fails
      console.error('Error updating last login:', error);
    }

      // Ensure fullName is always present (fallback to email if missing)
      const displayName = user.fullName?.trim() || user.email?.split('@')[0] || 'User';

      return {
        status: HttpStatus.OK,
        messageEn: 'Sign in successful',
        messageAr: 'تم تسجيل الدخول بنجاح',
        data: {
          access_token,
          user: {
            id: user.id,
            fullName: displayName,
            email: user.email,
            role: roleName,
          },
        },
      };
    } catch (error) {
      // Re-throw known exceptions (UnauthorizedException, ForbiddenException, etc.)
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      // Log unexpected errors and throw generic error
      console.error('Unexpected error in signIn:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw new BadRequestException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'An error occurred during sign in',
        messageAr: 'حدث خطأ أثناء تسجيل الدخول',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.verifyEmailByToken(token);
    if (!user) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        messageEn: 'Invalid or expired verification token',
        messageAr: 'رمز التحقق غير صالح أو منتهي الصلاحية',
      });
    }
    return {
      status: HttpStatus.OK,
      messageEn: 'Email verified successfully',
      messageAr: 'تم تأكيد البريد الإلكتروني بنجاح',
      data: { email: user.email },
    };
  }

  async signOut() {
    // Since JWTs are stateless, sign-out is primarily handled client-side
    // by removing the token from storage. This endpoint serves as a confirmation.
    // In the future, you could implement token blacklisting here if needed.
    return {
      status: HttpStatus.OK,
      messageEn: 'Sign out successful',
      messageAr: 'تم تسجيل الخروج بنجاح',
      data: null,
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException({
        status: HttpStatus.UNAUTHORIZED,
        messageEn: 'User not found',
        messageAr: 'المستخدم غير موجود',
      });
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException({
        status: HttpStatus.UNAUTHORIZED,
        messageEn: 'Current password is incorrect',
        messageAr: 'كلمة المرور الحالية غير صحيحة',
      });
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        messageEn: 'New password must be different from current password',
        messageAr: 'يجب أن تكون كلمة المرور الجديدة مختلفة عن الحالية',
      });
    }

    const updateResult = await this.usersService.update(userId, {
      password: dto.newPassword,
    });

    if ((updateResult as { status?: number }).status !== HttpStatus.OK) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        messageEn: 'Failed to update password',
        messageAr: 'فشل في تحديث كلمة المرور',
        data: updateResult,
      });
    }

    return {
      status: HttpStatus.OK,
      messageEn: 'Password updated successfully',
      messageAr: 'تم تحديث كلمة المرور بنجاح',
      data: null,
    };
  }
}
