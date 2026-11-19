import {getAdvanced} from '../../utils';
export default node => {
  const firstChild = node.children[0];
  const {cssClasses} = getAdvanced(node);
  if (!firstChild) {
    return {};
  }

  const isLinkElement = firstChild.element === 'link';
  const imageNode = isLinkElement ? firstChild.children : node.children;

  const getImageData = image => image.src;

  const getImageProps = () => {
    const image = imageNode[0];
    if (!image) {
      return {};
    }

    const imageData = getImageData(image);
    const imageProps = {
      desktopImage: null,
      mobileImage: null,
      altText: image.alt || null,
      title: image.title || null,
    };

    if (image.element === 'desktop_image') {
      imageProps.desktopImage = imageData;
      const image2 = imageNode[1];
      if (image2?.element === 'mobile_image' && image2.src !== imageData.src) {
        imageProps.mobileImage = getImageData(image2);
      }
    } else {
      imageProps.mobileImage = imageData;
    }

    return imageProps;
  };

  const props = {
    fullFill: !!node.fullFill,
    showView: !!node.showView,
    showPromotion: !!node.showPromotion,
    borderRadius: node.borderRadius ?? 12,
    promotionId: node.promotionId,
    promotionName: node.promotionName,
    creativeName: node.creativeName,
    creativeSlot: node.creativeSlow,
    customStyles: node.customStyles,
    ...getImageProps(),
  };

  if (isLinkElement) {
    props.link = firstChild.href?.trim();
    props.linkType = firstChild.linkType;
  }

  if (cssClasses?.includes('guardian-run-img')) {
    props.noPadding = true;
    props.borderRadius = 0;
    props.needMariginTop = true;
  }
  return props;
};
