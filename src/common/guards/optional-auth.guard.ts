import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { config } from '../../config/env';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const payload = this.jwtService.verify(token, {
          secret: config.jwt.accessSecret,
        }) as { userId: string; email: string };

        const user = await this.prisma.user.findUnique({
          where: { id: payload.userId },
        });

        if (user) {
          request.user = user;
        }
      } catch (error) {
        // Optional auth, so we just continue without user
      }
    }

    return true;
  }
}
