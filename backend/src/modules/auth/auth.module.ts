import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenService } from './services/token.service';
import { MembershipService } from './services/membership.service';
import { TwoFactorService } from './services/two-factor.service';
import { UsersModule } from '../users/users.module';
import { FinanceModule } from '../finance/finance.module';

@Module({
  imports: [
    UsersModule,
    FinanceModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_EXPIRATION', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    TokenService,
    MembershipService,
    TwoFactorService,
  ],
  exports: [AuthService, TokenService, MembershipService, TwoFactorService],
})
export class AuthModule {}
