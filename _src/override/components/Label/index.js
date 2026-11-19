import React from 'react';
import {Text} from 'react-native';
import {useReactiveVar} from '@apollo/client';
import {PRIMARY, ALERT, SECONDARY, GRAY_DARK, WHITE} from '@app/styles/colors';
import {DARK} from '@app/helpers/Constants';
// import {fontFamily} from '@app/styles/fonts';
import {rxUserFontSize, rxUserTheme} from '@app/services/cache';
import {Colors} from '@app/styles';
import {normalize} from '@app/styles/mixins';
import PropTypes from 'prop-types';

const Label = ({
  onPress,
  children,
  style,
  required,
  color,
  italic,
  light,
  lightItalic,
  medium,
  mediumItalic,
  semiBold,
  semiBoldItalic,
  bold,
  boldItalic,
  bolder,
  bolderItalic,
  black,
  blackItalic,
  underline,
  lineThrough,
  primary,
  secondary,
  gray,
  white,
  center,
  justify,
  left,
  right,
  bg,
  padding,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  paddingHorizontal,
  paddingVertical,
  margin,
  marginTop,
  marginLeft,
  marginRight,
  marginBottom,
  marginHorizontal,
  marginVertical,
  verticalCenter,
  verticalStart,
  verticalEnd,
  horizontalCenter,
  horizontalStart,
  horizontalEnd,
  textCenter,
  alignText,
  selfCenter,
  selfStart,
  selfEnd,
  size,
  sizeScaling = true,

  // font sizing
  xsmall,
  small,
  large,
  xlarge,
}) => {
  let fontSize = xsmall || small || large || xlarge || size || normalize(16);
  switch (fontSize) {
    case xsmall:
      fontSize = normalize(12);
      break;
    case small:
      fontSize = normalize(14);
      break;
    case large:
      fontSize = normalize(17);
      break;
    case xlarge:
      fontSize = normalize(19);
      break;
    case size:
      fontSize = size;
      break;
  }
  //   const userFontFamily = fontFamily();
  const getRxUserTheme = useReactiveVar(rxUserTheme);
  const colorTheme = getRxUserTheme === DARK ? Colors.WHITE : Colors.BLACK;
  const getRxUserFontSize = useReactiveVar(rxUserFontSize);
  return (
    <Text
      onPress={onPress}
      style={[
        style,
        {
          //   ...{fontFamily: userFontFamily.regular},
          ...(required ? {color: ALERT} : null),
          ...(color ? {color} : {color: colorTheme}),
          ...(primary ? {color: PRIMARY} : null),
          ...(secondary ? {color: SECONDARY} : null),
          ...(gray ? {color: GRAY_DARK} : null),
          ...(white ? {color: WHITE} : null),
          ...(underline ? {textDecorationLine: 'underline'} : null),
          ...(center ? {textAlign: 'center'} : null),
          ...(justify ? {textAlign: 'justify'} : null),
          ...(left ? {textAlign: 'left'} : null),
          ...(right ? {textAlign: 'right'} : null),
          ...(bg ? {backgroundColor: bg} : null),
          ...(padding ? {padding} : null),
          ...(paddingTop ? {paddingTop} : null),
          ...(paddingBottom ? {paddingBottom} : null),
          ...(paddingLeft ? {paddingLeft} : null),
          ...(paddingRight ? {paddingRight} : null),
          ...(paddingHorizontal ? {paddingHorizontal} : null),
          ...(paddingVertical ? {paddingVertical} : null),
          ...(margin ? {margin} : null),
          ...(marginTop ? {marginTop} : null),
          ...(marginBottom ? {marginBottom} : null),
          ...(marginLeft ? {marginLeft} : null),
          ...(marginRight ? {marginRight} : null),
          ...(marginHorizontal ? {marginHorizontal} : null),
          ...(marginVertical ? {marginVertical} : null),
          ...(verticalCenter ? {justifyContent: 'center'} : null),
          ...(verticalStart ? {justifyContent: 'flex-start'} : null),
          ...(verticalEnd ? {justifyContent: 'flex-end'} : null),
          ...(horizontalCenter ? {alignItems: 'center'} : null),
          ...(horizontalStart ? {alignItems: 'flex-start'} : null),
          ...(horizontalEnd ? {alignItems: 'flex-end'} : null),
          ...(textCenter ? {textAlign: 'center'} : null),
          ...(alignText ? {textAlign: alignText} : null),
          ...(selfCenter ? {alignSelf: 'center'} : null),
          ...(selfStart ? {alignSelf: 'flex-start'} : null),
          ...(selfEnd ? {alignSelf: 'flex-end'} : null),
          //   ...(italic ? {fontFamily: userFontFamily.italic} : null),
          //   ...(light ? {fontFamily: userFontFamily.light_italic} : null),
          //   ...(lightItalic ? {fontFamily: userFontFamily.light_italic} : null),
          //   ...(medium ? {fontFamily: userFontFamily.medium} : null),
          //   ...(mediumItalic ? {fontFamily: userFontFamily.medium_italic} : null),
          //   ...(bold ? {fontFamily: userFontFamily.bold} : null),
          //   ...(boldItalic ? {fontFamily: userFontFamily.bold_italic} : null),
          //   ...(bolder ? {fontFamily: userFontFamily.bolder} : null),
          //   ...(bolderItalic ? {fontFamily: userFontFamily.bolder_italic} : null),
          //   ...(black ? {fontFamily: userFontFamily.black} : null),
          //   ...(blackItalic ? {fontFamily: userFontFamily.black_italic} : null),
          //   ...(semiBold ? {fontFamily: userFontFamily.semi_bold} : null),
          //   ...(semiBoldItalic
          //     ? {fontFamily: userFontFamily.semi_bold_italic}
          //     : null),
          ...(sizeScaling
            ? {fontSize: fontSize * getRxUserFontSize}
            : {fontSize: fontSize}),
          ...(lineThrough
            ? {textDecorationLine: 'line-through', textDecorationStyle: 'solid'}
            : null),
        },
      ]}>
      {children}
    </Text>
  );
};

