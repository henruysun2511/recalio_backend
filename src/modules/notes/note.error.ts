import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { NOTE_CONSTANTS } from './note.constant';

export class NoteError {
  static notFound() {
    return new NotFoundException('Note không tồn tại');
  }

  static deckNotFound() {
    return new NotFoundException('Deck không tồn tại');
  }

  static notOwner() {
    return new ForbiddenException('Bạn không có quyền thao tác với note này');
  }

  static deckNotAccessible() {
    return new NotFoundException('Deck không tồn tại hoặc không thể truy cập');
  }

  static limitExceeded() {
    return new BadRequestException(
      `Deck đã đạt giới hạn ${NOTE_CONSTANTS.NOTES_PER_DECK_MAX} notes`,
    );
  }

  static invalidClozeSyntax() {
    return new BadRequestException('Nội dung Cloze phải chứa ít nhất 1 vùng ẩn dạng {{c1::...}}');
  }

  static invalidOcclusionMasks() {
    return new BadRequestException('Image Occlusion cần ít nhất 1 vùng che');
  }
}
