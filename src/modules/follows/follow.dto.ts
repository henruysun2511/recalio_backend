import { ApiProperty } from '@nestjs/swagger';

export class FollowStatusDto {
  @ApiProperty({ example: true })
  isFollowing: boolean;
}

export class FollowUserDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiProperty({ example: 'John Doe' })
  displayName: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ example: '2026-06-16T10:00:00.000Z' })
  followedAt: Date;

  @ApiProperty({ example: true })
  isFollowing: boolean;
}
