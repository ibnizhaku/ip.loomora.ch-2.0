import { Module } from '@nestjs/common';
import { AbsencesService } from './absences.service';
import { AbsencesController } from './absences.controller';

@Module({
  controllers: [AbsencesController],
  providers: [AbsencesService],
  exports: [AbsencesService],
})
export class AbsencesModule {}
