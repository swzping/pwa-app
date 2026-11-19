export default node => {
  // 如果children是heading内容，返回空数组，让组件自动调用API
  let voucherData = node.children || [];

  // 检查children是否包含真实的voucher数据，如果没有则返回空数组
  if (voucherData.length === 0 || voucherData[0]?.contentType === 'heading') {
    voucherData = []; // 返回空数组，触发组件的API调用
  }

  return {
    data: voucherData,
    onVoucherPress: null, // 可以通过props传入
    onDetailsPress: null, // 可以通过props传入
  };
};
