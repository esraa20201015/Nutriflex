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
 * Trainee profile – personal + health info for users with TRAINEE role.
 * One-to-one with User (only for users with role = TRAINEE).
 */
@Entity({ name: 'trainee_profiles', comment: 'This table stores trainee profile records' })
export class TraineeProfile extends ActionTracked {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Foreign key to users table - One-to-One relationship */
  @Column({ name: 'user_id', type: 'uuid', unique: true, comment: 'Foreign key to users table' })
  user_id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /** Trainee full name (duplicated for reporting convenience) */
  @Column('varchar', {
    name: 'full_name',
    length: 255,
    nullable: false,
    comment: 'Trainee full name',
  })
  full_name: string;

  /** Gender */
  @Column('varchar', {
    name: 'gender',
    length: 20,
    nullable: false,
    comment: 'Gender',
  })
  gender: string;

  /** Date of birth */
  @Column('date', {
    name: 'date_of_birth',
    nullable: false,
    comment: 'Date of birth',
  })
  date_of_birth: string;

  /** Height in centimeters */
  @Column('numeric', {
    name: 'height_cm',
    precision: 6,
    scale: 2,
    nullable: true,
    comment: 'Height in centimeters',
  })
  height_cm: number | null;

  /** Weight in kilograms */
  @Column('numeric', {
    name: 'weight_kg',
    precision: 6,
    scale: 2,
    nullable: true,
    comment: 'Weight in kilograms',
  })
  weight_kg: number | null;

  /** Primary fitness goal (e.g., lose weight, build muscle) */
  @Column('text', {
    name: 'fitness_goal',
    nullable: true,
    comment: 'Primary fitness goal',
  })
  fitness_goal: string | null;

  /** Activity level (e.g., sedentary, lightly_active, very_active) */
  @Column('varchar', {
    name: 'activity_level',
    length: 50,
    nullable: true,
    comment: 'Activity level',
  })
  activity_level: string | null;

  /** Dietary preference (e.g., normal, vegetarian) */
  @Column('varchar', {
    name: 'dietary_preference',
    length: 50,
    nullable: true,
    comment: 'Dietary preference (normal, vegetarian, etc.)',
  })
  dietary_preference: string | null;

  /** Medical notes (injuries, conditions, etc.) */
  @Column('text', {
    name: 'medical_notes',
    nullable: true,
    comment: 'Medical notes and important health info',
  })
  medical_notes: string | null;
}

