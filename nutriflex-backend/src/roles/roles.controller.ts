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
} from '@nestjs/swagger';
import { ParseUUIDPipe } from '@nestjs/common/pipes';
import { RolesService } from './roles.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  CreateRoleDto,
  UpdateRoleDto,
  PaginationDto,
  SearchRoleDto,
} from './dto/role.dto';

@ApiTags('Role')
@ApiBearerAuth('access-token')
@Controller('roles')
@UseGuards(RolesGuard)
@Roles('ADMIN') // Only Admin can manage roles
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new role' })
  @ApiBody({ type: CreateRoleDto })
  async create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles list' })
  async findAll(@Query() pagination: PaginationDto) {
    return this.rolesService.findAll(pagination);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search roles' })
  async search(
    @Query() searchDto: SearchRoleDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.rolesService.search(searchDto, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find role by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update role by ID' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, dto);
  }

  @Put(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle role status' })
  async toggleStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.toggleStatus(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete role' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.delete(id);
  }
}
