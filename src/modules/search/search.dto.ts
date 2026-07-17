import {
  IsOptional,
  IsString,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { PAGINATION } from '../../common/constants/pagination.constant';
import { SEARCH_CONSTANTS } from './search.constant';

export enum SearchEntity {
  ALL = 'all',
  DECKS = 'decks',
  POSTS = 'posts',
  USERS = 'users',
}

export class SearchQueryDto extends PaginationDto {
  @ApiProperty({ example: 'ielts', description: 'Search keyword' })
  @IsString()
  @MinLength(SEARCH_CONSTANTS.SEARCH_MIN_LENGTH)
  @MaxLength(SEARCH_CONSTANTS.SEARCH_MAX_LENGTH)
  @Transform(({ value }) => value?.trim())
  q: string;

  @ApiPropertyOptional({
    enum: SearchEntity,
    default: SearchEntity.ALL,
  })
  @IsOptional()
  @IsEnum(SearchEntity)
  entity?: SearchEntity = SearchEntity.ALL;

  get take(): number {
    return Math.min(this.limit, PAGINATION.MAX_LIMIT);
  }
}

export class DeckSearchResult {
  id: string;
  name: string;
  fullPath: string;
  description: string | null;
  coverImage: string | null;
  tags: string[];
  downloadCount: number;
  isFeatured: boolean;
  createdAt: Date;
  user: { id: string; username: string; displayName: string; avatarUrl: string | null };
  _count: { notes: number; cards: number };
}

export class PostSearchResult {
  id: string;
  title: string;
  content: string | null;
  tags: string[];
  likeCount: number;
  createdAt: Date;
  user: { id: string; username: string; displayName: string; avatarUrl: string | null };
}

export class UserSearchResult {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
}

export class SearchResponseDto {
  decks: { data: DeckSearchResult[]; total: number };
  posts: { data: PostSearchResult[]; total: number };
  users: { data: UserSearchResult[]; total: number };
}