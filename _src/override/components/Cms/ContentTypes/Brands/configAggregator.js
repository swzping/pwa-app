import {findNode} from '../../utils';

export default node => {
  const items = node.children.map(child => {
    const image = findNode(
      child,
      currentNode => !!currentNode?.cssClasses?.includes('small-icon__image'),
    )?.src;
    const caption = findNode(
      child,
      currentNode => !!currentNode?.cssClasses?.includes('small-icon__text'),
    )?.content;
    return {
      link: child.href,
      image: image,
      caption: caption,
    };
  });

  return {
    contentType: 'brands',
    items,
  };
};
