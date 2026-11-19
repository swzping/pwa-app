import React from 'react';
import {Text} from 'react-native';

import {useReactiveVar} from '@apollo/client';

import {IS_IOS} from '@app/helpers/Constants';
import {rxUserFontSize, rxUserTheme} from '@app/services/cache';
import {Colors} from '@app/styles';
import {Typography} from '@app/styles/index';
import {normalize} from '@app/styles/mixins';

const CustomText = ({
  children,
  numberOfLines,
  ellipsizeMode,
  style,
  color: colorProp,
  onPress = null,
  onTextLayout,
  onLayout,

  // size
  xxsmall,
  xsmall,
  small_12,
  small,
  small2,
  small3,
  large,
  xlarge,
  scaling = true,

  // weight
  bold,
  light,

  // color
  primary,
  white,

  // text alignment
  center,
  justify,
  left,
  right,

  // decoration
  underline,
  lineThrough,

  // align self
  alignStart,
  alignEnd,
  alignCenter,
}) => {
  const scheme = useReactiveVar(rxUserTheme);

  const userFontSize = useReactiveVar(rxUserFontSize);

  let fontSize = normalize(15);
  if (small) {
    fontSize = normalize(13);
  }
  if (small2) {
    fontSize = normalize(12);
  }
  if (small3) {
    fontSize = normalize(11);
  }
  if (small_12) {
    fontSize = normalize(12);
  }

  if (xsmall) {
    fontSize = normalize(10);
  }
  if (xxsmall) {
    fontSize = normalize(8);
  }
  if (large) {
    fontSize = normalize(17);
  }
  if (xlarge) {
    fontSize = normalize(18);
  }
  if (scaling) {
    fontSize *= userFontSize;
  }

  let fontStyle = Typography.FONT_REGULAR;
  let fontWeight = {};
  if (bold) {
    fontStyle = Typography.FONT_BOLD;
    fontWeight = IS_IOS ? {fontWeight: 'bold'} : {};
  }
  if (light) {
    fontStyle = Typography.FONT_LIGHT;
  }

  // let color = Colors.BLACK;
  let color = scheme === 'dark' ? Colors.WHITE : Colors.BLACK;
  if (primary) {
    color = Colors.PRIMARY;
  }
  if (white) {
    color = Colors.WHITE;
  }
  if (colorProp) {
    color = colorProp;
  }
  // if (white) color = scheme === 'dark' ? Colors.BLACK : Colors.WHITE;

  let textAlign = 'auto';
  if (center) {
    textAlign = 'center';
  }
  if (justify) {
    textAlign = 'justify';
  }
  if (left) {
    textAlign = 'left';
  }
  if (right) {
    textAlign = 'right';
  }

  let textDecorationLine = 'none';
  if (underline) {
    textDecorationLine = 'underline';
  }
  if (lineThrough) {
    textDecorationLine = 'line-through';
  }

  let alignSelf = 'auto';
  if (alignCenter) {
    alignSelf = 'center';
  }
  if (alignStart) {
    alignSelf = 'flex-start';
  }
  if (alignEnd) {
    alignSelf = 'flex-end';
  }
  return (
    <Text
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      onPress={onPress}
      onTextLayout={onTextLayout}
      onLayout={onLayout}
      style={[
        {
          ...fontStyle,
          ...fontWeight,
          fontSize,
          color,
          textAlign,
          textDecorationLine,
          alignSelf,
        },
        style,
      ]}>
      {children}
    </Text>
  );
};

export default CustomText;
