import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto, UpdateCategoryDto, QueryCategoryDto } from './categories.dto';
import { CategoryError } from './categories.error';
import { CATEGORY_CONSTANTS } from './categories.constant';
import { paginate } from '../../common/utils/paginate.util';

@Injectable()
export class CategoriesService {
  constructor(private readonly repo: CategoriesRepository) {}

  async create(dto: CreateCategoryDto) {
    const existing = await this.repo.findBySlug(dto.slug);
    if (existing) throw CategoryError.slugTaken(dto.slug);

    let depth = 0;
    if (dto.parentId) {
      const parent = await this.repo.findById(dto.parentId);
      if (!parent) throw CategoryError.notFound(dto.parentId);
      depth = parent.depth + 1;
      if (depth > CATEGORY_CONSTANTS.MAX_DEPTH) throw CategoryError.maxDepth(CATEGORY_CONSTANTS.MAX_DEPTH);
    }

    const maxOrder = await this.repo.countByParentId(dto.parentId ?? '');

    const cat = await this.repo.create({
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      depth,
      sortOrder: maxOrder + 1,
      ...(dto.parentId && { parent: { connect: { categoryId: dto.parentId } } }),
    });

    return this.repo.findById(cat.categoryId);
  }

  async findAll(query: QueryCategoryDto) {
    const result = await this.repo.findMany(query);
    return paginate(result.data, result.total, query);
  }

  async findOne(id: string) {
    const cat = await this.repo.findById(id);
    if (!cat) throw CategoryError.notFound(id);
    return cat;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const cat = await this.findOne(id);

    if (dto.slug && dto.slug !== cat.slug) {
      const existing = await this.repo.findBySlug(dto.slug);
      if (existing) throw CategoryError.slugTaken(dto.slug);
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === id) throw CategoryError.maxDepth(CATEGORY_CONSTANTS.MAX_DEPTH);
      if (dto.parentId) {
        const parent = await this.repo.findById(dto.parentId);
        if (!parent) throw CategoryError.notFound(dto.parentId);
      }
    }

    const updated = await this.repo.update(id, {
      ...(dto.name && { name: dto.name }),
      ...(dto.slug && { slug: dto.slug }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.parentId !== undefined && {
        parent: dto.parentId ? { connect: { categoryId: dto.parentId } } : { disconnect: true },
      }),
    });

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);

    const childCount = await this.repo.countByParentId(id);
    if (childCount > 0) throw CategoryError.hasChildren(id);

    await this.repo.delete(id);
  }
}
