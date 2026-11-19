// icons.svg 装饰层统一配置
export const ICONS_CONFIG = {
  WIDTH: 250,
  HEIGHT: 300,
  TOP: -60, // NavBar 中使用的 top 值
  LEFT: 185,
  Z_INDEX: 2,
  NAVBAR_HEIGHT: 56, // NavBar 的高度
};

// LoyaltyCard 中使用的 top 值（需要减去 NavBar 高度）
export const getLoyaltyCardTop = () => {
  return ICONS_CONFIG.TOP - ICONS_CONFIG.NAVBAR_HEIGHT;
};

