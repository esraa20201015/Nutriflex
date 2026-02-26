import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ActionTracked } from '../../shared/ActionTrack/action-tracked.entity';
import { NutritionPlan } from '../../nutrition-plan/entities/nutrition-plan.entity';
import { MealType } from '../enums/meal-type.enum';
import type { MealIngredient } from './meal-ingredient.entity';

/**
 * Meal – belongs to a nutrition plan (breakfast, lunch, dinner, snack).
 */
@Entity({ name: 'meal', comment: 'Meals belonging to a nutrition plan' })
export class Meal extends ActionTracked {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nutrition_plan_id', type: 'uuid', comment: 'FK to nutrition_plan' })
  nutrition_plan_id: string;

  @ManyToOne(() => NutritionPlan, (plan) => plan.meals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nutrition_plan_id' })
  nutrition_plan: NutritionPlan;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'meal_type', type: 'varchar', length: 20 })
  meal_type: MealType;

  /** Optional day index within the plan (e.g., 1 = Day 1). */
  @Column({ name: 'day_index', type: 'int', default: 1 })
  day_index: number;

  @Column({ name: 'calories', type: 'int', nullable: true })
  calories: number | null;

  @Column({ name: 'protein', type: 'decimal', precision: 8, scale: 2, nullable: true })
  protein: number | null;

  @Column({ name: 'carbs', type: 'decimal', precision: 8, scale: 2, nullable: true })
  carbs: number | null;

  @Column({ name: 'fats', type: 'decimal', precision: 8, scale: 2, nullable: true })
  fats: number | null;

  @Column({ name: 'instructions', type: 'text', nullable: true })
  instructions: string | null;

  @Column({ name: 'order_index', type: 'int', default: 0 })
  order_index: number;

  /** Structured ingredients attached to this meal (optional, for detailed meal breakdown). */
  @OneToMany('MealIngredient', 'meal')
  ingredients: MealIngredient[];
}
