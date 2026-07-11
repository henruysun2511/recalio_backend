export interface IUserRequest {
  id: string;
  username: string;
  role: string;
  displayName?: string;
  avatarUrl?: string | null;
}
