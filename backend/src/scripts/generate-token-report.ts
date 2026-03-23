// src/scripts/generate-token-report.ts
import fs from 'fs';
import path from 'path';
import { tokenTracker } from '../utils/token-tracker';
import { logger } from '../utils/logger';

async function main() {
  console.log('--- Token Usage Report Generator ---');
  
  if (!tokenTracker.isEnabled) {
    console.warn('NOTE: Token tracking is currently DISABLED in your .env (ENABLE_TOKEN_TRACKING=true)');
  }

  const projectRoot = process.cwd();
  const reportDir = path.join(projectRoot, 'logs');
  const reportPath = path.join(reportDir, 'token-report.json');
  
  // Ensure logs directory exists
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  try {
    const summary = tokenTracker.getSummary();
    
    if (summary.totalCalls === 0) {
      console.log('No token usage data found yet. Run some AI interviews first!');
      return;
    }

    fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2), 'utf8');
    
    console.log(`\nSUCCESS! Report generated at: ${reportPath}`);
    console.log(`Total Calls: ${summary.totalCalls}`);
    console.log(`Total Tokens: ${summary.totalTokens}`);
    console.log(`Avg Tokens/Call: ${summary.averageTokensPerCall}`);
    console.log('\nOpen the file above to see the full breakdown by callType, model, and session.');
  } catch (err) {
    console.error('Failed to generate report:', err);
  }
}

main().catch(console.error);
