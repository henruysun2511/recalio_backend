import { Module } from '@nestjs/common';
import { NoteTemplateController } from './note-template.controller';
import { NoteTemplateService } from './note-template.service';
import { NoteTemplateRepository } from './note-template.repository';

@Module({
  controllers: [NoteTemplateController],
  providers: [NoteTemplateService, NoteTemplateRepository],
  exports: [NoteTemplateService],
})
export class NoteTemplateModule {}
