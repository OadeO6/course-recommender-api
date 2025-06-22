import { CourseDiscoveryService } from './services/course-discovery.service';
import { DiscoverCoursesDto } from './dto/discover-courses.dto';
export declare class AiController {
    private readonly courseDiscovery;
    constructor(courseDiscovery: CourseDiscoveryService);
    discoverCourses(body: DiscoverCoursesDto): Promise<import("./services/course-discovery.service").CourseDiscoveryResult>;
}
