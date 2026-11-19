import React, {forwardRef, useCallback,useState} from 'react';
import {View} from 'react-native';

import {HelperText,TextInput} from 'react-native-paper';
import {Chip,useTheme} from 'react-native-paper';

import _ from 'lodash';
import {useTranslation} from 'react-i18next';
import PropTypes from 'prop-types';

import AtomModalAddressInput from '@app/components/_AppModal/atoms/ModalAddressInput/index';
import CustomView from '@app/components/CustomView/index';
import styles from '@app/components/InputField/style';
import Show from '@app/components/Show';
import Text from '@app/components/Text';
import {FORM_FIELD, IS_IOS} from '@app/helpers/Constants';
import {rxAppSnackbar} from '@app/services/cache';
import {Colors, InputUI} from '@app/styles';

/**
 * @component InputField
 * @param {Object} ref - to be forwarded to the component
 * @param {Object} InputFieldComponent.propTypes - defined using PropTypes
 * @summary Input field component based on react-native-paper
 * @returns Component
 */
//
const InputFieldComponent = forwardRef(
  (
    {
      isLast,
      label,
      defaultValue,
      affixLabel,
      autoCapitalized = 'none',
      isPassword = false,
      textContentType = 'none',
      keyboardType = 'default',
      multiline = false,
      editable = true,
      onChange,
      onBlur,
      value,
      error,
      success,
      loading,
      isSubmitting,
      data,
      onPress,
      name,
      inputRightCustom,
      disabled = false,
      formInputInfo = null,
      type,
      multiselect = false,
      placeholder,
      textStyleProp,
      labelStyleProp = {},
      outlineStyle,
      onSaveMultiselect = () => {},
      onRemoveMultiselect = () => {},
      maxLength,
    },
    innerRef,
  ) => {
    const theme = useTheme();
    const primary = _.get(theme, 'colors.primary');
    const placeholderColor = _.get(theme, 'colors.placeholder');
    const [passVisibility, setPassVisibility] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const {t} = useTranslation();
    const containerStyle = isLast ? styles.bottomContainer : styles.container;
    const errorMessage = _.get(error, 'message');
    const isDropDown = type === FORM_FIELD.INPUT_DROPDOWN;
    const isDropdownDisabled = IS_IOS ? false : isDropDown;

    // 判断输入状态
    const hasValue = !!(value && value.length > 0);
    const hasError = !!errorMessage;
    const isDisabled = isSubmitting || loading || isDropdownDisabled || disabled;

    // 获取外层容器样式（相对定位）
    const inputContainerStyle = InputUI.getInputContainerStyle();

    // 获取光晕背景层样式（绝对定位，不影响输入框尺寸）
    const glowBackgroundStyle = InputUI.getGlowBackgroundStyle(isFocused, hasError);

    // 获取 Paper TextInput 样式
    const paperInputVisual = InputUI.getPaperOutlinedInputVisual({
      isFocused,
      hasValue,
      disabled: isDisabled,
      hasError,
      extraOutlineStyle: outlineStyle,
    });

    const onOpenModal = useCallback(() => {
      if (data) {
        setShowModal(true);
      }
    }, []);

    const onCloseModal = () => setShowModal(false);

    const onShowDisableInfo = () => {
      rxAppSnackbar({
        message: label
          ? `${t('message.cannotEdit')} ${label}!`
          : t('message.cannotEditField'),
      });
    };

    let onInputRight = null;
    if (inputRightCustom) {
      onInputRight = inputRightCustom;
    }
    if (isPassword) {
      onInputRight = (
        <TextInput.Icon
          icon={passVisibility ? 'eye-off' : 'eye'}
          onPress={() => setPassVisibility(!passVisibility)}
          color={primary}
        />
      );
    }

    return (
      <CustomView style={containerStyle}>
        <Show when={multiselect}>
          {data?.map((item, index) => {
            if (item.selected) {
              return (
                <CustomView marginBottom={10} key={`${item.name}-${index}`}>
                  <Chip
                    closeIcon="close"
                    onClose={() => onRemoveMultiselect(item)}>
                    {item.name}
                  </Chip>
                </CustomView>
              );
            }
          })}
        </Show>
        {/* Label above input field */}
        {label && (
          <CustomView marginBottom={8}>
            {label.includes('*') ? (
              <Text style={{fontSize: 14, fontWeight: '600', color: '#000000', ...labelStyleProp}}>
                {label.split('*')[0]}
                <Text style={{color: '#FF0000'}}>*</Text>
              </Text>
            ) : (
            <Text style={{fontSize: 14, fontWeight: '600', color: '#000000', ...labelStyleProp}}>
              {label}
            </Text>
            )}
          </CustomView>
        )}
        <CustomView
          onPress={
            data && !disabled
              ? onOpenModal
              : data
              ? onShowDisableInfo
              : () => {}
          }>
          {/* 外层：相对定位容器（不影响输入框尺寸） */}
          <View style={inputContainerStyle}>
            {/* 光晕背景层：绝对定位在输入框后面 */}
            <View style={glowBackgroundStyle} />
            {/* 输入框本身 */}
          <TextInput
            ref={innerRef}
            mode={'outlined'}
            label={''}
            editable={editable}
              disabled={isDisabled}
            secureTextEntry={isPassword && !passVisibility}
            error={errorMessage}
            onChangeText={onChange}
              onBlur={(e) => {
                setIsFocused(false);
                if (!data && onBlur) {onBlur(e);}
              }}
              onFocus={(e) => {
                setIsFocused(true);
                if (data && !disabled) {onOpenModal();}
              }}
            autoCapitalize={autoCapitalized}
            defaultValue={defaultValue}
            value={value}
            multiline={multiline}
            returnKeyType={isLast ? 'done' : 'next'}
            textContentType={textContentType}
            keyboardType={keyboardType}
            left={affixLabel && <TextInput.Affix text={affixLabel} />}
            right={onInputRight}
            placeholder={placeholder}
            maxLength={maxLength}
              placeholderTextColor={InputUI.placeholderColor}
              style={[
                textStyleProp,
                paperInputVisual.style,
              ]}
              contentStyle={paperInputVisual.contentStyle}
              outlineStyle={paperInputVisual.outlineStyle}
              outlineColor={paperInputVisual.outlineColor}
              activeOutlineColor={paperInputVisual.activeOutlineColor}
            theme={
              data
                ? {
                    colors: {
                      text: primary,
                      disabled: placeholderColor,
                    },
                  }
                : {colors: {error: Colors.ALERT_SECONDARY}}
            }
          />
          </View>
          <Show when={errorMessage}>
            <HelperText
              type="error"
              visible={errorMessage}
              theme={{colors: {error: Colors.ALERT_SECONDARY}}}>
              {errorMessage}
            </HelperText>
          </Show>
          <Show when={success && !errorMessage}>
            <HelperText
              type="info"
              visible={success}
              style={{color: Colors.SUCCESS}}>
              {success}
            </HelperText>
          </Show>
          <Show when={formInputInfo}>
            <HelperText visible={formInputInfo}>{formInputInfo}</HelperText>
          </Show>
          <AtomModalAddressInput
            show={showModal}
            title={label}
            dataList={data ? data : []}
            onClose={onCloseModal}
            onChange={onChange}
            onPress={onPress}
            fieldName={name}
            multiselect={multiselect}
            onSaveMultiselect={onSaveMultiselect}
          />
        </CustomView>
      </CustomView>
    );
  },
);

