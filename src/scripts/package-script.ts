import {join} from 'path';
import {platform} from 'os';
import {execSync} from 'child_process';
import {copyFileSync, readdirSync} from 'fs';

const isMacOS = platform() === 'darwin';

const targets = isMacOS
    // ? 'node18-macos-arm64,node18-win-x64'
    ? 'node18-macos-arm64'
    : 'node18-win-x64';

console.log('Step 1: Building TypeScript...');
execSync('npm run build', {stdio: 'inherit'});

console.log('\nStep 2: Bundling with ncc...');
execSync('npm run bundle', {stdio: 'inherit'});

console.log('\nStep 3: Fixing node: protocol imports...');
execSync('ts-node src/scripts/fix-node-protocol.ts', {stdio: 'inherit'});

console.log('\nStep 4: Creating executable with pkg...');
execSync(`pkg . --target ${targets} --output dist/google-workspace`, {stdio: 'inherit'});

console.log('\nStep 5: Copying ncc chunk files...');
const buildDir = 'build';
const distDir = 'dist';
const files = readdirSync(buildDir);
const chunkFiles = files.filter(f => f.endsWith('.index.js') && f !== 'index.js');

chunkFiles.forEach(file => {
    const src = join(buildDir, file);
    const dest = join(distDir, file);
    copyFileSync(src, dest);
    console.log(`  Copied ${file}`);
});

console.log('\n✓ Package created successfully!');
console.log(`\nIMPORTANT: When deploying, make sure to include these files alongside the executable:`);
console.log(`  - google-workspace.exe`);
chunkFiles.forEach(file => console.log(`  - ${file}`));
