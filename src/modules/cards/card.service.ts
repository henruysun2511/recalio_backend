import { Injectable, Logger } from '@nestjs/common';
import { CardRepository } from './card.repository';
import { DeckService } from '../decks/deck.service';
import { CardError } from './card.error';
import { DueCardsQueryDto, ReviewCardDto, CardResponseDto, CardStatsDto } from './card.dto';
import { CardState, ReviewRating } from '@prisma/client';
import { CARD_CONSTANTS } from './card.constant';
import { paginate } from '../../common/utils/paginate.util';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@Injectable()
export class CardService {
    private readonly logger = new Logger(CardService.name);

    constructor(
        private readonly repo: CardRepository,
        private readonly deckService: DeckService,
    ) { }

    async getDueCards(userId: string, dto: DueCardsQueryDto) {
        const page = dto.page ?? 1;
        const limit = Math.min(dto.limit ?? CARD_CONSTANTS.DEFAULT_LIMIT, CARD_CONSTANTS.MAX_LIMIT);

        if (dto.deckId) {
            const ownerId = await this.deckService.checkReadAccess(dto.deckId, userId);
            if (!ownerId) throw CardError.notFound();
        }

        const { items, total } = await this.repo.findDueCards(userId, dto.deckId, limit);
        return paginate(items.map((item) => this.toResponse(item)), total, { page, limit } as PaginationDto);
    }

    async getCard(userId: string, id: string): Promise<CardResponseDto> {
        const card = await this.repo.findById(id);
        if (!card) throw CardError.notFound();
        if (card.userId !== userId) throw CardError.notOwner();

        return this.toResponse(card);
    }

    async review(userId: string, id: string, dto: ReviewCardDto) {
        const card = await this.repo.findById(id);
        if (!card) throw CardError.notFound();
        if (card.userId !== userId) throw CardError.notOwner();
        if (card.state === 'SUSPENDED') throw CardError.suspended();

        const now = new Date();
        const intervalBefore = card.interval;
        const easeBefore = card.easeFactor;

        const result = this.calculateSM2(dto.rating, card.state, card.interval, card.easeFactor, card.repetitions, card.lapses, card.currentStep);

        await this.repo.update(id, {
            state: result.newState,
            interval: result.newInterval,
            easeFactor: result.newEase,
            repetitions: result.newReps,
            lapses: result.newLapses,
            currentStep: result.newStep,
            due: result.newDue,
            lastReviewAt: now,
        });

        const reviewLogData: any = {
            rating: dto.rating,
            stateBefore: card.state,
            stateAfter: result.newState,
            intervalBefore,
            intervalAfter: result.newInterval,
            easeBefore,
            easeAfter: result.newEase,
            responseTimeMs: dto.responseTimeMs,
            reviewedAt: now,
            card: { connect: { id } },
            user: { connect: { id: userId } },
        };
        if (dto.sessionId) {
            reviewLogData.session = { connect: { id: dto.sessionId } };
        }

        await this.repo.createReviewLog(reviewLogData);

        this.logger.log(`Card ${id} reviewed: ${card.state}→${result.newState}, rating=${dto.rating}`);

        return {
            state: result.newState,
            due: result.newDue,
            interval: result.newInterval,
            easeFactor: result.newEase,
        };
    }

    async flagCard(userId: string, id: string, flags: number) {
        const card = await this.repo.findById(id);
        if (!card) throw CardError.notFound();
        if (card.userId !== userId) throw CardError.notOwner();

        await this.repo.update(id, { flags });
    }

    async toggleSuspend(userId: string, id: string) {
        const card = await this.repo.findById(id);
        if (!card) throw CardError.notFound();
        if (card.userId !== userId) throw CardError.notOwner();

        const newState = card.state === 'SUSPENDED' ? 'NEW' : 'SUSPENDED';
        await this.repo.update(id, { state: newState });
    }

    async buryCard(userId: string, id: string) {
        const card = await this.repo.findById(id);
        if (!card) throw CardError.notFound();
        if (card.userId !== userId) throw CardError.notOwner();

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        await this.repo.update(id, { due: tomorrow });
    }

    async getStats(userId: string, deckId?: string): Promise<CardStatsDto> {
        const stats = await this.repo.countByState(userId, deckId);
        return {
            new: stats.NEW,
            learning: stats.LEARNING,
            review: stats.REVIEW,
            due: stats.due,
            total: stats.NEW + stats.LEARNING + stats.REVIEW,
        };
    }

