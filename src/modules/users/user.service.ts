import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UpdateUserDto, UserQueryDto, UpdateUserRoleDto } from './user.dto';
import { UserError } from './user.error';

@Injectable()
export class UserService {
    constructor(private readonly repo: UserRepository) { }

    async findById(id: string) {
        return this.repo.findById(id);
    }

    async getProfile(userId: string) {
        const user = await this.repo.findById(userId);
        if (!user) throw UserError.notFound();
        return user;
    }

    async updateProfile(userId: string, dto: UpdateUserDto) {
        const user = await this.repo.updateUser(userId, dto);
        if (!user) throw UserError.notFound();
        return user;
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
}
