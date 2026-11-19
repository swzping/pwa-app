/* eslint-disable no-shadow */
import React, {createRef} from 'react';

import {Button, Caption} from 'react-native-paper';

import {useNavigation} from '@react-navigation/native';

import {modules} from '@root/swift.config';

import {useTranslation} from 'react-i18next';
import i18next from 'i18next';
import PropTypes from 'prop-types';
import {useForm} from 'react-hook-form';
import {Controller} from 'react-hook-form';

import styles from '@app/components/_Forms/styles';
import CheckBox from '@app/components/CheckBox/index';
import CustomView from '@app/components/CustomView';
import DatePicker from '@app/components/DatePicker';
import InputField from '@app/components/InputField/index';
import RenderIf from '@app/components/RenderIf';
import Text from '@app/components/Text/index';
import {FORM_FIELD} from '@app/helpers/Constants';
import {navigateTo} from '@app/helpers/Navigation';
import {CmsStyles,Colors} from '@app/styles';

/**
 * @component LabeledCheckbox - override CheckBox to add label after it
 * @param {Boolean} value - state of the checkbox
 * @param {Function} onChange - function for the onClick Checkbox
 * @param {Object} error - use to render error border on Checkbox
 * @param {String} label - use for label Checkbox
 * @param {Boolean} isLast - use to determine marginBottom of the Checkbox
 * @summary Only use in the Forms
 * @returns Component
 */
const LabeledCheckbox = ({value, onChange, error, label, isLast, isTerms}) => {
  const {t} = useTranslation();
  const renderCaption = () => {
    if (!isTerms) {
      return <Caption style={styles.label}>{label}</Caption>;
    }
    return (
      <Caption style={[styles.label, styles.termsLabel]}>
        {i18next.t('auth_signup.label.terms.firstPhrase')}
        <Caption
          style={{
            color: Colors.PRIMARY,
            textDecorationLine: 'underline',
            fontWeight: 'bold',
          }}
          onPress={() =>
            navigateTo(modules.cms_page.enable, modules.cms_page.name, {
              identifier: 'privacy-policy',
              title: t('cms_page.tnc_title'),
              tagsStyles: CmsStyles.tagStylesPrivacyPolicy,
              classesStyles: CmsStyles.classesStylesPrivacyPolicy,
            })
          }>
          {i18next.t('auth_signup.label.terms.pp')}
        </Caption>
        {' ' + i18next.t('auth_signup.label.terms.and') + ' '}
        <Caption
          style={{
            color: Colors.PRIMARY,
            textDecorationLine: 'underline',
            fontWeight: 'bold',
          }}
          onPress={() =>
            navigateTo(modules.cms_page.enable, modules.cms_page.name, {
              identifier: 'terms-conditions',
              title: t('cms_page.tnc_title'),
              tagsStyles: CmsStyles.tagStylesPrivacyPolicy,
              classesStyles: CmsStyles.classesStylesPrivacyPolicy,
            })
          }>
          {i18next.t('auth_signup.label.terms.tc')}
        </Caption>
      </Caption>
    );
  };

  const renderError = () => {
    if (error && error.message) {
      return (
        <Text small2 color={Colors.ALERT_SECONDARY} style={{marginTop: 4}}>
          {error.message}
        </Text>
      );
    }
  };

  return (
    <CustomView>
      <CustomView
        style={[isLast ? styles.containerCheckBottom : styles.containerCheck]}>
        <CheckBox
          checkedColor={Colors.PRIMARY}
          uncheckedColor={error?.message && Colors.ALERT_SECONDARY}
          onPress={() => onChange(!value)}
          size={20}
          selected={value}
        />
        {renderCaption()}
      </CustomView>
      {renderError()}
    </CustomView>
  );
};

/**
 * @component FormComponent
 * @param {Object} FormComponent.propTypes - defined using PropTypes
 * @summary Use to render formschema into component
 * @returns Components
 */
