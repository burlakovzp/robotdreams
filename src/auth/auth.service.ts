import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenEntity } from './token.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(TokenEntity)
    private tokenRepository: Repository<TokenEntity>,
    private jwtService: JwtService,
    private usersService: UserService,
  ) {}

  async login(data: UserEntity): Promise<TokenEntity> {
    const accessToken = this.jwtService.sign(data, {
      expiresIn: '3h',
      secret: process.env.JWT_SECRET,
    });

    const refreshToken = this.jwtService.sign(data, {
      expiresIn: '7d',
      secret: process.env.JWT_SECRET,
    });

    if (!data.email || !data.password) {
      throw new HttpException('Invalid data', HttpStatus.BAD_REQUEST);
    }

    const user = await this.validateUser(data);

    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    return await this.saveTokens(user.id, accessToken, refreshToken);
  }

  async validateUser(data: UserEntity): Promise<UserEntity | null> {
    const { email, password } = data;

    const user = await this.usersService.findByEmail(email);

    if (user && (await user.comparePassword(password))) {
      return user;
    }
    return null;
  }

  async findAccessToken(token: string): Promise<TokenEntity> {
    return await this.tokenRepository.findOne({
      where: { access_token: token },
    });
  }

  async findRefreshToken(token: string): Promise<TokenEntity> {
    return await this.tokenRepository.findOne({
      where: { refresh_token: token },
    });
  }

  async saveTokens(
    userId: number,
    accessToken: string,
    refreshToken: string,
  ): Promise<TokenEntity> {
    const token = new TokenEntity();
    token.user_id = userId;
    token.access_token = accessToken;
    token.refresh_token = refreshToken;

    return await this.tokenRepository.save(token);
  }

  async refresh(data: {
    refresh_token: TokenEntity['refresh_token'];
  }): Promise<TokenEntity> {
    const token = await this.findRefreshToken(data.refresh_token);

    if (!token) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.usersService.findOne(token.user_id);

    if (!user) {
      throw new HttpException('Invalid user', HttpStatus.UNAUTHORIZED);
    }

    // Creating a plain object to sign with the JWT
    const userPayload = { ...user };

    const accessToken = this.jwtService.sign(userPayload, {
      expiresIn: '3h',
      secret: process.env.JWT_SECRET,
    });

    const newRefreshToken = this.jwtService.sign(userPayload, {
      expiresIn: '7d',
      secret: process.env.JWT_SECRET,
    });

    // Delete old refresh token
    this.tokenRepository.delete({ id: token.id });

    return await this.saveTokens(user.id, accessToken, newRefreshToken);
  }
}
