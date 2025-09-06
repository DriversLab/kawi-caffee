import { IsString } from 'class-validator';

export class VerifyOtcDto {
    @IsString()
    key: string;

    @IsString()
    code: string;
}
