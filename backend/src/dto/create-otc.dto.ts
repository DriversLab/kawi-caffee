import { IsString } from 'class-validator';

export class GenerateOtcDto {
  @IsString()
  key: string; // unique session/user identifier
}
