import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';
import { UpdateUserDto } from './user.dto';

@Injectable()
export class UserRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                displayName: true,
                avatarUrl: true,
                bio: true,
                role: true,
                timezone: true,
                createdAt: true,
            },
        });
    }

    async updateUser(id: string, dto: UpdateUserDto) {
        return this.prisma.user.update({
            where: { id },
            data: dto,
            select: {
                id: true,
                username: true,
                email: true,
                displayName: true,
                avatarUrl: true,
                bio: true,
                role: true,
                timezone: true,
                createdAt: true,
            },
        });
    }
}
