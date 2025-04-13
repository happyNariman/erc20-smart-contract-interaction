import { ApiProperty } from '@nestjs/swagger';

import { Erc20Dto } from './erc20.dto';

export class TokenDto extends Erc20Dto {
  constructor(params: Partial<TokenDto>) {
    super(params);
    Object.assign(this, params);
  }

  @ApiProperty()
  dollarValue?: number;
}
