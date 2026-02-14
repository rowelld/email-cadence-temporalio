import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CadencesService } from './cadences.service';

interface Cadence {
    id: string;
    name: string;
    steps: Step[];
}

interface Step {
    id: string;
    type: 'SEND_EMAIL' | 'WAIT';
    subject?: string;
    body?: string;
    seconds?: number;
}

@Controller('cadences')
export class CadenceController {
    constructor(private readonly cadenceService: CadencesService) { }

    @Post()
    create(@Body() cadence: Cadence) {
        this.cadenceService.create(cadence);
        return cadence;
    }

    @Get(':id')
    get(@Param('id') id: string) {
        return this.cadenceService.get(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() cadence: Cadence) {
        this.cadenceService.update(id, cadence);
        return cadence;
    }
}
