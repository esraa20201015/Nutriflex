import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ActionTracked } from '../../shared/ActionTrack/action-tracked.entity';

/**
 * Body measurement – tracks physical measurements (chest, waist, hips, etc.) for trainees.
 */
@Entity({ name: 'body_measurement', comment: 'Physical body measurements for trainees over time' })
export class BodyMeasurement extends ActionTracked {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Foreign key to users table (trainee) */
  @Column({ name: 'trainee_id', type: 'uuid', comment: 'Foreign key to users table (trainee)' })
  trainee_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trainee_id' })
  trainee: User;

  @Column('numeric', {
    name: 'chest_cm',
    precision: 6,
    scale: 2,
    nullable: true,
    comment: 'Chest circumference in centimeters',
  })
  chest_cm: number | null;

  @Column('numeric', {
    name: 'waist_cm',
    precision: 6,
    scale: 2,
    nullable: true,
    comment: 'Waist circumference in centimeters',
  })
  waist_cm: number | null;

  @Column('numeric', {
    name: 'hips_cm',
    precision: 6,
    scale: 2,
    nullable: true,
    comment: 'Hips circumference in centimeters',
  })
  hips_cm: number | null;

  @Column('numeric', {
    name: 'arm_cm',
    precision: 6,
    scale: 2,
    nullable: true,
    comment: 'Arm circumference in centimeters',
  })
  arm_cm: number | null;

  @Column('numeric', {
    name: 'thigh_cm',
    precision: 6,
    scale: 2,
    nullable: true,
    comment: 'Thigh circumference in centimeters',
  })
  thigh_cm: number | null;

  /** When this measurement snapshot was taken */
  @Column('timestamptz', {
    name: 'measured_date',
    nullable: false,
    comment: 'When these measurements were taken',
  })
  measured_date: Date;
}

