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
import { MealService } from './meal.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  CreateMealDto,
  UpdateMealDto,
  PaginationDto,
  SearchMealDto,
} from './dto/meal.dto';

@ApiTags('Meal')
@ApiBearerAuth('access-token')
@Controller('meal')
@UseGuards(RolesGuard)
@Roles('ADMIN', 'COACH')
export class MealController {
  constructor(private readonly mealService: MealService) {}

  @Post()
  @ApiOperation({ summary: 'Create meal' })
  @ApiBody({ type: CreateMealDto })
  async create(@Body() dto: CreateMealDto) {
    return this.mealService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all meals list' })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'meal_type', required: false })
  @ApiQuery({ name: 'nutrition_plan_id', required: false })
  async findAll(@Query() pagination: PaginationDto) {
    return this.mealService.findAll(pagination);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search meals' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'meal_type', required: false })
  @ApiQuery({ name: 'nutrition_plan_id', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  async search(
    @Query() searchDto: SearchMealDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.mealService.search(searchDto, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find meal by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.mealService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update meal by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateMealDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMealDto,
  ) {
    return this.mealService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete meal' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.mealService.delete(id);
  }
}
