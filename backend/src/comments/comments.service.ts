import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
    constructor(private prisma: PrismaService) { }

    async findAll(is_approved?: boolean) {
        const where = is_approved !== undefined ? { is_approved } : {};
        return this.prisma.comment.findMany({ where, orderBy: { created_at: 'desc' } });
    }

    async update(id: number, data: any) {
        return this.prisma.comment.update({ where: { id }, data });
    }

    async remove(id: number) {
        return this.prisma.comment.delete({ where: { id } });
    }
}
