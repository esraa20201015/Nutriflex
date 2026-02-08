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
import { TraineeProgressService } from './trainee-progress.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  CreateTraineeProgressDto,
  UpdateTraineeProgressDto,
  PaginationDto,
  SearchTraineeProgressDto,
} from './dto/trainee-progress.dto';

@ApiTags('Trainee Progress')
@ApiBearerAuth('access-token')
@Controller('trainee-progress')
@UseGuards(RolesGuard)
@Roles('ADMIN', 'COACH')
export class TraineeProgressController {
  constructor(private readonly traineeProgressService: TraineeProgressService) {}

  @Post()
  @ApiOperation({ summary: 'Create trainee progress record' })
  @ApiBody({ type: CreateTraineeProgressDto })
  async create(@Body() dto: CreateTraineeProgressDto) {
    return this.traineeProgressService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trainee progress records list' })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'period_type', required: false })
  @ApiQuery({ name: 'trainee_id', required: false })
  async findAll(@Query() pagination: PaginationDto) {
    return this.traineeProgressService.findAll(pagination);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search trainee progress records' })
  @ApiQuery({ name: 'period_type', required: false })
  @ApiQuery({ name: 'trainee_id', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  async search(
    @Query() searchDto: SearchTraineeProgressDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.traineeProgressService.search(searchDto, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find trainee progress by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.traineeProgressService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update trainee progress by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateTraineeProgressDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTraineeProgressDto,
  ) {
    return this.traineeProgressService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete trainee progress record' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.traineeProgressService.delete(id);
  }
}

