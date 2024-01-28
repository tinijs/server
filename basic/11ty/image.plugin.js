const eleventyImage = require('@11ty/eleventy-img');
const path = require('path');

function relativeToInputPath(inputPath, relativeFilePath) {
  const splits = inputPath.split('/');
  splits.pop();
  return path.resolve(splits.join(path.sep), relativeFilePath);
}

function isFullUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addAsyncShortcode(
    'image',
    async function imageShortcode(src, alt, widths, sizes) {
      const input = isFullUrl(src)
        ? src
        : relativeToInputPath(this.page.inputPath, src);

      const metadata = await eleventyImage(input, {
        widths: widths || ['auto'],
        formats: ['avif', 'webp', 'auto'],
        urlPath: '/_content/images/',
        outputDir: path.join(eleventyConfig.dir.output, 'images'),
      });

      const imageAttributes = {
        alt,
        sizes,
        loading: 'lazy',
        decoding: 'async',
      };

      return eleventyImage.generateHTML(metadata, imageAttributes);
    }
  );

  eleventyConfig.addAsyncShortcode(
    'imageUrl',
    async function imageShortcode(src, width) {
      const input = isFullUrl(src)
        ? src
        : relativeToInputPath(this.page.inputPath, src);

      const metadata = await eleventyImage(input, {
        widths: !width ? ['auto'] : [width],
        formats: ['jpeg'],
        urlPath: '/_content/images/',
        outputDir: path.join(eleventyConfig.dir.output, 'images'),
      });

      return metadata.jpeg[0].url;
    }
  );
};
