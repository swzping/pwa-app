import CustomView from '@app/components/CustomView';
import React from 'react';
import {Colors} from '@app/styles';
import {useReactiveVar} from '@apollo/client';
import {rxUserTheme} from '@app/services/cache';

const RadioButton = ({
  style,
  onPress,
  selected,
  size = 16,
  color: colorProp,
  activeColor = null,
}) => {
  const scheme = useReactiveVar(rxUserTheme);

  let color;
  if (colorProp) {
    color = colorProp;
  } else {
    color = scheme === 'dark' ? Colors.WHITE : Colors.BLACK;
  }

  const containerStyle = {
    height: size,
    width: size,
    borderRadius: size / 2,
    borderColor: activeColor ? activeColor : color,
    backgroundColor: selected && activeColor ? activeColor : 'white',
  };

  const radioStyle = {
    height: 8,
    width: 8,
    borderRadius: 6,
    // backgroundColor: activeColor ? activeColor : color,
    backgroundColor: 'white',
  };

  return (
    <CustomView
      horizontalCenter
      verticalCenter
      onPress={onPress}
      border={1}
      borderColor={selected && activeColor ? activeColor : Colors.BLACK}
      style={[containerStyle, style]}>
      {selected ? <CustomView style={radioStyle} /> : null}
    </CustomView>
  );
};

export default RadioButton;
