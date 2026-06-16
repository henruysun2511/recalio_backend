import { Injectable } from '@nestjs/common';
import { ReviewRepository } from './review.repository';
import { CreateReviewDto } from './review.dto';
import { ReviewError } from './review.error';
import { paginate } from '../../common/utils/paginate.util';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { DeckService } from '../decks/deck.service';

@Injectable()
export class ReviewService {
    constructor(
        private readonly repo: ReviewRepository,
        private readonly deckService: DeckService,
    ) { }

    async upsert(userId: string, deckId: string, dto: CreateReviewDto) {
        const ownerId = await this.deckService.getOwner(deckId);
        if (!ownerId) throw ReviewError.deckNotFound();
        if (ownerId === userId) throw ReviewError.cannotReviewOwn();

        return this.repo.upsert(userId, deckId, dto);
    }

    async getByDeck(deckId: string, dto: PaginationDto) {
        const ownerId = await this.deckService.getOwner(deckId);
        if (!ownerId) throw ReviewError.deckNotFound();

        const { items, total } = await this.repo.findPublicByDeck(deckId, dto);
        return paginate(items, total, dto);
    }

    async delete(userId: string, reviewId: string) {
        const review = await this.repo.findById(reviewId);
        if (!review) throw ReviewError.notFound();

        const ownerId = await this.deckService.getOwner(review.deckId);
        if (ownerId !== userId) throw ReviewError.notOwner();

        await this.repo.delete(reviewId);
    }
}
