import { Injectable, Logger } from '@nestjs/common';

import { EvmService } from './evm.service';
import { ConfigService } from '@nestjs/config';
import { Erc20Service } from './erc20.service';
import { TokenDto } from 'api/dto';

@Injectable()
export class TokenService extends EvmService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    configService: ConfigService,
    private erc20Service: Erc20Service,
  ) {
    super(configService);
  }

  async get(chainId: number, tokenAddress: `0x${string}`): Promise<TokenDto> {
    const erc20 = await this.erc20Service.get(chainId, tokenAddress);

    // get dollar value

    throw new Error('Method not implemented.');
  }
}
