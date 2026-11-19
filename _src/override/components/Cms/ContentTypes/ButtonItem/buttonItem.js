import React, {useCallback, useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import PrimaryButton from 'src/components/button/PrimaryButton';
import SecondaryButton from 'src/components/button/SecondaryButton';
import TextButton from 'src/components/button/TextButton';
import {resolveLinkAndNavigate} from '@app/helpers/Navigation';

const ButtonItem = ({
  buttonType = 'primary',
  link,
  text = '',
  textAlign = 'center',
  borderColor,
  borderWidth,
  borderRadius = 8,
  marginTop,
  marginRight,
  marginBottom,
  marginLeft,
  paddingTop,
  paddingRight = 16,
  paddingBottom,
  paddingLeft = 16,
}) => {
  const handlePress = useCallback(() => {
    if (link) {
      resolveLinkAndNavigate(link);
    }
  }, [link]);

  const buttonStyles = [
    styles.baseButton,
    {
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      borderColor,
      borderWidth,
      borderRadius,
    },
  ];

  const textStyles = [
    styles.baseText,
    {textAlign},
    buttonType === 'link' && styles.linkText,
  ];

  const buttonProps = {
    text,
    style: buttonStyles,
    textStyle: textStyles,
    onPress: handlePress,
  };

  const ButtonComponent = useMemo(() => {
    switch (buttonType) {
      case 'primary':
        return <PrimaryButton {...buttonProps} />;
      case 'secondary':
        return <SecondaryButton {...buttonProps} />;
      case 'link':
        return <TextButton {...buttonProps} />;
      default:
        return null;
    }
  }, [buttonType, buttonStyles, textStyles, handlePress]);

  return <View style={styles.container}>{ButtonComponent}</View>;
};

const styles = StyleSheet.create({
  container: {},
  baseButton: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  baseText: {
    fontSize: 14,
    fontWeight: '700',
  },
  linkText: {
    color: '#0066CC',
    textDecorationLine: 'underline',
  },
});

export default ButtonItem;
