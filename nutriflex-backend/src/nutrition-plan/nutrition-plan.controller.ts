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
import { NutritionPlanService } from './nutrition-plan.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  CreateNutritionPlanDto,
  UpdateNutritionPlanDto,
  PaginationDto,
  SearchNutritionPlanDto,
  CreatePlanWithDetailsDto,
} from './dto/nutrition-plan.dto';

@ApiTags('Nutrition Plan')
@ApiBearerAuth('access-token')
@Controller('nutrition-plan')
@UseGuards(RolesGuard)
@Roles('ADMIN', 'COACH')
export class NutritionPlanController {
  constructor(private readonly nutritionPlanService: NutritionPlanService) {}

  @Post()
  @ApiOperation({ summary: 'Create nutrition plan' })
  @ApiBody({ type: CreateNutritionPlanDto })
  async create(@Body() dto: CreateNutritionPlanDto) {
    return this.nutritionPlanService.create(dto);
  }

  @Post('coach-with-details')
  @ApiOperation({
    summary: 'Create nutrition plan with exercises and meals (Coach Plans wizard)',
    description:
      'Creates a nutrition plan and attaches exercises and meals in a single request. ' +
      'Intended for use by the Coach Plans page (not coach dashboard).',
  })
  @ApiBody({ type: CreatePlanWithDetailsDto })
  async createWithDetails(@Body() dto: CreatePlanWithDetailsDto) {
    return this.nutritionPlanService.createWithDetails(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all nutrition plans list' })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'coach_id', required: false })
  @ApiQuery({ name: 'trainee_id', required: false })
  async findAll(@Query() pagination: PaginationDto & { coach_id?: string; trainee_id?: string }) {
    return this.nutritionPlanService.findAll(pagination);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search nutrition plans' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'coach_id', required: false })
  @ApiQuery({ name: 'trainee_id', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  async search(
    @Query() searchDto: SearchNutritionPlanDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.nutritionPlanService.search(searchDto, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find nutrition plan by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.nutritionPlanService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update nutrition plan by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateNutritionPlanDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNutritionPlanDto,
  ) {
    return this.nutritionPlanService.update(id, dto);
  }

  @Put(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle nutrition plan status' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async toggleStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.nutritionPlanService.toggleStatus(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete nutrition plan' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.nutritionPlanService.delete(id);
  }
}
