import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ActionTracked } from '../../shared/ActionTrack/action-tracked.entity';
import { TraineePlanStatusEnum } from '../enums/trainee-plan-status.enum';

/**
 * Trainee plan status – tracks how a trainee is progressing on an assigned plan.
 */
@Entity({ name: 'trainee_plan_status', comment: 'Tracks trainee interaction with assigned plans' })
export class TraineePlanStatus extends ActionTracked {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Foreign key to users table (trainee) */
  @Column({ name: 'trainee_id', type: 'uuid', comment: 'Foreign key to users table (trainee)' })
  trainee_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trainee_id' })
  trainee: User;

  /**
   * Plan ID – references either nutrition_plan.id or an exercise/other plan ID.
   * Stored as generic UUID (no hard FK to allow multiple plan types).
   */
  @Column({ name: 'plan_id', type: 'uuid', comment: 'ID of the assigned plan (nutrition or exercise plan)' })
  plan_id: string;

  /** Completion percentage (0–100) */
  @Column('int', {
    name: 'completion_percentage',
    nullable: false,
    default: 0,
    comment: 'Completion percentage of the plan (0–100)',
  })
  completion_percentage: number;

  /** Status: not_started, in_progress, completed */
  @Column('varchar', {
    name: 'status',
    length: 20,
    nullable: false,
    default: TraineePlanStatusEnum.NOT_STARTED,
    comment: 'Status of the plan for this trainee',
  })
  status: TraineePlanStatusEnum;

  /** Last interaction/update timestamp for this status record */
  @Column('timestamptz', {
    name: 'last_updated',
    nullable: true,
    comment: 'When the status was last updated',
  })
  last_updated: Date | null;
}

