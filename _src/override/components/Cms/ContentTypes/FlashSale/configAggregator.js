import {traverse, findNode} from '../../utils';

// 从节点中提取文本内容
function extractTextFromNode(node) {
  if (!node) return '';
  
  // 如果有直接的文本内容
  if (node.text) {
    return node.text.trim();
  }
  
  // 如果有 content 属性
  if (node.content) {
    // 简单去除 HTML 标签
    return node.content.replace(/<[^>]*>/g, '').trim();
  }
  
  // 递归查找子节点中的文本
  let text = '';
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      const childText = extractTextFromNode(child);
      if (childText) {
        text += childText + ' ';
      }
    }
  }
  
  return text.trim();
}

// 查找标题节点
function findTitleNode(node) {
  // 查找 h1, h2, h3 等标题标签
  const headingNode = findNode(node, n => 
    n.tagName && /^h[1-6]$/i.test(n.tagName)
  );
  if (headingNode) {
    return extractTextFromNode(headingNode);
  }
  
  // 查找带有特定 CSS 类的元素
  const titleClassNode = findNode(node, n => 
    Array.isArray(n.cssClasses) && (
      n.cssClasses.includes('module-title') ||
      n.cssClasses.includes('flash-sale-title') ||
      n.cssClasses.includes('heading') ||
      n.cssClasses.includes('title')
    )
  );
  if (titleClassNode) {
    return extractTextFromNode(titleClassNode);
  }
  
  // 查找第一个包含文本的子节点
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      const text = extractTextFromNode(child);
      if (text && text.length > 0 && text.length < 100) {
        // 如果文本不太长，可能是标题
        return text;
      }
    }
  }
  
  return null;
}

// 查找结束时间
function findEndTime(node) {
  // 从 data 属性中查找
  if (node.dataEndTime) {
    return node.dataEndTime;
  }
  if (node.dataFlashSaleEndTime) {
    return node.dataFlashSaleEndTime;
  }
  
  // 从子节点中查找带有 data 属性的元素
  const dataNode = findNode(node, n => 
    n.dataEndTime || n.dataFlashSaleEndTime
  );
  if (dataNode) {
    return dataNode.dataEndTime || dataNode.dataFlashSaleEndTime;
  }
  
  return null;
}

export default (node, props, pNode) => {
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

  // 尝试从节点中提取标题
  const extractedTitle = findTitleNode(node);
  const moduleTitle = node.moduleTitle || node.title || extractedTitle;
  
  // 尝试从节点中提取结束时间
  const extractedEndTime = findEndTime(node);
  const endTime = node.endTime || node.flashSaleEndTime || extractedEndTime;


  const result = {
    width: pNode.width,
    moduleTitle,
    moreName: node.moreName,
    moreLink: node.moreLink,
    endTime, // 闪购结束时间
    showCountdown: node.showCountdown !== false, // 是否显示倒计时
    pageSize: node.pageSize || 20, // 产品数量，默认20
    ...carouselConfig,
  };
  
  return result;
};

