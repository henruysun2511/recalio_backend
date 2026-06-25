import { Injectable } from '@nestjs/common';
import { PostRepository } from './post.repository';
import { CreatePostDto, UpdatePostDto, PostQueryDto, ReportPostDto, BanPostDto } from './post.dto';
import { PostError } from './post.error';

@Injectable()
export class PostService {
    constructor(private readonly repo: PostRepository) { }

    async create(userId: string, dto: CreatePostDto) {
        const owned = await this.repo.findDecksByUser(dto.deckIds, userId);
        const allOwned = dto.deckIds.every((id) => owned.has(id));
        if (!allOwned) throw PostError.deckNotOwned();

        const deckIds = dto.deckIds.map((id, i) => ({ deckId: id, orderIndex: i }));

        return this.repo.create({
            userId,
            title: dto.title,
            content: dto.content,
            coverImage: dto.coverImage,
            tags: dto.tags ?? [],
            deckIds,
        });
    }

    async findAll(dto: PostQueryDto) {
        return this.repo.findAll(dto);
    }

    async findById(id: string) {
        const post = await this.repo.findById(id);
        if (!post || post.deletedAt) throw PostError.notFound();
        return post;
    }

    async update(userId: string, postId: string, dto: UpdatePostDto) {
        const post = await this.repo.findById(postId);
        if (!post || post.deletedAt) throw PostError.notFound();
        if (post.userId !== userId) throw PostError.notOwner();

        const updateData: any = {};
        if (dto.title !== undefined) updateData.title = dto.title;
        if (dto.content !== undefined) updateData.content = dto.content;
        if (dto.coverImage !== undefined) updateData.coverImage = dto.coverImage;
        if (dto.tags !== undefined) updateData.tags = dto.tags;

        if (dto.deckIds !== undefined) {
            const owned = await this.repo.findDecksByUser(dto.deckIds, userId);
            const allOwned = dto.deckIds.every((id) => owned.has(id));
            if (!allOwned) throw PostError.deckNotOwned();
        }

        const updated = await this.repo.update(postId, updateData);

        if (dto.deckIds !== undefined) {
            const deckIds = dto.deckIds.map((id, i) => ({ deckId: id, orderIndex: i }));
            await this.repo.replaceDecks(postId, deckIds);
        }

        return this.repo.findById(postId);
    }

    async delete(userId: string, postId: string) {
        const post = await this.repo.findById(postId);
        if (!post || post.deletedAt) throw PostError.notFound();
        if (post.userId !== userId) throw PostError.notOwner();

        return this.repo.softDelete(postId);
    }

    async report(userId: string, postId: string, dto: ReportPostDto) {
        const post = await this.repo.findById(postId);
        if (!post || post.deletedAt) throw PostError.notFound();
        if (post.userId === userId) throw PostError.cannotReportOwn();

        const existing = await this.repo.findExistingReport(userId, postId);
        if (existing) throw PostError.alreadyReported();

        return this.repo.createReport({
            reportedById: userId,
            postId,
            reason: dto.reason,
            description: dto.description,
        });
    }

    async findAllAdmin(dto: PostQueryDto) {
        return this.repo.findAllAdmin(dto);
    }

    async ban(postId: string, dto: BanPostDto) {
        const post = await this.repo.findById(postId);
        if (!post) throw PostError.notFound();
        return this.repo.ban(postId, dto.isBanned);
    }

    async toggleLike(userId: string, postId: string) {
        const post = await this.repo.findById(postId);
        if (!post || post.deletedAt) throw PostError.notFound();

        const existing = await this.repo.findLike(userId, postId);
        if (existing) {
            await this.repo.removeLike(userId, postId);
            return { liked: false };
        }
        await this.repo.addLike(userId, postId);
        return { liked: true };
    }
}
