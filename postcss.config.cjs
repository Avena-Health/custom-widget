module.exports = {
  plugins: [
    require('postcss-modules')({
      generateScopedName: '[name]__[local]___[hash:base64:5]',
      getJSON: function(cssFileName, json, outputFileName) {
        // Optional: write JSON with class mappings if needed
        require('fs').writeFileSync(
          cssFileName.replace('.css', '.json'),
          JSON.stringify(json)
        );
      }
    }),
    require('autoprefixer'),
    require('postcss-nested'),
  ]
}; 