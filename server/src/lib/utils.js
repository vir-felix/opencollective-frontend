import fs from 'fs';
import svg_to_png from 'svg-to-png';
import crypto from 'crypto';
import Promise from 'bluebird';

const readFile = Promise.promisify(fs.readFile);

export default {

  getCloudinaryUrl: (src, { width, height, query }) => {

    if (src.match(/cloudinary.com/)) {
      return src;
    }

    let size = '';
    if (width) size += `w_${width},`;
    if (height) size += `h_${height},`;
    if (size === '') size = 'w_320';

    const queryurl = query || `/${size}c_fill,f_jpg/`;

    return `http://res.cloudinary.com/opencollective/image/fetch${queryurl}${encodeURIComponent(src)}`;
  },

  /**
   * Converts an svg string into a PNG data blob
   * (returns a promise)
   */
  svg2png: (svg) => {
    const md5 = crypto.createHash('md5').update(svg).digest("hex");
    const svgFilePath = `/tmp/${md5}.svg`;
    const outputDir = `/tmp`;
    const outputFile = `${outputDir}/${md5}.png`;

    try {
      // If file exists, return it
      // Note: because we generate a md5 fingerprint based on the content of the svg,
      //       any change in the svg (margin, size, number of backers, etc.) will force
      //       the creation of a new png :-)
      fs.statSync(outputFile);
      return readFile(outputFile);
    } catch (e) {
      // Otherwise, generate a new png (slow)
      fs.writeFileSync(svgFilePath, svg);

      return svg_to_png.convert(svgFilePath, outputDir)
              .then(() => readFile(outputFile));
    }
  }
}
