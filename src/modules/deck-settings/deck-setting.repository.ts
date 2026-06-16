import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UpdateDeckSettingDto } from './deck-setting.dto';

const deckSettingSelect = {
    id: true,
    deckId: true,
    algorithm: true,
    newCardsPerDay: true,
    reviewsPerDay: true,
    learningSteps: true,
    graduatingInterval: true,
    easyInterval: true,
    intervalModifier: true,
    easyBonus: true,
    hardInterval: true,
    maximumInterval: true,
    lapseSteps: true,
    minimumInterval: true,
    leechThreshold: true,
    leechAction: true,
    fsrsWeights: true,
    requestRetention: true,
    updatedAt: true,
} satisfies Prisma.DeckSettingSelect;

@Injectable()
export class DeckSettingRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findByDeckId(deckId: string) {
        return this.prisma.deckSetting.findUnique({
            where: { deckId },
            select: deckSettingSelect,
        });
    }

    async update(deckId: string, dto: UpdateDeckSettingDto) {
        return this.prisma.deckSetting.update({
            where: { deckId },
            data: dto,
            select: deckSettingSelect,
        });
    }
}
