import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DECK_CONSTANTS } from './deck.constant';

export class DeckError {
  static notFound() {
    return new NotFoundException('Deck không tồn tại');
  }

  static notOwner() {
    return new ForbiddenException('Bạn không có quyền thao tác với deck này');
  }

  static nameTaken(name: string) {
    return new ConflictException(`Bạn đã có deck tên "${name}"`);
  }

  static alreadyCloned() {
    return new ConflictException('Bạn đã clone deck này rồi');
  }

  static cannotCloneOwn() {
    return new BadRequestException('Không thể clone deck của chính mình');
  }

  static maxDepthReached() {
    return new BadRequestException(
      `Không thể lồng deck quá ${DECK_CONSTANTS.MAX_DEPTH} cấp`,
    );
  }
}
