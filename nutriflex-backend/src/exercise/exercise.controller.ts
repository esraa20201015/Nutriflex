import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ParseUUIDPipe } from '@nestjs/common/pipes';
import { ExerciseService } from './exercise.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  CreateExerciseDto,
  UpdateExerciseDto,
  PaginationDto,
  SearchExerciseDto,
} from './dto/exercise.dto';

@ApiTags('Exercise')
@ApiBearerAuth('access-token')
@Controller('exercise')
@UseGuards(RolesGuard)
@Roles('ADMIN', 'COACH')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Post()
  @ApiOperation({ summary: 'Create exercise' })
  @ApiBody({ type: CreateExerciseDto })
  async create(@Body() dto: CreateExerciseDto) {
    return this.exerciseService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all exercises list' })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'exercise_type', required: false })
  @ApiQuery({ name: 'coach_id', required: false })
  @ApiQuery({ name: 'trainee_id', required: false })
  async findAll(@Query() pagination: PaginationDto) {
    return this.exerciseService.findAll(pagination);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search exercises' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'exercise_type', required: false })
  @ApiQuery({ name: 'coach_id', required: false })
  @ApiQuery({ name: 'trainee_id', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  async search(
    @Query() searchDto: SearchExerciseDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.exerciseService.search(searchDto, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find exercise by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.exerciseService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update exercise by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateExerciseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExerciseDto,
  ) {
    return this.exerciseService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete exercise' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.exerciseService.delete(id);
  }
}

