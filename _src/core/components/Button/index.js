import RenderIf from '@app/components/RenderIf';
import Text from '@app/components/Text';
import CustomView from '@app/components/CustomView';
import {Colors} from '@app/styles';
import React from 'react';
import {StyleSheet} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {rxUserFontSize, rxUserTheme} from '@app/services/cache';
import {useReactiveVar} from '@apollo/client';
import {DARK} from '@app/helpers/Constants';
const Button = ({
  label,
  onPress,
  disabled = false,
  styleProp = {},
  textStyleProp = {},
  loading = false,
  width: widthProp,
}) => {
  const scheme = useReactiveVar(rxUserTheme);

  const userFontSize = useReactiveVar(rxUserFontSize);

  let width = 100;
  if (widthProp) {
    width = widthProp;
  }

  return (
    <CustomView
      onPress={onPress}
      borderColor={scheme === DARK ? Colors.WHITE : Colors.BLACK}
      borderRadius={15}
      width={width * userFontSize}
      horizontalCenter
      verticalCenter
      style={[{borderColor: scheme === 'dark' ? '#fff' : '#000'}, styleProp]}
      disabled={disabled}>
      <RenderIf condition={loading}>
        <ActivityIndicator
          style={{
            padding: 5,
          }}
        />
      </RenderIf>
      <RenderIf condition={!loading}>
        <Text center style={[styles.textStyle, textStyleProp]}>
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
