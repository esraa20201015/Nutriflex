import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserStatus } from '../enums/user-status.enum';
import { Role } from '../../roles/entities/role.entity';

/**
 * User entity – stores authentication data securely.
 * Each user has exactly one role (role_id FK); each role can have many users.
 * No separate salt column: bcrypt/Argon2 embed salt in the hash.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName: string;

  /** Avatar image: URL or base64 data URL (data:image/...;base64,...) for upload */
  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string | null;

  /** Unique login identifier. Normalize (lowercase, trim) in app layer before save/search. */
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  /** bcrypt or Argon2 hash. Salt is embedded in the hash string. */
  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  /** Email confirmation status. Use to control login before confirmation. */
  @Column({ name: 'is_email_verified', type: 'boolean', default: false })
  isEmailVerified: boolean;

  /** Token for email verification link (optional). */
  @Column({ name: 'email_verification_token', type: 'varchar', length: 255, nullable: true })
  emailVerificationToken: string | null;

  @Column({ name: 'email_verification_expires', type: 'timestamptz', nullable: true })
  emailVerificationExpires: Date | null;

  /** Account status for soft delete and locking. */
  @Column({ type: 'varchar', length: 20, default: UserStatus.ACTIVE })
  status: UserStatus;

  /** Every user has exactly one role (role_id FK). */
  @ManyToOne(() => Role, (role) => role.users, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  /** Last login timestamp for security audits and cleanups. */
  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  /** User/admin who created the record. */
  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  /** User/admin who last updated the record. */
  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string | null;
}
