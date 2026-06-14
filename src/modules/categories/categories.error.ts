import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

export class CategoryError {
  static notFound(id: string) {
    return new NotFoundException(`Category ${id} not found`);
  }

  static slugTaken(slug: string) {
    return new ConflictException(`Slug "${slug}" already exists`);
  }

  static hasChildren(id: string) {
    return new BadRequestException(`Category ${id} still has child categories`);
  }

  static maxDepth(depth: number) {
    return new BadRequestException(`Max category depth is ${depth}`);
  }
}
