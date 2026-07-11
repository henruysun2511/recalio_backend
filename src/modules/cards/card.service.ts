import { Injectable, Logger } from '@nestjs/common';
import { CardRepository } from './card.repository';
import { DeckService } from '../decks/deck.service';
import { GamificationService } from '../gamification/gamification.service';
import { CardError } from './card.error';
import {
  DueCardsQueryDto,
  ReviewCardDto,
  CardResponseDto,
  CardStatsDto,
} from './card.dto';
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
    private readonly gamificationService: GamificationService,
  ) {}

  async getDueCards(userId: string, dto: DueCardsQueryDto) {
    const page = dto.page ?? 1;
    const limit = Math.min(
      dto.limit ?? CARD_CONSTANTS.DEFAULT_LIMIT,
      CARD_CONSTANTS.MAX_LIMIT,
    );

    if (dto.deckId) {
      const ownerId = await this.deckService.checkReadAccess(
        dto.deckId,
        userId,
      );
      if (!ownerId) throw CardError.notFound();
    }

    let newLimit: number | null = null;
    let reviewLimit: number | null = null;
    if (dto.deckId) {
      const settings = await this.repo.findDeckSettings(dto.deckId);
      if (settings) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const counts = await this.repo.countTodayReviews(
          userId,
          dto.deckId,
          todayStart,
        );
        newLimit = Math.max(0, settings.newCardsPerDay - counts.newCards);
        reviewLimit = Math.max(0, settings.reviewsPerDay - counts.reviewCards);
      }
    }

    const { items, total } = await this.repo.findDueCards(
      userId,
      dto.deckId,
      limit,
      newLimit,
      reviewLimit,
    );
    return paginate(
      items.map((item) => this.toResponse(item)),
      total,
      { page, limit } as PaginationDto,
    );
  }

  async findByDeck(
    userId: string,
    deckId: string,
    state?: string,
    page: number = 1,
    limit: number = CARD_CONSTANTS.DEFAULT_LIMIT,
  ) {
    const ownerId = await this.deckService.checkReadAccess(deckId, userId);
    if (!ownerId) throw CardError.notFound();

    const { items, total } = await this.repo.findByDeck(
      ownerId,
      deckId,
      state,
      page,
      limit,
    );
    return paginate(
      items.map((item) => this.toResponse(item)),
      total,
      { page, limit } as PaginationDto,
    );
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
    if (card.state === CardState.SUSPENDED) throw CardError.suspended();

    const now = new Date();
    const intervalBefore = card.interval;
    const easeBefore = card.easeFactor;

    const rawSettings = (card as any).deck?.setting ?? null;
    const settings = rawSettings
      ? {
          learningSteps:
            rawSettings.learningSteps?.split(' ').map(Number) ??
            CARD_CONSTANTS.LEARNING_STEPS,
          graduatingInterval:
            rawSettings.graduatingInterval ??
            CARD_CONSTANTS.GRADUATING_INTERVAL,
          easyInterval:
            rawSettings.easyInterval ?? CARD_CONSTANTS.EASY_INTERVAL,
          intervalModifier: rawSettings.intervalModifier ?? 1,
          easyBonus: rawSettings.easyBonus ?? CARD_CONSTANTS.EASY_BONUS,
          hardInterval:
            rawSettings.hardInterval ?? CARD_CONSTANTS.HARD_INTERVAL,
          maximumInterval:
            rawSettings.maximumInterval ?? CARD_CONSTANTS.MAX_INTERVAL,
          lapseSteps:
            rawSettings.lapseSteps?.split(' ').map(Number) ??
            CARD_CONSTANTS.RELEARNING_STEPS,
          minimumInterval: rawSettings.minimumInterval ?? 1,
        }
      : undefined;
    const result = this.calculateSM2(
      dto.rating,
      card.state,
      card.interval,
      card.easeFactor,
      card.repetitions,
      card.lapses,
      card.currentStep,
      settings,
    );

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

    const gamification = await this.gamificationService.awardReviewXp(userId);

    this.logger.log(
      `Card ${id} reviewed: ${card.state}→${result.newState}, rating=${dto.rating}`,
    );

    return {
      state: result.newState,
      due: result.newDue,
      interval: result.newInterval,
      easeFactor: result.newEase,
      xpEarned: gamification.xpEarned,
      dailyGoalBonus: gamification.dailyGoalBonus,
      achievementUnlocked: gamification.achievementUnlocked,
    };
  }

  async toggleSuspend(userId: string, id: string) {
    const card = await this.repo.findById(id);
    if (!card) throw CardError.notFound();
    if (card.userId !== userId) throw CardError.notOwner();

    const newState =
      card.state === CardState.SUSPENDED ? CardState.NEW : CardState.SUSPENDED;
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
      suspended: stats.SUSPENDED,
      total: stats.NEW + stats.LEARNING + stats.REVIEW + stats.SUSPENDED,
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
    settings?: {
      learningSteps: number[];
      graduatingInterval: number;
      easyInterval: number;
      intervalModifier: number;
      easyBonus: number;
      hardInterval: number;
      maximumInterval: number;
      lapseSteps: number[];
      minimumInterval: number;
    },
  ) {
    const learningSteps =
      settings?.learningSteps ?? CARD_CONSTANTS.LEARNING_STEPS;
    const graduatingInterval =
      settings?.graduatingInterval ?? CARD_CONSTANTS.GRADUATING_INTERVAL;
    const easyInterval = settings?.easyInterval ?? CARD_CONSTANTS.EASY_INTERVAL;
    const easyBonus = settings?.easyBonus ?? CARD_CONSTANTS.EASY_BONUS;
    const maximumInterval =
      settings?.maximumInterval ?? CARD_CONSTANTS.MAX_INTERVAL;
    const lapseSteps = settings?.lapseSteps ?? CARD_CONSTANTS.RELEARNING_STEPS;
    const hardInterval = settings?.hardInterval ?? CARD_CONSTANTS.HARD_INTERVAL;
    const intervalModifier = settings?.intervalModifier ?? 1;
    const minimumInterval = settings?.minimumInterval ?? 1;

    let newState = state;
    let newInterval = interval;
    let newEase = ease;
    let newReps = reps;
    let newLapses = lapses;
    let newStep = step;
    const now = new Date();
    const minutes = (m: number) => new Date(now.getTime() + m * 60000);

    switch (state) {
      case CardState.NEW: {
        if (rating === ReviewRating.AGAIN) {
          newState = CardState.NEW;
          newInterval = 0;
          newStep = 0;
          newReps = 0;
        } else if (rating === ReviewRating.HARD) {
          newState = CardState.LEARNING;
          newInterval = learningSteps[0];
          newStep = 1;
          newReps = 1;
        } else if (rating === ReviewRating.GOOD) {
          newState = CardState.LEARNING;
          newInterval = learningSteps[1] ?? 10;
          newStep = 1;
          newReps = 1;
        } else {
          newState = CardState.REVIEW;
          newInterval = easyInterval;
          newStep = 0;
          newReps = 1;
        }
        break;
      }

      case CardState.LEARNING:
      case CardState.RELEARNING: {
        if (rating === ReviewRating.AGAIN) {
          newState = state;
          newInterval = learningSteps[0];
          newStep = 0;
          newLapses += 1;
        } else if (rating === ReviewRating.HARD) {
          newState = state;
          newInterval = (learningSteps[step] ?? step * 2) * 2;
          newStep = step;
        } else if (rating === ReviewRating.GOOD) {
          if (step >= learningSteps.length - 1 || !learningSteps[step + 1]) {
            newState = CardState.REVIEW;
            newInterval = graduatingInterval;
            newStep = 0;
          } else {
            newState = state;
            newInterval = learningSteps[step + 1];
            newStep = step + 1;
          }
        } else {
          newState = CardState.REVIEW;
          newInterval = easyInterval;
          newStep = 0;
        }
        break;
      }

      case CardState.REVIEW: {
        if (rating === ReviewRating.AGAIN) {
          newState = CardState.RELEARNING;
          newInterval = lapseSteps[0];
          newStep = 0;
          newLapses += 1;
          newReps = 0;
          newEase = Math.max(CARD_CONSTANTS.MIN_EASE, ease - 0.2);
        } else if (rating === ReviewRating.HARD) {
          newState = CardState.REVIEW;
          newInterval = Math.round(
            Math.max(interval * hardInterval, minimumInterval),
          );
          newEase = Math.max(CARD_CONSTANTS.MIN_EASE, ease - 0.15);
          newReps += 1;
        } else if (rating === ReviewRating.GOOD) {
          newState = CardState.REVIEW;
          newInterval = Math.round(
            Math.max(interval * ease * intervalModifier, minimumInterval),
          );
          newReps += 1;
        } else {
          newState = CardState.REVIEW;
          newInterval = Math.round(
            Math.max(
              interval * ease * easyBonus * intervalModifier,
              minimumInterval,
            ),
          );
          newEase = Math.max(CARD_CONSTANTS.MIN_EASE, ease + 0.15);
          newReps += 1;
        }
        break;
      }
    }

    newInterval = Math.min(newInterval, maximumInterval);

    const newDue =
      newState === CardState.LEARNING || newState === CardState.RELEARNING
        ? minutes(newInterval)
        : new Date(now.getTime() + newInterval * 86400000);

    return {
      newState,
      newInterval,
      newEase,
      newReps,
      newLapses,
      newStep,
      newDue,
    };
  }

  private toResponse(card: any): CardResponseDto {
    const note = card.note;
    const template = card.cardTemplate;

    const fieldMap: Record<string, string> = {};
    if (note.word) fieldMap['Word'] = note.word;
    if (note.meaning) fieldMap['Meaning'] = note.meaning;
    if (note.ipa) fieldMap['IPA'] = note.ipa;
    if (note.partOfSpeech) fieldMap['PartOfSpeech'] = note.partOfSpeech;
    if (note.example) fieldMap['Example'] = note.example;
    if (note.audioUrl) {
      fieldMap['AudioUrl'] = note.audioUrl;
      fieldMap['Audio'] = `<button onclick="new Audio('${note.audioUrl}').play()" class="card-audio-btn">🔊 Nghe</button>`;
    }
    if (note.imageUrl) {
      fieldMap['ImageUrl'] = note.imageUrl;
      fieldMap['Image'] = `<img src="${note.imageUrl}" class="card-image" />`;
    }
    if (note.word) {
      fieldMap['Front'] = note.word;
      fieldMap['Text'] = note.word;
    }
    if (note.meaning) fieldMap['Back'] = note.meaning;
    if (note.example) fieldMap['Extra'] = note.example;

    if (note.fields && typeof note.fields === 'object') {
      for (const [key, val] of Object.entries(note.fields)) {
        if (typeof val === 'string') fieldMap[key] = val;
      }
    }

    const render = (html: string) => {
      return html.replace(
        /\{\{(\w+)\}\}/g,
        (_, key) => fieldMap[key] ?? `{{${key}}}`,
      );
    };

    return {
      id: card.id,
      noteId: card.noteId,
      deckId: card.deckId,
      cardTemplateId: card.cardTemplateId,
      state: card.state,
      due: card.due,
      frontHtml: render(template.frontHtml),
      backHtml: render(template.backHtml),
      css: template.css,
      note: {
        word: note.word,
        meaning: note.meaning,
        ipa: note.ipa,
        partOfSpeech: note.partOfSpeech,
        example: note.example,
        audioUrl: note.audioUrl,
        imageUrl: note.imageUrl,
      },
    };
  }
}
