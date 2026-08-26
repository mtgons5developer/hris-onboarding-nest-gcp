import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCaseDto {
  @ApiProperty()
  @IsUUID()
  employeeId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  offerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;
}
