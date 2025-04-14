import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-ethers";
import { config as dotEnvConfig } from "dotenv";

dotEnvConfig();

const PRIVATE_KEY = process.env.PRIVATE_KEY!;

const config: HardhatUserConfig = {
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: [PRIVATE_KEY]
    },
    hardhat: {
      accounts: [
        {
          privateKey: PRIVATE_KEY,
          balance: "10000000000000000000000", // 10 000 ETH in wei
        },
      ],
    },
  },
  solidity: "0.8.28",
};

export default config;
