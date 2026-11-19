import React, {useRef, useEffect} from 'react';
import {Animated, Text, View} from 'react-native';
import {Colors, Mixins} from '@app/styles';
import styles from '@app/components/Circle/styles';

const Circle = React.memo(props => {
  const {
    color = Colors.PRIMARY,
    textColor = Colors.PRIMARY,
    textSize = 8,
    size = 4,
    bottomPosition,
    topPosition,
    rightPosition,
    // leftPosition,
    number,
  } = props;
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
  const mount = useRef(false);
  const prevNumberRef = useRef(number);
  useEffect(() => {
    setTimeout(() => {
      mount.current = true;
    }, 10000);
  }, []);

  useEffect(() => {
    // console.log("number change", number, mount.current, 'prevnumb', prevNumberRef.current)
    if (number > 0 && mount.current && number > prevNumberRef.current) {
      startShake();
    }
    setTimeout(() => {
      prevNumberRef.current = number;
    }, 0);
  }, [number, startShake]);

  const shakeAnimation = new Animated.Value(0);
  const startShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 4,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -6,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderCircle = () => {
    if (!number) {
      return null;
    }
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
        <Animated.View
          style={[
            styles.circlePosition,
            circleGeneralStyle,
            topPositionStyle,
            {
              transform: [{translateX: shakeAnimation}],
            },
          ]}>
          {number > -1 && (
            <Text style={[styles.circleText, circleTextStyle]}>{number}</Text>
          )}
        </Animated.View>
      );
    }
  };

  return <>{renderCircle()}</>;
});

export default Circle;
