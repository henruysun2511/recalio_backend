import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UpdateUserDto } from './user.dto';
import { UserError } from './user.error';

@Injectable()
export class UserService {
    constructor(private readonly repo: UserRepository) { }

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
}
