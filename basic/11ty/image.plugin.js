const eleventyImage = require('@11ty/eleventy-img');
const path = require('path');
const YAML = require('yaml');
const TOML = require('@iarna/toml');

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

function stringifyData(data, target) {
  const VALID_TARGETS = ['JSON', 'YAML', 'TOML'];
  if (!~VALID_TARGETS.indexOf(target)) {
    throw new Error(
      `Invalid stringify target, allowed values are: ${VALID_TARGETS.join(
        ', '
      )}`
    );
  }
  return target === 'JSON'
    ? JSON.stringify(data)
    : target === 'YAML'
    ? YAML.stringify(data)
    : TOML.stringify(data);
}

module.exports = function (eleventyConfig) {
  const buildImage = function (src, options) {
    options = options || {};
    const input = isFullUrl(src)
      ? src
      : relativeToInputPath(this.page.inputPath, src);
    return eleventyImage(input, {
      ...options,
      outputDir: path.join(eleventyConfig.dir.output, 'images'),
      urlPath: '/tini-content/images/',
      widths: options.widths || ['auto'],
      formats: options.formats || ['avif', 'webp', 'auto'],
    });
  };

  const buildSingleImage = async function (src, options) {
    options = options || {};
    const metadata = await buildImage.call(this, src, {
      ...options,
      widths: [(options.widths || ['auto'])[0]],
      formats: [(options.formats || ['auto'])[0]],
    });
    return metadata[Object.keys(metadata)[0]][0];
  };

  const buildAndGenerateHTML = async function (
    src,
    alt,
    widths,
    sizes,
    imageAttributes,
    buildOptions,
    generateHTMLOptions
  ) {
    return eleventyImage.generateHTML(
      await buildImage.call(this, src, {
        ...buildOptions,
        widths,
      }),
      {
        alt,
        sizes,
        loading: 'lazy',
        decoding: 'async',
        ...imageAttributes,
      },
      generateHTMLOptions
    );
  };

  const buildSingleAndGenerateHTML = async function (
    src,
    alt,
    width,
    format,
    imageAttributes,
    buildOptions,
    generateHTMLOptions
  ) {
    return await buildAndGenerateHTML.call(
      this,
      src,
      alt,
      !width ? undefined : [width],
      undefined,
      imageAttributes,
      {
        ...buildOptions,
        formats: !format ? undefined : [format],
      },
      generateHTMLOptions
    );
  };

  const buildSingleAndExtractUrl = async function (
    src,
    width,
    format,
    buildOptions
  ) {
    const metadata = await buildImage.call(this, src, {
      ...buildOptions,
      widths: !width ? ['auto'] : [width],
      formats: !format ? ['auto'] : [format],
    });
    return metadata[Object.keys(metadata)[0]][0].url;
  };

  const buildAndExtractData = async function (
    src,
    alt,
    widths,
    sizes,
    imageAttributes,
    buildOptions
  ) {
    const object = eleventyImage.generateObject(
      await buildImage.call(this, src, {
        ...buildOptions,
        widths,
      }),
      {
        alt,
        sizes,
        loading: 'lazy',
        decoding: 'async',
        ...imageAttributes,
      }
    );
    // extract result
    let result = {};
    for (const tag in object) {
      if (!Array.isArray(object[tag])) {
        result = object[tag];
      } else {
        let mainProperties = {};
        const sources = [];
        for (const child of object[tag]) {
          const childTagName = Object.keys(child)[0];
          if (childTagName === 'source') {
            sources.push(child[childTagName]);
          } else {
            mainProperties = child[childTagName];
          }
        }
        result = {...mainProperties, sources};
      }
    }
    // return
    return result;
  };

  const buildSingleAndExtractData = async function (
    src,
    alt,
    width,
    format,
    imageAttributes,
    buildOptions
  ) {
    return await buildAndExtractData.call(
      this,
      src,
      alt,
      !width ? undefined : [width],
      undefined,
      imageAttributes,
      {
        ...buildOptions,
        formats: !format ? undefined : [format],
      }
    );
  };

  /*
   * Shortcodes
   */

  eleventyConfig.addAsyncShortcode('image', buildAndGenerateHTML);

  eleventyConfig.addAsyncShortcode('imageSingle', buildSingleAndGenerateHTML);

  eleventyConfig.addAsyncShortcode('imageUrl', buildSingleAndExtractUrl);

  eleventyConfig.addAsyncShortcode(
    'imageData',
    async function (target, ...params) {
      return stringifyData(
        await buildAndExtractData.apply(this, params),
        target
      );
    }
  );

  eleventyConfig.addAsyncShortcode(
    'imageSingleData',
    async function (target, ...params) {
      return stringifyData(
        await buildSingleAndExtractData.apply(this, params),
        target
      );
    }
  );

  /*
   * Filters
   */

  eleventyConfig.addFilter('image', buildImage);

  eleventyConfig.addFilter('imageSingle', buildSingleImage);

  eleventyConfig.addFilter('imageUrl', buildSingleAndExtractUrl);

  eleventyConfig.addFilter('imageData', buildAndExtractData);

  eleventyConfig.addFilter('imageSingleData', buildSingleAndExtractData);
};