InputFieldComponent.propTypes = {
  // use to determined marginBottom
  isLast: PropTypes.bool,
  // use as the input label
  label: PropTypes.string.isRequired,
  // use as defaultValue
  defaultValue: PropTypes.string,
  // use to determined whether to show affix component or not
  affixLabel: PropTypes.string,
  //use as capitalized format for the input
  autoCapitalized: PropTypes.string,
  // use to determined whether to enable secureTextEntry and Visibility Password Component
  isPassword: PropTypes.bool,
  // use tas text content type of the Input
  textContentType: PropTypes.any,
  // use as keyboard type of the Input
  keyboardType: PropTypes.string,
  // use whether multiline enable or not
  multiline: PropTypes.bool,
  // use as callback function for onChange event
  onChange: PropTypes.func.isRequired,
  // use as callback function fot onBlur event
  onBlur: PropTypes.func,
  // use as value of the input
  value: PropTypes.string.isRequired,
  //use to show error message
  error: PropTypes.object,
  //use to show success message (green text below input)
  success: PropTypes.string,
  //use for disabling input on submit
  isSubmitting: PropTypes.bool,
  //state for editable props
  editable: PropTypes.bool,
  // data list for dropdown input
  data: PropTypes.array,
  //onPress callback on selected item for dropdown input
  onPress: PropTypes.func,
  //name from the controller
  name: PropTypes.string,
  // loading state to use in submit
  loading: PropTypes.bool,
  // for flaging type
  type: PropTypes.string,
};

export default InputFieldComponent;
