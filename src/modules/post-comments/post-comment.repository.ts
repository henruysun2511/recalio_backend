import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';
import { CommentQueryDto } from './post-comment.dto';

const commentInclude = {
    user: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
    },
    likes: {
        select: { userId: true },
    },
} as const;

@Injectable()
export class PostCommentRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: {
        postId: string;
        userId: string;
        content: string;
        parentId?: string | null;
    }) {
        return this.prisma.postComment.create({
            data: {
                postId: data.postId,
                userId: data.userId,
                content: data.content,
                parentId: data.parentId ?? null,
            },
            include: {
                ...commentInclude,
                replies: {
                    include: commentInclude,
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
    }

    async findById(id: string) {
        return this.prisma.postComment.findUnique({
            where: { id },
            include: {
                ...commentInclude,
                replies: {
                    include: commentInclude,
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
    }

    async findByPost(postId: string, dto: CommentQueryDto) {
        const { page = 1, limit = 20 } = dto;
        const skip = (page - 1) * limit;

        const where = { postId, parentId: null as string | null, deletedAt: null as Date | null };

        const [comments, total] = await Promise.all([
            this.prisma.postComment.findMany({
                where,
                include: {
                    ...commentInclude,
                    replies: {
                        where: { deletedAt: null },
                        include: commentInclude,
                        orderBy: { createdAt: 'asc' },
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.postComment.count({ where }),
        ]);

        return { comments, total, page, limit };
    }

    async update(id: string, content: string) {
        return this.prisma.postComment.update({
            where: { id },
            data: { content },
            include: {
                ...commentInclude,
                replies: {
                    include: commentInclude,
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
    }

    async softDelete(id: string) {
        return this.prisma.postComment.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    async findByPostAndUser(postId: string, userId: string) {
        return this.prisma.postComment.findFirst({
            where: { postId, userId, deletedAt: null },
        });
    }

    async findLike(userId: string, commentId: string) {
        return this.prisma.postCommentLike.findUnique({
            where: { userId_commentId: { userId, commentId } },
        });
    }

    async addLike(userId: string, commentId: string) {
        const [like] = await Promise.all([
            this.prisma.postCommentLike.create({ data: { userId, commentId } }),
            this.prisma.postComment.update({
                where: { id: commentId },
                data: { likeCount: { increment: 1 } },
            }),
        ]);
        return like;
    }

    async removeLike(userId: string, commentId: string) {
        const [like] = await Promise.all([
            this.prisma.postCommentLike.delete({
                where: { userId_commentId: { userId, commentId } },
            }),
            this.prisma.postComment.update({
                where: { id: commentId },
                data: { likeCount: { decrement: 1 } },
            }),
        ]);
        return like;
    }
}
