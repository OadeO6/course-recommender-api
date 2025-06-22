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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestScraperDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class TestScraperDto {
    query;
    platform;
    skill;
}
exports.TestScraperDto = TestScraperDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Python tutorial' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestScraperDto.prototype, "query", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'blog', enum: ['pdf', 'doc', 'blog', 'video', 'course'] }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestScraperDto.prototype, "platform", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Python' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestScraperDto.prototype, "skill", void 0);
//# sourceMappingURL=test-scraper.dto.js.map