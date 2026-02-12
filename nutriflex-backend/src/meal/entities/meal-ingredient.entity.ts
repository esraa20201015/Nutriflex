import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActionTracked } from '../../shared/ActionTrack/action-tracked.entity';
import { Meal } from './meal.entity';

/**
 * MealIngredient – structured ingredient rows that belong to a specific meal.
 *
 * This allows the Coach Plans UI to store a detailed list of ingredients
 * (name, quantity, unit, calories, notes) without changing the existing
 * meal fields or breaking current APIs.
 */
@Entity({ name: 'meal_ingredient', comment: 'Structured ingredients for a specific meal' })
export class MealIngredient extends ActionTracked {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'meal_id', type: 'uuid', comment: 'FK to meal table' })
  meal_id: string;

  @ManyToOne(() => Meal, (meal) => meal.ingredients, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meal_id' })
  meal: Meal;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'quantity', type: 'decimal', precision: 10, scale: 2, nullable: true })
  quantity: number | null;

  @Column({ name: 'unit', type: 'varchar', length: 50, nullable: true })
  unit: string | null;

  @Column({ name: 'calories', type: 'int', nullable: true })
  calories: number | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'order_index', type: 'int', default: 0 })
  order_index: number;
}

