import {Dimensions} from 'react-native';

const {height: screenHeight} = Dimensions.get('window');

export function findNode(node, condition) {
  if (condition(node)) {
    return node;
  }

  for (let child of node.children || []) {
    const foundNode = findNode(child, condition);
    if (foundNode) {
      return foundNode;
    }
  }

  return null;
}

export function findNodes(node, condition) {
  const results = [];
  function recurse(current) {
    if (condition(current)) {
      results.push(current);
    }
    (current.children || []).forEach(child => recurse(child));
  }
  recurse(node);
  return results;
}

export function traverse(node, handler) {
  handler(node);
  for (let child of node.children || []) {
    traverse(child, handler);
  }
}

const kebabToCamel = str =>
  str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());

const parseValue = value => {
  if (typeof value === 'string') {
    if (value.endsWith('px')) {
      const num = parseFloat(value);
      return isNaN(num) ? value : num;
    }
    if (value.endsWith('vh')) {
      const num = parseFloat(value);
      return isNaN(num) ? value : (num / 100) * screenHeight;
    }
  }
  return value;
};

export const parsePbStyleInline = node => {
  const styleInline = node?.pbStyleInline || {};
  const result = {};

  Object.keys(styleInline).forEach(key => {
    const value = styleInline[key];
    const camelKey = kebabToCamel(key);
    result[camelKey] = typeof value === 'string' ? parseValue(value) : value;
  });

  return result;
};

export function getIsHidden(node) {
  return {
    isHidden: node?.pbStyleInline?.display === 'none',
  };
}

export function getAdvanced(node) {
  return {
    ...parsePbStyleInline(node),
    cssClasses: node?.cssClasses,
  };
}

export const parseDimension = value => {
  if (value == null) {
    return null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.endsWith('px')) {
      const num = parseFloat(trimmed);
      return Number.isFinite(num) && num > 0 ? num : null;
    }
  }

  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : null;
};

export const getAspectRatioFromDimensions = (width, height) => {
  const parsedWidth = parseDimension(width);
  const parsedHeight = parseDimension(height);

  if (parsedWidth && parsedHeight) {
    return parsedWidth / parsedHeight;
  }

  return null;
};

export const resolveBannerAspectRatio = node => {
  if (!node) {
    return null;
  }

  const directRatio = getAspectRatioFromDimensions(node.width, node.height);
  if (directRatio) {
    return directRatio;
  }

  const pbStyleRatio = getAspectRatioFromDimensions(
    node.pbStyleInline?.width,
    node.pbStyleInline?.height,
  );
  if (pbStyleRatio) {
    return pbStyleRatio;
  }

  const parsedPbStyle = parsePbStyleInline(node);
  const parsedStyleRatio = getAspectRatioFromDimensions(
    parsedPbStyle.width,
    parsedPbStyle.height,
  );
  if (parsedStyleRatio) {
    return parsedStyleRatio;
  }

  let resolvedRatio = null;
  traverse(node, current => {
    if (resolvedRatio) {
      return;
    }

    const ratio =
      getAspectRatioFromDimensions(current.width, current.height) ||
      getAspectRatioFromDimensions(
        current.pbStyleInline?.width,
        current.pbStyleInline?.height,
      );

    if (ratio) {
      resolvedRatio = ratio;
    }
  });

  return resolvedRatio;
};

/**
 * @param node
 * @returns {{mobileImage: null, desktopImage: null}}
 */
export function getBackgroundImages(node) {
  return {
    desktop_image: node?.backgroundImages?.desktop_image,
    mobile_image: node?.backgroundImages?.mobile_image,
  };
}

export const isNotWhiteBackground = color => {
  if (!color) {
    return false;
  }
  const whiteColors = [
    '#fff',
    '#ffffff',
    'rgb(255,255,255)',
    'rgba(255,255,255,1)',
  ];
  return !whiteColors.includes(color.toLowerCase());
};

/**
 * 将节点转换为 HTML 字符串
 * 用于 fallback 到 RenderHTML 渲染
 */
const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

const buildStyleString = styleInline => {
  if (!styleInline) {
    return '';
  }
  return Object.entries(styleInline)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    )
    .map(([key, value]) => `${key}:${value}`)
    .join(';');
};

const buildAttributes = node => {
  const attrs = [];
  if (Array.isArray(node?.cssClasses) && node.cssClasses.length) {
    attrs.push(`class="${node.cssClasses.join(' ')}"`);
  }
  if (node?.href) {
    attrs.push(`href="${node.href}"`);
  }
  if (node?.target) {
    attrs.push(`target="${node.target}"`);
  }
  if (node?.rel) {
    attrs.push(`rel="${node.rel}"`);
  }
  if (node?.src) {
    attrs.push(`src="${node.src}"`);
  }
  if (node?.alt) {
    attrs.push(`alt="${node.alt}"`);
  }
  if (node?.title) {
    attrs.push(`title="${node.title}"`);
  }
  if (node?.width) {
    attrs.push(`width="${node.width}"`);
  }
  if (node?.height) {
    attrs.push(`height="${node.height}"`);
  }

  const styleString = buildStyleString(node?.pbStyleInline);
  if (styleString) {
    attrs.push(`style="${styleString}"`);
  }

  return attrs.length ? ` ${attrs.join(' ')}` : '';
};

export const nodeToHtml = node => {
  if (!node) {
    return '';
  }

  if (typeof node === 'string') {
    return node;
  }

  if (node.text) {
    return node.text;
  }

  if (!node.tagName) {
    return (Array.isArray(node.children) ? node.children : [])
      .map(child => nodeToHtml(child))
      .join('');
  }

  const tag = node.tagName.toLowerCase();
  const attrs = buildAttributes(node);

  if (VOID_TAGS.has(tag)) {
    return `<${tag}${attrs} />`;
  }

  const childrenHtml = (Array.isArray(node.children) ? node.children : [])
    .map(child => nodeToHtml(child))
    .join('');

  return `<${tag}${attrs}>${childrenHtml}</${tag}>`;
};
