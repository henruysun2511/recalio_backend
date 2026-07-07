import { NotFoundException } from '@nestjs/common';

export class SuggestionError {
    static notFound() {
        return new NotFoundException('Góp ý không tồn tại');
    }
}
