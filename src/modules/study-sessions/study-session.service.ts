import { Injectable, Logger } from '@nestjs/common';
import { StudySessionRepository } from './study-session.repository';
import { DeckService } from '../decks/deck.service';
import { SessionError } from './study-session.error';
import { SESSION_CONSTANTS } from './study-session.constant';
import {
  StartSessionDto,
  ListSessionQueryDto,
  SessionResponseDto,
} from './study-session.dto';
import { SessionType } from '@prisma/client';
import { paginate } from '../../common/utils/paginate.util';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@Injectable()
export class StudySessionService {
  private readonly logger = new Logger(StudySessionService.name);

  constructor(
    private readonly repo: StudySessionRepository,
    private readonly deckService: DeckService,
  ) { }

  async start(userId: string, dto: StartSessionDto) {
    if (dto.deckId) {
      const ownerId = await this.deckService.checkReadAccess(
        dto.deckId,
        userId,
      );
      if (!ownerId) throw SessionError.notFound();

      const existing = await this.repo.findActiveByUserAndDeck(
        userId,
        dto.deckId,
      );
      if (existing) return existing;
    }

    const activeCount = await this.repo.countActiveSessions(userId);
    if (activeCount >= SESSION_CONSTANTS.MAX_ACTIVE_SESSIONS) {
      throw SessionError.tooManyActive();
    }

    const session = await this.repo.create(
      userId,
      dto.deckId,
      dto.sessionType,
    );
    return session;
  }

  async end(userId: string, id: string) {
    const session = await this.repo.findById(id);
    if (!session) throw SessionError.notFound();
    if (session.userId !== userId) throw SessionError.notOwner();
    if (session.endedAt) throw SessionError.alreadyEnded();

    const updated = await this.repo.update(id, { endedAt: new Date() });
    return updated;
  }

  async getById(userId: string, id: string): Promise<SessionResponseDto> {
    const session = await this.repo.findById(id);
    if (!session) throw SessionError.notFound();
    if (session.userId !== userId) throw SessionError.notOwner();

    const stats = await this.repo.getSessionReviewStats(id);
    return {
      id: session.id,
      deckId: session.deckId,
      sessionType: session.sessionType,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      stats,
    };
  }

  async list(userId: string, dto: ListSessionQueryDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? SESSION_CONSTANTS.DEFAULT_LIMIT;
    const { items, total } = await this.repo.findByUser(
      userId,
      dto.deckId,
      page,
      limit,
    );
    return paginate(items, total, { page, limit } as PaginationDto);
  }

  async getSessionType(userId: string, sessionId: string): Promise<SessionType | null> {
    const session = await this.repo.findById(sessionId);
    if (!session || session.userId !== userId) return null;
    return session.sessionType;
  }

  async getReviewLogs(userId: string, id: string, dto: PaginationDto) {
    const session = await this.repo.findById(id);
    if (!session) throw SessionError.notFound();
    if (session.userId !== userId) throw SessionError.notOwner();

    const page = dto.page ?? 1;
    const limit = dto.limit ?? SESSION_CONSTANTS.DEFAULT_LIMIT;
    const { items, total } = await this.repo.findReviewLogs(id, page, limit);
    return paginate(items, total, { page, limit } as PaginationDto);
  }
}
