import React, {useCallback,useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';

import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

// import ErrorIcon from './ErrorIcon';
// import ClearIcon from './ClearIcon';
import _ from 'lodash';
import {useForm} from 'react-hook-form';

// import {getErrorGQL} from '@app/helpers/General';
import {APPLY_MULTIPLE_COUPONS} from '@app/_modules/cart/services/schema';
import {useFormConfig} from '@app/components/_Forms/index';
import CustomView from '@app/components/CustomView/index';
import Text from '@app/components/Text/index';
import {numberFormat} from '@app/helpers/General';
import useCarts, {TYPES} from '@app/hooks/carts/useCarts';
import useCouponWallet from '@app/hooks/useCouponWallet';
import useCustomMutation from '@app/hooks/useCustomMutation';
// import {useTranslation} from 'react-i18next';
// import {FORM_FIELD} from '@app/helpers/Constants';
// import {useReactiveVar} from '@apollo/client';
// import {rxCartId} from '@app/services/cache';
// import {TouchableRipple, TextInput} from 'react-native-paper';
import {Colors} from '@app/styles/index';
// import {CheckoutContext} from '@app/_modules/cart_checkout/_controller';
import {isIOS} from '@app/styles/mixins.new';

// const ClearIconComponent = () => (
//   <ClearIcon width={14} height={14} color="white" backgroundColor="#999999" />
// );

const styles = StyleSheet.create({
  formContainer: {
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  label: {
    marginRight: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFF0EF',
    borderRadius: 8,
  },
  labelVoucher: {
    backgroundColor: '#ECFAEC',
  },
  labelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CC2B1E',
  },
  labelTextVoucher: {
    color: '#46A147',
  },
  labelShrink: {
    flexShrink: 1,
  },
  btnApply: {
    backgroundColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isIOS ? 10 : 8,
    borderRadius: 8,
    marginTop: 15,
  },
  btnCheckVoucher: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isIOS ? 10 : 8,
    borderRadius: 8,
  },
});

