/**
 * 统一输入框外观配置
 * 只改这个文件即可控制全局所有输入框的样式
 */

export const InputAppearance = {
  // ========== 圆角 ==========
  radius: 12,
  
  // ========== 默认状态 (default) ==========
  baseBorderColor: '#E0E0E0',
  baseBorderWidth: 2,
  // 全局输入框默认背景：与页面 #FAFAFA 保持一致的浅灰底色
  baseBgColor: '#FAFAFA',
  
  // ========== 聚焦状态 (focus) ==========
  focusBorderColor: '#FBC99D',
  focusBorderWidth: 1.5,
  
  // 聚焦时的外层光晕
  glow: {
    padding: 4,
    radius: 12,
    bgColor: 'rgba(255, 130, 0, 0.08)',
  },
  
  // ========== 已填充状态 (filled: 失焦 + 有值) ==========
  filledBorderColor: '#BDBDBD',
  
  // ========== 禁用状态 (disabled) ==========
  disabledBgColor: '#F5F5F5',
  disabledBorderColor: '#E0E0E0',
  disabledTextColor: '#999999',
  
  // ========== 错误状态 (error) ==========
  errorBorderColor: '#E21A23',
  
  // ========== Placeholder ==========
  placeholderColor: '#999999',
};

/**
 * 获取外层容器样式（相对定位，不影响输入框尺寸）
 */
export const getInputContainerStyle = () => {
  return {
    position: 'relative',
  };
};

/**
 * 获取光晕背景层样式（绝对定位，focus 时显示在输入框后面）
 */
export const getGlowBackgroundStyle = (isFocused, hasError) => {
  if (!isFocused || hasError) {
    return {
      display: 'none',
    };
  }
  
  return {
    position: 'absolute',
    top: -4,
    left: -5,
    right: -5,
    bottom: -8,
    borderRadius: InputAppearance.glow.radius,
    backgroundColor: InputAppearance.glow.bgColor,
    zIndex: -1,
  };
};

/**
 * 获取原生 TextInput 的样式（用于 auth_signin 手机号等）
 */
export const getNativeInputVisual = ({isFocused, hasValue, disabled, hasError}) => {
  let borderColor = InputAppearance.baseBorderColor;
  let borderWidth = InputAppearance.baseBorderWidth;
  
  if (hasError) {
    borderColor = InputAppearance.errorBorderColor;
  } else if (isFocused) {
    borderColor = InputAppearance.focusBorderColor;
    borderWidth = InputAppearance.focusBorderWidth;
  } else if (hasValue) {
    borderColor = InputAppearance.filledBorderColor;
  }
  
  return {
    borderWidth,
    borderColor,
    borderRadius: InputAppearance.radius,
    backgroundColor: disabled ? InputAppearance.disabledBgColor : InputAppearance.baseBgColor,
    color: disabled ? InputAppearance.disabledTextColor : '#333333',
  };
};

/**
 * 获取 react-native-paper TextInput 的样式配置
 */
export const getPaperOutlinedInputVisual = ({
  isFocused,
  hasValue,
  disabled,
  hasError,
  extraOutlineStyle = {},
}) => {
  let outlineColor = InputAppearance.baseBorderColor;
  
  if (hasError) {
    outlineColor = InputAppearance.errorBorderColor;
  } else if (isFocused) {
    outlineColor = InputAppearance.focusBorderColor;
  } else if (hasValue) {
    outlineColor = InputAppearance.filledBorderColor;
  }
  
  const outlineBgColor = disabled ? InputAppearance.disabledBgColor : InputAppearance.baseBgColor;
  
  const outlineBorderWidth = isFocused ? InputAppearance.focusBorderWidth : InputAppearance.baseBorderWidth;
  
  return {
    outlineColor,
    activeOutlineColor: InputAppearance.focusBorderColor,
    outlineStyle: {
      ...extraOutlineStyle,
      borderRadius: InputAppearance.radius,
      borderWidth: outlineBorderWidth,
      backgroundColor: outlineBgColor,
    },
    // 确保内容区域也遵循圆角
    contentStyle: {
      borderRadius: InputAppearance.radius,
    },
    // 输入框本身样式（不用 overflow: 'hidden'，避免裁切圆角）
    style: {
      borderRadius: InputAppearance.radius,
      backgroundColor: outlineBgColor,
    },
  };
};

// 简化访问：导出常用配置属性
export const {radius, placeholderColor} = InputAppearance;
