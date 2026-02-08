import { Module } from '@nestjs/common';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { DataSeedingService } from './seeding/data-seeding.service';

@Module({
  imports: [RolesModule, UsersModule],
  providers: [DataSeedingService],
})
export class DatabaseModule {}
