import React, {useMemo, useState, useCallback, useEffect} from 'react';
import {View, StyleSheet, ViewStyle, StyleProp} from 'react-native';

const ButtonsWidget = ({
  appearance = 'inline',
  isSameWidth = false,
  textAlign = 'left',
  borderColor,
  borderWidth,
  borderRadius,
  marginTop,
  marginRight,
  marginBottom,
  marginLeft,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  children,
}) => {
  const [minWidth, setMinWidth] = useState(0);

  useEffect(() => {
    if (isSameWidth) {
      setMinWidth(0);
    }
  }, [children, isSameWidth]);

  const handleLayout = useCallback(
    e => {
      const {width} = e.nativeEvent.layout;
      if (width > minWidth) {
        setMinWidth(width);
      }
    },
    [minWidth],
  );

  const processedChildren = useMemo(() => {
    if (!isSameWidth) {
      return children;
    }

    return React.Children.map(children, child => {
      if (!React.isValidElement(child)) {
        return null;
      }

      const childStyle: StyleProp<ViewStyle> = {};
      if (appearance === 'inline') {
        childStyle.flex = 1;
      } else if (appearance === 'stacked') {
        childStyle.alignSelf = 'stretch';
      }

      if (minWidth > 0) {
        childStyle.width = minWidth;
      }

      return (
        <View onLayout={handleLayout} style={childStyle}>
          {React.cloneElement(child, {style: [child.props.style]})}
        </View>
      );
    });
  }, [children, isSameWidth, appearance, minWidth, handleLayout]);

  const containerStyle = {
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    borderColor,
    borderWidth,
    borderRadius,
    flexDirection: appearance === 'stacked' ? 'column' : 'row',
    justifyContent:
      appearance === 'inline'
        ? textAlign === 'left'
          ? 'flex-start'
          : textAlign === 'center'
          ? 'center'
          : 'flex-end'
        : undefined,
    alignItems:
      appearance === 'stacked'
        ? textAlign === 'left'
          ? 'flex-start'
          : textAlign === 'center'
          ? 'center'
          : 'flex-end'
        : undefined,
    alignContent: 'center',
  };

  return (
    <View style={[styles.container, containerStyle]}>{processedChildren}</View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexWrap: 'wrap',
    // gap: 8,
  },
});

export default ButtonsWidget;
