import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoachProfile } from './entities/coach-profile.entity';
import { TraineeProfile } from './entities/trainee-profile.entity';
import { ProfilesService } from './profiles.service';
import { CoachProfilesRepo } from './coach-profiles.repo';
import { CoachProfilesService } from './coach-profiles.service';
import { CoachProfilesController } from './coach-profiles.controller';
import { TraineeProfilesRepo } from './trainee-profiles.repo';
import { TraineeProfilesService } from './trainee-profiles.service';
import { TraineeProfilesController } from './trainee-profiles.controller';
import { AuthModule } from '../auth/auth.module';
import { CurrentProfileController } from './current-profile.controller';
import { UsersModule } from '../users/users.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([CoachProfile, TraineeProfile]),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [CoachProfilesController, TraineeProfilesController, CurrentProfileController],
  providers: [
    ProfilesService,
    CoachProfilesRepo,
    CoachProfilesService,
    TraineeProfilesRepo,
    TraineeProfilesService,
  ],
  exports: [ProfilesService],
})
export class ProfilesModule {}

