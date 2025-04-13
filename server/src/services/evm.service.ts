import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Abi, Account, Address, Chain, createPublicClient, createWalletClient, http, isAddress, Prettify, PublicClient } from 'viem';
import { localhost } from 'viem/chains';

@Injectable()
export abstract class EvmService {
  private readonly publicClients: {
    [chainId: number]: PublicClient
  } = {};

  constructor(protected configService: ConfigService) {
    this.addPublicClient(localhost, this.configService.get<string>('RPC_ENDPOINT_LOCALHOST')!);
  }

  protected addPublicClient(chain: Chain, rpcUrl: string) {
    this.publicClients[chain.id] = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });
  }

  protected getPublicClient(chainId: number) {
    const publicClient = this.publicClients[chainId];
    if (!publicClient) throw new BadRequestException(`Chain with ID ${chainId} not found`);

    return publicClient;
  }

  protected getChain(chainId: number): Chain {
    const chain = this.publicClients[chainId]?.chain;
    if (!chain) throw new BadRequestException(`Chain with ID ${chainId} not found`);

    return chain;
  }

  protected readContract(
    chainId: number,
    address: `0x${string}`,
    functionName: string,
    abi: Abi,
    options?: { args?: unknown[]; account?: `0x${string}` },
  ) {
    if (!isAddress(address)) throw new BadRequestException('Invalid or missing contract address.');
    if (!functionName) throw new BadRequestException('Function name must be provided.');

    const publicClient = this.getPublicClient(chainId);

    return publicClient.readContract({
      address,
      abi,
      functionName,
      args: options?.args,
      account: options?.account,
    });
  }

  protected writeContract(
    chainId: number,
    address: `0x${string}`,
    functionName: string,
    abi: Abi,
    options: {
      args?: unknown[];
      account: `0x${string}`;
    },
  ) {
    if (!isAddress(address)) throw new BadRequestException('Invalid or missing contract address.');
    if (!functionName) throw new BadRequestException('Function name must be provided.');
    if (!options?.account) throw new BadRequestException('Account (signer) is required for writing');

    const publicClient = this.getPublicClient(chainId);

    console.log('publicClient.transport', publicClient.transport);

    const walletClient = createWalletClient({
      account: options.account,
      chain: publicClient.chain,
      transport: http(publicClient.transport.name),
    });

    return walletClient.writeContract({
      address,
      abi,
      functionName,
      args: options.args,
      account: options.account,
      chain: publicClient.chain,
    });
  }
}
