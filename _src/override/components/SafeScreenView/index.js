import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import PropTypes from 'prop-types';

/**
 * 带 NavBar/Appbar 的页面使用的 SafeAreaView 封装，避免顶部安全区重复导致空白过大。
 *
 * react-native-paper v5 的 Appbar.Header 已自带顶部安全区（statusBarHeight），
 * 若页面再用默认 SafeAreaView（含 top），会导致顶部空白过大。
 * 本组件默认只应用 bottom/left/right，顶部由 NavBar 处理。
 *
 * 使用方式：
 * - 有 NavBar 的页面：<SafeScreenView>...</SafeScreenView> 或 <SafeScreenView withHeader />
 * - 无 NavBar 的页面：<SafeScreenView withHeader={false}>...</SafeScreenView>
 * - 自定义边：<SafeScreenView edges={['bottom']}>...</SafeScreenView>
 *
 * @param {boolean} withHeader - 页面是否有 NavBar/Appbar（默认 true），为 true 时不应用 top
 * @param {string[]} edges - 覆盖默认 edges，传则优先使用
 * @param {object} style - 样式
 * @param {React.ReactNode} children - 子节点
 */
const SafeScreenView = ({
  withHeader = true,
  edges: edgesProp,
  style,
  children,
  ...rest
}) => {
  const edges =
    edgesProp !== undefined
      ? edgesProp
      : withHeader
        ? ['bottom', 'left', 'right']
        : ['top', 'bottom', 'left', 'right'];

  return (
    <SafeAreaView style={[{ flex: 1 }, style]} edges={edges} {...rest}>
      {children}
    </SafeAreaView>
  );
};

SafeScreenView.propTypes = {
  withHeader: PropTypes.bool,
  edges: PropTypes.arrayOf(PropTypes.oneOf(['top', 'bottom', 'left', 'right'])),
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  children: PropTypes.node,
};

export default SafeScreenView;
