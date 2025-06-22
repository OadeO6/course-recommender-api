import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { CourseDiscoveryService } from './services/course-discovery.service';
import { DiscoverCoursesDto } from './dto/discover-courses.dto';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly courseDiscovery: CourseDiscoveryService) {}

  @Post('discover-courses')
  @ApiBody({ type: DiscoverCoursesDto })
  async discoverCourses(@Body() body: DiscoverCoursesDto) {
    return this.courseDiscovery.discoverCourses(body.jobTitle);
  }
} 