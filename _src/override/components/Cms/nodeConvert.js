import {findNode, findNodes} from './utils';

export const promoSection2SmallIcon = currentNode => {
  try {
    const nodes = findNodes(
      currentNode,
      node => node.contentType === 'column' && node?.children?.length > 0,
    );

    currentNode.children = [
      {
        contentType: 'smallIcon',
        items: nodes.map(node => {
          const desktopImageNode = findNode(
            node,
            childNode => childNode.element === 'desktop_image',
          );
          const mobileImageNode = findNode(
            node,
            childNode => childNode.element === 'mobile_image',
          );
          const linkNode = findNode(
            node,
            childNode => childNode.element === 'link',
          );
          const textNode = findNode(
            node,
            childNode => childNode.contentType === 'text',
          );

          return {
            link: linkNode?.href,
            image: desktopImageNode?.src || mobileImageNode?.src,
            caption: textNode?.content
              ? String(textNode.content).replace(/<[^>]+>/g, '')
              : undefined,
          };
        }),
      },
    ];
  } catch (error) {}
};

export const promoSection2PopUp = currentNode => {
  try {
    const adsRowsMobileImg = findNodes(
      currentNode,
      node => node.element == "mobile_image"
    );

    const adsRowsMobileLink = findNodes(
      currentNode,
      node => node.element == "link"
    );
    currentNode.children = [
      {
        contentType: 'popUp',
        items:[{
            link:adsRowsMobileLink[0]?.href,
            image:adsRowsMobileImg[0]?.src
          }]
      },
    ];
  } catch (error) {
  }
};