import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying MyToken contract...");

  const myToken = await ethers.getContractFactory("MyToken");
  const contract = await myToken.deploy('MyToken', 'MTK', 18);
  await contract.waitForDeployment();

  console.log("Deployer address:\t", deployer.address);
  console.log("Contract address:\t", await contract.getAddress());

  const totalSupply = await contract.totalSupply();
  console.log("Total supply:\t\t", totalSupply.toString());
  console.log("Deployment successful!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
