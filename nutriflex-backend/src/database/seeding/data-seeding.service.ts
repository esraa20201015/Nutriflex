import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RolesService } from '../../roles/roles.service';
import { UsersService, normalizeEmail } from '../../users/users.service';
import { UserStatus } from '../../users/enums/user-status.enum';

/**
 * Admin user seed data
 */
const ADMIN_USER = {
  email: 'esraa.amunem@gmail.com',
  password: 'Aa@12345',
  fullName: 'Admin User',
};

/**
 * Orchestrates all data seeding on application bootstrap.
 * Add new seed steps here (e.g. seedAdminUser, seedSampleData).
 */
@Injectable()
export class DataSeedingService implements OnModuleInit {
  private readonly logger = new Logger(DataSeedingService.name);

  constructor(
    private readonly rolesService: RolesService,
    private readonly usersService: UsersService,
  ) {}

  async onModuleInit(): Promise<void> {
    const runSeed = process.env.RUN_SEED === 'true';
    if (!runSeed) {
      this.logger.log('Seeding skipped (set RUN_SEED=true to enable)');
      return;
    }
    try {
      await this.runAllSeeds();
    } catch (error) {
      this.logger.error('Data seeding failed', error instanceof Error ? error.stack : error);
      throw error;
    }
  }

  private async runAllSeeds(): Promise<void> {
    // Seed roles first (ADMIN, COACH, TRAINEE)
    await this.rolesService.seedRoles();
    this.logger.log('✅ Roles seeded');

    // Seed admin user
    await this.seedAdminUser();
    this.logger.log('✅ Admin user seeded');

    this.logger.log('✅ Data seeding completed');
  }

  /**
   * Seed admin user if it doesn't exist
   */
  private async seedAdminUser(): Promise<void> {
    const normalizedEmail = normalizeEmail(ADMIN_USER.email);
    const existingUser = await this.usersService.findByEmail(normalizedEmail);

    if (existingUser) {
      this.logger.log(`Admin user already exists: ${ADMIN_USER.email}`);
      return;
    }

    // Get ADMIN role
    const adminRole = await this.rolesService.findByName('ADMIN');
    if (!adminRole) {
      this.logger.error('ADMIN role not found. Make sure roles are seeded first.');
      throw new Error('ADMIN role not found');
    }

    // Create admin user (UsersService will hash the password)
    const result = await this.usersService.create({
      fullName: ADMIN_USER.fullName,
      email: ADMIN_USER.email,
      password: ADMIN_USER.password,
      roleId: adminRole.id,
      status: UserStatus.ACTIVE,
      isEmailVerified: true, // Admin user is pre-verified
    });

    if ((result as { status?: number }).status === 201) {
      this.logger.log(`✅ Admin user created: ${ADMIN_USER.email}`);
      this.logger.log(`   Email: ${ADMIN_USER.email}`);
      this.logger.log(`   Password: ${ADMIN_USER.password}`);
      this.logger.log(`   Role: ADMIN`);
    } else {
      this.logger.error('Failed to create admin user', result);
      throw new Error('Failed to create admin user');
    }
  }
}