const CheckoutCouponCode = () => {
  // const {t} = useTranslation();
  const navigation = useNavigation();
  // const ctxCheckout = useContext(CheckoutContext);
  // const getRxCartId = useReactiveVar(rxCartId);
  const [dataCoupon, setDataCoupon] = useState({
    loading: false,
    isError: false,
    errMessage: null,
  });
  const [manualCoupons, setManualCoupons] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [allCoupons, setAllCoupons] = useState([]);

  // 获取用户【可用】的优惠券列表（只统计 status = 'valid'）
  // eslint-disable-next-line no-unused-vars
  const {fetchCouponWallet, paginationInfo} = useCouponWallet();

  // eslint-disable-next-line no-unused-vars
  const {onRefetchData: onApplyMultipleCoupons} = useCustomMutation({
    schema: APPLY_MULTIPLE_COUPONS,
  });
  const {data: getDataCoupon} = useCarts({
    initialized: true,
    type: TYPES.APPLIED_COUPON,
  });
  // eslint-disable-next-line no-unused-vars
  const {setCart: setDataPrice} = useCarts({
    initialized: false,
    type: TYPES.PRICE,
  });
  // eslint-disable-next-line no-unused-vars
  const {setCart: setAvailablePaymentMethod} = useCarts({
    initialized: false,
    type: TYPES.AVAILABLE_PAYMENT,
  });

  const externalForm = useForm(useFormConfig);

  /**
   * ---------------------------------------------------- *
   * @dependency [getDataCoupon]
   * @summary for get latest coupon
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    const appliedCoupon = _.get(getDataCoupon, 'applied_coupon.code');
    if (appliedCoupon) {
      setAllCoupons(appliedCoupon.split(','));
    } else {
      setAllCoupons([]);
    }

    const manualRes = _.get(getDataCoupon, 'applied_coupons');
    if (manualRes) {
      setManualCoupons(manualRes);
      console.log('manualCoupons',manualRes);
    } else {
      setManualCoupons([]);
    }
  }, [getDataCoupon]);

  /**
   * ---------------------------------------------------- *
   * @dependency []
   * @summary for fetch user's collected vouchers on component mount
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    // 组件挂载时仅查询可用（valid）状态的优惠券，并拉取足够多的条目用于统计总数
    fetchCouponWallet({
      status: 'valid',
      pageSize: 999,
      currentPage: 1,
    });
  }, [fetchCouponWallet]);

  const route = useRoute();

  useFocusEffect(
    useCallback(() => {
      const params = route?.params;
      if (params?.selectedVoucherCode) {
        externalForm.setValue('couponCode', params.selectedVoucherCode);
        setDataCoupon({
          ...dataCoupon,
          isError: false,
          errMessage: null,
        });
        navigation.setParams({
          selectedVoucherCode: undefined,
          selectedVoucher: undefined,
        });
      }
    }, [route?.params, externalForm, dataCoupon, navigation]),
  );

  const goEvoucherSelection = ()=> {
    navigation.navigate('EvoucherSelection', {
            selectedVoucherCode: manualCoupons?.map(item => item.code)?.join(',') || '',
    });
  };

  return (
    <CustomView onPress={goEvoucherSelection} marginLeft={10} row flex horizontalCenter style={{justifyContent: 'flex-end'}}>

      {/* 错误提示 - 新的样式 */}
      {/* {dataCoupon.isError && (
        <CustomView
          backgroundColor="#FFF0F0"
          paddingHorizontal={12}
          paddingVertical={10}
          borderRadius={8}
          borderWidth={1}
          borderColor="#FFE0E0"
          marginTop={5}>
          <CustomView row>
            <CustomView marginTop={1}>
              <ErrorIcon width={18} height={19} />
            </CustomView>
            <CustomView marginLeft={8}>
              <Text
                color="#E41305"
                fontSize={14}
                fontWeight="500"
                marginTop={2}>
                {dataCoupon.errMessage}
              </Text>
            </CustomView>
          </CustomView>
        </CustomView>
      )} */}
      <CustomView row style={{justifyContent: 'flex-end', flexShrink: 1, flexWrap: 'wrap'}}>
        <CustomView row style={{flexShrink: 1, flexWrap: 'wrap', rowGap: 4}}>
          {manualCoupons.slice(0, 2).map((item, index) => {
            // cashback 券复用绿色 chip 样式，直接展示后端返回的 rule_name；
            // 文案过长时在 chip 内自动换行完整展示，不截断、不遮挡左侧标题
            const isCashback = item.is_cashback_coupon === true;
            const isGreenLabel = item.is_free_gift_coupon || isCashback;
            // cashback 金额有值时拼接在 rule_name 后展示,价格格式化与折扣 chip 同款
            const cashbackLabel = `${item.rule_name || 'Cashback'}${item.cashback_amount ? ` ${numberFormat('Rp', item.cashback_amount, ',', 0)}` : ''}`;
            return (
              <CustomView row key={`coupon-${index}`} style={[styles.label, styles.labelShrink, isGreenLabel && styles.labelVoucher]} >
                <Text style={[styles.labelText, styles.labelShrink, isGreenLabel && styles.labelTextVoucher]}> {isCashback ? cashbackLabel : item.is_free_gift_coupon ? 'Free Gift' : `-${ numberFormat('Rp', item.discount_amount, ',', 0)}`}</Text>
              </CustomView>
            );
          })}
          {manualCoupons.length > 2 && ( <CustomView row style={styles.label} >
            <Text style={styles.labelText}>...</Text>
          </CustomView>)}
        </CustomView>
      </CustomView>

      <Icon name={'chevron-right'} color={Colors.PRIMARY}  size={25} />

      {/* Check My eVoucher 按钮 */}
      {/* <CustomView marginTop={-5} marginBottom={15}>
        <TouchableRipple
          style={styles.btnCheckVoucher}
          onPress={() => navigation.navigate('EvoucherSelection', {
            selectedVoucherCode: manualCoupons?.map(item => item.coupon_code)?.join(',') || '',
          })}>
          <Text bold style={{fontSize: 14}} color={Colors.PRIMARY}>
            {t('cart_checkout.label.checkMyVoucher')} (
            {paginationInfo?.totalCount || 0})
          </Text>
        </TouchableRipple>
      </CustomView> */}
    </CustomView>
  );
};

export default CheckoutCouponCode;
