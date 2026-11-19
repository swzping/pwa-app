import React from 'react';
import {TouchableRipple} from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';

const ButtonSliderNavigator = ({
  isRight = false,
  onPress,
  navigatorButtonHeight = 0,
}) => {
  const iconName = isRight ? 'chevron-right' : 'chevron-left';
  let style = {
    elevation: 2,
    backgroundColor: 'white',
    marginLeft: isRight ? 0 : 10,
    marginRight: isRight ? 10 : 0,
    padding: 14,
    borderRadius: 50,
    position: 'absolute',
    top: navigatorButtonHeight,
  };
  if (isRight) {
    style = {...style, right: 0};
  }

  return (
    <TouchableRipple onPress={onPress} style={style}>
      <Icon
        name={iconName}
        size={12}
        color={'#ef7d00'}
        style={{opacity: 0.8}}
      />
    </TouchableRipple>
  );
};
export default ButtonSliderNavigator;
