import { IsOptional, IsString, IsUUID } from 'class-validator';
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
}