    private calculateSM2(
        rating: ReviewRating,
        state: CardState,
        interval: number,
        ease: number,
        reps: number,
        lapses: number,
        step: number,
    ) {
        let newState = state;
        let newInterval = interval;
        let newEase = ease;
        let newReps = reps;
        let newLapses = lapses;
        let newStep = step;
        const now = new Date();
        const minutes = (m: number) => new Date(now.getTime() + m * 60000);

        switch (state) {
            case 'NEW': {
                if (rating === ReviewRating.AGAIN) {
                    newState = CardState.NEW;
                    newInterval = 0;
                    newStep = 0;
                    newReps = 0;
                } else if (rating === ReviewRating.HARD) {
                    newState = CardState.LEARNING;
                    newInterval = CARD_CONSTANTS.LEARNING_STEPS[0];
                    newStep = 1;
                    newReps = 1;
                } else if (rating === ReviewRating.GOOD) {
                    newState = CardState.LEARNING;
                    newInterval = CARD_CONSTANTS.LEARNING_STEPS[1] ?? 10;
                    newStep = 1;
                    newReps = 1;
                } else {
                    newState = CardState.REVIEW;
                    newInterval = CARD_CONSTANTS.EASY_INTERVAL;
                    newStep = 0;
                    newReps = 1;
                }
                break;
            }

            case 'LEARNING':
            case 'RELEARNING': {
                if (rating === ReviewRating.AGAIN) {
                    newState = state;
                    newInterval = CARD_CONSTANTS.LEARNING_STEPS[0];
                    newStep = 0;
                    newLapses += 1;
                } else if (rating === ReviewRating.HARD) {
                    newState = state;
                    newInterval = (CARD_CONSTANTS.LEARNING_STEPS[step] ?? step * 2) * 2;
                    newStep = step;
                } else if (rating === ReviewRating.GOOD) {
                    if (step >= CARD_CONSTANTS.LEARNING_STEPS.length - 1 || !CARD_CONSTANTS.LEARNING_STEPS[step + 1]) {
                        newState = CardState.REVIEW;
                        newInterval = CARD_CONSTANTS.GRADUATING_INTERVAL;
                        newStep = 0;
                    } else {
                        newState = state;
                        newInterval = CARD_CONSTANTS.LEARNING_STEPS[step + 1];
                        newStep = step + 1;
                    }
                } else {
                    newState = CardState.REVIEW;
                    newInterval = CARD_CONSTANTS.EASY_INTERVAL;
                    newStep = 0;
                }
                break;
            }

            case 'REVIEW': {
                if (rating === ReviewRating.AGAIN) {
                    newState = CardState.RELEARNING;
                    newInterval = CARD_CONSTANTS.RELEARNING_STEPS[0];
                    newStep = 0;
                    newLapses += 1;
                    newReps = 0;
                    newEase = Math.max(CARD_CONSTANTS.MIN_EASE, ease - 0.2);
                } else if (rating === ReviewRating.HARD) {
                    newState = CardState.REVIEW;
                    newInterval = Math.round(interval * 1.2);
                    newEase = Math.max(CARD_CONSTANTS.MIN_EASE, ease - 0.15);
                    newReps += 1;
                } else if (rating === ReviewRating.GOOD) {
                    newState = CardState.REVIEW;
                    newInterval = Math.round(interval * ease);
                    newReps += 1;
                } else {
                    newState = CardState.REVIEW;
                    newInterval = Math.round(interval * ease * CARD_CONSTANTS.EASY_BONUS);
                    newEase = Math.max(CARD_CONSTANTS.MIN_EASE, ease + 0.15);
                    newReps += 1;
                }
                break;
            }
        }

        newInterval = Math.min(newInterval, CARD_CONSTANTS.MAX_INTERVAL);

        const newDue = ['LEARNING', 'RELEARNING'].includes(newState)
            ? minutes(newInterval)
            : new Date(now.getTime() + newInterval * 86400000);

        return {
            newState, newInterval, newEase, newReps, newLapses, newStep, newDue,
        };
    }

    private toResponse(card: any): CardResponseDto {
        const note = card.note as any;
        const template = card.cardTemplate as any;

        const fieldMap: Record<string, string> = {};
        if (note.word) fieldMap['Word'] = note.word;
        if (note.meaning) fieldMap['Meaning'] = note.meaning;
        if (note.ipa) fieldMap['IPA'] = note.ipa;
        if (note.example) fieldMap['Example'] = note.example;

        const render = (html: string) => {
            return html.replace(/\{\{(\w+)\}\}/g, (_, key) => fieldMap[key] ?? `{{${key}}}`);
        };

        return {
            id: card.id,
            noteId: card.noteId,
            deckId: card.deckId,
            cardTemplateId: card.cardTemplateId,
            state: card.state,
            flags: card.flags,
            due: card.due,
            frontHtml: render(template.frontHtml),
            backHtml: render(template.backHtml),
            css: template.css,
            note: {
                word: note.word,
                meaning: note.meaning,
                ipa: note.ipa,
                example: note.example,
                audioUrl: note.audioUrl,
            },
        };
    }
}
