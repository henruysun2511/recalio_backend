import { Request } from 'express';

import { IAccountRequest } from './account-request.interface';

export interface RequestWithUser extends Request {
  user: IAccountRequest;
}