export const _onFormHandleSubmitRef = createRef();
export const _onFormHandleResetRef = createRef();
export const _onFormHandleValuesRef = createRef();
export const _onFormHandleSetErrorRef = createRef();
export const useFormConfig = {
  mode: 'onChange',
  criteriaMode: 'firstError',
  shouldFocusError: true,
  shouldUnregister: false,
};

const FormComponent = ({
  resetAfterSubmit = false,
  buttonLabelColor = Colors.PRIMARY,
  buttonLabelCancelColor = Colors.PRIMARY,
  fields,
  onSubmit,
  onError = () => {},
  loading,
  buttonTitle,
  buttonStyle,
  buttonLabelStyle,
  buttonCancelStyle,
  formContainerStyle,
  cancelButton,
  cancelButtonColumn,
  centerButton,
  buttonChangePassword,
  onPressChangePassword,
  useFormExternal,
  FooterComponent,
  extraButtonTitle,
  extraLabelStyle,
  onExtraButtonPress,
}) => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const {control, watch, handleSubmit, getValues, reset, setError} =
    useFormExternal ? useFormExternal : useForm(useFormConfig);

  _onFormHandleSubmitRef.current = handleSubmit;
  _onFormHandleResetRef.current = reset;
  _onFormHandleValuesRef.current = getValues;
  _onFormHandleSetErrorRef.current = setError;

  // 使用 JSON 序列化来检测 fields 的实际变化，而不是引用变化
  const fieldsRef = React.useRef(null);
  React.useEffect(() => {
    if (!fields || fields.length === 0) {
      console.log('[Forms] No fields yet');
      return;
    }

    // 将 fields 转换为可比较的格式（只包含 name 和 defaultValue）
    const currentFieldsData = JSON.stringify(
      fields.map(f => ({name: f.name, defaultValue: f.defaultValue})),
    );

    // 如果 fields 数据没有变化，不需要重新初始化
    if (fieldsRef.current === currentFieldsData) {
      console.log('[Forms] Fields data unchanged, skipping reset');
      return;
    }

    console.log('[Forms] Fields changed, initializing form');

    // 构建默认值对象
    const defaultValues = {};
    fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        defaultValues[field.name] = field.defaultValue;
      }
    });
    reset(defaultValues);

    // 保存当前的 fields 数据
    fieldsRef.current = currentFieldsData;
  }, [fields, reset]);
  const password = watch('password');
  const validate = {
    validate: value => value === password || 'Password doesnt match',
  };

  const submitEvent = data => {
    onSubmit(data);
    resetAfterSubmit ? reset() : null;
  };

  const errorEvent = errors => {
    onError(errors);
  };

  // eslint-disable-next-line react/no-unstable-nested-components
  const RenderFormInput = ({item, index}) => {
    const itemType = item?.type;
    const isVisible = item?.isVisible ?? true;
    const rules =
      item.name === 'passwordConfirmation'
        ? {...item.rules, ...validate}
        : item.rules;

    if (!isVisible) {
      return;
    }
    if (itemType === FORM_FIELD.CUSTOM) {
      return (
        <Controller
          key={item.name}
          name={item.name}
          control={control}
          defaultValue={item.defaultValue}
          rules={item.rules}
          render={({
            field: {onChange, value, onBlur},
            fieldState: {error},
            formState: {isSubmitting},
          }) => {
            if (React.isValidElement(item.renderItem)) {
              // 如果 value 为空且 defaultValue 存在，使用 defaultValue
              // 这样可以确保在表单初始化时正确设置值
              const fieldValue =
                value !== undefined && value !== null
                  ? value
                  : item.defaultValue;
              return React.cloneElement(item.renderItem, {
                value: fieldValue,
                onChange,
                onBlur, // 传递 onBlur 给自定义字段
                error: error?.message ? {message: error.message} : error,
                success: item.success,
                label: item.label,
                isSubmitting: false, // 确保自定义字段不会被禁用
                loading: false, // 确保自定义字段不会被禁用
                disabled: item.disabled || false, // 传递 disabled 属性
                ...item.extraProps, // 传递额外的 props
              });
            }
            return item.renderItem;
          }}
        />
      );
    }

    return (
      <Controller
        key={item.name}
        name={item.name}
        control={control}
        defaultValue={item.defaultValue}
        rules={rules}
        render={renderProps => {
          const onChange = renderProps.field.onChange;
          const onBlur = renderProps.field.onBlur;
          const value = renderProps.field.value;
          const ref = renderProps.field.ref;
          const error = renderProps.fieldState.error;
          const isSubmitting = renderProps.formState.isSubmitting;

          const itemType = item.type;
          const defaultProps = {
            key: `form-fields-${item.name}-${index}`,
            isLast: fields.length === index + 1,
            name: item?.name ?? '',
            label: item?.label ?? '',
            mode: item?.inputMode ?? 'outlined',
            themeCustom: item?.themeInputCustom,
            inputRightCustom: item?.inputRightCustom,
            onChange,
            value: value ?? '',
            error,
            success: item.success,
          };

          const defaultPropsSecond = {
            ...defaultProps,
            ref,
            affixLabel: item.affixLabel,
            autoCapitalize: item.autoCapitalize,
            defaultValue: item.defaultValue,
            isPassword: item.isPassword,
            keyboardType: item.keyboardType,
            maxLength: item.maxLength,
            rules: item.rules,
            styleProp: item.styleProp,
            type: item.type,
            inputRightCustom: item?.inputRightCustom,
            isDisabled: item?.isDisabled,
            isSubmitting,
            control,
            onBlur,
            // textContentType: item.textContentType,
          };

          switch (itemType) {
            case FORM_FIELD.CUSTOM_INPUT:
              return item.renderItem({
                handleReset: reset,
                handleSubmit,
                ...renderProps,
              });
            case FORM_FIELD.CHECKBOX:
              return (
                <>
                  <LabeledCheckbox {...defaultProps} isTerms={item.isTerms} />
                  <RenderIf condition={item?.formInputInfo}>
                    <Text small {...item?.formInputInfoTextProps}>
                      {item?.formInputInfo}
                    </Text>
                  </RenderIf>
                </>
              );
            case FORM_FIELD.INPUT:
              return (
                <>
                  <RenderIf condition={!item.hide}>
                    <InputField
                      {...defaultProps}
                      {...defaultPropsSecond}
                      isNewPassword={item.isNewPassword}
                      loading={loading}
                      multiline={item.multiline}
                      numberOfLines={item.numberOfLines}
                      placeholder={item.placeholder}
                      textStyleProp={item.textStyleProp}
                      labelStyleProp={item.labelStyleProp}
                      outlineStyle={item.outlineStyle}
                    />

                    <RenderIf condition={item?.formInputInfo}>
                      <CustomView marginTop={10} marginBottom={10}>
                        <Text small {...item?.formInputInfoTextProps}>
                          {item?.formInputInfo}
                        </Text>
                      </CustomView>
                    </RenderIf>
                    <RenderIf condition={item?.formRightInfo}>
                      <CustomView horizontalEnd marginTop={5}>
                        <Text small>{item?.formRightInfo}</Text>
                      </CustomView>
                    </RenderIf>
                  </RenderIf>
                </>
              );
            case FORM_FIELD.INPUT_DROPDOWN:
              return (
                <CustomView>
                  <InputField
                    {...defaultProps}
                    {...defaultPropsSecond}
                    data={item.data}
                    onPress={item.onPress}
                    innerRef={ref}
                    inputRightCustom={item.inputRightCustom}
                    type={FORM_FIELD.INPUT_DROPDOWN}
                  />
                  <RenderIf condition={item?.formInputInfo}>
                    <Text small {...item?.formInputInfoTextProps}>
                      {item?.formInputInfo}
                    </Text>
                  </RenderIf>
                </CustomView>
              );
            case FORM_FIELD.DATE:
              return <DatePicker label={item.label} callback={onChange} />;
            default:
              return null;
          }
        }}
      />
    );
  };

  return (
    <CustomView style={[styles.container, formContainerStyle]}>
      {fields.map((item, index) => {
        return (
          <CustomView key={`form-item-${index}`}>
            {RenderFormInput({item, index})}
          </CustomView>
        );
      })}
      <RenderIf condition={cancelButton}>
        <CustomView row spaceBetween>
          <Button
            color={buttonLabelCancelColor}
            disabled={loading}
            onPress={() => navigation.goBack()}
            style={[styles.buttonRow, buttonCancelStyle]}
            labelStyle={{fontWeight: 'bold'}}>
            {t('label.cancel')}
          </Button>
          <Button
            color={buttonLabelColor}
            loading={loading}
            disabled={loading}
            onPress={handleSubmit(submitEvent, errorEvent)}
            style={[styles.buttonRow, buttonStyle]}
            labelStyle={[buttonLabelStyle, {fontWeight: 'bold'}]}>
            {buttonTitle}
          </Button>
        </CustomView>
      </RenderIf>
      <RenderIf condition={buttonChangePassword}>
        <Button
          color={buttonLabelColor}
          onPress={onPressChangePassword}
          style={{
            marginTop: 10,
            marginBottom: 30,
            paddingVertical: 5,
            borderRadius: 50,
            borderWidth: 1,
            borderColor: Colors.GRAY_MEDIUM,
            width: '55%',
          }}>
          <Text bold underline color={Colors.PRIMARY} numberOfLines={2}>
            {t('label.changePassword')}
          </Text>
        </Button>
      </RenderIf>
      <RenderIf condition={cancelButtonColumn}>
        <CustomView horizontalCenter>
          <Button
            color={buttonLabelColor}
            disabled={loading}
            loading={loading}
            onPress={handleSubmit(submitEvent, errorEvent)}
            style={[styles.buttonCol, buttonStyle]}
            labelStyle={[buttonLabelStyle, {fontWeight: 'bold'}]}>
            {buttonTitle}
          </Button>
          <Button
            color={buttonLabelCancelColor}
            disabled={loading}
            onPress={() => navigation.goBack()}
            style={[styles.buttonRow, buttonCancelStyle]}
            labelStyle={{fontWeight: 'bold'}}>
            {t('label.cancel')}
          </Button>
        </CustomView>
      </RenderIf>
      <RenderIf condition={onSubmit}>
        <RenderIf
          condition={!cancelButton && !cancelButtonColumn && !centerButton}>
          <Button
            color={buttonLabelColor}
            disabled={loading}
            loading={loading}
            textColor={buttonLabelColor}
            onPress={handleSubmit(submitEvent, errorEvent)}
            style={[styles.button, buttonStyle]}
            labelStyle={[buttonLabelStyle]}>
            {buttonTitle}
          </Button>
        </RenderIf>
      </RenderIf>
      {/* 渲染在提交按钮上方的附加按钮（如 My Profile 页的 Add Address） */}
      <RenderIf condition={extraButtonTitle && onExtraButtonPress}>
        <Button
          mode="outlined"
          textColor={Colors.PRIMARY}
          disabled={loading}
          onPress={onExtraButtonPress}
          style={[styles.button, {borderColor: Colors.PRIMARY}]}
          labelStyle={[extraLabelStyle]}>
          {extraButtonTitle}
        </Button>
      </RenderIf>
      <RenderIf condition={centerButton}>
        <CustomView horizontalCenter>
          <Button
            color={buttonLabelColor}
            disabled={loading}
            loading={loading}
            onPress={handleSubmit(submitEvent, errorEvent)}
            style={[styles.centerButton, buttonStyle]}
            labelStyle={[buttonLabelStyle]}>
            {buttonTitle}
          </Button>
        </CustomView>
      </RenderIf>
      {FooterComponent ? <FooterComponent /> : <></>}
    </CustomView>
  );
};

FormComponent.propTypes = {
  // use as schema to render form fields
  fields: PropTypes.array.isRequired,
  // use as a callback function for submit button
  onSubmit: PropTypes.func,
  // use as a callback function for error from useForm
  onError: PropTypes.func,
  // use as loader state for submit button
  loading: PropTypes.bool,
  // use for button submit title
  buttonTitle: PropTypes.string,
};

export default FormComponent;
