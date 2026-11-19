import React from 'react';
import {Text, View} from 'react-native';
import {Colors, Mixins} from '@app/styles';
import styles from '@app/components/Circle/styles';

const Circle = ({
  color = Colors.PRIMARY,
  textColor = Colors.PRIMARY,
  textSize = 8,
  size = 4,
  bottomPosition,
  topPosition,
  rightPosition,
  leftPosition,
  number,
}) => {
  const circleGeneralStyle = {
    backgroundColor: color,
    borderRadius: size * 2,
    width: size,
    height: size,
  };

  const bottomPositionStyle = {
    bottom: bottomPosition,
  };

  const topPositionStyle = {
    top: topPosition,
    right: rightPosition,
  };

  const circleTextStyle = {
    color: textColor,
    ...Mixins.margin(2, 0, 0, number < 10 ? 0 : 1),
    fontSize: textSize,
    fontWeight: 'bold',
  };

  const renderCircle = () => {
    if (bottomPosition) {
      return (
        <View
          style={[
            styles.circlePosition,
            circleGeneralStyle,
            bottomPositionStyle,
          ]}>
          {number && <Text>{number}</Text>}
        </View>
      );
    } else {
      return (
        <View
          style={[styles.circlePosition, circleGeneralStyle, topPositionStyle]}>
          {number > -1 && (
            <Text style={[styles.circleText, circleTextStyle]}>{number}</Text>
          )}
        </View>
      );
    }
  };

  return <>{renderCircle()}</>;
};

export default Circle;
