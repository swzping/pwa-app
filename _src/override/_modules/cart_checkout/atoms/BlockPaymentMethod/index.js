import React, {useContext, useEffect, useMemo,useRef, useState} from 'react';
import {TouchableOpacity, View} from 'react-native';

import {useReactiveVar} from '@apollo/client';
import crashlytics from '@react-native-firebase/crashlytics';

import _ from 'lodash';
import {useTranslation} from 'react-i18next';

import {SET_PAYMENT_METHOD} from '@app/_modules/cart/services/schema';
import {CheckoutContext} from '@app/_modules/cart_checkout/_controller';
import styles from '@app/_modules/cart_checkout/atoms/BlockPaymentMethod/styles';
import {GET_PAYMENT_GROUPING} from '@app/_modules/cart_checkout/services/schema';
// import Divider from '@app/components/Divider/index';
import Shimmer from '@app/components/_Shimmer/index';
import CustomView from '@app/components/CustomView/index';
import RadioButton from '@app/components/RadioButton/index';
import RenderIf from '@app/components/RenderIf/index';
import Text from '@app/components/Text/index';
// import CheckBox from '@app/components/CheckBox/index';
import AnalyticsHelper from '@app/helpers/Analytics';
import {IS_FREE, PAYMENT_METHOD} from '@app/helpers/Constants';
import {startPerfTrace} from '@app/helpers/perf';
// import CheckoutBillingForm from '@app/_modules/cart_checkout/atoms/BlockPaymentMethod/_billing';
import useCustomMutation from '@app/hooks/useCustomMutation';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {
  rxCartAvailablePaymentMethod,
  rxCartId,
  rxCartPayment,
  rxCartSelectedPaymentMethod,
} from '@app/services/cache';
import {Colors} from '@app/styles/index';

