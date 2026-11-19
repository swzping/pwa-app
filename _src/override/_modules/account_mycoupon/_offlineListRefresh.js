// 线下券详情页期间券的核销状态可能已变化(有效券经确认核销后才进入详情,或在店内被扫码核销)。
// 离开详情页时打标记;MyVoucher 列表重新获得焦点时消费标记并刷新,让已核销状态及时置灰
let needRefresh = false;

export const markOfflineListRefresh = () => {
  needRefresh = true;
};

export const consumeOfflineListRefresh = () => {
  const value = needRefresh;
  needRefresh = false;
  return value;
};
