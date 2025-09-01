#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { agenticDesignPlugin } = require('../packages/vite-plugin');

async function main() {
  const plugin = agenticDesignPlugin();
  // Simulate Vite config resolution
  plugin.configResolved({ root: process.cwd() });
  // Simulate CSS file transform
  const id = path.join(process.cwd(), 'examples', 'minimal', 'styles.css');
  fs.mkdirSync(path.dirname(id), { recursive: true });
  fs.writeFileSync(id, '.btn{padding:16px 32px}');
  await plugin.transform('.btn{padding:16px 32px}', id);
  console.log('Plugin test completed. See logs/plugin-tests.log');
}

main();

