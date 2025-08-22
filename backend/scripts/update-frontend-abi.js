import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function updateFrontendABI() {
  try {
    console.log('🔄 Updating frontend ABI...');
    
    // Read the compiled contract artifact
    const artifactPath = path.join(__dirname, '../artifacts/contracts/MatchUp.sol/MatchUpGame.json');
    const frontendABIPath = path.join(__dirname, '../../frontend/src/web3/MatchUpGame.json');
    
    if (!fs.existsSync(artifactPath)) {
      console.error('❌ Contract artifact not found. Please compile the contract first.');
      console.log('Run: npx hardhat compile');
      process.exit(1);
    }
    
    // Read the full artifact and copy it
    const artifact = fs.readFileSync(artifactPath, 'utf8');
    
    // Write the complete artifact to frontend for direct import
    fs.writeFileSync(frontendABIPath, artifact);
    
    console.log('✅ Frontend ABI updated successfully!');
    console.log(`📂 Updated: ${frontendABIPath}`);
    
  } catch (error) {
    console.error('❌ Error updating frontend ABI:', error.message);
    process.exit(1);
  }
}

updateFrontendABI(); 