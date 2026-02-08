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
import { HealthMetricService } from './health-metric.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  CreateHealthMetricDto,
  UpdateHealthMetricDto,
  PaginationDto,
  SearchHealthMetricDto,
} from './dto/health-metric.dto';

@ApiTags('Health Metric')
@ApiBearerAuth('access-token')
@Controller('health-metric')
@UseGuards(RolesGuard)
@Roles('ADMIN', 'COACH')
export class HealthMetricController {
  constructor(private readonly healthMetricService: HealthMetricService) {}

  @Post()
  @ApiOperation({ summary: 'Create health metric' })
  @ApiBody({ type: CreateHealthMetricDto })
  async create(@Body() dto: CreateHealthMetricDto) {
    return this.healthMetricService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all health metrics list' })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'metric_type', required: false })
  @ApiQuery({ name: 'trainee_id', required: false })
  async findAll(@Query() pagination: PaginationDto) {
    return this.healthMetricService.findAll(pagination);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search health metrics' })
  @ApiQuery({ name: 'metric_type', required: false })
  @ApiQuery({ name: 'trainee_id', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  async search(
    @Query() searchDto: SearchHealthMetricDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.healthMetricService.search(searchDto, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find health metric by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.healthMetricService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update health metric by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateHealthMetricDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHealthMetricDto,
  ) {
    return this.healthMetricService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete health metric' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.healthMetricService.delete(id);
  }
}

