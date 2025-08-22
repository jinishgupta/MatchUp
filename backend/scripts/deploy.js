import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;
  
  console.log("Deploying MatchUpGame contract...");
  console.log("Network:", network);
  console.log("Deployer account:", deployer.address);

  // Deploy the contract
  const MatchUpGame = await hre.ethers.getContractFactory("MatchUpGame");
  
  console.log("Deploying contract...");
  const matchUpGame = await MatchUpGame.deploy();

  await matchUpGame.waitForDeployment();
  const address = await matchUpGame.getAddress();

  console.log("✅ MatchUpGame deployed to:", address);

  // Wait for the contract to be mined
  console.log("Waiting for contract to be mined...");
  const deployTx = matchUpGame.deploymentTransaction();
  await deployTx.wait(5);
  
  console.log("✅ Contract mined in transaction:", deployTx.hash);

  // Save deployment info
  const deploymentInfo = {
    network: network,
    contractName: "MatchUpGame",
    contractAddress: address,
    deployerAddress: deployer.address,
    transactionHash: deployTx.hash,
    blockNumber: deployTx.blockNumber,
    timestamp: new Date().toISOString(),
    gasUsed: deployTx.gasLimit?.toString(),
    gasPrice: deployTx.gasPrice?.toString(),
  };

  // Save to deployments directory
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${network}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("✅ Deployment info saved to:", deploymentFile);

  // Update frontend config with new contract address
  const frontendConfigPath = path.join(__dirname, "..", "..", "frontend", "src", "web3", "config.js");
  if (fs.existsSync(frontendConfigPath)) {
    try {
      let configContent = fs.readFileSync(frontendConfigPath, 'utf8');
      
      // Update the contract address in the config
      configContent = configContent.replace(
        /address:\s*['"][^'"]*['"]/,
        `address: '${address}'`
      );
      
      fs.writeFileSync(frontendConfigPath, configContent);
      console.log("✅ Frontend config updated with new contract address");
    } catch (error) {
      console.log("⚠️ Could not update frontend config:", error.message);
    }
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📋 Contract Details:");
  console.log("   Address:", address);
  console.log("   Network:", network);
  console.log("   Transaction:", deployTx.hash);
  
  if (network === "sepolia") {
    console.log("   Etherscan:", `https://sepolia.etherscan.io/address/${address}`);
  }
  
  console.log("\n📝 Next steps:");
  console.log("1. Make sure to update your frontend .env with the new contract address");
  console.log("2. Deploy and configure your subgraph with the new contract address");
  console.log("3. Test the frontend connection to the deployed contract");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
