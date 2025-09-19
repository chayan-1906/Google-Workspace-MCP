module.exports = {
    target: 'node',
    mode: 'production',
    entry: './dist/server.js',
    output: {
        path: require('path').resolve(__dirname, 'build'),
        filename: 'index.js',
        library: {
            type: 'commonjs2',
        },
        chunkFormat: false,
    },
    resolve: {
        extensions: ['.js', '.json'],
    },
    optimization: {
        splitChunks: false,
        minimize: true,
        usedExports: false,
        sideEffects: false,
    },
    plugins: [
        {
            apply: (compiler) => {
                compiler.hooks.compilation.tap('ForceInlinePlugin', (compilation) => {
                    compilation.hooks.beforeChunkAssets.tap('ForceInlinePlugin', () => {
                        const chunks = Array.from(compilation.chunks);
                        const mainChunk = chunks.find(chunk => chunk.name === 'main');
                        if (mainChunk) {
                            chunks.forEach(chunk => {
                                if (chunk !== mainChunk) {
                                    chunk.getModules().forEach(module => {
                                        mainChunk.addModule(module);
                                        chunk.removeModule(module);
                                    });
                                    compilation.chunks.delete(chunk);
                                }
                            });
                        }
                    });
                });
            }
        }
    ],
    externals: {}
};
