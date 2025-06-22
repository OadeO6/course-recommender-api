"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const course_discovery_service_1 = require("./services/course-discovery.service");
const discover_courses_dto_1 = require("./dto/discover-courses.dto");
let AiController = class AiController {
    courseDiscovery;
    constructor(courseDiscovery) {
        this.courseDiscovery = courseDiscovery;
    }
    async discoverCourses(body) {
        return this.courseDiscovery.discoverCourses(body.jobTitle);
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('discover-courses'),
    (0, swagger_1.ApiBody)({ type: discover_courses_dto_1.DiscoverCoursesDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [discover_courses_dto_1.DiscoverCoursesDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "discoverCourses", null);
exports.AiController = AiController = __decorate([
    (0, swagger_1.ApiTags)('ai'),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [course_discovery_service_1.CourseDiscoveryService])
], AiController);
//# sourceMappingURL=ai.controller.js.map