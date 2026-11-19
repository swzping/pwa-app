import {Storage} from '@app/helpers/Storage';

/**
 * ---------------------------------------------------- *
 * @module FlashSale
 * @summary 闪购结束弹框 跨页面联动（PLP / PDP / 购物车 / 结算页）
 *
 * 解决两个问题：
 * 1. 弹框定时器串扰：4 个页面各自维护倒计时定时器，且 stack navigator
 *    会保持栈底页面挂载，同一时刻到期时会互相抢弹（包括隐藏页面）。
 *    现在各页面仅在 isFocused 时启动定时器，并由
 *    Storage.name.FLASH_SALE_MODAL_SHOWN 全局标记去重（按闪购结束
 *    时间戳识别：同一轮闪购只弹一次；同一商品配置新一轮闪购后标记
 *    自然失效，会重新弹框并覆盖为新时间戳）。
 * 2. 静默刷新联动：在任一页面的弹框上点击「刷新」后，其余页面重新
 *    获得焦点时需要静默刷新一次数据（闪购价已恢复原价）。
 *
 * 状态只保存在内存（模块级单例）：4 个页面同处一个 JS 上下文
 * （stack navigator 不会销毁栈底页面），无需持久化。持久化的
 * FLASH_SALE_MODAL_SHOWN 按结束时间戳识别，重启后新一轮闪购
 * （新结束时间）自然失效，无需额外清理。
 * ---------------------------------------------------- *
 */

// 最近一次「闪购结束弹框点击刷新」的广播时间戳
let lastEndedRefreshAt = 0;
// 各页面实例已消费的广播时间戳：pageKey -> 已处理过的 lastEndedRefreshAt
const consumedByPage = {};

/**
 * ---------------------------------------------------- *
 * @function getFlashSalePageKey
 * @summary 生成页面实例唯一 key（同一页面类型可能存在多个栈内实例，
 * 例如 PDP 之上再推入 PDP）
 * ---------------------------------------------------- *
 */
export const getFlashSalePageKey = (pageName = 'page') =>
  `${pageName}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;

/**
 * ---------------------------------------------------- *
 * @function isFlashSaleModalShownFor
 * @summary 全局弹框去重：FLASH_SALE_MODAL_SHOWN 存储的是「已弹过弹框的
 * 那一轮闪购」的结束时间戳（ms）。只有当前闪购的结束时间戳与存储值完全
 * 一致时才视为已弹过——同一商品配置新一轮闪购（新的结束时间）后标记
 * 自然失效，会重新弹框；旧版本存的布尔 true 同样视为失效。
 * 注意：4 个页面（PLP/PDP/Cart/Checkout）对结束时间戳的计算路径一致
 * （normalizeDateValue + convertUTCToIndonesia，可交换），跨页可比。
 * ---------------------------------------------------- *
 */
export const isFlashSaleModalShownFor = async flashSaleEndMs => {
  if (!flashSaleEndMs) {
    return false;
  }
  const shownForEndMs = await Storage.get(
    Storage.name.FLASH_SALE_MODAL_SHOWN,
  );
  return shownForEndMs === flashSaleEndMs;
};

/**
 * ---------------------------------------------------- *
 * @function markFlashSaleModalShown
 * @summary 弹框弹出后记录本轮闪购的结束时间戳（ms）
 * ---------------------------------------------------- *
 */
export const markFlashSaleModalShown = flashSaleEndMs => {
  if (flashSaleEndMs) {
    Storage.set(Storage.name.FLASH_SALE_MODAL_SHOWN, flashSaleEndMs);
  }
};

/**
 * ---------------------------------------------------- *
 * @function notifyFlashSaleEndedRefreshed
 * @summary 广播：用户在某个页面的闪购结束弹框上点击了刷新。
 * 在各页面弹框的 onRefresh 回调里调用。
 * ---------------------------------------------------- *
 */
export const notifyFlashSaleEndedRefreshed = () => {
  lastEndedRefreshAt = Date.now();
};

/**
 * ---------------------------------------------------- *
 * @function shouldSilentRefreshFlashSale
 * @summary 该页面实例是否还有一次未消费的静默刷新
 * ---------------------------------------------------- *
 */
export const shouldSilentRefreshFlashSale = pageKey =>
  Boolean(pageKey) && lastEndedRefreshAt > (consumedByPage[pageKey] || 0);

/**
 * ---------------------------------------------------- *
 * @function markFlashSaleSilentRefreshed
 * @summary 标记该页面实例已完成本次静默刷新
 * ---------------------------------------------------- *
 */
export const markFlashSaleSilentRefreshed = pageKey => {
  if (pageKey) {
    consumedByPage[pageKey] = lastEndedRefreshAt;
  }
};
