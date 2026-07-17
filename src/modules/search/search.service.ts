import { Injectable } from '@nestjs/common';
import { SearchRepository } from './search.repository';
import { SearchQueryDto, SearchEntity, SearchResponseDto } from './search.dto';

@Injectable()
export class SearchService {
  constructor(private readonly repo: SearchRepository) {}

  async search(dto: SearchQueryDto): Promise<SearchResponseDto> {
    const q = dto.q.trim();
    const entity = dto.entity ?? SearchEntity.ALL;

    if (entity === SearchEntity.DECKS) {
      const { items, total } = await this.repo.searchDecks(q, dto);
      return { decks: { data: items, total }, posts: { data: [], total: 0 }, users: { data: [], total: 0 } };
    }

    if (entity === SearchEntity.POSTS) {
      const { items, total } = await this.repo.searchPosts(q, dto);
      return { decks: { data: [], total: 0 }, posts: { data: items, total }, users: { data: [], total: 0 } };
    }

    if (entity === SearchEntity.USERS) {
      const { items, total } = await this.repo.searchUsers(q, dto);
      return { decks: { data: [], total: 0 }, posts: { data: [], total: 0 }, users: { data: items, total } };
    }

    const [decks, posts, users] = await Promise.all([
      this.repo.searchDecks(q, dto),
      this.repo.searchPosts(q, dto),
      this.repo.searchUsers(q, dto),
    ]);

    return {
      decks: { data: decks.items, total: decks.total },
      posts: { data: posts.items, total: posts.total },
      users: { data: users.items, total: users.total },
    };
  }
}