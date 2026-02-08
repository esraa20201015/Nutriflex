import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RolesRepo } from './roles.repo';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    forwardRef(() => AuthModule),
  ],
  controllers: [RolesController],
  providers: [RolesRepo, RolesService],
  exports: [RolesService],
})
export class RolesModule {}
