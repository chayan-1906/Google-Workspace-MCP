import * as fs from 'fs';
import * as path from 'path';

const buildIndexPath = path.join(process.cwd(), 'build', 'index.js');

console.log('Fixing node: protocol imports in bundled code...');

let content = fs.readFileSync(buildIndexPath, 'utf8');

// Replace node: protocol with regular requires for pkg compatibility
const replacements = [
    ['require("node:buffer")', 'require("buffer")'],
    ['require("node:events")', 'require("events")'],
    ['require("node:fs")', 'require("fs")'],
    ['require("node:http")', 'require("http")'],
    ['require("node:https")', 'require("https")'],
    ['require("node:net")', 'require("net")'],
    ['require("node:path")', 'require("path")'],
    ['require("node:process")', 'require("process")'],
    ['require("node:stream")', 'require("stream")'],
    ['require("node:stream/web")', 'require("stream/web")'],
    ['require("node:url")', 'require("url")'],
    ['require("node:util")', 'require("util")'],
    ['require("node:zlib")', 'require("zlib")'],
];

let changeCount = 0;
for (const [from, to] of replacements) {
    const beforeLength = content.length;
    content = content.split(from).join(to);
    const afterLength = content.length;
    if (beforeLength !== afterLength) {
        const count = (beforeLength - afterLength) / (from.length - to.length);
        console.log(`  Replaced ${count} occurrence(s) of ${from}`);
        changeCount += count;
    }
}

console.log(`✓ Fixed ${changeCount} node: protocol imports`);

// Fix ncc chunk loading for pkg compatibility
console.log('\nFixing ncc chunk loading for pkg...');

// Replace the dynamic require for chunks to use __dirname
// This is needed because pkg puts files in C:\snapshot\... and relative paths don't work
const dynamicChunkRequire = 'installChunk(require("./" + __nccwpck_require__.u(chunkId)));';
const fixedChunkRequire = 'installChunk(require(__nccwpck_require__.u(chunkId)));';

if (content.includes(dynamicChunkRequire)) {
    content = content.replace(dynamicChunkRequire, fixedChunkRequire);
    console.log('  ✓ Fixed dynamic chunk require to work with pkg snapshot');
} else {
    console.log('  ⚠ Warning: Could not find dynamic chunk require pattern');
}

// Also update the chunk path function to return absolute path in snapshot
const chunkFunctionPattern = /(__nccwpck_require__\.u = \(chunkId\) => \{[\s\S]*?return )("" \+ chunkId \+ "\.index\.js");/;
const chunkMatch = content.match(chunkFunctionPattern);
if (chunkMatch) {
    content = content.replace(
        chunkFunctionPattern,
        '$1require("path").join(__dirname, chunkId + ".index.js");'
    );
    console.log('  ✓ Updated chunk path function to use __dirname');
} else {
    console.log('  ⚠ Warning: Could not find chunk path function');
}

fs.writeFileSync(buildIndexPath, content, 'utf8');
console.log('\n✓ All fixes applied successfully!');