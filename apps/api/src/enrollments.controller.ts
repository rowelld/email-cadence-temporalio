import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TemporalService } from './temporal.service';
import { v4 as uuidv4 } from 'uuid';

interface EnrollmentRequest {
    cadenceId: string;
    contactEmail: string;
}

interface Step {
    id: string;
    type: 'SEND_EMAIL' | 'WAIT';
    subject?: string;
    body?: string;
    seconds?: number;
}

interface UpdateCadenceRequest {
    steps: Step[];
}

@Controller('enrollments')
export class EnrollmentsController {
    constructor(private readonly temporalService: TemporalService) { }

    @Post()
    async enroll(@Body() body: EnrollmentRequest) {
        const enrollmentId = uuidv4();
        await this.temporalService.startWorkFlow(enrollmentId, body.cadenceId, body.contactEmail);
        return { enrollmentId };
    }

    @Get(':id')
    async get(@Param('id') id: string) {
        return this.temporalService.getWorkflowState(id);
    }

    @Post(':id/update-cadence')
    async updateCadence(@Param('id') id: string, @Body() body: UpdateCadenceRequest) {
        await this.temporalService.signalUpdateCadence(id, body.steps);
        return { success: true };
    }
}
