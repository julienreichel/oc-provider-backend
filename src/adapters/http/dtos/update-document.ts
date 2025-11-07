import { Transform } from 'class-transformer';
import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import type { DocumentStatus } from '../../../domain/entities/document';

const TRIM_TRANSFORM = Transform(({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value,
);

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  @TRIM_TRANSFORM
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @TRIM_TRANSFORM
  content?: string;

  @IsOptional()
  @IsIn(['draft', 'final'])
  status?: DocumentStatus;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @TRIM_TRANSFORM
  accessCode?: string | null;
}
