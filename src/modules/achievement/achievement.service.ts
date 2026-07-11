import { Injectable } from '@nestjs/common';
import { AchievementRepository } from './achievement.repository';
import {
  CreateAchievementDto,
  UpdateAchievementDto,
  QueryAchievementDto,
} from './achievement.dto';
import { AchievementError } from './achievement.error';

@Injectable()
export class AchievementService {
  constructor(private readonly repo: AchievementRepository) {}

  async create(dto: CreateAchievementDto) {
    const existing = await this.repo.findByKey(dto.key);
    if (existing) throw AchievementError.keyExists(dto.key);
    return this.repo.create(dto);
  }

  async findAll(dto: QueryAchievementDto) {
    return this.repo.findAll(dto);
  }

  async findOne(id: string) {
    const achievement = await this.repo.findOne(id);
    if (!achievement) throw AchievementError.notFound();
    return achievement;
  }

  async findByKey(key: string) {
    const achievement = await this.repo.findByKey(key);
    if (!achievement) throw AchievementError.notFound();
    return achievement;
  }

  async update(id: string, dto: UpdateAchievementDto) {
    await this.findOne(id);
    return this.repo.update(id, dto);
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
