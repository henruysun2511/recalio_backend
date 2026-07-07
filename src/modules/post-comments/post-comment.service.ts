import { Injectable } from '@nestjs/common';
import { PostCommentRepository } from './post-comment.repository';
import { CreateCommentDto, UpdateCommentDto, CommentQueryDto } from './post-comment.dto';
import { PostCommentError } from './post-comment.error';

@Injectable()
export class PostCommentService {
    constructor(private readonly repo: PostCommentRepository) { }

    async create(userId: string, postId: string, dto: CreateCommentDto) {
        if (dto.parentId) {
            const parent = await this.repo.findById(dto.parentId);
            if (!parent) throw PostCommentError.notFound();
            if (parent.parentId) throw PostCommentError.cannotReplyToReply();
        }
        return this.repo.create({ postId, userId, content: dto.content, parentId: dto.parentId });
    }

    async findByPost(postId: string, dto: CommentQueryDto) {
        return this.repo.findByPost(postId, dto);
    }

    async update(userId: string, commentId: string, dto: UpdateCommentDto) {
        const comment = await this.repo.findById(commentId);
        if (!comment || comment.deletedAt) throw PostCommentError.notFound();
        if (comment.userId !== userId) throw PostCommentError.notOwner();
        return this.repo.update(commentId, dto.content);
    }

    async delete(userId: string, commentId: string) {
        const comment = await this.repo.findById(commentId);
        if (!comment || comment.deletedAt) throw PostCommentError.notFound();
        if (comment.userId !== userId) throw PostCommentError.notOwner();
        return this.repo.softDelete(commentId);
    }

    async toggleLike(userId: string, commentId: string) {
        const comment = await this.repo.findById(commentId);
        if (!comment || comment.deletedAt) throw PostCommentError.notFound();
        const existing = await this.repo.findLike(userId, commentId);
        if (existing) {
            await this.repo.removeLike(userId, commentId);
            return { liked: false };
        }
        await this.repo.addLike(userId, commentId);
        return { liked: true };
    }
}
