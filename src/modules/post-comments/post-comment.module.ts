import { Module } from '@nestjs/common';
import { PostCommentController } from './post-comment.controller';
import { PostCommentService } from './post-comment.service';
import { PostCommentRepository } from './post-comment.repository';

@Module({
  controllers: [PostCommentController],
  providers: [PostCommentService, PostCommentRepository],
  exports: [PostCommentService, PostCommentRepository],
})
export class PostCommentModule {}