const PaymentMethodItem = ({
  method,
  index,
  isLast,
  onSelectedPaymentMethod,
  selectedPaymentMethod,
  onGetSelectedStatus,
}) => {
  return (
    <TouchableOpacity
      onPress={() => {
        onSelectedPaymentMethod({item: method});
      }}
      style={[
        styles.itemContainer,
        {paddingTop: index === 0 ? 0 : 10, paddingBottom: isLast ? 15 : 10},
      ]}>
      <View style={{alignItems: 'center', flexDirection: 'row'}}>
        <RadioButton
          selected={
            selectedPaymentMethod && selectedPaymentMethod.title !== ''
              ? onGetSelectedStatus(method)
              : false
          }
          activeColor={Colors.PRIMARY}
          size={20}
        />
        <Text style={styles.paymentItemText}>{method.title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const BlockPaymentMethod = ({isFree}) => {
  const {t} = useTranslation();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const getRxCartSelectedPayment = useReactiveVar(rxCartSelectedPaymentMethod);
  const activeSections = useReactiveVar(rxCartPayment);
  const {
    onRefetchData: selectPaymentMethodHook,
    // loading: isLoadingSelectPaymentMethod,
  } = useCustomMutation({
    schema: SET_PAYMENT_METHOD,
  });

  const {data: paymentConfigResData} = useCustomQuery({
    schema: GET_PAYMENT_GROUPING,
    useInitData: true,
    opts: {fetchPolicy: 'no-cache'},
  });

  useEffect(() => {
    const resData = _.get(
      paymentConfigResData,
      'data.storeConfig.payments_configuration',
    );
    if (resData) {
      setPaymentConfig(JSON.parse(resData));
    }
  }, [paymentConfigResData]);

  // console.log('masuk paymentGrouping', paymentConfig);

  const ctxCheckout = useContext(CheckoutContext);
  const getRxCartId = useReactiveVar(rxCartId);
  const getRxCartAvailablePaymentMethod = useReactiveVar(
    rxCartAvailablePaymentMethod,
  );
  const isShowingAvailablePayment =
    getRxCartAvailablePaymentMethod?.length > 0 ?? 0;

  let mount = useRef();

  // ComponentDidMount
  useEffect(() => {
    mount.current = true;
    return () => {
      mount.current = false;
    };
  }, []);

  useEffect(() => {
    if (isFree) {
      const onSetPaymentFree = async () => {
        try {
          const cart_id = getRxCartId;
          const res = await selectPaymentMethodHook({
            paramsOpt: {isReturn: true},
            params: {
              input: {cart_id, payment_method: {code: IS_FREE}},
            },
          });
          if (res?.data) {
            const selectedPayment = _.get(
              res,
              'data.setPaymentMethodOnCart.cart.selected_payment_method',
            );
            rxCartSelectedPaymentMethod(selectedPayment);
          }
        } catch (err) {
          console.log('[err] set payment method free', err);
        }
      };
      onSetPaymentFree();
    } else {


      // reset payment
      // setSelectedPaymentMethod(null);
    }
  }, [isFree]);

  /**
   * ---------------------------------------------------- *
   * @function useEffect
   * @summary for set Selected Payment Method
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    if (mount.current) {
      let selectedPaymentItem = null;
      if (getRxCartSelectedPayment?.code) {
        getRxCartAvailablePaymentMethod?.map((item, index) => {
          if (item?.code === getRxCartSelectedPayment?.code) {
            selectedPaymentItem = item;
          }
        });
      }

      // TODO: 后端无返回时前端无需默认选中
      // 如果接口返回的 selected_payment_method 的 code 为空，或返回的 code 不在 available 列表中，
      // 默认选第一个非 purchaseorder 的
      // if (!selectedPaymentItem && getRxCartAvailablePaymentMethod?.length > 0 && !isFree) {
      //   const defaultMethod = getRxCartAvailablePaymentMethod.find(
      //     ({code}) => code !== IS_FREE && code !== 'purchaseorder',
      //   );
      //   if (defaultMethod) {
      //     selectedPaymentItem = defaultMethod;
      //     // 调用 API 默认选中该支付方式（静默执行，不阻塞 UI）
      //     onSelectedPaymentMethod({item: defaultMethod, isDefault: true});
      //   }
      // }

      setSelectedPaymentMethod(selectedPaymentItem);
      ctxCheckout?.setIsCart({
        ...ctxCheckout.isCart,
        selectedPaymentMethod: selectedPaymentItem !== null ? true : false,
      });
    }
  }, [getRxCartSelectedPayment, isShowingAvailablePayment]);

  /**
   * ---------------------------------------------------- *
   * @function onSelectedPaymentMethod
   * @summary for process selected payment method
   * ---------------------------------------------------- *
   */
  const onSelectedPaymentMethod = async ({item, isDefault}) => {
    // 默认自动选中时不显示 loading（由 useEffect 触发，非用户交互）
    if (!isDefault) {
      ctxCheckout?.setIsCart({
        ...ctxCheckout?.isCart,
        loadingButtonOrder: true,
      });
    }

    // 开始 checkOutSelectPaymentWay trace
    const paymentTrace = await startPerfTrace('checkOutSelectPaymentWay');
    const paymentStartTime = Date.now();

    try {
      const cart_id = getRxCartId;
      const payment_method = {code: item?.code};
      const res = await selectPaymentMethodHook({
        paramsOpt: {isReturn: true},
        params: {
          input: {cart_id, payment_method},
        },
      });
      if (res?.data) {
        const selectedPayment = _.get(
          res,
          'data.setPaymentMethodOnCart.cart.selected_payment_method',
        );
        rxCartSelectedPaymentMethod(selectedPayment);
        crashlytics().setAttribute(PAYMENT_METHOD, item?.code?.toString());
        setSelectedPaymentMethod(item);
        AnalyticsHelper.eventAddPaymentInfo({
          payment_type: item?.title?.toString(),
        });
        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          selectedPaymentMethod: true,
          ...(!isDefault && {loadingButtonOrder: false}),
        });

        // 选择成功
        const duration = Date.now() - paymentStartTime;
        paymentTrace.putAttribute('payment_method', item?.code || '');
        paymentTrace.putAttribute('payment_title', item?.title || '');
        paymentTrace.putMetric('duration_ms', duration);
        paymentTrace.putAttribute('status', 'success');
        paymentTrace.stop();
      } else {
        // 选择失败
        const duration = Date.now() - paymentStartTime;
        paymentTrace.putMetric('duration_ms', duration);
        paymentTrace.putAttribute('status', 'error');
        paymentTrace.putAttribute('error_reason', 'no_response');
        paymentTrace.stop();

        if (!isDefault) {
          ctxCheckout?.setIsCart({
            ...ctxCheckout?.isCart,
            loadingButtonOrder: false,
          });
        }
      }
    } catch (err) {
      // 选择失败
      const duration = Date.now() - paymentStartTime;
      paymentTrace.putMetric('duration_ms', duration);
      paymentTrace.putAttribute('status', 'error');
      paymentTrace.putAttribute(
        'error_reason',
        err?.message || 'unknown_error',
      );
      paymentTrace.stop();

      console.log('[err] selected payment method', err);
      if (!isDefault) {
        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          loadingButtonOrder: false,
        });
      }
    }
  };

  // const onCheckBillingSameShipping = () => {
  //   ctxCheckout?.setIsCart({
  //     ...ctxCheckout?.isCart,
  //     isBillingSameShipping: !ctxCheckout?.isCart?.isBillingSameShipping,
  //   });
  // };

  const updateSections = activeSection => {
    rxCartPayment(activeSection);
  };

  const getTitleGroupingPayment = keyTitle => {
    switch (keyTitle) {
      case 'pg-banktransfer':
        return {
          title: t('cart_checkout.paymentGrouping.banktransfer'),
          icon: 'money',
        };
      case 'pg-installment':
        return {
          title: t('cart_checkout.paymentGrouping.installment'),
          icon: 'clock-o',
        };
      case 'pg-creditcard':
        return {
          title: t('cart_checkout.paymentGrouping.creditcard'),
          icon: 'credit-card',
        };
      case 'pg-internetpayment':
        return {
          title: t('cart_checkout.paymentGrouping.internetpayment'),
          icon: 'mobile-phone',
        };
      case 'pg-onlinepayment':
        return {
          title: t('cart_checkout.paymentGrouping.onlinepayment'),
          icon: 'wifi',
        };
      default:
        return {
          title: t('cart_checkout.paymentGrouping.others'),
          icon: 'list',
        };
    }
  };

  const groupingPayment = (available, configs) => {
    const resultGroupingPayment = [];
    if (available?.length > 0) {
      Object.keys(configs).map((key, index) => {
        const paymentConfigs = configs[key].toLowerCase().split(',');
        const filteredPayment = available.filter(item => {
          return paymentConfigs.includes(item.code.toLocaleLowerCase());
        });
        if (selectedPaymentMethod) {
          if (
            filteredPayment.filter(
              item => item.code === selectedPaymentMethod.code,
            ).length > 0
          ) {
            if (activeSections.length === 0) {
              updateSections([index]);
            }
          }
        }
        const singlePaymentConfig = getTitleGroupingPayment(key);
        resultGroupingPayment.push({
          title: singlePaymentConfig.title,
          icon: singlePaymentConfig.icon,
          value: filteredPayment,
        });
      });
    }
    // setIsGrouping(true);
    return resultGroupingPayment;
  };

  const availablePaymentMethods = useMemo(() => {
    let configStore = [];
    if (paymentConfig && getRxCartAvailablePaymentMethod) {
      configStore = groupingPayment(
        getRxCartAvailablePaymentMethod,
        paymentConfig,
      );
    }
    return configStore.filter(item => item?.value?.length > 0);
  }, [paymentConfig, getRxCartAvailablePaymentMethod]);

  const onGetSelectedStatus = item => {
    if (
      selectedPaymentMethod &&
      selectedPaymentMethod.title === item.title &&
      selectedPaymentMethod.code === item.code
    ) {
      return true;
    } else {
      return false;
    }
  };

  if (ctxCheckout?.isCart?.getReviewOrder) {
    return (
      <CustomView paddingBottom={15}>
        <CustomView row>
          <CustomView
            width={'100%'}
            paddingHorizontal={15}
            paddingVertical={10}>
            <Text bold style={{fontSize: 16}}>
              {t('cart_checkout.paymentInformation')}
            </Text>
          </CustomView>
        </CustomView>
        <RenderIf condition={!getRxCartSelectedPayment?.title}>
          <CustomView paddingHorizontal={15}>
            <Shimmer
              wrapperStyle={{borderRadius: 10, width: '100%', height: 30}}
            />
          </CustomView>
        </RenderIf>
        <RenderIf condition={getRxCartSelectedPayment?.title}>
          <CustomView
            border={1}
            borderColor={Colors.GRAY_SMOOTH3}
            borderRadius={10}
            marginHorizontal={15}
            paddingHorizontal={15}
            paddingVertical={10}>
            <Text>{getRxCartSelectedPayment?.title}</Text>
          </CustomView>
        </RenderIf>
      </CustomView>
    );
  }

  return (
    <CustomView paddingHorizontal={15}>
      <CustomView row>
        <CustomView width={'100%'} marginBottom={10} paddingTop={15}>
          <Text bold style={{fontSize: 16}}>
            {t('cart_checkout.paymentInformation')}
          </Text>
        </CustomView>
      </CustomView>
      <RenderIf
        condition={
          !isShowingAvailablePayment ||
          !ctxCheckout?.isCart?.selectedShippingMethod
        }>
        <CustomView marginBottom={10}>
          <Text color={Colors.GRAY_DARK} style={{fontSize: 14}}>
            {t('cart_checkout.choosePaymentMethod')}
          </Text>
        </CustomView>
      </RenderIf>
      <RenderIf
        condition={
          isShowingAvailablePayment &&
          ctxCheckout?.isCart?.selectedShippingMethod &&
          isFree
        }>
        <CustomView
          border={1}
          borderColor={Colors.GRAY_SMOOTH3}
          borderRadius={10}
          marginHorizontal={10}
          paddingHorizontal={10}
          paddingVertical={10}>
          <Text>{getRxCartSelectedPayment?.title}</Text>
        </CustomView>
      </RenderIf>
      <RenderIf
        condition={
          isShowingAvailablePayment &&
          ctxCheckout?.isCart?.selectedShippingMethod &&
          !isFree
        }>
        <CustomView>
          {availablePaymentMethods?.map(paymentItem => {
            const {title, value} = paymentItem;
            return (
              <CustomView key={title}>
                <CustomView marginTop={10} marginBottom={5}>
                  {value?.map((method, index) => {
                    return (
                      <PaymentMethodItem
                        key={`${method.code}${index}`}
                        method={method}
                        index={index}
                        isLast={false}
                        selectedPaymentMethod={selectedPaymentMethod}
                        onSelectedPaymentMethod={onSelectedPaymentMethod}
                        onGetSelectedStatus={onGetSelectedStatus}
                      />
                    );
                  })}
                </CustomView>
              </CustomView>
            );
          })}
        </CustomView>
      </RenderIf>
    </CustomView>
  );
};

export default BlockPaymentMethod;
