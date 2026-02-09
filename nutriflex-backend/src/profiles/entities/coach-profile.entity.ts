import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ActionTracked } from '../../shared/ActionTrack/action-tracked.entity';

/**
 * Coach profile – professional details for users with COACH role.
 * One-to-one with User (only for users with role = COACH).
 */
@Entity({ name: 'coach_profiles', comment: 'This table stores coach profile records' })
export class CoachProfile extends ActionTracked {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Foreign key to users table - One-to-One relationship */
  @Column({ name: 'user_id', type: 'uuid', unique: true, comment: 'Foreign key to users table' })
  user_id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /** Full name of the coach */
  @Column('varchar', {
    name: 'full_name',
    length: 255,
    nullable: false,
    comment: 'Coach full name',
  })
  full_name: string;

  /** Professional biography */
  @Column('text', {
    name: 'bio',
    nullable: true,
    comment: 'Professional biography',
  })
  bio: string | null;

  /** Area of specialization (e.g., "Strength Training", "Nutrition") */
  @Column('varchar', {
    name: 'specialization',
    length: 255,
    nullable: true,
    comment: 'Area of specialization',
  })
  specialization: string | null;

  /** Years of professional experience */
  @Column('int', {
    name: 'years_of_experience',
    nullable: true,
    comment: 'Years of professional experience',
  })
  years_of_experience: number | null;

  /** Certifications and qualifications (text description) */
  @Column('text', {
    name: 'certifications',
    nullable: true,
    comment: 'Certifications and qualifications',
  })
  certifications: string | null;

  /** Certification document/image as base64 data URL (upload) */
  @Column('text', {
    name: 'certification_document',
    nullable: true,
    comment: 'Uploaded certification image/document as base64 data URL',
  })
  certification_document: string | null;

  /** Profile image: URL or base64 data URL (data:image/...;base64,...) for upload */
  @Column('text', {
    name: 'profile_image_url',
    nullable: true,
    comment: 'Profile image URL or base64 data URL',
  })
  profile_image_url: string | null;

  /** Profile status: true = Active, false = Inactive */
  @Column('boolean', {
    name: 'status',
    default: true,
    comment: 'Status: true = Active, false = Inactive',
  })
  status: boolean;
}
