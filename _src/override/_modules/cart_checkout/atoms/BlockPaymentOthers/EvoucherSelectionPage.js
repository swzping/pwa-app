import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import {TextInput,TouchableRipple} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Defs, Line, LinearGradient, Stop} from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';

import {useNavigation, useRoute} from '@react-navigation/native';

import {useReactiveVar} from '@apollo/client';
import Clipboard from '@react-native-clipboard/clipboard';

import _ from 'lodash';
import {useTranslation} from 'react-i18next';
import {useForm, useWatch} from 'react-hook-form';

import {
  APPLY_MULTIPLE_COUPONS,
  USE_COUPON,
} from '@app/_modules/cart/services/schema';
import {CheckoutContext} from '@app/_modules/cart_checkout/_controller';
import NodataForCoupon from '@app/assets/svgs/NodataForCoupon';
import Forms, {useFormConfig} from '@app/components/_Forms/index';
import VoucherDetailsModal from '@app/components/Cms/ContentTypes/VoucherSlider/VoucherDetailsModal';
import CustomView from '@app/components/CustomView/index';
import Text from '@app/components/Text/index';
import {FORM_FIELD} from '@app/helpers/Constants';
import {getErrorGQL} from '@app/helpers/General';
import useCarts, {TYPES} from '@app/hooks/carts/useCarts';
import useCouponWallet from '@app/hooks/useCouponWallet';
import useCustomMutation from '@app/hooks/useCustomMutation';
import {rxAppSnackbar, rxCartId} from '@app/services/cache';
import {Colors} from '@app/styles/index';

// import {isIOS} from '@app/styles/mixins.new';
import ClearIcon from './ClearIcon';
import CopyCodeIcon from './CopyCodeIcon';

