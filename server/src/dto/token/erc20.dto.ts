import { ApiProperty } from '@nestjs/swagger';

export class Erc20Dto {
  constructor(params: Partial<Erc20Dto>) {
    Object.assign(this, params);
  }

  @ApiProperty()
  address!: string;

  @ApiProperty()
  networkId!: number;

  @ApiProperty()
  totalSupply!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  symbol!: string;

  @ApiProperty()
  decimals!: number;
}
