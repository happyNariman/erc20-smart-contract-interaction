import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBadRequestResponse, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { isAddress, maxUint256 } from 'viem';

import { Erc20Dto, TokenApproveRequest, TokenBalanceDto, TokenDto, TokenTransferRequest } from 'api/dto';
import { Erc20Service, TokenService } from 'api/services';
import { privateKeyToAccount } from 'viem/accounts';

const TEST_CHAIN_ID = 31337;
const TEST_SMART_CONTRACT_ADDRESS = '0x781337A07e04a0b3De04D7E21Bad55dc6BC652D0';
const TEST_OWNER_WALLET_ADDRESS = '0xB39EacEcb580f72d3718b5BA4A513212A6d5bFD4';
const TEST_ANY_OTHER_WALLET_ADDRESS = '0x1F9a5A4257f38E17d0039Ea823e3BE7Ec96b99BF';

@Controller('api/tokens')
export class TokensController {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly erc20Service: Erc20Service,
  ) {}

  @Get(':chain/:address')
  @ApiOperation({ tags: ['tokens'], summary: 'Get a token' })
  @ApiParam({
    name: 'chain',
    required: true,
    example: TEST_CHAIN_ID,
  })
  @ApiParam({
    name: 'address',
    required: true,
    example: TEST_SMART_CONTRACT_ADDRESS,
    description: 'Smart contract address of the token',
  })
  @ApiResponse({ status: 200, type: TokenDto })
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
    example: TEST_CHAIN_ID,
  })
  @ApiParam({
    name: 'address',
    required: true,
    example: TEST_SMART_CONTRACT_ADDRESS,
    description: 'Smart contract address of the token',
  })
  @ApiResponse({ status: 200, type: Erc20Dto })
  async getErc20ByAddress(@Param('chain') chain: number, @Param('address') address: string): Promise<Erc20Dto> {
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
    example: TEST_CHAIN_ID,
  })
  @ApiParam({
    name: 'address',
    required: true,
    example: TEST_SMART_CONTRACT_ADDRESS,
    description: 'Smart contract address of the token',
  })
  @ApiParam({
    name: 'wallet',
    required: true,
    example: TEST_OWNER_WALLET_ADDRESS,
    description: 'Wallet address to get the balance of',
  })
  @ApiResponse({ status: 200, type: TokenBalanceDto })
  async getErc20Balance(
    @Param('chain') chain: number,
    @Param('address') address: string,
    @Param('wallet') wallet: string,
  ): Promise<{ balanceRaw: bigint; balance: number }> {
    if (!isAddress(address) || !isAddress(wallet)) throw new BadRequestException('Invalid token address or wallet address');

    const balance = await this.erc20Service.getBalanceOf(chain, address, wallet);
    return balance;
  }

  @Get(':chain/:address/erc20/allowance/:owner/:spender')
  @ApiOperation({ tags: ['tokens'], summary: 'Get a ERC20 token allowance' })
  @ApiParam({
    name: 'chain',
    required: true,
    example: TEST_CHAIN_ID,
  })
  @ApiParam({
    name: 'address',
    required: true,
    example: TEST_SMART_CONTRACT_ADDRESS,
    description: 'Smart contract address of the token',
  })
  @ApiParam({
    name: 'owner',
    required: true,
    example: TEST_OWNER_WALLET_ADDRESS,
    description: 'Wallet address to get the allowance of',
  })
  @ApiParam({
    name: 'spender',
    required: true,
    example: TEST_OWNER_WALLET_ADDRESS,
    description: 'Wallet address to get the allowance of',
  })
  @ApiResponse({ status: 200, type: TokenBalanceDto })
  async getErc20Allowance(
    @Param('chain') chain: number,
    @Param('address') address: string,
    @Param('owner') owner: string,
    @Param('spender') spender: string,
  ): Promise<{ balanceRaw: bigint; balance: number }> {
    if (!isAddress(address) || !isAddress(owner) || !isAddress(spender))
      throw new BadRequestException('Invalid token address or wallet address');

    const allowance = await this.erc20Service.getAllowance(chain, address, owner, spender);
    return allowance;
  }

  @Post(':chain/:address/erc20/approve')
  @ApiOperation({ tags: ['tokens'], summary: 'Approve a ERC20 token' })
  @ApiParam({
    name: 'chain',
    required: true,
    example: TEST_CHAIN_ID,
  })
  @ApiParam({
    name: 'address',
    required: true,
    example: TEST_SMART_CONTRACT_ADDRESS,
    description: 'Smart contract address of the token',
  })
  @ApiBody({
    type: TokenApproveRequest,
    examples: {
      example1: {
        summary: 'Basic example',
        value: {
          to: TEST_OWNER_WALLET_ADDRESS,
          amount: maxUint256.toString(),
          privateKey: null,
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid body passed' })
  async approve(
    @Param('chain') chain: number,
    @Param('address') address: string,
    @Body() body: TokenApproveRequest,
  ): Promise<{ txHash: `0x${string}` }> {
    if (!isAddress(address) || !isAddress(body?.to)) throw new BadRequestException('Invalid token address or wallet address');

    if (!body?.privateKey) {
      // TODO: For test implementation, we will replace this
      body.privateKey = this.configService.get<string>('PRIVATE_KEY') as `0x${string}`;
    }

    const hash = await this.erc20Service.approve(chain, address, body.to, body.amount, body.privateKey);
    return hash;
  }


  @Post(':chain/:address/erc20/transfer')
  @ApiOperation({ tags: ['tokens'], summary: 'Transfer ERC20 token' })
  @ApiParam({
    name: 'chain',
    required: true,
    example: TEST_CHAIN_ID,
  })
  @ApiParam({
    name: 'address',
    required: true,
    example: TEST_SMART_CONTRACT_ADDRESS,
    description: 'Smart contract address of the token',
  })
  @ApiBody({
    type: TokenTransferRequest,
    examples: {
      example1: {
        summary: 'Basic example',
        value: {
          from: null,
          to: TEST_ANY_OTHER_WALLET_ADDRESS,
          amount: '1000000000000000000',
          privateKey: null,
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid body passed' })
  async transfer(
    @Param('chain') chain: number,
    @Param('address') address: string,
    @Body() body: TokenTransferRequest,
  ): Promise<{ txHash: `0x${string}` }> {
    if (!isAddress(address) || !isAddress(body?.to)) throw new BadRequestException('Invalid token address or wallet address');

    if (!isAddress(body?.from) || !body?.privateKey) {
      // TODO: For test implementation, we will replace this
      body.privateKey = this.configService.get<string>('PRIVATE_KEY') as `0x${string}`;
      const account = privateKeyToAccount(body.privateKey);
      body.from = account.address;
    }

    const hash = await this.erc20Service.transfer(chain, address, body.from, body.to, body.amount, body.privateKey);
    return hash;
  }
}
