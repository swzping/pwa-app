import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {Colors} from '@app/styles';
import {DARK} from '@app/helpers/Constants';
import {useReactiveVar} from '@apollo/client';

import React, {useCallback, useState, forwardRef} from 'react';
import {Platform, StyleSheet, TextInput} from 'react-native';
import {rxUserTheme} from '@app/services/cache';
import RNInfo from 'react-native-device-info';

const Input = forwardRef(
  (
    {
      placeholder,
      defaultValue,
      value,
      styleProp = {},
      textStyleProp = {},
      onChange = null,
      isPassword = false,
      isNewPassword = false,
      editable = true,
      keyboardType,
      name,
      label = '',
      error = '',
      placeholderTextColor,
      onFocus,
      autoFocus,
      autoCapitalize,
      multiline = false,
      numberOfLines = 1,
      caretHidden,
    },
    ref,
  ) => {
    const {Version} = Platform;

    const scheme = useReactiveVar(rxUserTheme);

    const strongPasswordRegex = new RegExp(
      '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%&/=?_.,:;\\-])(?=.{8,})',
    );
    const mediumPasswordRegex = new RegExp(
      '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])',
    );

    const brandsNeedingWorkaround = ['redmi', 'xiaomi', 'poco', 'pocophone'];
    const needsXiaomiWorkaround =
      brandsNeedingWorkaround.includes(RNInfo.getBrand().toLowerCase()) &&
      Version > 28;

    const [hackCaretHidden, setHackCaretHidden] = useState(
      needsXiaomiWorkaround ? true : false,
    );
    const [passwordStrength, setPasswordStrength] = useState({
      text: 'No Password',
      color: Colors.GRAY_DARK,
    });

    const handleFocus = useCallback(() => {
      if (needsXiaomiWorkaround) {
        setHackCaretHidden(true);
      }
      if (onFocus) {
        onFocus();
      }
    }, [onFocus, caretHidden]);

    const onChangeText = e => {
      onChange(e);
      if (isNewPassword) {
        if (strongPasswordRegex.test(e)) {
          setPasswordStrength({
            text: 'Strong',
            color: Colors.SUCCESS,
          });
        } else if (mediumPasswordRegex.test(e)) {
          setPasswordStrength({
            text: 'Medium',
            color: Colors.WARNING,
          });
        } else if (e) {
          setPasswordStrength({
            text: 'Weak',
            color: Colors.ALERT,
          });
        } else {
          setPasswordStrength({
            text: 'No Password',
            color: Colors.GRAY_DARK,
          });
        }
      }
    };

    const passwordStrengthSection = () => {
      if (isNewPassword) {
        return (
          <CustomView
            row
            paddingHorizontal={10}
            paddingVertical={8}
            backgroundColor={Colors.GRAY_SMOOTH2}>
            <Text small color={Colors.GRAY_DARK} style={{marginRight: 5}}>
              Password Strength:
            </Text>
            <Text small color={passwordStrength.color}>
              {passwordStrength.text}
            </Text>
          </CustomView>
        );
      }
    };

    const errorSection = () => {
      if (error && error.message) {
        return (
          <Text small primary>
            {error.message}
          </Text>
        );
      }
    };

    return (
      <CustomView style={[styles.mainContainer, styleProp]}>
        <Text bold uppercase>
          {label.toUpperCase()}
        </Text>
        <TextInput
          ref={ref}
          defaultValue={defaultValue}
          value={value}
          style={[
            {color: scheme === DARK ? Colors.WHITE : Colors.BLACK},
            styles.inputStyle,
            textStyleProp,
          ]}
          placeholder={placeholder}
          onChangeText={onChangeText}
          secureTextEntry={isPassword}
          editable={editable}
          keyboardType={keyboardType}
          placeholderTextColor={
            placeholderTextColor
              ? placeholderTextColor
              : scheme === DARK
              ? Colors.GRAY_DARK
              : Colors.GRAY_MEDIUM
          }
          onFocus={handleFocus}
          autoFocus={autoFocus}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          caretHidden={hackCaretHidden}
        />
        <CustomView
          style={{
            borderBottomWidth: 1,
            borderColor: scheme === DARK ? Colors.WHITE : Colors.BLACK,
          }}
        />
        {passwordStrengthSection()}
        {errorSection()}
      </CustomView>
    );
  },
);

const styles = StyleSheet.create({
  inputStyle: {
    paddingHorizontal: 0,
    paddingVertical: 5,
  },
  mainContainer: {
    marginBottom: 20,
  },
});

export default Input;
