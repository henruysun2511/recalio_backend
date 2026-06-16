import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

export class ReviewError {
    static deckNotFound() {
        return new NotFoundException('Deck không tồn tại');
    }

    static notFound() {
        return new NotFoundException('Đánh giá không tồn tại');
    }

    static notOwner() {
        return new ForbiddenException('Bạn không có quyền thao tác với đánh giá này');
    }

    static cannotReviewOwn() {
        return new BadRequestException('Không thể đánh giá deck của chính mình');
    }
}
