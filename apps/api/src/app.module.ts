import { Module } from '@nestjs/common';
import { CadenceController } from './cadences.controller';
import { CadencesService } from './cadences.service';
import { TemporalService } from './temporal.service';
import { EnrollmentsController } from './enrollments.controller';

@Module({
  controllers: [CadenceController, EnrollmentsController],
  providers: [CadencesService, TemporalService],
})
export class AppModule {}
