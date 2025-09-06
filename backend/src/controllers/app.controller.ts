import { Body, Controller, Logger, Post } from '@nestjs/common';
import { AppService } from '../services';
import { GenerateOtcDto, VerifyOtcDto } from '../dto';

@Controller()
export class AppController {
  private logger: Logger;
  constructor(private readonly appService: AppService) {
    this.logger = new Logger(AppController.name);
  }

  @Post('create')
  async generate(@Body() dto: GenerateOtcDto) {
    const code = await this.appService.createOTC(dto.key);
    return { key: dto.key, code };
  }

  @Post('verify')
  async verifyOTC(@Body() dto: VerifyOtcDto) {
    this.logger.log(dto);
    const success = await this.appService.verifyOTC(dto.key, dto.code);
    return { success };
  }
}
