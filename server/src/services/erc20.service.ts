import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Abi, formatUnits, isAddress } from 'viem';

import * as ERC20_ABI from 'api/assets/erc20.abi.json';
import { EvmService } from './evm.service';
import { Erc20Dto } from 'api/dto';

@Injectable()
export class Erc20Service extends EvmService {
  private readonly logger = new Logger(Erc20Service.name);

  constructor(configService: ConfigService) {
    super(configService);
  }

  async get(chainId: number, contractAccountAddress: `0x${string}`): Promise<Erc20Dto> {
    if (!isAddress(contractAccountAddress)) throw new BadRequestException('Invalid token address');

    const [decimals, name, symbol, totalSupply] = await Promise.all([
      this.getDecimals(chainId, contractAccountAddress),
      this.getName(chainId, contractAccountAddress),
      this.getSymbol(chainId, contractAccountAddress),
      this.getTotalSupply(chainId, contractAccountAddress),
    ]);

    const erc20Info = new Erc20Dto({
      address: contractAccountAddress,
      networkId: chainId,
      decimals,
      name,
      symbol,
      totalSupply: +formatUnits(totalSupply, decimals),
    });

    return erc20Info;
  }

  async getName(chainId: number, contractAccountAddress: `0x${string}`): Promise<string> {
    const name = await this.readContract(chainId, contractAccountAddress, 'name', ERC20_ABI as Abi);
    return name as string;
  }

  async getSymbol(chainId: number, contractAccountAddress: `0x${string}`): Promise<string> {
    const symbol = await this.readContract(chainId, contractAccountAddress, 'symbol', ERC20_ABI as Abi);
    return symbol as string;
  }

  async getDecimals(chainId: number, contractAccountAddress: `0x${string}`): Promise<number> {
    const decimalsBN = await this.readContract(chainId, contractAccountAddress, 'decimals', ERC20_ABI as Abi);
    return Number(decimalsBN);
  }

  async getTotalSupply(chainId: number, contractAccountAddress: `0x${string}`): Promise<bigint> {
    const totalSupply = await this.readContract(chainId, contractAccountAddress, 'totalSupply', ERC20_ABI as Abi);
    return totalSupply as bigint;
  }

  async getBalanceOfRaw(chainId: number, contractAccountAddress: `0x${string}`, eoaAddress: string): Promise<bigint> {
    const balance = await this.readContract(chainId, contractAccountAddress, 'balanceOf', ERC20_ABI as Abi, {
      args: [eoaAddress],
    });
    return balance as bigint;
  }

  async getBalanceOf(chainId: number, contractAccountAddress: `0x${string}`, eoaAddress: string): Promise<{ balanceRaw: bigint, balance: number }> {
    const decimals = await this.getDecimals(chainId, contractAccountAddress);
    const balance = await this.getBalanceOfRaw(chainId, contractAccountAddress, eoaAddress);
    return { balanceRaw: balance, balance: +formatUnits(balance, decimals) };
  }
}
