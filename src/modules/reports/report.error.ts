import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

export class ReportError {
    static notFound() {
        return new NotFoundException('Báo cáo không tồn tại');
    }

    static deckNotFound() {
        return new NotFoundException('Deck không tồn tại');
    }

    static cannotReportOwn() {
        return new BadRequestException('Không thể báo cáo deck của chính mình');
    }

    static alreadyReported() {
        return new ConflictException('Bạn đã báo cáo deck này rồi');
    }
}
