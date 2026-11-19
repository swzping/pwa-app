import React, {useEffect} from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withDelay,
  cancelAnimation,
} from 'react-native-reanimated';

const FadeInView = ({children, delay = 0, style, ...props}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    const opacityAnimation = withDelay(
      delay,
      withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      }),
    );

    const translateYAnimation = withDelay(
      delay,
      withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      }),
    );

    opacity.value = opacityAnimation;
    translateY.value = translateYAnimation;

    return () => {
      cancelAnimation(opacity);
      cancelAnimation(translateY);
      opacity.value = 0;
      translateY.value = 10;
    };
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}],
  }));

  return (
    <Animated.View
      style={[style, animatedStyle]}
      needsOffscreenAlphaCompositing={true}
      renderToHardwareTextureAndroid={true}
      shouldRasterizeIOS={true}
      {...props}>
      {children}
    </Animated.View>
  );
};

export default React.memo(FadeInView);
