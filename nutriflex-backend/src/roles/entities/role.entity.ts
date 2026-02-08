import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RoleStatus } from '../enums/role-status.enum';
import { User } from '../../users/entities/user.entity';

/**
 * Role entity – stores role definitions (e.g. ADMIN, COACH, TRAINEE).
 * One role can be assigned to many users (users.role_id FK).
 */
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Role name (e.g. ADMIN, COACH, TRAINEE). Unique. */
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  /** Optional description of what the role allows. */
  @Column({ type: 'text', nullable: true })
  description: string | null;

  /** Whether the role is active or inactive (soft delete / disabling). */
  @Column({ type: 'varchar', length: 20, default: RoleStatus.ACTIVE })
  status: RoleStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  /** Admin user who created the role (audit). */
  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  /** Admin user who last updated the role (audit). */
  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string | null;

  /** Users that have this role (one-to-many). */
  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
