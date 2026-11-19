import Config from 'react-native-config';
const absoluteUrl = /^(data|http|https):/i;
const IMAGE_FILE_REGEX = /\.(png|jpe?g|gif|webp|svg|avif)$/i;
const joinUrls = (base, url) =>
  (base.endsWith('/') ? base.slice(0, -1) : base) +
  '/' +
  (url.startsWith('/') ? url.slice(1) : url);
const sanitizeInput = value =>
  typeof value === 'string' ? value.trim() : '';
const hasPathIndicators = value => value.includes('/') || value.includes('\\');
const isLikelyMediaPath = value =>
  Boolean(value) && (hasPathIndicators(value) || IMAGE_FILE_REGEX.test(value));
const MEDIA_ROOT_HINTS = [
  'catalog/',
  'notification/',
  'attribute/',
  'wysiwyg/',
  'cms/',
  'blog/',
  'import/',
  'tmp/',
  'banner/',
  'downloadable/',
];
const ensureMediaSegment = path => {
  const trimmed = path.replace(/^\/+/, '');
  if (!trimmed) {
    return '';
  }
  if (trimmed.startsWith('media/')) {
    return `/${trimmed}`;
  }
  const shouldPrefixMedia = MEDIA_ROOT_HINTS.some(prefix =>
    trimmed.startsWith(prefix),
  );
  if (shouldPrefixMedia) {
    return `/media/${trimmed}`;
  }
  return `/${trimmed}`;
};

const mediaBases = new Map([
  ['image-product', 'catalog/product/'],
  ['image-category', 'catalog/category/'],
  ['image-swatch', 'attribute/swatch/'],
]);

const getFileType = url => {
  const fileName = url.split('/').pop() || '';
  return fileName.split('.').pop() || '';
};

export const makeOptimizedUrl = (path, {type, ...opts}) => {
  if (!path) {
    return '';
  }
  if (!type || !type.startsWith('image-')) {
    return path;
  }

  const mediaBackend = Config.PWA_BASE_URL ;

  if (!mediaBackend) {
    console.warn('A media backend URL should be defined in your config.');
  }

  let baseURL = absoluteUrl.test(path) ? path : joinUrls(mediaBackend, path);

  if (!absoluteUrl.test(baseURL) && mediaBases.has(type)) {
    const mediaBase = mediaBases.get(type);
    if (!baseURL.includes(mediaBase)) {
      baseURL = joinUrls(mediaBackend, joinUrls(mediaBase, path));
    }
  }

  const params = {auto: 'webp'};
  const imageFileType = getFileType(baseURL);
  params.format = imageFileType === 'png' ? 'png' : 'pjpg';

  Object.entries(opts).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params[key] = value;
    }
  });

  const queryString = Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join('&');

  return queryString ? `${baseURL}?${queryString}` : baseURL;
};

export const resolveMagentoMediaUrl = value => {
  const sanitized = sanitizeInput(value);
  if (!sanitized) {
    return '';
  }

  if (absoluteUrl.test(sanitized)) {
    return sanitized;
  }

  const looksLikeMedia = isLikelyMediaPath(sanitized);
  if (!looksLikeMedia) {
    return sanitized;
  }

  const base = sanitizeInput(Config.PWA_BASE_URL);
  if (!base) {
    return sanitized;
  }

  const baseWithoutTrailingSlash = base.replace(/\/$/, '');
  const normalizedPath = ensureMediaSegment(sanitized);
  return `${baseWithoutTrailingSlash}${normalizedPath}`;
};

export default makeOptimizedUrl;
