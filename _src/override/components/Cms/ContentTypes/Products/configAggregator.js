import {traverse} from '../../utils';

export default (node, props, pNode) => {
  const forms = [];
  traverse(node, n => {
    if (
      n.tagName === 'a' &&
      Array.isArray(n.cssClasses) &&
      (n.cssClasses.includes('product-item-photo') ||
        n.cssClasses.includes('product-item-link')) &&
      typeof n.href === 'string'
    ) {
      try {
        const url = n.href;
        const segments = url.split('/').filter(Boolean);
        let slug = segments.pop() || '';
        slug = slug.replace(/\.html?$/i, '');
        forms.push(slug);
      } catch (e) {
        forms.push(n.href);
      }
    }
  });

  let carouselConfig = {};
  if (props.appearance === 'carousel') {
    carouselConfig = {
      autoplay: node.autoplay,
      autoplaySpeed: node.autoplaySpeed,
      infinite: node.infiniteLoop,
      arrows: node.showArrows,
      dots: node.showDots,
      carouselMode: node.carouselMode,
    };
  }

  return {
    pathNames: forms,
    width: pNode.width,
    moduleTitle: node.moduleTitle,
    moreName: node.moreName,
    moreLink: node.moreLink,
    ...carouselConfig,
  };
};
