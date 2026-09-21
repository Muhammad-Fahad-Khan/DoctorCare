import { IsString, MaxLength } from 'class-validator';

export class SaveNotesDto {
  @IsString()
  @MaxLength(5000)
  doctorNotes: string;
}
