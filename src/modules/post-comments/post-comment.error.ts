import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

export class PostCommentError {
  static notFound() {
    return new NotFoundException('Bình luận không tồn tại');
  }

  static notOwner() {
    return new ForbiddenException(
      'Bạn không có quyền thao tác với bình luận này',
    );
  }

  static postNotFound() {
    return new NotFoundException('Bài viết không tồn tại');
  }

  static cannotReplyToReply() {
    return new BadRequestException(
      'Chỉ có thể trả lời bình luận gốc, không thể trả lời câu trả lời',
    );
  }
}
