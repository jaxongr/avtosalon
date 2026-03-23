import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Email yoki parol xato');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Email yoki parol xato');

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwt.sign(payload),
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  async seedAdmin() {
    const exists = await this.prisma.user.findUnique({
      where: { email: 'admin@avtosalon.uz' },
    });
    if (!exists) {
      await this.prisma.user.create({
        data: {
          email: 'admin@avtosalon.uz',
          password: await bcrypt.hash('admin123', 10),
          name: 'Admin',
          role: 'ADMIN',
        },
      });
    }
  }
}
