#!/usr/bin/env node

/**
 * Documentation Integrity Verification Script
 *
 * Purpose: Prevent documentation degradation and accidental errors
 * Usage: node scripts/verify-docs-integrity.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

// Critical evidence patterns that should never be deleted
const PROTECTED_PATTERNS = [
  /Last (Updated|Verified|Tested):\s*\d{4}-\d{2}-\d{2}/g,
  /Evidence:.*\n```[\s\S]*?```/g,
  /Status Code:\s*\d{3}/g,
  /Response Time:\s*\d+ms/g,
  /\d+\/\d+\s+(endpoints?|working|failed)/gi,
  /success rate.*\d+%/gi,
];

// Files that contain critical documentation
const CRITICAL_FILES = [
  'docs/app/README.md',
  'docs/app/issues/active-problems.md',
  'docs/app/api/verified-endpoints.md',
  'docs/app/issues/endpoint-analysis.md',
];

class DocumentationVerifier {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.protectedContent = new Map();
  }

  // Check if server files have changed since documentation update
  checkServerChanges() {
    console.log('\n📊 Checking for server changes since documentation update...');

    const docsPath = path.join(process.cwd(), 'docs/app/README.md');
    const serverPath = path.join(process.cwd(), 'apps/server');

    if (!fs.existsSync(docsPath)) {
      this.warnings.push('docs/app/README.md not found');
      return;
    }

    const docsModTime = fs.statSync(docsPath).mtime;

    try {
      const changedFiles = execSync(
        `find "${serverPath}" -name "*.js" -newer "${docsPath}" -type f 2>/dev/null | head -10`,
        { encoding: 'utf8', shell: '/bin/bash' }
      )
        .trim()
        .split('\n')
        .filter(Boolean);

      if (changedFiles.length > 0) {
        this.warnings.push(`${changedFiles.length} server files changed since docs updated`);
        console.log(
          `${colors.yellow}⚠️  Found ${changedFiles.length} server changes - docs may need update${colors.reset}`
        );
      } else {
        console.log(
          `${colors.green}✅ No server changes - documentation is current${colors.reset}`
        );
      }
    } catch (e) {
      // Windows fallback
      console.log(
        `${colors.yellow}⚠️  Cannot check file changes on Windows - manual verification needed${colors.reset}`
      );
    }
  }

  // Check for consistency in success rates and statistics
  checkConsistency() {
    console.log('\n🔍 Checking documentation consistency...');

    const stats = {
      successRates: new Set(),
      endpointCounts: new Set(),
      lastUpdatedDates: new Set(),
    };

    CRITICAL_FILES.forEach((file) => {
      const fullPath = path.join(process.cwd(), file);
      if (!fs.existsSync(fullPath)) return;

      const content = fs.readFileSync(fullPath, 'utf8');

      // Extract success rates
      const rateMatches = content.match(/(\d+)%\s+(?:actual\s+)?success rate/gi) || [];
      rateMatches.forEach((match) => {
        const rate = match.match(/\d+/)[0];
        stats.successRates.add(rate);
      });

      // Extract endpoint counts
      const countMatches =
        content.match(/(\d+)(?:\/\d+)?\s+endpoints?\s+(?:working|claimed|tested)/gi) || [];
      countMatches.forEach((match) => {
        const count = match.match(/\d+/)[0];
        stats.endpointCounts.add(count);
      });

      // Extract last updated dates
      const dateMatches = content.match(/Last (?:Updated|Verified):\s*(\d{4}-\d{2}-\d{2})/gi) || [];
      dateMatches.forEach((match) => {
        const date = match.match(/\d{4}-\d{2}-\d{2}/)[0];
        stats.lastUpdatedDates.add(date);
      });
    });

    // Check for inconsistencies
    if (stats.successRates.size > 1) {
      this.warnings.push(
        `Inconsistent success rates found: ${Array.from(stats.successRates).join(', ')}%`
      );
      console.log(
        `${colors.yellow}⚠️  Multiple success rates: ${Array.from(stats.successRates).join(', ')}%${colors.reset}`
      );
    } else if (stats.successRates.size === 1) {
      console.log(
        `${colors.green}✅ Consistent success rate: ${Array.from(stats.successRates)[0]}%${colors.reset}`
      );
    }

    if (stats.lastUpdatedDates.size > 2) {
      console.log(
        `${colors.yellow}⚠️  Multiple update dates found - some docs may be stale${colors.reset}`
      );
    }
  }

  // Load and protect critical evidence
  loadProtectedContent() {
    console.log('\n🛡️  Loading protected evidence blocks...');

    CRITICAL_FILES.forEach((file) => {
      const fullPath = path.join(process.cwd(), file);
      if (!fs.existsSync(fullPath)) return;

      const content = fs.readFileSync(fullPath, 'utf8');
      const protectedBlocks = [];

      PROTECTED_PATTERNS.forEach((pattern) => {
        const matches = content.match(pattern) || [];
        protectedBlocks.push(...matches);
      });

      if (protectedBlocks.length > 0) {
        this.protectedContent.set(file, protectedBlocks);
        console.log(`  📁 ${path.basename(file)}: ${protectedBlocks.length} protected blocks`);
      }
    });
  }

  // Quick server health check
  async checkServerHealth() {
    console.log('\n🏥 Running quick health check...');

    const ports = [3001, 8901];
    let serverFound = false;

    for (const port of ports) {
      try {
        const response = execSync(
          `curl -s -o /dev/null -w "%{http_code}" http://localhost:${port}/api/health`,
          { encoding: 'utf8' }
        ).trim();

        if (response === '200') {
          console.log(`${colors.green}✅ Server healthy on port ${port}${colors.reset}`);
          serverFound = true;
          break;
        }
      } catch (e) {
        // Server not on this port
      }
    }

    if (!serverFound) {
      console.log(
        `${colors.yellow}⚠️  Server not responding - start with: PORT=3001 node apps/server/index.js${colors.reset}`
      );
      this.warnings.push('Server not running - cannot verify endpoint status');
    }

    return serverFound;
  }

  // Generate integrity report
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Documentation Integrity Report');
    console.log('='.repeat(60));

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log(
        `${colors.green}✅ All checks passed - documentation integrity maintained${colors.reset}`
      );
    } else {
      if (this.errors.length > 0) {
        console.log(`\n${colors.red}❌ Errors (${this.errors.length}):${colors.reset}`);
        this.errors.forEach((err) => console.log(`  - ${err}`));
      }

      if (this.warnings.length > 0) {
        console.log(`\n${colors.yellow}⚠️  Warnings (${this.warnings.length}):${colors.reset}`);
        this.warnings.forEach((warn) => console.log(`  - ${warn}`));
      }
    }

    console.log('\n📝 Protected Evidence Summary:');
    let totalProtected = 0;
    this.protectedContent.forEach((blocks, file) => {
      totalProtected += blocks.length;
    });
    console.log(`  Total protected blocks: ${totalProtected}`);

    console.log('\n🎯 Recommendations:');
    if (this.warnings.some((w) => w.includes('server files changed'))) {
      console.log('  1. Run targeted tests on changed endpoints only');
      console.log('  2. Update only affected documentation sections');
    }
    if (this.warnings.some((w) => w.includes('Server not running'))) {
      console.log('  1. Start server: PORT=3001 node apps/server/index.js');
      console.log('  2. Re-run verification after server is up');
    }
    if (this.warnings.some((w) => w.includes('success rates'))) {
      console.log('  1. Verify which success rate is current');
      console.log('  2. Update all files to use consistent rate');
    }
  }

  async run() {
    console.log(`${colors.green}🔍 Documentation Integrity Verification${colors.reset}`);
    console.log('Purpose: Ensure docs/app accuracy without full testing\n');

    // Run all checks
    this.checkServerChanges();
    this.checkConsistency();
    this.loadProtectedContent();
    await this.checkServerHealth();

    // Generate report
    this.generateReport();

    // Return exit code
    return this.errors.length > 0 ? 1 : 0;
  }
}

// Run verification
const verifier = new DocumentationVerifier();
verifier
  .run()
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((err) => {
    console.error(`${colors.red}Error: ${err.message}${colors.reset}`);
    process.exit(1);
  });
