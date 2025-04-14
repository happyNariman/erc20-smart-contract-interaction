import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';

export class TokenTransferRequest {
  @ApiProperty()
  from: `0x${string}`;

  @ApiProperty()
  to: `0x${string}`;

  @ApiProperty()
  @Transform((params: TransformFnParams) => BigInt(params.value))
  amount: bigint;

  @ApiProperty()
  privateKey: `0x${string}`;
}
