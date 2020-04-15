import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";

import { Language } from './language.entity';
import { LanguageController } from './language.controller';
import { LanguageService } from './language.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Language,
    ]),
  ],
  providers: [
    LanguageService,
  ],
  exports: [
    LanguageService,
  ],
  controllers: [
    LanguageController,
  ],
})
export class LanguageModule {}
