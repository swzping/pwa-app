import React from 'react';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {TYPE_FAILED, TYPE_SUCCESS} from '@app/helpers/Constants';

const Alert = ({type = TYPE_SUCCESS, message = null, style, labelStyle}) => {
  // 统一样式：无论成功/失败都黑底白字
  let alertColor = '#424242';
  let messageColor = '#FFFFFF';
  let iconName = 'check-circle';
  let iconColor = '#FFFFFF';

  switch (type) {
    case TYPE_FAILED:
      // 失败：只在 icon 上区分（仍然黑底白字）
      iconName = 'information';
      break;
    case TYPE_SUCCESS:
      // 成功：icon 和 message 均用黑字
      iconColor = '#30D158';
      break;
    default:
      break;
  }

  return (
    <CustomView
      verticalCenter
      horizontalCenter
      padding={10}
      backgroundColor={alertColor}
      style={[
        {
          flexDirection: 'row', // 用于图标和文字对齐
          borderRadius: 8, // 圆角
          paddingVertical: 14,
          paddingHorizontal: 30,
          alignItems: 'center',
          width: '100%',
        },
        style,
      ]}>
      <Icon
        name={iconName}
        size={20}
        color={iconColor}
        style={{marginRight: 10}}
      />
      <Text
        bold
        color={messageColor}
        style={[{fontWeight: 'bold', flex: 1}, labelStyle]}>
        {message}
      </Text>
    </CustomView>
  );
};

export default Alert;
