import { Module } from '@nestjs/common';
import { FollowController } from './follow.controller';
import { FollowService } from './follow.service';
import { FollowRepository } from './follow.repository';
import { UserModule } from '../users/user.module';

@Module({
    imports: [UserModule],
    controllers: [FollowController],
    providers: [FollowService, FollowRepository],
    exports: [FollowService, FollowRepository],
})
export class FollowModule { }
