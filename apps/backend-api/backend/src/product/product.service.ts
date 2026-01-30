import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  create(data: {
    name: string;
    price: number;
    description: string;
    coverImage: string;
    freeShip?: boolean;
  }) {
    return this.prisma.product.create({ data });
  }

  findAll() {
    return this.prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  }

  remove(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}
