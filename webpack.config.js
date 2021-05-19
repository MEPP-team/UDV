/** @format */
const path = require('path');
const mode = process.env.NODE_ENV;
const debugBuild = mode === 'development';

let outputPath;
let devTool;
if (debugBuild) {
  devTool = 'source-map';
  outputPath = path.resolve(__dirname, 'dist/debug');
} else {
  devTool = 'none';
  outputPath = path.resolve(__dirname, 'dist/release');
}

module.exports = (env) => {
  const rules = [
    {
      // We also want to (web)pack the style files:
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    },
    {
      test: /\.json$/,
      include: [path.resolve(__dirname, 'src')],
      loader: 'raw-loader',
    },
  ];

  const entry = process.env.npm_config_entry || './src/index.js';
  const output = process.env.npm_config_output || 'udv';

  console.log('Build from ', entry, ' to ', outputPath + '/' + output);

  return {
    mode,
    entry: path.resolve(__dirname, entry),
    devtool: devTool,
    output: {
      path: outputPath,
      filename: output + '.js',
      library: output + '',
      libraryTarget: 'umd',
      umdNamedDefine: true,
    },
    module: {
      rules: rules,
    },
  };
};
