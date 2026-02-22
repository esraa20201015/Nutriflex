import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { RequestUser } from '../auth/types/request-user.interface';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ParseUUIDPipe } from '@nestjs/common/pipes';
import { CoachTraineeService } from './coach-trainee.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  CreateCoachTraineeDto,
  UpdateCoachTraineeDto,
  PaginationDto,
  SearchCoachTraineeDto,
} from './dto/coach-trainee.dto';

@ApiTags('Coach Trainee')
@ApiBearerAuth('access-token')
@Controller('coach-trainee')
@UseGuards(RolesGuard)
@Roles('ADMIN', 'COACH', 'TRAINEE')
export class CoachTraineeController {
  constructor(private readonly coachTraineeService: CoachTraineeService) {}

  @Post()
  @ApiOperation({ summary: 'Create coach-trainee relationship' })
  @ApiBody({ type: CreateCoachTraineeDto })
  async create(
    @Req() req: Request & { user?: RequestUser },
    @Body() dto: CreateCoachTraineeDto,
  ) {
    if (req.user?.role === 'TRAINEE' && req.user?.id !== dto.trainee_id) {
      throw new ForbiddenException({
        messageEn: 'Trainees can only assign themselves to a coach. Use POST /coaches/select instead.',
        messageAr: 'يمكن للمتدربين فقط تعيين أنفسهم لمدرب. استخدم POST /coaches/select بدلاً من ذلك.',
      });
    }
    return this.coachTraineeService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all coach-trainee relationships list' })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'coach_id', required: false })
  @ApiQuery({ name: 'trainee_id', required: false })
  async findAll(@Query() pagination: PaginationDto & { coach_id?: string; trainee_id?: string }) {
    return this.coachTraineeService.findAll(pagination);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search coach-trainee relationships' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'coach_id', required: false })
  @ApiQuery({ name: 'trainee_id', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  async search(
    @Query() searchDto: SearchCoachTraineeDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.coachTraineeService.search(searchDto, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find coach-trainee relationship by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.coachTraineeService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update coach-trainee relationship by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateCoachTraineeDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCoachTraineeDto,
  ) {
    return this.coachTraineeService.update(id, dto);
  }

  @Put(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle coach-trainee relationship status' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async toggleStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.coachTraineeService.toggleStatus(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete coach-trainee relationship' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.coachTraineeService.delete(id);
  }

  // ======= New endpoint: Get all trainees for a coach =======
  @Get('my-trainees/:coach_id')
  @ApiOperation({ summary: 'Get all active trainees of a specific coach' })
  @ApiParam({ name: 'coach_id', type: String, format: 'uuid' })
  async getTraineesByCoach(@Param('coach_id', ParseUUIDPipe) coach_id: string) {
    return this.coachTraineeService.getTraineesByCoach(coach_id);
  }
}
