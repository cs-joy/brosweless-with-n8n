import { Module } from '@nestjs/common';
import { InternationsService } from './internations.service';

@Module({
    providers: [InternationsService],
    exports: [InternationsService],
})
export class InternationsModule { }