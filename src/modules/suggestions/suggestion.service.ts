import { Injectable, Logger } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { SuggestionRepository } from './suggestion.repository';
import { CreateSuggestionDto } from './suggestion.dto';
import { SuggestionError } from './suggestion.error';
import { NotificationService } from '../notifications/notification.service';
import { paginate } from '../../common/utils/paginate.util';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';

@Injectable()
export class SuggestionService {
  private readonly logger = new Logger(SuggestionService.name);

  constructor(
    private readonly repo: SuggestionRepository,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(userId: string, dto: CreateSuggestionDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, username: true, displayName: true },
    });
    const suggestion = await this.repo.create(userId, dto.content, user?.email);

    const adminIds = await this.repo.findAdminIds();
    const displayName = user?.displayName || user?.username || 'Người dùng';
    for (const adminId of adminIds) {
      await this.notificationService.notifyUser(
        adminId,
        NotificationType.SUGGESTION_RECEIVED,
        'Góp ý mới',
        `${displayName} đã gửi góp ý mới`,
        { suggestionId: suggestion.id, userId },
      );
    }
    this.logger.log(
      `Suggestion ${suggestion.id}: notified ${adminIds.length} admins`,
    );

    return suggestion;
  }

  async findAll(dto: PaginationDto) {
    const { items, total } = await this.repo.findAll(dto);
    return paginate(items, total, dto);
  }

  async markAsRead(userId: string, id: string) {
    const suggestion = await this.repo.findById(id);
    if (!suggestion) throw SuggestionError.notFound();

    return this.repo.markAsRead(id);
  }
}
