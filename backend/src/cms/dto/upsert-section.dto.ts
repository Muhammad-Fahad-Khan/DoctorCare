import { IsInt, IsObject, IsString, Min } from 'class-validator';

export class UpsertSectionDto {
  @IsString()
  sectionKey: string;

  @IsObject()
  content: Record<string, unknown>;

  @IsInt()
  @Min(0)
  order: number;
}
