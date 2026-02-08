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
import { TraineeProfilesService } from './trainee-profiles.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  CreateTraineeProfileDto,
  UpdateTraineeProfileDto,
  PaginationDto,
  SearchTraineeProfileDto,
} from './dto/trainee-profile.dto';

@ApiTags('Trainee Profile')
@ApiBearerAuth('access-token')
@Controller('profiles/trainee')
@UseGuards(RolesGuard)
@Roles('ADMIN', 'COACH')
export class TraineeProfilesController {
  constructor(private readonly traineeProfilesService: TraineeProfilesService) {}

  @Post()
  @ApiOperation({ summary: 'Create trainee profile' })
  @ApiBody({ type: CreateTraineeProfileDto })
  async create(@Body() dto: CreateTraineeProfileDto) {
    return this.traineeProfilesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trainee profiles list' })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  async findAll(@Query() pagination: PaginationDto) {
    return this.traineeProfilesService.findAll(pagination);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search trainee profiles' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  async search(
    @Query() searchDto: SearchTraineeProfileDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.traineeProfilesService.search(searchDto, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find trainee profile by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.traineeProfilesService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update trainee profile by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateTraineeProfileDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTraineeProfileDto,
  ) {
    return this.traineeProfilesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete trainee profile' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.traineeProfilesService.delete(id);
  }
}

