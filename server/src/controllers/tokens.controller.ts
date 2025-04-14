import { BadRequestException, Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { isAddress } from 'viem';

import { TokenDto } from 'api/dto';
import { Erc20Service, TokenService } from 'api/services';

@Controller('api/tokens')
export class TokensController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly erc20Service: Erc20Service,
  ) {}

  @Get(':chain/:address')
  @ApiOperation({ tags: ['tokens'], summary: 'Get a token' })
  @ApiParam({
    name: 'chain',
    required: true,
    example: 1337,
  })
  @ApiParam({
    name: 'address',
    required: true,
    example: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    description: 'Smart contract address of the token',
  })
  async getByAddress(@Param('chain') chain: number, @Param('address') address: string): Promise<TokenDto> {
    if (!isAddress(address)) throw new BadRequestException('Invalid token address');

    const token = await this.tokenService.get(chain, address);
    if (!token) throw new NotFoundException('Token not found');

    return token;
  }

  @Get(':chain/:address/erc20')
  @ApiOperation({ tags: ['tokens'], summary: 'Get a ERC20 token info' })
  @ApiParam({
    name: 'chain',
    required: true,
    example: 1337,
  })
  @ApiParam({
    name: 'address',
    required: true,
    example: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    description: 'Smart contract address of the token',
  })
  async getErc20ByAddress(@Param('chain') chain: number, @Param('address') address: string): Promise<TokenDto> {
    if (!isAddress(address)) throw new BadRequestException('Invalid token address');

    const erc20 = await this.erc20Service.get(chain, address);
    if (!erc20) throw new NotFoundException('Token not found');
    return erc20;
  }

  @Get(':chain/:address/erc20/balance/:wallet')
  @ApiOperation({ tags: ['tokens'], summary: 'Get a ERC20 token balance' })
  @ApiParam({
    name: 'chain',
    required: true,
    example: 1337,
  })
  @ApiParam({
    name: 'address',
    required: true,
    example: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    description: 'Smart contract address of the token',
  })
  @ApiParam({
    name: 'wallet',
    required: true,
    example: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    description: 'Wallet address to get the balance of',
  })
  async getErc20Balance(
    @Param('chain') chain: number,
    @Param('address') address: string,
    @Param('wallet') wallet: string,
  ): Promise<{ balanceRaw: bigint, balance: number }> {
    if (!isAddress(address) || !isAddress(wallet)) throw new BadRequestException('Invalid token address or wallet address');

    const balance = await this.erc20Service.getBalanceOf(chain, address, wallet);
    return balance;
  }
}
