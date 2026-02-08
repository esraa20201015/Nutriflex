import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @Public()
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'Simple endpoint to test backend connectivity. Returns 200 if backend is running.',
  })
  @ApiResponse({
    status: 200,
    description: 'Backend is running',
    schema: {
      example: {
        status: 'ok',
        message: 'Backend is running',
        timestamp: '2026-02-03T13:00:00.000Z',
      },
    },
  })
  check() {
    return {
      status: 'ok',
      message: 'Backend is running',
      timestamp: new Date().toISOString(),
      endpoints: {
        signUp: '/api/auth/sign-up',
        signIn: '/api/auth/sign-in',
        swagger: '/api/swagger',
      },
    };
  }
}
