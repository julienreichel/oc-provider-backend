import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

const normalizeOptional = ({ value }: { value: unknown }) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }
  return value;
};

export class ListDocumentsQueryDto {
  @IsOptional()
  @Transform(normalizeOptional)
  @IsString()
  cursor?: string;

  @IsOptional()
  @Transform(({ value }) => {
    const normalized = normalizeOptional({ value });
    if (normalized === undefined) {
      return undefined;
    }
    return Number(normalized);
  })
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
