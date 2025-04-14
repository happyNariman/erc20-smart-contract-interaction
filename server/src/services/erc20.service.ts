import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Abi, formatUnits, isAddress } from 'viem';

import * as ERC20_ABI from 'api/assets/erc20.abi.json';
import { EvmService } from './evm.service';
import { Erc20Dto, TokenBalanceDto } from 'api/dto';

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

  async getBalanceOf(chainId: number, contractAccountAddress: `0x${string}`, eoaAddress: string): Promise<TokenBalanceDto> {
    const decimals = await this.getDecimals(chainId, contractAccountAddress);
    const balance = await this.getBalanceOfRaw(chainId, contractAccountAddress, eoaAddress);
    return { balanceRaw: balance, balance: +formatUnits(balance, decimals) };
  }

  async getAllowanceRaw(
    chainId: number,
    contractAccountAddress: `0x${string}`,
    owner: `0x${string}`,
    spender: `0x${string}`,
  ): Promise<bigint> {
    const allowance = await this.readContract(chainId, contractAccountAddress, 'allowance', ERC20_ABI as Abi, {
      args: [owner, spender],
    });
    return allowance as bigint;
  }

  async getAllowance(
    chainId: number,
    contractAccountAddress: `0x${string}`,
    owner: `0x${string}`,
    spender: `0x${string}`,
  ): Promise<TokenBalanceDto> {
    const decimals = await this.getDecimals(chainId, contractAccountAddress);
    const allowance = await this.getAllowanceRaw(chainId, contractAccountAddress, owner, spender);
    return { balanceRaw: allowance as bigint, balance: +formatUnits(allowance, decimals) };
  }

  async approve(
    chainId: number,
    contractAccountAddress: `0x${string}`,
    spender: `0x${string}`,
    amount: bigint,
    privateKey: `0x${string}`,
  ): Promise<{ txHash: `0x${string}` }> {
    amount = BigInt(amount);
    if (amount <= 0) throw new BadRequestException('Amount must be greater than 0');

    const txHash = await this.writeContract(chainId, contractAccountAddress, 'approve', ERC20_ABI as Abi, {
      args: [spender, amount],
      privateKey,
    });

    return { txHash };
  }

  async transfer(
    chainId: number,
    contractAccountAddress: `0x${string}`,
    from: `0x${string}`,
    to: `0x${string}`,
    amount: bigint,
    privateKey: `0x${string}`,
  ): Promise<{ txHash: `0x${string}` }> {
    amount = BigInt(amount);
    if (amount <= 0) throw new BadRequestException('Amount must be greater than 0');

    const allowance = await this.getAllowanceRaw(chainId, contractAccountAddress, from, to);
    if (allowance === 0n || allowance < amount) throw new BadRequestException('Allowance is not enough');

    const txHash = await this.writeContract(chainId, contractAccountAddress, 'transferFrom', ERC20_ABI as Abi, {
      args: [from, to, amount],
      privateKey,
    });

    return { txHash };
  }
}
