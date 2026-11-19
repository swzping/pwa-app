const IOS_SYSTEM_SHARE_TYPES = new Set(['facebook', 'twitter']);

export const shouldUseSystemShareSheet = (platform, type) =>
  platform === 'ios' && IOS_SYSTEM_SHARE_TYPES.has(type);
