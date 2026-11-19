import {Dimensions} from 'react-native';

import {LogUtils} from '@app/helpers/LoggerUtils';

import {getContentTypeConfig} from './config';
import {promoSection2PopUp,promoSection2SmallIcon} from './nodeConvert';
import {getIsHidden, nodeToHtml,traverse} from './utils';

const createContentTypeObject = (type, node, position, context = {}) => {
  const base = {
    position,
    contentType: type,
    appearance: node?.appearance || null,
    children: [],
  };

  if (node.noPadding || context.noPadding) {
    base.noPadding = true;
  }

  // 传递isPLP标识
  if (context.isPLP) {
    base.isPLP = true;
  }

  return base;
};

const applyLayoutClasses = currentNode => {
  if (currentNode.contentTypeMap === 'row') {
    if (currentNode?.cssClasses?.includes('campaign-highlight')) {
      traverse(currentNode, traverseNode => {
        traverseNode.noPadding = true;
        if (traverseNode.contentType === 'column') {
          traverseNode.borderRadius = 16;
          traverseNode.marginTop = 8;
          traverseNode.marginBottom = 8;
        } else if (traverseNode.contentType === 'slider') {
          traverseNode.bleeding = false;
          traverseNode.breakpoints = {
            0: {slidesPerView: 1, spaceBetween: 0},
            1: {slidesPerView: 1.25, spaceBetween: 0},
            2: {slidesPerView: 1.33, spaceBetween: 0},
            3: {slidesPerView: 2.5, spaceBetween: 0},
            4: {slidesPerView: 2.5, spaceBetween: 0},
          };
        } else if (
          traverseNode.contentType === 'slide' ||
          traverseNode.contentType === 'banner' ||
          traverseNode.contentType === 'image'
        ) {
          traverseNode.borderRadius = 0;
        }
      });
    }
    if (currentNode?.cssClasses?.includes('highlight-service-row')) {
      currentNode.children = [];
    }
    if (currentNode?.cssClasses?.includes('health-check-service-app')) {
      traverse(currentNode, node => {
        if (node.contentType === 'column-line') {
          node.healthCheckLayout = true;
        }
      });
    }
    if (currentNode?.cssClasses?.includes('homePage-ads-row')) {
      promoSection2PopUp(currentNode);
    }
    if (currentNode?.cssClasses?.includes('promo-section')) {
      promoSection2SmallIcon(currentNode);
    }
    if (currentNode?.cssClasses?.includes('Voucher-Rows')) {
      // 保持当前节点不变，在其children中添加voucherSlider节点
      if (!currentNode.children) {
        currentNode.children = [];
      }
      // 添加voucherSlider节点到children
      currentNode.children.push({
        contentType: 'voucherSlider',
        contentTypeMap: 'voucherSlider',
        cssClasses: ['voucher-slider-content'],
        children: [], // voucher数据将通过configAggregator提供
      });
    }
  }
};

const calculateTabWidth = context => {
  return context.screenWidth - 2 * (context.currentColumnPadding || 0);
};

const walk = (
  node,
  contentTypeStructureObj,
  path = '0',
  context = {
    screenWidth: Dimensions.get('window').width,
    currentColumnPadding: undefined,
    isPLP: false,
  },
) => {
  const processNode = (currentNode, currentPath, nodeContext) => {
    applyLayoutClasses(currentNode);

    let modifiedContext = nodeContext;

    if (currentNode.contentType === 'column') {
      const paddingRaw = contentTypeStructureObj?.marginHorizontal || 0;
      const padding =
        typeof paddingRaw === 'string' ? parseFloat(paddingRaw) : paddingRaw;
      modifiedContext = {
        ...nodeContext,
        currentColumnPadding: padding,
      };
    }

    if (
      currentNode.contentType === 'tab-item' &&
      modifiedContext.currentColumnPadding
    ) {
      currentNode.width = calculateTabWidth(modifiedContext);
    }
    if (currentNode.contentType === 'column-group') {
      if (currentNode?.cssClasses?.includes('guardian-run-location-and-time')) {
        traverse(currentNode, traverseNode => {
          if (traverseNode.contentType === 'column-line') {
            traverseNode.is2NLayout = true;
          }
        });
      }
    }
    const children = currentNode.children || [];
    children.forEach((childNode, index) => {
      // 检查是否有 flash-sale-product CSS 类，如果有则转换为 flashSale 组件
      if (childNode?.cssClasses?.includes('flash-sale-product')) {
        childNode.contentType = 'flashSale';
        childNode.contentTypeMap = 'flashSale';
      }

      const contentType = childNode.contentType;
      if (!contentType) {
        childNode.contentTypeMap = currentNode.contentType;
        processNode(childNode, currentPath, modifiedContext);
        return;
      }

      const childPosition = `${currentPath}-${index}`;
      const props = createContentTypeObject(
        contentType,
        childNode,
        childPosition,
        modifiedContext,
      );
      const contentTypeConfig = getContentTypeConfig(contentType);

      // 如果没有找到对应的组件配置,fallback 到 HTML 渲染
      if (!contentTypeConfig || !contentTypeConfig.component) {
        if (__DEV__) {
          console.log(
            `[ParseJSON] 未找到组件配置,转换为HTML [${contentType}] at [${childPosition}]`,
          );
        }

        // 将节点转换为 HTML 字符串
        const htmlContent = nodeToHtml(childNode);
        const htmlProps = {
          position: childPosition,
          contentType: 'html',
          appearance: null,
          children: [],
          content: htmlContent,
        };

        contentTypeStructureObj.children.push(htmlProps);
        return;
      }

      if (contentTypeConfig?.configAggregator) {
        try {
          const hiddenProps = getIsHidden(childNode);
          if (hiddenProps.isHidden) {
            return;
          }
          const aggregatedData = contentTypeConfig.configAggregator(
            childNode,
            props,
            currentNode,
          );
          Object.assign(props, hiddenProps, aggregatedData);
        } catch (error) {
          LogUtils.error(`Config aggregator failed for ${contentType}`, error);
        }
      }

      contentTypeStructureObj.children.push(props);
      walk(childNode, props, childPosition, modifiedContext);
    });
  };

  processNode(node, path, context);
  return contentTypeStructureObj;
};

const parseStorageJSON = (jsonStr, options = {}) => {
  let data = null;
  try {
    const json = JSON.parse(jsonStr);
    if (__DEV__) {
      // console.log('Page builder json: ', json);
    }
    const rootNode = createContentTypeObject('root-container', json, '0', options);
    data = walk(json, rootNode, '0', {
      screenWidth: Dimensions.get('window').width,
      currentColumnPadding: undefined,
      isPLP: options.isPLP || false,
      ...options,
    });

    if (options.noBorderRadius) {
      traverse(rootNode, node => {
        node.borderRadius = 0;
      });
    }
  } catch (error) {
    LogUtils.error('Page builder JSON parsing error:', error);
    return null;
  }
  return data;
};

export default parseStorageJSON;
