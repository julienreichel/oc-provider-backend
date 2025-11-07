import { IsNotEmpty, IsString } from 'class-validator';

export class SendDocumentDto {
  @IsString()
  @IsNotEmpty()
  documentId!: string;
}
