import {DomUtils, parseDocument} from 'htmlparser2';

const decodeCmsHtml = html =>
  (html || '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"');

const getClasses = node => (node?.attribs?.class || '').split(/\s+/).filter(Boolean);

const hasClass = (node, className) => getClasses(node).includes(className);

const findNode = (node, predicate) => {
  if (predicate(node)) {
    return node;
  }

  for (const child of node?.children || []) {
    const found = findNode(child, predicate);
    if (found) {
      return found;
    }
  }

  return null;
};

const findNodesByTagName = (node, tagName) => {
  const nodes = [];

  const traverse = currentNode => {
    if (currentNode?.name === tagName) {
      nodes.push(currentNode);
    }

    currentNode?.children?.forEach(traverse);
  };

  traverse(node);
  return nodes;
};

const getText = node => DomUtils.textContent(node || {}).replace(/\s+/g, ' ').trim();

const getSocialType = imgNode =>
  (
    imgNode?.attribs?.alt ||
    imgNode?.attribs?.src?.split('/').pop()?.split('.').shift() ||
    ''
  ).toLowerCase();

const getSocialIcon = type => (type === 'facebook' ? 'facebook-f' : type);

const extractSocialLinks = sectionNode =>
  findNodesByTagName(sectionNode, 'a')
    .map(anchorNode => {
      const imgNode = findNodesByTagName(anchorNode, 'img')[0];
      if (!imgNode?.attribs?.src) {
        return null;
      }

      const type = getSocialType(imgNode);

      return {
        type,
        icon: getSocialIcon(type),
        url: anchorNode.attribs.href,
        img: {
          uri: imgNode.attribs.src,
          width: imgNode.attribs.width,
        },
      };
    })
    .filter(Boolean);

const extractSections = contactNode =>
  (contactNode?.children || [])
    .map(columnNode => {
      const sectionNode = findNode(columnNode, node =>
        getClasses(node).some(className => className.includes('section-')),
      );

      if (!sectionNode) {
        return null;
      }

      const title = getText(findNodesByTagName(sectionNode, 'h5')[0]);
      const socialLinks = extractSocialLinks(sectionNode);
      const paragraphContent = findNodesByTagName(sectionNode, 'p')
        .map(getText)
        .filter(Boolean);

      return {
        title,
        content: socialLinks.length > 0 ? socialLinks : paragraphContent,
      };
    })
    .filter(Boolean);

export const parseCustomerCareContent = html => {
  const decodedHtml = decodeCmsHtml(html);
  const doc = parseDocument(decodedHtml);
  const bannerImage = decodedHtml.match(
    /\.image-contact\s*\{[\s\S]*?url\(["']?([^"')]+)["']?\)/,
  )?.[1];
  const bannerNode = findNode(doc, node => hasClass(node, 'image-contact'));
  const contactNode = findNode(doc, node => hasClass(node, 'cms-blocks-contact'));

  return {
    bannerImage,
    bannerTitle: getText(bannerNode) || 'Contact us',
    sections: extractSections(contactNode),
  };
};
