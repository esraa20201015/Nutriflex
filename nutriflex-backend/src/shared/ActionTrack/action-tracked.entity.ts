import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Base entity for created_date and updated_date audit fields.
 * Extend this for entities that follow the project template.
 */
export abstract class ActionTracked {
  @CreateDateColumn({ name: 'created_date', type: 'timestamptz' })
  created_date: Date;

  @UpdateDateColumn({ name: 'updated_date', type: 'timestamptz' })
  updated_date: Date;
}
