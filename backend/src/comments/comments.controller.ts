import { Controller, Get, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Get()
    findAll(@Query('is_approved') is_approved?: string) {
        const isApprovedBool = is_approved === 'true' ? true : (is_approved === 'false' ? false : undefined);
        return this.commentsService.findAll(isApprovedBool);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateData: any) {
        return this.commentsService.update(+id, updateData);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.commentsService.remove(+id);
    }
}
