import { IsEnum } from 'class-validator';
import { ReviewStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ReviewDocumentDto {
  @ApiProperty({ enum: [ReviewStatus.approved, ReviewStatus.rejected] })
  @IsEnum(ReviewStatus)
  reviewStatus: ReviewStatus;
}
