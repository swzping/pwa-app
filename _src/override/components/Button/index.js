import React from 'react';
import {StyleSheet} from 'react-native';

import {ActivityIndicator} from 'react-native-paper';

import {useReactiveVar} from '@apollo/client';

import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf';
import Text from '@app/components/Text';
import {DARK} from '@app/helpers/Constants';
import {rxUserFontSize, rxUserTheme} from '@app/services/cache';
import {Colors} from '@app/styles';
const Button = ({
  label,
  onPress,
  borderRadius = 15,
  disabled = false,
  styleProp = {},
  textStyleProp = {},
  textProps = {},
  loading = false,
  loadingColor,
  loadingStyle,
  isUseUserFontSize = true,
  width: widthProp,
}) => {
  const scheme = useReactiveVar(rxUserTheme);

  const userFontSize = useReactiveVar(rxUserFontSize);
  let width = 100;
  if (widthProp) {
    width = widthProp;
  }

  const buttonWidth = isUseUserFontSize ? width * userFontSize : width;

  return (
    <CustomView
      onPress={onPress}
      borderRadius={borderRadius}
      width={buttonWidth}
      horizontalCenter
      verticalCenter
      style={[
        {borderColor: scheme === DARK ? Colors.WHITE : Colors.BLACK},
        styleProp,
      ]}
      disabled={disabled}>
      <RenderIf condition={loading}>
        <ActivityIndicator
          color={loadingColor}
          style={[{padding: 5}, loadingStyle]}
        />
      </RenderIf>
      <RenderIf condition={!loading}>
        <Text {...textProps} center style={[styles.textStyle, textStyleProp]}>
          {label}
        </Text>
      </RenderIf>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  textStyle: {
    padding: 10,
  },
});

export default Button;
