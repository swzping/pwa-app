/**
 * VideoWidget Config Aggregator
 * 
 * 用于在 PageBuilder 中配置 VideoWidget 组件的数据聚合器
 * 
 * @param {Object} node - PageBuilder 节点数据
 * @param {Object} data - 额外的数据
 * @param {Object} storeConfig - 商店配置
 * @returns {Object} VideoWidget 组件所需的 props
 */
const videoWidgetConfigAggregator = (node, data, storeConfig) => {
  // 从 node 或 data 中提取视频 URL
  const src = node.video_url || 
              node.src || 
              data?.video_url || 
              data?.src || 
              '';

  // 提取自动播放设置
  const autoplay = node.autoplay !== undefined 
    ? Boolean(node.autoplay) 
    : data?.autoplay !== undefined 
    ? Boolean(data.autoplay) 
    : false;

  // 提取容器高度设置
  const useContainerHeight = node.use_container_height !== undefined
    ? Boolean(node.use_container_height)
    : data?.use_container_height !== undefined
    ? Boolean(data.use_container_height)
    : false;

  return {
    src,
    autoplay,
    useContainerHeight,
  };
};

export default videoWidgetConfigAggregator;

