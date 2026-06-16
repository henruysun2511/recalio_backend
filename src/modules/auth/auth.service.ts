import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AuthRepository } from './auth.repository';
import { RegisterDto, LoginDto } from './auth.dto';
import { AuthError } from './auth.error';
import { AUTH_CONSTANTS } from './auth.constant';
import { IUserRequest } from 'src/common/interfaces/user-request.interface';

export interface GoogleProfile {
    googleId: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly repo: AuthRepository,
        private readonly jwt: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        const [existingUser, existingEmail] = await Promise.all([
            this.repo.findByUsername(dto.username),
            this.repo.findByEmail(dto.email),
        ]);
        if (existingUser) throw AuthError.usernameTaken(dto.username);
        if (existingEmail) throw AuthError.emailTaken(dto.email);

        const passwordHash = await bcrypt.hash(dto.password, AUTH_CONSTANTS.BCRYPT_ROUNDS);
        const user = await this.repo.createUser({
            username: dto.username,
            email: dto.email,
            passwordHash,
            displayName: dto.displayName,
        });

        return this.generateTokens(user);
    }

    async login(dto: LoginDto) {
        const user = await this.repo.findByUsername(dto.username);
        if (!user) throw AuthError.userNotFound(dto.username);
        if (!user.passwordHash) throw AuthError.googleLoginOnly();

        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid) throw AuthError.invalidPassword();

        return this.generateTokens(user);
    }

    async handleGoogleLogin(profile: GoogleProfile) {
        let user = await this.repo.findByGoogleId(profile.googleId);
        if (user) return user;

        const existingEmail = await this.repo.findByEmail(profile.email);
        if (existingEmail) {
            return this.repo.linkGoogle(existingEmail.id, profile.googleId);
        }

        const base = profile.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase().slice(0, 30);
        let username = base;
        let suffix = 1;
        while (await this.repo.findByUsername(username)) {
            username = `${base}${suffix}`.slice(0, 30);
            suffix++;
        }

        return this.repo.createUser({
            username,
            email: profile.email,
            passwordHash: null,
            displayName: profile.displayName,
            googleId: profile.googleId,
            avatarUrl: profile.avatarUrl,
        });
    }

    async refresh(refreshToken: string) {
        const stored = await this.repo.findRefreshToken(refreshToken);
        if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
            throw AuthError.invalidRefreshToken();
        }

        await this.repo.revokeRefreshToken(refreshToken);

        const user = await this.repo.findById(stored.userId);
        if (!user) throw AuthError.userDeleted();

        return this.generateTokens(user);
    }

    async logout(refreshToken: string) {
        await this.repo.revokeRefreshToken(refreshToken);
    }

    async logoutAll(userId: string) {
        await this.repo.revokeUserRefreshTokens(userId);
    }

    async generateTokens(user: IUserRequest) {
        const accessToken = this.jwt.sign({ sub: user.id, username: user.username, role: user.role });

        const refreshToken = crypto.randomBytes(AUTH_CONSTANTS.REFRESH_TOKEN_BYTES).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await this.repo.saveRefreshToken({
            userId: user.id,
            token: refreshToken,
            device: null,
            expiresAt,
        });

        return {
            accessToken,
            refreshToken,
            expiresAt,
            user: {
                username: user.username,
                role: user.role,
            },
        };
    }
}
