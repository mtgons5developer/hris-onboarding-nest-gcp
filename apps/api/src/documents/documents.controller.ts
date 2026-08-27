import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
  RawBodyRequest,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ReviewStatus, User, UserRole } from '@prisma/client';
import { Request, Response } from 'express';
import { DocumentsService } from './documents.service';
import { RegisterDocumentDto } from './dto/register-document.dto';
import { ReviewDocumentDto } from './dto/review-document.dto';
import { JwtAuthGuard } from '../identity/jwt-auth.guard';
import { RolesGuard } from '../identity/roles.guard';
import { Roles } from '../identity/roles.decorator';
import { CurrentUser } from '../identity/current-user.decorator';

@ApiTags('documents')
@ApiBearerAuth()
@Controller('api/v1/documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  register(@Body() dto: RegisterDocumentDto, @CurrentUser() user: User) {
    return this.documents.register(dto, user);
  }

  @Get(':id/download-url')
  @UseGuards(JwtAuthGuard, RolesGuard)
  downloadUrl(@Param('id') id: string, @CurrentUser() user: User) {
    return this.documents.getDownloadUrl(id, user);
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async download(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const file = await this.documents.serveDownload(id, user);
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `inline; filename="${file.filename.replace(/"/g, '')}"`);
    res.send(file.data);
  }

  @Put(':id/upload')
  @ApiConsumes('application/octet-stream')
  async upload(@Param('id') id: string, @Req() req: RawBodyRequest<Request>) {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);
    return this.documents.saveUpload(id, buffer, req.headers['content-type'] ?? 'application/octet-stream');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.documents.remove(id, user);
  }

  @Post(':id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.hr_admin)
  review(@Param('id') id: string, @Body() dto: ReviewDocumentDto, @CurrentUser() user: User) {
    return this.documents.review(id, dto.reviewStatus as ReviewStatus, user);
  }
}
