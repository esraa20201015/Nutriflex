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
import { CoachProfilesService } from './coach-profiles.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  CreateCoachProfileDto,
  UpdateCoachProfileDto,
  PaginationDto,
  SearchCoachProfileDto,
} from './dto/coach-profile.dto';

@ApiTags('Coach Profile')
@ApiBearerAuth('access-token')
@Controller('profiles/coach')
@UseGuards(RolesGuard)
@Roles('ADMIN', 'COACH')
export class CoachProfilesController {
  constructor(private readonly coachProfilesService: CoachProfilesService) {}

  @Post()
  @ApiOperation({ summary: 'Create coach profile' })
  @ApiBody({ type: CreateCoachProfileDto })
  async create(@Body() dto: CreateCoachProfileDto) {
    return this.coachProfilesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all coach profiles list' })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(@Query() pagination: PaginationDto) {
    return this.coachProfilesService.findAll(pagination);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search coach profiles' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  async search(
    @Query() searchDto: SearchCoachProfileDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.coachProfilesService.search(searchDto, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find coach profile by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.coachProfilesService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update coach profile by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateCoachProfileDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCoachProfileDto,
  ) {
    return this.coachProfilesService.update(id, dto);
  }

  @Put(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle coach profile status' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async toggleStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.coachProfilesService.toggleStatus(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete coach profile' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.coachProfilesService.delete(id);
  }
}
