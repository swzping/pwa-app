export default node => {
  return {
    width: node.children[0]?.pbStyleInline?.width,
    color: node.children[0]?.pbStyleInline?.borderColor,
    thickness: node.children[0]?.pbStyleInline?.borderWidth,
  };
};
