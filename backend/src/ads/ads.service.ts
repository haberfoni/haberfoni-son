import { Injectable } from '@nestjs/common';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdsService {
  constructor(private prisma: PrismaService) { }

  create(createAdDto: CreateAdDto) {
    return this.prisma.ad.create({
      data: createAdDto,
    });
  }

  findAll() {
    return this.prisma.ad.findMany({
      where: { is_active: true },
    });
  }

  findOne(id: number) {
    return this.prisma.ad.findUnique({
      where: { id },
    });
  }

  update(id: number, updateAdDto: UpdateAdDto) {
    return this.prisma.ad.update({
      where: { id },
      data: updateAdDto,
    });
  }

  remove(id: number) {
    return this.prisma.ad.delete({
      where: { id },
    });
  }
}
