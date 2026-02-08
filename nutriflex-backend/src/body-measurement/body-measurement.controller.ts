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
import { BodyMeasurementService } from './body-measurement.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  CreateBodyMeasurementDto,
  UpdateBodyMeasurementDto,
  PaginationDto,
  SearchBodyMeasurementDto,
} from './dto/body-measurement.dto';

@ApiTags('Body Measurement')
@ApiBearerAuth('access-token')
@Controller('body-measurement')
@UseGuards(RolesGuard)
@Roles('ADMIN', 'COACH')
export class BodyMeasurementController {
  constructor(private readonly bodyMeasurementService: BodyMeasurementService) {}

  @Post()
  @ApiOperation({ summary: 'Create body measurement' })
  @ApiBody({ type: CreateBodyMeasurementDto })
  async create(@Body() dto: CreateBodyMeasurementDto) {
    return this.bodyMeasurementService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all body measurements list' })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'trainee_id', required: false })
  async findAll(@Query() pagination: PaginationDto) {
    return this.bodyMeasurementService.findAll(pagination);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search body measurements' })
  @ApiQuery({ name: 'trainee_id', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  async search(
    @Query() searchDto: SearchBodyMeasurementDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.bodyMeasurementService.search(searchDto, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find body measurement by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.bodyMeasurementService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update body measurement by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateBodyMeasurementDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBodyMeasurementDto,
  ) {
    return this.bodyMeasurementService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete body measurement' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.bodyMeasurementService.delete(id);
  }
}

