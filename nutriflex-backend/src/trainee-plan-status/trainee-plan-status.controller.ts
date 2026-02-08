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
import { TraineePlanStatusService } from './trainee-plan-status.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  CreateTraineePlanStatusDto,
  UpdateTraineePlanStatusDto,
  PaginationDto,
  SearchTraineePlanStatusDto,
} from './dto/trainee-plan-status.dto';

@ApiTags('Trainee Plan Status')
@ApiBearerAuth('access-token')
@Controller('trainee-plan-status')
@UseGuards(RolesGuard)
@Roles('ADMIN', 'COACH')
export class TraineePlanStatusController {
  constructor(private readonly traineePlanStatusService: TraineePlanStatusService) {}

  @Post()
  @ApiOperation({ summary: 'Create trainee plan status' })
  @ApiBody({ type: CreateTraineePlanStatusDto })
  async create(@Body() dto: CreateTraineePlanStatusDto) {
    return this.traineePlanStatusService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trainee plan statuses list' })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'trainee_id', required: false })
  @ApiQuery({ name: 'plan_id', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(@Query() pagination: PaginationDto) {
    return this.traineePlanStatusService.findAll(pagination);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search trainee plan statuses' })
  @ApiQuery({ name: 'trainee_id', required: false })
  @ApiQuery({ name: 'plan_id', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  async search(
    @Query() searchDto: SearchTraineePlanStatusDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.traineePlanStatusService.search(searchDto, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find trainee plan status by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.traineePlanStatusService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update trainee plan status by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateTraineePlanStatusDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTraineePlanStatusDto,
  ) {
    return this.traineePlanStatusService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete trainee plan status' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.traineePlanStatusService.delete(id);
  }
}

