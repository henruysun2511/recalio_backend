import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

export class PostError {
    static notFound() {
        return new NotFoundException('Bài viết không tồn tại');
    }

    static notOwner() {
        return new ForbiddenException('Bạn không có quyền thao tác với bài viết này');
    }

    static deckNotOwned() {
        return new BadRequestException('Bạn chỉ có thể thêm deck của chính mình');
    }

    static alreadyReported() {
        return new BadRequestException('Bạn đã báo cáo bài viết này rồi');
    }

    static cannotReportOwn() {
        return new BadRequestException('Không thể báo cáo bài viết của chính mình');
    }
}
