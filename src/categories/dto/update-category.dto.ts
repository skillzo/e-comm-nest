import { IsString, IsUUID } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  name: string;
}