const ClearIconComponent = () => (
  <ClearIcon width={14} height={14} marginTop={0} color="white" backgroundColor="#999999" />
);
const EvoucherSelectionPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const ctxCheckout = React.useContext(CheckoutContext);
  const getRxCartId = useReactiveVar(rxCartId);
  const {couponWallet, paginationInfo, loading, fetchCouponWallet} =
    useCouponWallet();
  const [selectedVouchers, setSelectedVouchers] = useState([]);
  const [initialCouponCode, setInitialCouponCode] = useState('');
  // 尚未在券包列表中匹配到的初始带入券码（可能分页加载后才出现；也可能不在券包内，如免费赠品/系统券）
  const pendingInitialRef = useRef([]);
  // 用户手动改动过勾选后，不再自动勾选初始带入券
  const userTouchedRef = useRef(false);
  const [copyTipStates, setCopyTipStates] = useState({});
  const [isVoucherDetailsModalVisible, setIsVoucherDetailsModalVisible] =
    useState(false);
  const [selectedVoucherDetails, setSelectedVoucherDetails] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allVouchers, setAllVouchers] = useState([]);
  const [allCoupons, setAllCoupons] = useState([]);
  const externalForm = useForm(useFormConfig);
  const searchKeywordValue = useWatch({
    control: externalForm.control,
    name: 'couponCode',
  });

    const [dataCoupon, setDataCoupon] = useState({
      loading: false,
      isError: false,
      errMessage: null,
      successMessage: null,
    });
  const [isInputFocused, setIsInputFocused] = useState(false);

  // 输入框值改变时清除搜索错误信息（含 form 内联错误）
  useEffect(() => {
    externalForm.clearErrors('couponCode');
    if (dataCoupon.isError || dataCoupon.errMessage || dataCoupon.successMessage) {
      setDataCoupon(prev => ({
        ...prev,
        isError: false,
        errMessage: null,
        successMessage: null,
      }));
    }
  }, [searchKeywordValue]);

  const {t} = useTranslation();
  const {onRefetchData: onApplyMultipleCoupons} = useCustomMutation({
    schema: APPLY_MULTIPLE_COUPONS,
  });
  const {onRefetchData: onUseCoupon} = useCustomMutation({
    schema: USE_COUPON,
    configErr: {isBypass: true},
  });
  // eslint-disable-next-line no-unused-vars
  const {data: getDataCoupon, setCart: onRefetchCoupons} = useCarts({
    initialized: true,
    type: TYPES.APPLIED_COUPON,
  });
  // 返回结账页前刷新 checkout 页面的展示数据。
  // 注意：EvoucherSelection 注册在根导航 Stack，不在 CheckoutContext.Provider 内，
  // 所以 useContext(CheckoutContext) 拿到的是 undefined，不能依赖它刷新。
  // 数据经全局 reactive var 共享，结账页回到前台会自动拿到最新值。
  //
  // 只刷新结账页用到的数据源（useCarts 旧体系）：
  // - ITEM_BLOCK_SUBTOTAL：商品列表
  // - PRICE：价格小计
  // - APPLIED_COUPON：优惠券 chips（结账页 _coupon.js 期望 {applied_coupon, applied_coupons[]} 形状）
  const {setCart: onRefreshCartItems} = useCarts({
    initialized: false,
    type: TYPES.ITEM_BLOCK_SUBTOTAL,
  });
  const {setCart: onRefreshCartPrices} = useCarts({
    initialized: false,
    type: TYPES.PRICE,
  });
  const {setCart: onRefreshAppliedCoupon} = useCarts({
    initialized: false,
    type: TYPES.APPLIED_COUPON,
  });
  // const {setCart: setDataPrice} = useCarts({
  //   initialized: false,
  //   type: TYPES.PRICE,
  // });
  // const {setCart: setAvailablePaymentMethod} = useCarts({
  //   initialized: false,
  //   type: TYPES.AVAILABLE_PAYMENT,
  // });

  useEffect(() => {
    const appliedCoupon = _.get(getDataCoupon, 'applied_coupon.code');
    if (appliedCoupon) {
      setAllCoupons(appliedCoupon.split(','));
    } else {
      setAllCoupons([]);
    }
  }, [getDataCoupon]);

  // 首次加载第一页【可用】优惠券（status = 'valid'）
  useEffect(() => {
    fetchCouponWallet({pageSize: 5, currentPage: 1, status: 'valid'});
    setCurrentPage(1);
  }, [fetchCouponWallet]);

  // Populate selection with incoming coupon codes from checkout page
  useEffect(() => {
    const selectedCode = route?.params?.selectedVoucherCode;
    if (!selectedCode) {
      return;
    }

    // Save the initial codes for later use (e.g., removal logic)
    setInitialCouponCode(selectedCode);

    // 多选：记录全部初始券码，待券包数据（含后续分页）到达后逐个匹配勾选
    pendingInitialRef.current = selectedCode
      .split(',')
      .map(code => code.trim())
      .filter(Boolean);

    // Clear params to prevent re-processing on re-render
    navigation.setParams?.({
      ...route?.params,
      selectedVoucherCode: undefined,
      selectedVoucher: undefined,
    });
  }, [navigation, route?.params?.selectedVoucherCode]);

  // 每批券包数据到达时，把能匹配上的初始带入券勾选上（多选）；
  // 未匹配的券码保留在 pendingInitialRef，等后续分页数据继续匹配
  useEffect(() => {
    if (!couponWallet || couponWallet.length === 0) {
      return;
    }
    if (pendingInitialRef.current.length === 0 || userTouchedRef.current) {
      return;
    }

    const matched = couponWallet.filter(item =>
      pendingInitialRef.current.some(
        code => code.toUpperCase() === item.code?.toUpperCase(),
      ),
    );

    if (matched.length > 0) {
      pendingInitialRef.current = pendingInitialRef.current.filter(
        code =>
          !matched.some(m => m.code?.toUpperCase() === code.toUpperCase()),
      );
      setSelectedVouchers(prev => [
        ...prev,
        ...matched.filter(
          m => !prev.some(v => v.code?.toUpperCase() === m.code?.toUpperCase()),
        ),
      ]);
    }
  }, [couponWallet]);

  // 根据当前页累积本地列表，实现分页；
  // 第 1 页整体替换（搜索/刷新），后续页按 code 去重追加
  useEffect(() => {
    if (!couponWallet) {
      return;
    }
    if (currentPage === 1) {
      setAllVouchers(couponWallet);
    } else {
      setAllVouchers(prev => {
        const existingCodes = new Set(prev.map(v => v.code));
        const newItems = couponWallet.filter(v => !existingCodes.has(v.code));
        return [...prev, ...newItems];
      });
    }
  }, [couponWallet, currentPage]);

  // 是否还有更多数据
  const hasMore = useMemo(() => {
    if (!paginationInfo) {
      return false;
    }
    return allVouchers.length < paginationInfo.totalCount;
  }, [paginationInfo, allVouchers.length]);

  const handleVoucherSelect = voucher => {
    if (voucher.status === 'used') {
      return;
    }

    // 多选：再次点击取消勾选单个券，其余保持不变；
    // 忽略大小写匹配（搜索校验返回的 code 大小写可能与钱包列表不一致）
    userTouchedRef.current = true;
    setSelectedVouchers(prev => {
      const isSelected = prev.some(
        item => item.code?.toUpperCase() === voucher.code?.toUpperCase(),
      );
      if (isSelected) {
        return prev.filter(
          item => item.code?.toUpperCase() !== voucher.code?.toUpperCase(),
        );
      }
      return [...prev, voucher];
    });
  };

  const handleSearch = async keyword => {
    // 搜索前先清除上次的错误信息（含 form 内联错误）
    setDataCoupon({loading: false, isError: false, errMessage: null, successMessage: null});
    externalForm.clearErrors('couponCode');

    // keyword 有值时，先调用 useCoupon 校验优惠券
    if (keyword) {
      setDataCoupon({loading: true, isError: false, errMessage: null, successMessage: null});
      try {
        const res = await onUseCoupon({
          paramsOpt: {isReturn: true},
          params: {coupon: keyword},
        });
        const getError = getErrorGQL(res);
        if (!res || getError.isError) {
          const message = getError?.message || t('message.somethingWrong');
          setDataCoupon({loading: false, isError: true, errMessage: message, successMessage: null});
          // 接口报错：错误内联显示在输入框下方，不继续搜索
          externalForm.setError('couponCode', {
            type: 'useCoupon',
            message,
          });
          return;
        }
        setDataCoupon({loading: false, isError: false, errMessage: null, successMessage: t('cart_checkout.couponCodeValid')});
        // 多选：把校验通过的券并入已选列表（已选中的不重复添加）
        if (res?.data?.useCoupon?.items?.length) {
          const validItems = res.data.useCoupon.items;
          setSelectedVouchers(prev => [
            ...prev,
            ...validItems.filter(
              item =>
                !prev.some(
                  v => v.code?.toUpperCase() === item.code?.toUpperCase(),
                ),
            ),
          ]);
        }
      } catch (error) {
        const message = error?.message || t('message.somethingWrong');
        setDataCoupon({loading: false, isError: true, errMessage: message, successMessage: null});
        externalForm.setError('couponCode', {
          type: 'useCoupon',
          message,
        });
        return;
      }
    }

    // Reset pagination and fetch filtered results
    // 不清空列表：旧数据保留展示，新数据到达后由分页 effect 整体替换，避免闪烁
    setCurrentPage(1);
    await fetchCouponWallet({
      pageSize: 5,
      currentPage: 1,
      status: 'valid',
      couponCode: keyword,
    });
  };

  const onApplyCoupon = async couponCodes => {
    const cart_id = getRxCartId;

    if (!couponCodes?.length) {
      const message = t('cart_checkout.error.requiredCodeCoupon');
      setDataCoupon({
        loading: false,
        isError: true,
        errMessage: message,
      });
      return {success: false, message};
    }

    ctxCheckout?.setIsCart({
      ...ctxCheckout?.isCart,
      loadingButtonOrder: true,
    });

    try {
      setDataCoupon({loading: true, isError: false, errMessage: null});
      // 多选：一次性提交全部选中的券码（整单替换购物车优惠券），后端逐个返回应用结果
      const addCouponVar = couponCodes;

      await ctxCheckout?.resetPoints();
      const res = await onApplyMultipleCoupons({
        paramsOpt: {isReturn: true},
        params: {
          input: {cart_id, couponCodes: addCouponVar},
        },
      });

      if (!res) {
        const message = t('message.somethingWrong');
        setDataCoupon({loading: false, isError: true, errMessage: message});
        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          loadingButtonOrder: false,
        });
        return {success: false, message};
      }

      const getError = getErrorGQL(res);
      if (getError.isError) {
        const message = getError.message;
        setDataCoupon({
          loading: false,
          isError: true,
          errMessage: message,
        });
        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          loadingButtonOrder: false,
        });
        return {success: false, message};
      }

      const arrRes = _.get(res, 'data.applyMultipleCoupon');
      if (Array.isArray(arrRes)) {
        // await onRefetchCoupons();
        // 按 code（忽略大小写）逐个匹配提交的券，统计未成功应用的券
        const failedCodes = couponCodes.filter(code => {
          const findRes = arrRes.find(
            item => item?.code?.toUpperCase() === String(code).toUpperCase(),
          );
          return !findRes || findRes.isApplied !== '1';
        });

        if (failedCodes.length === 0) {
          setDataCoupon({loading: false, isError: false, errMessage: null});
          ctxCheckout?.setIsCart({
            ...ctxCheckout?.isCart,
            loadingButtonOrder: false,
          });
          return {success: true};
        }

        const message =
          failedCodes.length === couponCodes.length
            ? t('cart_checkout.error.invalidCouponCode')
            : `${t('cart_checkout.error.invalidCouponCode')} (${failedCodes.join(', ')})`;
        setDataCoupon({loading: false, isError: true, errMessage: message});
        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          loadingButtonOrder: false,
        });
        return {success: false, message};
      }

      const message = t('cart_checkout.error.invalidCouponCode');
      setDataCoupon({loading: false, isError: true, errMessage: message});
      ctxCheckout?.setIsCart({
        ...ctxCheckout?.isCart,
        loadingButtonOrder: false,
      });
      return {success: false, message};
    } catch (error) {
      const message = t('message.somethingWrong');
      setDataCoupon({loading: false, isError: true, errMessage: message});
      ctxCheckout?.setIsCart({
        ...ctxCheckout?.isCart,
        loadingButtonOrder: false,
      });
      return {success: false, message};
    }
  };

  const onRemoveCoupon = async coupon_code => {
    const cart_id = getRxCartId;

    ctxCheckout?.setIsCart({
      ...ctxCheckout?.isCart,
      loadingButtonOrder: true,
    });

    try {
      setDataCoupon({loading: true, isError: false, errMessage: null});
      // coupon_code could be comma-separated; split to get individual codes
      // 忽略大小写匹配：allCoupons（applied_coupon.code）与入参（applied_coupons）来源不同
      const codesToRemove = coupon_code
        .split(',')
        .map(c => c.trim().toUpperCase());
      const removeCouponVar = [...allCoupons].filter(
        item => !codesToRemove.includes(String(item).toUpperCase()),
      );

      const res = await onApplyMultipleCoupons({
        paramsOpt: {isReturn: true},
        params: {
          input: {cart_id, couponCodes: removeCouponVar},
        },
      });

      if (!res) {
        const message = t('message.somethingWrong');
        setDataCoupon({loading: false, isError: true, errMessage: message});
        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          loadingButtonOrder: false,
        });
        return {success: false, message};
      }

      const getError = getErrorGQL(res);
      if (getError.isError) {
        const message = getError.message;
        setDataCoupon({loading: false, isError: true, errMessage: message});
        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          loadingButtonOrder: false,
        });
        return {success: false, message};
      }

      // await onRefetchCoupons();
      setDataCoupon({loading: false, isError: false, errMessage: null});
      ctxCheckout?.setIsCart({
        ...ctxCheckout?.isCart,
        loadingButtonOrder: false,
      });
      return {success: true};
    } catch (error) {
      const message = t('message.somethingWrong');
      setDataCoupon({loading: false, isError: true, errMessage: message});
      ctxCheckout?.setIsCart({
        ...ctxCheckout?.isCart,
        loadingButtonOrder: false,
      });
      return {success: false, message};
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function refreshCartAndGoBack
   * @summary 刷新购物车（商品 + 价格小计）后再返回结账页
   * ---------------------------------------------------- *
   */
  const refreshCartAndGoBack = async () => {
    try {
      // 只刷新结账页展示数据：商品 + 价格小计 + 优惠券 chips
      await Promise.all([
        onRefreshCartItems(),
        onRefreshCartPrices(),
        onRefreshAppliedCoupon(),
      ]);
    } catch (error) {
      console.log('[EvoucherSelection] checkout cart refresh failed', error);
    }
    navigation.goBack();
  };

  const handleApply = async () => {
    if (confirmLoading) {
      return;
    }

    // 多选提交：已勾选券 + 未在券包中匹配到的初始券（如免费赠品/系统券，页面无法展示，保持不动）
    const selectedCodes = selectedVouchers
      .map(v => v?.code?.trim())
      .filter(Boolean);
    const mergedCodes = [...selectedCodes];
    pendingInitialRef.current.forEach(code => {
      if (!mergedCodes.some(c => c.toUpperCase() === code.toUpperCase())) {
        mergedCodes.push(code);
      }
    });

    if (mergedCodes.length === 0) {
      // No code selected - if user came with an existing coupon, remove it
      if (initialCouponCode) {
        setConfirmLoading(true);
        try {
          const result = await onRemoveCoupon(initialCouponCode);
          if (result?.success) {
            await refreshCartAndGoBack();
          } else {
            rxAppSnackbar({message: result?.message || t('message.somethingWrong')});
          }
        } catch (error) {
          const message = t('message.somethingWrong');
          rxAppSnackbar({message});
        } finally {
          setConfirmLoading(false);
        }
      }
      return;
    }

    // 与购物车已用券完全一致时无需重新提交，直接返回
    const isSameAsApplied =
      mergedCodes.length === allCoupons.length &&
      mergedCodes.every(code =>
        allCoupons.some(item => item?.toUpperCase() === code.toUpperCase()),
      );
    if (isSameAsApplied) {
      await refreshCartAndGoBack();
      return;
    }

    setConfirmLoading(true);
    try {
      const result = await onApplyCoupon(mergedCodes);

      if (result?.success) {
        await refreshCartAndGoBack();
        return;
      }

      const message = result?.message || t('cart_checkout.error.invalidCouponCode');
      rxAppSnackbar({message});
    } catch (error) {
      const message = error.message || t('message.somethingWrong');
      rxAppSnackbar({message});
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCopyCode = async (code, event) => {
    try {
      event.persist();

      await Clipboard.setString(code);

      setCopyTipStates(prev => ({...prev, [code]: true}));

      setTimeout(() => {
        setCopyTipStates(prev => ({...prev, [code]: false}));
      }, 3000);
    } catch (error) {
      console.log('Failed to copy voucher code');
    }
  };

  const handleShowVoucherDetails = voucher => {
    setSelectedVoucherDetails(voucher);
    setIsVoucherDetailsModalVisible(true);
  };

  const handleCloseVoucherDetailsModal = () => {
    setIsVoucherDetailsModalVisible(false);
    setSelectedVoucherDetails(null);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // 保留输入框中的筛选值（couponCode），刷新时重新应用
      const keyword = externalForm.getValues('couponCode') || '';
      setCurrentPage(1);
      await fetchCouponWallet({
        pageSize: 5,
        currentPage: 1,
        status: 'valid',
        couponCode: keyword,
      });
    } catch (error) {
      console.log('Failed to refresh voucher list');
    } finally {
      setRefreshing(false);
    }
  }, [fetchCouponWallet, externalForm]);

  // 下拉到底部加载更多
  const handleLoadMore = useCallback(() => {
    if (loading || refreshing || !hasMore || !paginationInfo) {
      return;
    }
    const totalPages = Math.ceil(
      paginationInfo.totalCount / paginationInfo.pageSize,
    );
    if (currentPage >= totalPages) {
      return;
    }
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchCouponWallet({
      pageSize: paginationInfo.pageSize || 5,
      currentPage: nextPage,
      status: 'valid',
      // 翻页保持搜索过滤条件，避免追加未过滤的券
      couponCode: externalForm.getValues('couponCode') || '',
    });
  }, [
    loading,
    refreshing,
    hasMore,
    paginationInfo,
    currentPage,
    fetchCouponWallet,
    externalForm,
  ]);

  const formatDate = dateString => {
    if (!dateString) {
      return '';
    }
    const date = new Date(dateString);
    return date
      .toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      .replace(/\//g, '.');
  };

    const clearInput = () => {
    externalForm.setValue('couponCode', '');
    handleSearch('');
  };


  const renderVoucherCard = useCallback(({item, index}) => {
    const voucher = item;
    const isUsed = voucher.status === 'used';

    return (
      <View
        key={`voucher-${index}`}
        style={[styles.voucherCard, isUsed && styles.voucherCardUsed]}>
        <View style={styles.titleRow}>
          <Text
            style={styles.discountTitle}
            numberOfLines={1}
            ellipsizeMode="tail">
            {voucher.name || ''}
          </Text>

          {!isUsed && (
            <TouchableOpacity
              style={styles.checkmarkButton}
              onPress={() => handleVoucherSelect(voucher)}>
              {selectedVouchers.some(
                v => v.code?.toUpperCase() === voucher.code?.toUpperCase(),
              ) ? (
                <View style={styles.checkmarkSelected}>
                  <Icon name="checkmark-sharp" size={18} color="#FFFFFF" />
                </View>
              ) : (
                <View style={styles.checkmarkUnselected} />
              )}
            </TouchableOpacity>
          )}

          {isUsed && <View style={styles.checkmarkUnselected} />}
        </View>

        <Text style={styles.productDescription}>
          {voucher.description || ''}
        </Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={() => !isUsed && handleShowVoucherDetails(voucher)}
            disabled={isUsed}>
            <Text
              style={[styles.detailsLink, isUsed && styles.detailsLinkUsed]}>
              Details
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.promoCodeButton,
              isUsed && styles.promoCodeButtonUsed,
            ]}
            onPress={event => !isUsed && handleCopyCode(voucher.code, event)}
            disabled={isUsed}>
            <Text
              style={[
                styles.promoCodeText,
                isUsed && styles.promoCodeTextUsed,
              ]}>
              {voucher.code}
            </Text>
            <CopyCodeIcon
              width={16}
              height={16}
              color={isUsed ? '#999' : '#FF8200'}
            />
            {copyTipStates[voucher.code] && !isUsed && (
              <View style={styles.copyTip}>
                <View style={styles.copyTipArrow} />
                <Text style={styles.copyTipText}>Code copied</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.innerCircleLeft} />
          <Svg style={styles.dashedLineSvg} width="100%" height={1}>
            <Defs>
              <LinearGradient
                id={`dashedGrad-${voucher.code}-${index}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%">
                <Stop offset="50%" stopColor="#E0E0E0" />
              </LinearGradient>
            </Defs>
            <Line
              x1="0"
              y1="0"
              x2="100%"
              y2="0"
              stroke={`url(#dashedGrad-${voucher.code}-${index})`}
              strokeWidth={3}
              strokeDasharray="7"
            />
          </Svg>
          <View style={styles.innerCircleRight} />
        </View>

        <Text style={[styles.validDate, isUsed && styles.validDateUsed]}>
          Valid date: {formatDate(voucher.from_date)} -{' '}
          {formatDate(voucher.to_date)}
        </Text>
      </View>
    );
  },[selectedVouchers, copyTipStates, handleVoucherSelect, handleShowVoucherDetails, handleCopyCode, formatDate]);

    /**
     * ---------------------------------------------------- *
     * @const {forms}
     * @summary for generate form builder object
     * ---------------------------------------------------- *
     */
    const forms = [
      {
        name: 'couponCode',
        type: FORM_FIELD.INPUT,
        defaultValue: '',
        autoCapitalize: 'none',
        rules: {},
        placeholder: t('cart_checkout.enterCouponCode'),
        textStyleProp: {
          fontSize: 14,
          padding: 0,
          height: 40,
        },
        outlineStyle: {
          borderColor: isInputFocused ? Colors.PRIMARY : '#eee',
          borderRadius: 8,
        },
        success: dataCoupon.successMessage,
        inputRightCustom: searchKeywordValue ? (
          <TextInput.Icon
            onPress={clearInput}
            icon={ClearIconComponent}
            forceTextInputFocus={false}
          />
        ) : null,
      },
    ];

  const displayData = useMemo(()=> {
    return  allVouchers && allVouchers.length > 0 ? allVouchers : [];
  }, [allVouchers]);

  const renderFooter = () => {
    if (loading && allVouchers.length > 0) {
      return (
        <View
          style={{
            paddingVertical: 8,
            alignItems: 'center',
            marginBottom: 24, // 让 loading 效果整体稍微往上移一点
          }}>
          <ActivityIndicator size="small" color="#FF8200" />
        </View>
      );
    }
    return <View style={{height: 0}} />;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('@app/assets/images/arrow_back.png')}
            style={styles.backButton}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vouchers</Text>
        <View style={styles.headerRight} />
      </View>

      <CustomView row horizontalStart backgroundColor={Colors.GRAY_SMOOTH} style={styles.searchContainer}>
        <CustomView flexNumber={1} paddingRight={12}>
          <Forms
            useFormExternal={externalForm}
            fields={forms}
            buttonTitle={t('cart_checkout.use')}
            loading={dataCoupon.loading}
            formContainerStyle={styles.formContainer}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
          />
        </CustomView>
        <CustomView width={100} height={36} marginTop={12}>
          <TouchableRipple
            style={{
              ...styles.btnApply,
              // 输入框无值时禁用，并置灰；校验/搜索中也禁用防止重复点击
              backgroundColor:
                !searchKeywordValue || dataCoupon.loading
                  ? Colors.GRAY_MEDIUM
                  : Colors.PRIMARY,
            }}
            disabled={!searchKeywordValue || dataCoupon.loading}
            onPress={() => handleSearch(externalForm.getValues('couponCode'))}>
            <Text bold style={{fontSize: 14}} color={Colors.WHITE}>
              {dataCoupon.loading ? <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 2 }} /> : t('cart_checkout.use')}
            </Text>
          </TouchableRipple>
        </CustomView>
      </CustomView>

      <FlatList
        style={styles.content}
        data={displayData}
        keyExtractor={(item, index) => `voucher-${index}`}
        renderItem={renderVoucherCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#FF8200']}
            tintColor="#FF8200"
          />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color="#FF8200" />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <NodataForCoupon />
              <Text style={{marginTop: 16}}>No Coupon at the moment</Text>
            </View>
          )
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.applyButton, confirmLoading && styles.applyButtonDisabled]}
          onPress={handleApply}
          disabled={confirmLoading}
          activeOpacity={selectedVouchers.length ? 0.7 : 1}>
          {confirmLoading && (<ActivityIndicator size="small" color="#fff" />)}
          <Text style={styles.applyButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>

      {selectedVoucherDetails && (
        <VoucherDetailsModal
          visible={isVoucherDetailsModalVisible}
          voucher={selectedVoucherDetails}
          onClose={handleCloseVoucherDetailsModal}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingBottom: 16,
    flexGrow: 1, // 让空状态在列表区域垂直居中
  },
  searchContainer: {
    paddingHorizontal: 12,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  formContainer: {
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  btnApply: {
    backgroundColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8.5,
    borderRadius: 8,
  },
  voucherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  discountTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8200',
    flex: 1,
    marginRight: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#000',
    marginTop: 8,
    marginBottom: 12,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  promoCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F8',
    paddingHorizontal: 13,
    paddingVertical: 4,
    borderRadius: 4,
    position: 'relative',
  },
  promoCodeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF8200',
    marginRight: 8,
  },
  detailsLink: {
    fontSize: 14,
    textDecorationLine: 'underline',
    color: '#FF8200',
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
    position: 'relative',
  },
  dashedLineSvg: {
    flex: 1,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  validDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 0,
    height: 14,
    lineHeight: 14,
  },
  checkmarkButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF8200',
    backgroundColor: '#FF8200',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkUnselected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 0,
    borderTopColor: 'transparent',
    backgroundColor: 'transparent',
  },
  applyButton: {
    backgroundColor: '#FF8200',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: '#FFB066',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyTip: {
    position: 'absolute',
    backgroundColor: '#666',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    top: 35,
    left: 0,
    minWidth: 80,
  },
  copyTipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  copyTipArrow: {
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -4,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 0,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: '#666',
  },
  innerCircleLeft: {
    position: 'absolute',
    top: -10,
    left: -24,
    width: 20,
    height: 20,
    backgroundColor: '#F5F5F5',
    zIndex: 1,
    borderRadius: 10,
    borderLeftWidth: 10,
    borderLeftColor: '#F5F5F5',
  },
  innerCircleRight: {
    position: 'absolute',
    top: -10,
    right: -24,
    width: 20,
    height: 20,
    backgroundColor: '#F5F5F5',
    zIndex: 1,
    borderRadius: 10,
    borderRightWidth: 10,
    borderRightColor: '#F5F5F5',
  },
  voucherCardUsed: {
    opacity: 0.4,
  },
  discountTitleUsed: {
    color: '#999',
  },
  productDescriptionUsed: {
    color: '#999',
  },
  promoCodeButtonUsed: {
    backgroundColor: '#E0E0E0',
    opacity: 0.7,
  },
  promoCodeTextUsed: {
    color: '#999',
  },
  detailsLinkUsed: {
    color: '#999',
    textDecorationLine: 'none',
  },
  validDateUsed: {
    color: '#999',
  },
  usedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF8200',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  usedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default EvoucherSelectionPage;
