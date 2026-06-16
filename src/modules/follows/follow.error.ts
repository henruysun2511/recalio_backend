import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

export class FollowError {
    static userNotFound() {
        return new NotFoundException('Người dùng không tồn tại');
    }

    static cannotFollowSelf() {
        return new BadRequestException('Không thể follow chính mình');
    }

    static alreadyFollowing() {
        return new ConflictException('Bạn đã follow người dùng này rồi');
    }

    static notFollowing() {
        return new NotFoundException('Bạn chưa follow người dùng này');
    }
}
