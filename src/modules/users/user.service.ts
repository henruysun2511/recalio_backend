import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UpdateUserDto, UserQueryDto, UpdateUserRoleDto } from './user.dto';
import { UserError } from './user.error';
import { AuthRepository } from '../auth/auth.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly repo: UserRepository,
    private readonly authRepo: AuthRepository,
  ) {}

  async findById(id: string) {
    return this.repo.findById(id);
  }

  async getProfile(userId: string) {
    const user = await this.repo.findById(userId);
    if (!user) throw UserError.notFound();
    const [stats, followerCount, followingCount] = await Promise.all([
      this.repo.getUserStats(userId),
      this.repo.countFollowers(userId),
      this.repo.countFollowing(userId),
    ]);
    return { ...user, stats, followerCount, followingCount };
  }

  async getPublicProfile(username: string) {
    const user = await this.repo.findByUsername(username);
    if (!user) throw UserError.notFound();
    const [stats, followerCount, followingCount] = await Promise.all([
      this.repo.getUserStats(user.id),
      this.repo.countFollowers(user.id),
      this.repo.countFollowing(user.id),
    ]);
    const { email, role, isActive, timezone, ...publicUser } = user as any;
    return { ...publicUser, stats, followerCount, followingCount };
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.repo.updateUser(userId, dto);
    if (!user) throw UserError.notFound();
    return user;
  }

  async deleteAccount(userId: string) {
    const user = await this.repo.findByIdIncludeDeleted(userId);
    if (!user || user.deletedAt) throw UserError.notFound();

    await this.repo.softDelete(userId);
    await this.authRepo.revokeUserRefreshTokens(userId);
  }

  async findAll(dto: UserQueryDto) {
    return this.repo.findAll(dto);
  }

  async toggleActive(userId: string) {
    const user = await this.repo.toggleActive(userId);
    if (!user) throw UserError.notFound();
    return user;
  }

  async updateRole(userId: string, dto: UpdateUserRoleDto) {
    const user = await this.repo.updateRole(userId, dto);
    if (!user) throw UserError.notFound();
    return user;
  }

  async getLanguages(userId: string) {
    return this.repo.findLanguages(userId);
  }
}
