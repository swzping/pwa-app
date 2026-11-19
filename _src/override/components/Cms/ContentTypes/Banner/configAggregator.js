import {getBackgroundImages, findNode} from '../../utils';

export default node => {
  const dataNode = node.children[0];
  if (!dataNode) {
    return {};
  }

  const imageNode = dataNode.children[0];

  const props = {
    showPromotion: !!node.showPromotion,
    promotionId: node.promotionId,
    promotionName: node.promotionName,
    creativeName: node.creativeName,
    creativeSlot: node.creativeSlow,
    ...getBackgroundImages(imageNode),
  };

  const posterContentNode = findNode(
    node,
    currentNode =>
      !!currentNode.cssClasses?.includes('pagebuilder-poster-content'),
  );
  const guardianRuntNode = findNode(
    node,
    currentNode => !!currentNode.cssClasses?.includes('guardian-run-banner'),
  );
  const slideWrapperNode = findNode(
    node,
    currentNode =>
      !!currentNode.cssClasses?.includes('pagebuilder-slide-wrapper'),
  );
  if (posterContentNode) {
    const [contentNode, buttonNode] = posterContentNode?.children || [];
    if (contentNode?.content || buttonNode?.text) {
      const titleNode =
        contentNode?.children?.[0] &&
        findNode(contentNode.children[0], childNode => Boolean(childNode.text));
      const title = titleNode?.text || '';
      Object.assign(props, {
        content: {
          title,
          description: contentNode?.content,
        },
        button: {
          text: buttonNode?.text,
          attributes: {
            type: '',
          },
        },
      });
    }
  }
  if (guardianRuntNode) {
    Object.assign(props, {
      backgroundType: guardianRuntNode.backgroundType,
      borderRadius: 0,
      noPadding: true,
    });
  }
  if (slideWrapperNode) {
    Object.assign(props, {
      backgroundType: slideWrapperNode.backgroundType,
      videoFallbackSrc: slideWrapperNode.videoFallbackSrc,
      videoLazyLoad: slideWrapperNode.videoLazyLoad,
      videoLoop: slideWrapperNode.videoLoop,
      videoPlayOnlyVisible: slideWrapperNode.videoPlayOnlyVisible,
      videoSrc: slideWrapperNode.videoSrc,
      borderRadius: node.borderRadius ?? 12,
    });
  }

  if (dataNode.element === 'link') {
    const {href, linkType} = dataNode;
    Object.assign(props, {link: href, linkType});
  }

  return props;
};
