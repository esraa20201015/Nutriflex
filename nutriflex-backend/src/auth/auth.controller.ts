import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Public } from './public.decorator';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Request } from 'express';
import { RequestUser } from './types/request-user.interface';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @Public()
  @ApiOperation({
    summary: 'Register as Coach or Trainee',
    description: 'Register a new user account. Select role (COACH or TRAINEE) and provide required profile data based on the selected role.',
  })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      example: {
        status: 201,
        messageEn: 'User registered successfully',
        messageAr: 'تم التسجيل بنجاح',
        data: {
          id: 'uuid',
          fullName: 'John Doe',
          email: 'user@example.com',
          role: 'TRAINEE',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error or missing required fields' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Post('sign-in')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sign in with email and password',
    description: 'Authenticate an existing user with email and password. Returns JWT access token and user information.',
  })
  @ApiBody({ type: SignInDto })
  @ApiResponse({
    status: 200,
    description: 'Returns access_token and user info',
    schema: {
      example: {
        status: 200,
        messageEn: 'Sign in successful',
        messageAr: 'تم تسجيل الدخول بنجاح',
        data: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 'uuid',
            fullName: 'John Doe',
            email: 'user@example.com',
            role: 'TRAINEE',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials (email or password incorrect)' })
  @ApiResponse({ status: 403, description: 'Email not verified or account inactive' })
  async signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  @Get('verify-email')
  @Public()
  @ApiOperation({ summary: 'Verify email with token from verification link' })
  @ApiQuery({ name: 'token', required: true })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sign out current user',
    description: 'Sign out the currently authenticated user. Since JWTs are stateless, this endpoint mainly serves as a confirmation. The client should remove the token from storage.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sign out successful',
    schema: {
      example: {
        status: 200,
        messageEn: 'Sign out successful',
        messageAr: 'تم تسجيل الخروج بنجاح',
        data: null,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async signOut() {
    return this.authService.signOut();
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change current user password' })
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(
    @Req() req: Request & { user?: RequestUser },
    @Body() dto: ChangePasswordDto,
  ) {
    const user = req.user;
    if (!user || !user.id) {
      throw new ForbiddenException({
        status: HttpStatus.FORBIDDEN,
        messageEn: 'User not authenticated',
        messageAr: 'المستخدم غير مصادق عليه',
      });
    }
    return this.authService.changePassword(user.id, dto);
  }
}
