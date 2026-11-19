import React, {useEffect,useState} from 'react';
import {StyleSheet} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

import {useReactiveVar} from '@apollo/client';

import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf';
import {DARK} from '@app/helpers/Constants';
import {rxUserTheme} from '@app/services/cache';
import {Colors, Mixins} from '@app/styles';

const RadioButton = ({
  style,
  onPress,
  selected,
  radius = 12,
  size = 24,
  checkedSize = 22,
  uncheckedColor: uncheckedColorProp,
  checkedColor: checkedColorProp,
}) => {
  /**
   * ----------------------------------------- *
   * @constant
   * @summary list of constant local state
   * ----------------------------------------- *
   */
  const scheme = useReactiveVar(rxUserTheme);
  const [checked, setChecked] = useState(selected);

  useEffect(() => {
    setChecked(selected);
  }, [selected]);

  let uncheckedColor;
  if (uncheckedColorProp) {
    uncheckedColor = uncheckedColorProp;
  } else {
    uncheckedColor = scheme === DARK ? Colors.WHITE : Colors.BLACK;
  }

  let checkedColor;
  if (checkedColorProp) {
    checkedColor = checkedColorProp;
  } else {
    checkedColor = scheme === DARK ? Colors.WHITE : Colors.BLACK;
  }

  const sizeStyle = {
    height: size,
    width: size,
    borderRadius: radius,
  };

  const backgroundColor = {
    backgroundColor: checkedColor,
  };

  const borderColor = {
    borderColor: uncheckedColor,
  };

  const onPressCheck = () => {
    if (!onPress) {
      return;
    }
    setChecked(!checked);
    onPress(!checked);
  };

  const renderChecbox = () => {
    return (
      <CustomView style={[backgroundColor, sizeStyle, styles.centerOfContent]}>
        <Icon
          name={'checkmark-sharp'}
          size={checkedSize}
          color={scheme === DARK ? Colors.BLACK : Colors.WHITE}
        />
      </CustomView>
    );
  };

  return (
    <CustomView
      onPress={onPress ? onPressCheck : undefined}
      style={[
        borderColor,
        sizeStyle,
        styles.container,
        styles.centerOfContent,
        style,
      ]}>
      <RenderIf condition={checked}>{renderChecbox()}</RenderIf>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  centerOfContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    borderWidth: 0.5,
    ...Mixins.margin(5, 0, 5, 0),
  },
});

export default RadioButton;
