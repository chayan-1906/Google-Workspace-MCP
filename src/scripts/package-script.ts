import {platform} from 'os';
import {execSync} from 'child_process';

const isMacOS = platform() === 'darwin';

const targets = isMacOS
    // ? 'node16-macos-arm64,node18-win-x64'
    ? 'node18-macos-arm64'
    : 'node18-win-x64';

const cmd = `npm run build && npm run bundle && pkg build/index.js --target ${targets} --output dist/google-workspace`;

execSync(cmd, {stdio: 'inherit'});
