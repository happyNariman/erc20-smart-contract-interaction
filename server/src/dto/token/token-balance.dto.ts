import { ApiProperty } from '@nestjs/swagger';

export class TokenBalanceDto {
  constructor(params: Partial<TokenBalanceDto>) {
    Object.assign(this, params);
  }

  @ApiProperty()
  balanceRaw: bigint;

  @ApiProperty()
  balance: number;
}