Label.propTypes = {
  // func
  onPress: PropTypes.func,
  // children
  children: PropTypes.any,
  // style
  style: PropTypes.any,
  // required
  required: PropTypes.any,
  // color
  color: PropTypes.any,
  // size
  size: PropTypes.any,
  // font style italic
  italic: PropTypes.any,
  // font style light
  light: PropTypes.any,
  // font style light italic
  lightItalic: PropTypes.any,
  // font style medium
  medium: PropTypes.any,
  // font style medium italic
  mediumItalic: PropTypes.any,
  // font style semi bold
  semiBold: PropTypes.any,
  // font style semi bold italic
  semiBoldItalic: PropTypes.any,
  // font style bold
  bold: PropTypes.any,
  // font style bold italic
  boldItalic: PropTypes.any,
  // font style bolder
  bolder: PropTypes.any,
  // font style bolder italic
  bolderItalic: PropTypes.any,
  // font style black
  black: PropTypes.any,
  // font style black italic
  blackItalic: PropTypes.any,
  // primary
  primary: PropTypes.any,
  // secondary
  secondary: PropTypes.any,
  // gray
  gray: PropTypes.any,
  // white
  white: PropTypes.any,
  // text align
  center: PropTypes.any,
  // text align
  justify: PropTypes.any,
  // text align
  left: PropTypes.any,
  // text align
  right: PropTypes.any,
  // background
  bg: PropTypes.any,
  // padding
  padding: PropTypes.any,
  // padding top
  paddingTop: PropTypes.any,
  // padding bottom
  paddingBottom: PropTypes.any,
  // padding left
  paddingLeft: PropTypes.any,
  // padding right
  paddingRight: PropTypes.any,
  // padding horizontal
  paddingHorizontal: PropTypes.any,
  // padding vertical
  paddingVertical: PropTypes.any,
  // margin
  margin: PropTypes.any,
  // margin top
  marginTop: PropTypes.any,
  // margin left
  marginLeft: PropTypes.any,
  // margin left
  marginRight: PropTypes.any,
  // margin bottom
  marginBottom: PropTypes.any,
  // margin horizontal
  marginHorizontal: PropTypes.any,
  // margin vertical
  marginVertical: PropTypes.any,
  // vertical center
  verticalCenter: PropTypes.any,
  // vertical start
  verticalStart: PropTypes.any,
  // vertical end
  verticalEnd: PropTypes.any,
  // horizontal center
  horizontalCenter: PropTypes.any,
  // horizontal start
  horizontalStart: PropTypes.any,
  // horizontal end
  horizontalEnd: PropTypes.any,
  // text center
  textCenter: PropTypes.any,
  // custom align text
  alignText: PropTypes.any,
  // self center
  selfCenter: PropTypes.any,
  // self start
  selfStart: PropTypes.any,
  // self end
  selfEnd: PropTypes.any,
};

export default Label;
