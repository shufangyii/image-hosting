import { createClerkClient, User } from '@clerk/backend';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from 'jsonwebtoken';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class ClerkStrategy extends PassportStrategy(Strategy, 'clerk') {
  private clerk: ReturnType<typeof createClerkClient>;

  constructor(configService: ConfigService) {
    const secretKey = configService.get<string>('CLERK_SECRET_KEY');
    const jwtVerificationKey = configService.get<string>(
      'CLERK_JWT_VERIFICATION_KEY',
    );

    if (!secretKey || !jwtVerificationKey) {
      throw new Error(
        'CLERK_SECRET_KEY and CLERK_JWT_VERIFICATION_KEY must be defined in environment variables.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtVerificationKey,
    });

    this.clerk = createClerkClient({
      secretKey: secretKey,
      jwtKey: jwtVerificationKey,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const userId = payload.sub;
    if (!userId) {
      throw new UnauthorizedException('User ID not found in token payload.');
    }

    try {
      const user = await this.clerk.users.getUser(userId);
      return user;
    } catch (error: unknown) {
      throw new UnauthorizedException(
        'Clerk authentication failed.',
        (error as Error).message,
      );
    }
  }
}
