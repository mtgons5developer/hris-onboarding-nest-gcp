import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDocumentDto {
  @ApiProperty()
  @IsUUID()
  caseId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  taskId?: string;

  @ApiProperty()
  @IsString()
  filename: string;

  @ApiProperty()
  @IsString()
  contentType: string;

  @ApiProperty({ description: 'File size in bytes (max 10 MB per file)' })
  @IsInt()
  @Min(1)
  sizeBytes: number;
}
