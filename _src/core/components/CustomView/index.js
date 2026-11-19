import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors, Spacing} from '@app/styles';

/**
 * ---------------------------------------------------- *
 * @styles {Custom View}
 * @summary return styles Custom View
 * ---------------------------------------------------- *
 */
const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.BASE_MARGIN,
    backgroundColor: 'transparent',
  },
  containerHeader: {
    paddingVertical: Spacing.DOUBLE_BASE_MARGIN,
    backgroundColor: Colors.WHITE,
  },
});

/**
 * ---------------------------------------------------- *
 * @component {Custom View}
 * @summary return component Custom View
 * ---------------------------------------------------- *
 */
const CustomView = ({
  bg,
  children,
  style,
  header,
  flex,
  flexNumber,
  small,
  horizontalStart,
  horizontalCenter,
  horizontalEnd,
  width,
  height,
  plain,
  spaceBetween,
  spaceAround,
  spaceEvenly,
  verticalCenter,
  row,
  column,
  border,
  borderColor,
  backgroundColor,
  borderRadius,
  horizontal,
  margin,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  marginHorizontal,
  marginVertical,
  padding,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  paddingHorizontal,
  paddingVertical,
  doubleHorizontal,
  doubleVertical,
  underline,
  safe = false,
  disabled = false,
  onPress = null,
}) => {
  let styleObject = {
    ...(row ? {flexDirection: 'row'} : null),
    ...(flex ? {flex: 1} : null),
    ...(flexNumber ? {flex: flexNumber} : null),
    ...(bg ? {backgroundColor: bg} : null),
    ...(small ? {paddingVertical: Spacing.SMALL_MARGIN} : null),
    ...(horizontal ? {paddingHorizontal: Spacing.BASE_MARGIN} : null),
    ...(width ? {width} : null),
    ...(height ? {height} : null),
    ...(horizontalStart ? {alignItems: 'flex-start'} : null),
    ...(horizontalEnd ? {alignItems: 'flex-end'} : null),
    ...(horizontalCenter ? {alignItems: 'center'} : null),
    ...(verticalCenter ? {justifyContent: 'center'} : null),
    ...(plain ? {paddingVertical: 0, paddingHorizontal: 0} : null),
    ...(spaceBetween ? {justifyContent: 'space-between'} : null),
    ...(spaceAround ? {justifyContent: 'space-around'} : null),
    ...(spaceEvenly ? {justifyContent: 'space-evenly'} : null),
    ...(column ? {flexDirection: 'column'} : null),
    ...(backgroundColor ? {backgroundColor} : null),
    ...(border ? {borderWidth: border} : null),
    ...(borderColor ? {borderColor} : null),
    ...(borderRadius ? {borderRadius} : null),
    ...(margin ? {margin} : null),
    ...(marginTop ? {marginTop} : null),
    ...(marginBottom ? {marginBottom} : null),
    ...(marginLeft ? {marginLeft} : null),
    ...(marginRight ? {marginRight} : null),
    ...(marginHorizontal ? {marginHorizontal} : null),
    ...(marginVertical ? {marginVertical} : null),
    ...(padding ? {padding} : null),
    ...(paddingTop ? {paddingTop} : null),
    ...(paddingBottom ? {paddingBottom} : null),
    ...(paddingLeft ? {paddingLeft} : null),
    ...(paddingRight ? {paddingRight} : null),
    ...(paddingHorizontal ? {paddingHorizontal} : null),
    ...(paddingVertical ? {paddingVertical} : null),
    ...(doubleHorizontal
      ? {paddingHorizontal: Spacing.DOUBLE_BASE_MARGIN}
      : null),
    ...(doubleVertical ? {paddingVertical: Spacing.DOUBLE_BASE_MARGIN} : null),
    ...(underline
      ? {borderBottomWidth: 0.2, borderBottomColor: Colors.GRAY_SMOOTH5}
      : null),
  };
  if (safe) {
    return (
      <SafeAreaView
        style={[header ? styles.containerHeader : null, style, styleObject]}>
        {children}
      </SafeAreaView>
    );
  } else if (onPress) {
    // Merge all styles to extract layout properties
    const mergedStyle = StyleSheet.flatten([
      header ? styles.containerHeader : null,
      style,
      styleObject,
    ]);
    // Extract layout-related styles for inner View from merged styles
    const layoutStyle = {
      flexDirection: mergedStyle.flexDirection,
      flex: mergedStyle.flex,
      alignItems: mergedStyle.alignItems,
      justifyContent: mergedStyle.justifyContent,
    };
    return (
      <TouchableOpacity
        disabled={disabled}
        onPress={onPress}
        style={[header ? styles.containerHeader : null, style, styleObject]}>
        <View style={layoutStyle}>{children}</View>
      </TouchableOpacity>
    );
  } else {
    return (
      <View
        style={[header ? styles.containerHeader : null, style, styleObject]}>
        {children}
      </View>
    );
  }
};

export default CustomView;
