import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services';

@Injectable()
export class AdminMiddleware implements NestMiddleware {
  constructor(private readonly adminService: AdminService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const email = req.headers['x-user-email'];
    if (!email || !(await this.adminService.isAdmin(email as string))) {
      throw new UnauthorizedException('Only admin can access this route');
    }
    next();
  }
}
