import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RolesGuard } from './roles.guard';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { BodyMeasurementModule } from '../body-measurement/body-measurement.module';
import { EmailModule } from '../common/services/email.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => RolesModule),
    ProfilesModule,
    BodyMeasurementModule,
    JwtModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, RolesGuard],
  exports: [AuthService, RolesGuard],
})
export class AuthModule {}
