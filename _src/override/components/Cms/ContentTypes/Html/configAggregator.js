import {
  getAspectRatioFromDimensions,
  resolveBannerAspectRatio,
  traverse,
} from '../../utils.js';

export default node => {
  let slides = null;
  let bannerAspectRatio = null;
  let items = null;
  let brands = null;
  let smallIconItems = null;
  let plpSmallIconItems = null;
  let plpBrandsItems = null;

  traverse(node, current => {
    // 处理 plp-small-icon 结构（独立检测）
    if (!plpSmallIconItems && current.cssClasses?.includes('plp-small-icon')) {
      plpSmallIconItems = (current.children || []).flatMap(child => {
        if (child.tagName !== 'a') {
          return [];
        }
        const link = child.href || '';
        // 查找图片：可能在 figure > img 或直接是 img
        const figureNode = child.children?.find(n => n.tagName === 'figure');
        const imgNode = figureNode
          ? figureNode.children?.find(n => n.tagName === 'img')
          : child.children?.find(n => n.tagName === 'img');

        // 查找标题：可能在 figcaption、p 或其他文本节点
        const captionNode =
          figureNode?.children?.find(
            n => n.tagName === 'figcaption' || n.tagName === 'p',
          ) ||
          child.children?.find(
            n =>
              n.tagName === 'figcaption' ||
              n.tagName === 'p' ||
              n.tagName === 'span',
          );

        const caption =
          captionNode?.content ||
          captionNode?.text ||
          captionNode?.children?.find(n => n.text)?.text ||
          '';

        return [
          {
            link,
            image: imgNode?.src || '',
            caption: caption,
          },
        ];
      });
    }

    // 处理 plp-brands 结构（独立检测）
    if (!plpBrandsItems && current.cssClasses?.includes('plp-brands')) {
      plpBrandsItems = (current.children || []).flatMap(child => {
        if (child.tagName !== 'a') {
          return [];
        }
        const link = child.href || '';
        const imgNode = child.children
          ?.find(n => n.tagName === 'figure')
          ?.children.find(n => n.tagName === 'img');
        return [
          {
            link,
            image: imgNode?.src || '',
          },
        ];
      });
    }

    // 处理 small-icon 结构（原有逻辑）
    if (!smallIconItems && current.cssClasses?.includes('small-icon')) {
      smallIconItems = (current.children || []).flatMap(child => {
        if (
          child.tagName !== 'a' ||
          !child.cssClasses?.includes('small-icon__item')
        ) {
          return [];
        }
        const link = child.href || '';
        const figureNode = child.children?.find(n => n.tagName === 'figure');
        const imgNode = figureNode?.children?.find(
          n =>
            n.tagName === 'img' && n.cssClasses?.includes('small-icon__image'),
        );
        const captionNode = figureNode?.children?.find(
          n =>
            n.tagName === 'figcaption' &&
            n.cssClasses?.includes('small-icon__text'),
        );
        return [
          {
            link,
            image: imgNode?.src || '',
            caption: captionNode?.content || '',
          },
        ];
      });
    }

    // 处理 brands 结构（原有逻辑）
    if (!brands && current.cssClasses?.includes('brands')) {
      brands = (current.children || []).flatMap(child => {
        if (child.tagName !== 'a') {
          return [];
        }
        const link = child.href || '';
        const imgNode = child.children
          ?.find(n => n.tagName === 'figure')
          ?.children.find(n => n.tagName === 'img');
        return [
          {
            link,
            image: imgNode?.src || '',
          },
        ];
      });
    }
    if (!slides && current.cssClasses?.includes('banner-highlight-parent')) {
      bannerAspectRatio = resolveBannerAspectRatio(current);

      slides =
        current.children?.flatMap(child => {
          if (!child.cssClasses?.includes('banner-highlight-children')) {
            return [];
          }
          const aTag = child.children?.find(n => n.tagName === 'a');
          const img = aTag?.children?.find(n => n.tagName === 'img');
          const slideAspectRatio =
            getAspectRatioFromDimensions(img?.width, img?.height) ||
            getAspectRatioFromDimensions(child.width, child.height);

          if (slideAspectRatio && !bannerAspectRatio) {
            bannerAspectRatio = slideAspectRatio;
          }

          return [
            {
              contentType: 'image',
              mobileImage: img?.src || '',
              link: aTag?.href || '',
            },
          ];
        }) || [];
    }

    if (!items && current.cssClasses?.includes('wrapper-catalog-promotion')) {
      items = [];
      traverse(current, sub => {
        if (!sub.cssClasses?.includes('item-catalog-wrapper')) {
          return;
        }
        const anchor = sub.children
          ?.find(n => n.tagName === 'center')
          ?.children.find(n => n.tagName === 'a');
        const imgNode = anchor?.children
          ?.find(
            n => n.tagName === 'div' && n.cssClasses?.includes('item-catalog'),
          )
          ?.children.find(n => n.tagName === 'img');
        const caption = anchor?.children.find(n => n.tagName === 'p')?.text;
        items.push({
          link: anchor?.href || '',
          image: imgNode?.src || '',
          caption: caption || '',
          hide:
            sub.cssClasses?.includes('hide') ||
            sub.cssClasses?.includes('app-hide'),
        });
      });
    }
  });

  // 优先检查 PLP 标识，使用独立的组件
  if (plpBrandsItems?.length) {
    return {
      contentType: 'plpBrands',
      items: plpBrandsItems,
    };
  }

  if (plpSmallIconItems?.length) {
    return {
      contentType: 'plpSmallIcon',
      items: plpSmallIconItems,
    };
  }

  // 原有逻辑作为 fallback（没有 PLP 标识时）
  if (brands?.length) {
    return {
      contentType: 'brands',
      items: brands.slice(0, 6),
    };
  }

  if (slides?.length) {
    const hasOsmosPlaceholders = slides.some(
      slide => !slide.mobileImage && !slide.desktopImage,
    );

    return {
      contentType: 'slider',
      showSmallBanner: true,
      mode: 3,
      children: slides,
      ...(bannerAspectRatio ? {bannerAspectRatio} : {}),
      cssClasses: [
        'banner-highlight-slider',
        ...(hasOsmosPlaceholders ? ['osmos-brand-banner'] : []),
      ],
      breakpoints: {
        0: {slidesPerView: 1, spaceBetween: 8},
        1: {slidesPerView: 1.25, spaceBetween: 8},
        2: {slidesPerView: 1.33, spaceBetween: 8},
        3: {slidesPerView: 2.05, spaceBetween: 8},
        4: {slidesPerView: 2.05, spaceBetween: 8},
      },
    };
  }

  if (items?.length) {
    return {
      contentType: 'smallIcon',
      items,
    };
  }

  if (smallIconItems?.length) {
    return {
      contentType: 'smallIcon',
      items: smallIconItems,
    };
  }

  return {};
};
