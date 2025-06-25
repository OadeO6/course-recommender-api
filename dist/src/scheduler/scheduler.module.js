"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const nestjs_1 = require("@bull-board/nestjs");
const bullAdapter_1 = require("@bull-board/api/bullAdapter");
const scheduler_service_1 = require("./scheduler.service");
const recommendation_module_1 = require("../recommendation/recommendation.module");
const processor_1 = require("./processor");
let SchedulerModule = class SchedulerModule {
};
exports.SchedulerModule = SchedulerModule;
exports.SchedulerModule = SchedulerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bull_1.BullModule.forRoot({
                redis: { host: 'redis', port: 6379 },
            }),
            bull_1.BullModule.registerQueue({
                name: 'background-jobs',
            }),
            nestjs_1.BullBoardModule.forFeature({
                name: 'background-jobs',
                adapter: bullAdapter_1.BullAdapter,
            }),
            (0, common_1.forwardRef)(() => recommendation_module_1.RecommendationModule),
        ],
        providers: [scheduler_service_1.SchedulerService, processor_1.SchedulerProcessor],
        exports: [scheduler_service_1.SchedulerService],
    })
], SchedulerModule);
//# sourceMappingURL=scheduler.module.js.map