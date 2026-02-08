import { Injectable, HttpStatus } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Exercise } from './entities/exercise.entity';
import { ExerciseType } from './enums/exercise-type.enum';

@Injectable()
export class ExerciseRepo extends Repository<Exercise> {
  constructor(private dataSource: DataSource) {
    super(Exercise, dataSource.createEntityManager());
  }

  async createEntity(dto: Partial<Exercise>) {
    try {
      const entity = this.create({
        coach_id: dto.coach_id,
        trainee_id: dto.trainee_id,
        name: dto.name,
        exercise_type: dto.exercise_type,
        sets: dto.sets ?? null,
        reps: dto.reps ?? null,
        duration_minutes: dto.duration_minutes ?? null,
        instructions: dto.instructions ?? null,
      });

      const saved = await this.save(entity);
      const result = await this.findOne({
        where: { id: saved.id },
        relations: ['coach', 'trainee'],
      });

      return {
        status: HttpStatus.CREATED,
        messageEn: 'Exercise created successfully',
        messageAr: 'تم إنشاء التمرين بنجاح',
        data: result,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error creating exercise',
        messageAr: 'خطأ في إنشاء التمرين',
        error: (error as Error).message,
      };
    }
  }

  async findAll(options?: {
    skip?: number;
    take?: number;
    exercise_type?: ExerciseType;
    coach_id?: string;
    trainee_id?: string;
  }) {
    try {
      const query = this.createQueryBuilder('exercise')
        .leftJoinAndSelect('exercise.coach', 'coach')
        .leftJoinAndSelect('exercise.trainee', 'trainee');

      if (options?.exercise_type !== undefined) {
        query.andWhere('exercise.exercise_type = :exercise_type', {
          exercise_type: options.exercise_type,
        });
      }

      if (options?.coach_id) {
        query.andWhere('exercise.coach_id = :coach_id', { coach_id: options.coach_id });
      }

      if (options?.trainee_id) {
        query.andWhere('exercise.trainee_id = :trainee_id', { trainee_id: options.trainee_id });
      }

      if (options?.skip !== undefined) query.skip(options.skip);
      if (options?.take !== undefined) query.take(options.take);

      query.orderBy('exercise.created_date', 'DESC');

      const [rows, total] = await query.getManyAndCount();

      return {
        status: HttpStatus.OK,
        messageEn: 'Exercises retrieved successfully',
        messageAr: 'تم استرجاع التمارين بنجاح',
        data: rows,
        meta: {
          total,
          count: rows.length,
          skip: options?.skip ?? 0,
          take: options?.take ?? total,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error retrieving exercises',
        messageAr: 'خطأ في استرجاع التمارين',
        error: (error as Error).message,
      };
    }
  }

  async findById(id: string) {
    try {
      const entity = await this.findOne({
        where: { id },
        relations: ['coach', 'trainee'],
      });

      if (!entity) {
        return {
          status: HttpStatus.NOT_FOUND,
          messageEn: 'Exercise not found',
          messageAr: 'التمرين غير موجود',
          data: null,
        };
      }

      return {
        status: HttpStatus.OK,
        messageEn: 'Exercise retrieved successfully',
        messageAr: 'تم استرجاع التمرين بنجاح',
        data: entity,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error retrieving exercise',
        messageAr: 'خطأ في استرجاع التمرين',
        error: (error as Error).message,
      };
    }
  }

  async updateEntity(id: string, dto: Partial<Exercise>) {
    try {
      const entity = await this.findOne({ where: { id } });

      if (!entity) {
        return {
          status: HttpStatus.NOT_FOUND,
          messageEn: 'Exercise not found',
          messageAr: 'التمرين غير موجود',
          data: null,
        };
      }

      if (dto.name !== undefined) entity.name = dto.name;
      if (dto.exercise_type !== undefined) entity.exercise_type = dto.exercise_type;
      if (dto.sets !== undefined) entity.sets = dto.sets ?? null;
      if (dto.reps !== undefined) entity.reps = dto.reps ?? null;
      if (dto.duration_minutes !== undefined) entity.duration_minutes = dto.duration_minutes ?? null;
      if (dto.instructions !== undefined) entity.instructions = dto.instructions ?? null;

      await this.save(entity);
      const updated = await this.findOne({
        where: { id },
        relations: ['coach', 'trainee'],
      });

      return {
        status: HttpStatus.OK,
        messageEn: 'Exercise updated successfully',
        messageAr: 'تم تحديث التمرين بنجاح',
        data: updated,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error updating exercise',
        messageAr: 'خطأ في تحديث التمرين',
        error: (error as Error).message,
      };
    }
  }

  async deleteEntity(id: string) {
    try {
      const entity = await this.findOne({ where: { id } });

      if (!entity) {
        return {
          status: HttpStatus.NOT_FOUND,
          messageEn: 'Exercise not found',
          messageAr: 'التمرين غير موجود',
          data: null,
        };
      }

      await this.remove(entity);

      return {
        status: HttpStatus.OK,
        messageEn: 'Exercise deleted successfully',
        messageAr: 'تم حذف التمرين بنجاح',
        data: null,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error deleting exercise',
        messageAr: 'خطأ في حذف التمرين',
        error: (error as Error).message,
      };
    }
  }

  async search(options: {
    search?: string;
    exercise_type?: ExerciseType;
    coach_id?: string;
    trainee_id?: string;
    skip?: number;
    take?: number;
  }) {
    try {
      const query = this.createQueryBuilder('exercise')
        .leftJoinAndSelect('exercise.coach', 'coach')
        .leftJoinAndSelect('exercise.trainee', 'trainee');

      if (options.search) {
        query.andWhere('(exercise.name ILIKE :search OR exercise.instructions ILIKE :search)', {
          search: `%${options.search}%`,
        });
      }

      if (options.exercise_type !== undefined) {
        query.andWhere('exercise.exercise_type = :exercise_type', {
          exercise_type: options.exercise_type,
        });
      }

      if (options.coach_id) {
        query.andWhere('exercise.coach_id = :coach_id', { coach_id: options.coach_id });
      }

      if (options.trainee_id) {
        query.andWhere('exercise.trainee_id = :trainee_id', { trainee_id: options.trainee_id });
      }

      if (options.skip !== undefined) query.skip(options.skip);
      if (options.take !== undefined) query.take(options.take);

      query.orderBy('exercise.created_date', 'DESC');

      const [rows, total] = await query.getManyAndCount();

      return {
        status: HttpStatus.OK,
        messageEn: 'Exercise search completed',
        messageAr: 'تم البحث في التمارين بنجاح',
        data: rows,
        meta: {
          total,
          count: rows.length,
          skip: options?.skip ?? 0,
          take: options?.take ?? total,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error searching exercises',
        messageAr: 'خطأ في البحث في التمارين',
        error: (error as Error).message,
      };
    }
  }
}

