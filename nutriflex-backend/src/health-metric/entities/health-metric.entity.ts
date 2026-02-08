import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ActionTracked } from '../../shared/ActionTrack/action-tracked.entity';
import { HealthMetricType } from '../enums/health-metric-type.enum';

/**
 * Health metric – tracks trainee progress over time (weight, steps, heart rate, blood pressure, etc.).
 */
@Entity({ name: 'health_metric', comment: 'This table stores health metrics for trainees over time' })
export class HealthMetric extends ActionTracked {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Foreign key to users table (trainee) */
  @Column({ name: 'trainee_id', type: 'uuid', comment: 'Foreign key to users table (trainee)' })
  trainee_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trainee_id' })
  trainee: User;

  @Column('varchar', { name: 'metric_type', length: 20 })
  metric_type: HealthMetricType;

  /** Numeric value for the metric (e.g. 70, 10000, 72). */
  @Column('numeric', { name: 'value', precision: 12, scale: 2 })
  value: number;

  /** Unit of the metric (e.g. kg, steps, bpm, mmHg). */
  @Column('varchar', { name: 'unit', length: 50 })
  unit: string;

  /** When this metric was recorded. */
  @Column('timestamptz', { name: 'recorded_date' })
  recorded_date: Date;
}

