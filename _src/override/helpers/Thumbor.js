import {Dimensions, PixelRatio} from 'react-native';

const {height, width} = Dimensions.get('window');

const THUMBOR_BASE_URL = 'https://thumbor.sirclocdn.com/unsafe/';

export const thumborProductList = (url, opts = {}) => {
  const widthImage = opts?.width ?? Math.round(width);
  const heightImage = opts?.height ?? Math.round(height);
  const imageSize = `${widthImage}x${heightImage}`;

  const thumborURL = `https://thumbor.sirclocdn.com/unsafe/${imageSize}/filters:format(png):quality(0.5)/`;
  const image = thumborURL + url;

  return image;
};

/**
 * Square image thumbnail via Thumbor, optimized for small variant swatch /
 * header images (webp, resized to the display size in dp x pixel ratio).
 */
export const thumborSquareImage = (url, sizeDp = 36) => {
  if (!url) {
    return url;
  }
  const pixelSize = Math.round(sizeDp * PixelRatio.get());
  const imageSize = `${pixelSize}x${pixelSize}`;

  return `${THUMBOR_BASE_URL}${imageSize}/filters:format(webp)/${url}`;
};
