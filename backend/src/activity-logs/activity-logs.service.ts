import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityLogsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.activityLog.findMany({ orderBy: { created_at: 'desc' } });
    }

    async create(data: any) {
        const payload = { ...data };
        if (payload.entity_id) {
            payload.entity_id = Number(payload.entity_id);
        }
        return this.prisma.activityLog.create({ data: payload });
    }

    async remove(id: number) {
        return this.prisma.activityLog.delete({ where: { id } });
    }
}
