export default node => {
  return {
    isInline: node.isInline,
    is3NLayout: node.is3NLayout,
    is2NLayout: node.is2NLayout,
    is4NLayout: node.is4NLayout,
    healthCheckLayout: node.healthCheckLayout,
  };
};
