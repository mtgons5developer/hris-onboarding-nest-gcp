import { IsEnum, IsOptional } from 'class-validator';
import { TaskStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class PatchTaskDto {
  @ApiProperty({ enum: [TaskStatus.done, TaskStatus.waived, TaskStatus.rejected, TaskStatus.pending] })
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsOptional()
  note?: string;
}
