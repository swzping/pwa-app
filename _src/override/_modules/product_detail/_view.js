import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  View,
} from 'react-native';

import Config from 'react-native-config';
import ImageView from 'react-native-image-viewing';
import {MD2Colors as ColorsPaper} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import Svg, {Path} from 'react-native-svg';
import FeatherIcon from 'react-native-vector-icons/Feather';

import {useNavigation} from '@react-navigation/native';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';

import {useLazyQuery, useReactiveVar} from '@apollo/client';
import FastImage from '@d11/react-native-fast-image';
import FlashSaleCountdownBar from '@root/_src/override/_modules/product_detail/atoms/FlashSaleCountdownBar';
import PriceRowBlock from '@root/_src/override/_modules/product_detail/atoms/PriceRowBlock/index';
import FlashSaleEndedModal from '@root/_src/override/components/FlashSaleEndedModal';
import {modules} from '@root/swift.config';

import AddReviewBlock from '@app/_modules/product_detail/atoms/AddReviewBlock';
import BundleProduct from '@app/_modules/product_detail/atoms/BundleProduct';
import ButtonAddToCart from '@app/_modules/product_detail/atoms/ButtonAddToCart';
import ConfigurableOptions from '@app/_modules/product_detail/atoms/ConfigurableOptions/index';
import ProductRecommend from '@app/_modules/product_detail/atoms/ProductRecommend';
import RelatedProducts from '@app/_modules/product_detail/atoms/RelatedProducts';
import styles, {descriptionStyle} from '@app/_modules/product_detail/styles';
import AtomRightCart from '@app/_modules/product_list/atoms/RightCart';
import {URL_RESOLVER} from '@app/_modules/product_list/services/schema';
import DiscountIcon from '@app/assets/svgs/DiscountIcon';
import FlashSaleBoltIcon from '@app/assets/svgs/FlashSaleBoltIcon';
import FlashSaleIcon from '@app/assets/svgs/FlashSaleIcon';
import SafeguardIcon from '@app/assets/svgs/SafeguardIcon';
import WarningTriangleIcon from '@app/assets/svgs/WarningTriangleIcon';
import CustomView from '@app/components/CustomView/index';
import Divider from '@app/components/Divider/index';
import NavBar from '@app/components/NavBar/index';
import VideoWidget from '@app/components/PageBuilder/atoms/VideoWidget';
import ProductBadges from '@app/components/ProductBadges';
import Rating from '@app/components/Rating';
import RenderHTML from '@app/components/RenderHTML';
import RenderIf from '@app/components/RenderIf/index';
import Sale from '@app/components/Sale';
import SocialShareBlock from '@app/components/SocialShareBlock/index';
import Text from '@app/components/Text';
import ToggleWishlist from '@app/components/ToggleWishlist';
import VariantPickerModal from '@app/components/VariantPickerModal';
import useVariantPicker from '@app/components/VariantPickerModal/useVariantPicker';
import {
  CART_ACTIONS,
  IN_STOCK,
  TYPENAME_BUNDLE,
  TYPENAME_CONFIGURABLE,
  USER_GUEST,
} from '@app/helpers/Constants';
import DateHelper from '@app/helpers/Date';
import {
  getFlashSalePageKey,
  isFlashSaleModalShownFor,
  markFlashSaleModalShown,
  markFlashSaleSilentRefreshed,
  notifyFlashSaleEndedRefreshed,
  shouldSilentRefreshFlashSale,
} from '@app/helpers/FlashSale';
import {Capitalize, numberFormat} from '@app/helpers/General';
import {navigateTo, navigateUrlToPage} from '@app/helpers/Navigation';
import useCarts from '@app/hooks/carts/useCarts';
import {usePreviousScreen} from '@app/hooks/useNavigationTracking';
import {rxAppLoading, rxCartQty} from '@app/services/cache';
import {CmsStyles, Colors, Mixins} from '@app/styles';
import {MAX_HEIGHT} from '@app/styles/mixins';
import {trackViewSkuPdp} from '@app/track';

export const WishListButton = props => {
  return <ToggleWishlist {...props} />;
};

const PdpLoadingOverlay = ({visible}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      // fade in - also softens the spinner pop-in on fast (cached) loads
      setMounted(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    } else {
      // fade out before unmounting, never abrupt
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(({finished}) => {
        if (finished) {
          setMounted(false);
        }
      });
    }
  }, [visible, opacity]);

  if (!mounted) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity,
        backgroundColor: 'rgba(255,255,255,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <ActivityIndicator size="large" color={Colors.PRIMARY} />
    </Animated.View>
  );
};

const ProductDetailScreen = ({
  t,
  loading,
  refreshing,
  isProductNotFound,
  productCrosssellLoading,
  product,
  relatedProducts,
  recommendProducts,
  userType,
  productReviews,
  totalReview,
  refetchProductReviews,
  refetchWishlist,
  // getPriceRange,
  getPriceCurrency,
  // getPriceRegularValue,
  getPriceFinalValue,
  // getDiscountPercent,
  isProductReady,
  imageUrl,
  promoProduct,
  // brandProduct,
  // skuProduct,
  starRatingProduct,
  visibleImageView,
  selectedVariant,
  selectedOptions,
  configurableFinalPrice,
  disabledAddToCart,
  // getMoreReviews,
  setSkuProduct,
  onItemClickPreviewImage,
  onNavigateToProductDetail,
  setSelectedVariant,
  selectedVariantOpt,
  setSelectedVariantOpt,
  setSelectedOptions,
  setBundleItemsCount,
  setDisabledAddToCart,
  onPressCart,
  bundlePriceCustomization,
  setBundlePriceCustomization,
  refetchProduct,
  route,
  handleRefreshPage,
  onNotifyMe,
  priceProps,
}) => {
  const fromScreen = usePreviousScreen();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [onGetResolver] = useLazyQuery(URL_RESOLVER, {fetchPolicy: 'no-cache'});

  const onPressBrandInfo = async () => {
    const rawUrl = product?.brand_info?.category_url
      ?.replace(/\.html$/, '')
      .replace(/^\//, '');
    if (!rawUrl) {
      return;
    }
    try {
      rxAppLoading(true);
      const res = await onGetResolver({
        variables: {url: `${rawUrl}.html`},
      });
      rxAppLoading(false);

      navigateUrlToPage({
        t,
        fullUrl: `${rawUrl}.html`,
        type: res?.data?.urlResolver?.type,
        id: res?.data?.urlResolver?.id,
        url_key: res?.data?.urlResolver?.relative_url?.replace('.html', ''),
      });
    } catch (error) {
      console.log('[err] pdp brand link', error);
    }
  };
  const [showFlashSaleEndedModal, setShowFlashSaleEndedModal] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState([]);

  const skuModalRef = useRef(null);

  const showGwp = product?.is_gwp === true;

  const showDiscountRibbon = Number(product?.discount_percentage) > 0;

  const isVariantProduct = product?.__typename === TYPENAME_CONFIGURABLE;

  // 变体商品的闪购信息（倒计时/图标）挂在被选中的子 variant 上，
  // 非变体商品则直接取父商品自身字段。
  const flashSaleStartDate =
    (isVariantProduct
      ? selectedVariant?.product?.special_from_date
      : product?.special_from_date) ?? null;
  const flashSaleEndDate =
    (isVariantProduct
      ? selectedVariant?.product?.special_to_date
      : product?.special_to_date) ?? null;

  const rawSpecialToDate = flashSaleEndDate;

  const isFlashSale = useMemo(() => {
    if (isVariantProduct) {
      return selectedVariant?.product?.is_flash_sale === 1;
    }
    return product?.is_flash_sale === 1;
  }, [selectedVariant, product]);

  const specialToDate = useMemo(() => {
    if (!rawSpecialToDate) {
      return null;
    }
    return DateHelper.convertUTCToIndonesia(rawSpecialToDate);
  }, [rawSpecialToDate]);

  const normalizeDateValue = value => {
    if (!value) {
      return null;
    }
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }
    if (typeof value === 'string') {
      const normalized = value.includes(' ') ? value.replace(' ', 'T') : value;
      const parsed = new Date(normalized);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  };

  const normalizedEndDate = useMemo(
    () => normalizeDateValue(specialToDate),
    [specialToDate],
  );

  const getRemainingMs = dateValue => {
    if (!dateValue) {
      return null;
    }
    const indonesiaTimeNow = DateHelper.getIndonesiaTimeNow();
    return Math.max(dateValue.getTime() - indonesiaTimeNow.getTime(), 0);
  };

  const [remainingMs, setRemainingMs] = useState(() =>
    getRemainingMs(normalizedEndDate),
  );

  const carouselRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const mountedRef = useRef(true);
  const hasShownEndedModalRef = useRef(false);
  const prevRemainingMsRef = useRef(null);
  // 本页面实例在「闪购结束刷新广播」中的唯一 key
  const flashSalePageKeyRef = useRef(getFlashSalePageKey('pdp'));

  const picker = useVariantPicker({
    modalRef: skuModalRef,
    onClose: () => skuModalRef.current?.dismiss(),
    onNotifyMe: () => {
      skuModalRef.current?.dismiss();
      onNotifyMe();
    },
  });

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (
      product?.name &&
      product?.sku &&
      ![undefined, null].includes(getPriceFinalValue)
    ) {
      trackViewSkuPdp({
        sku_name: product?.name,
        sku_id: product?.sku,
        sku_current_price: getPriceFinalValue,
        location_name: fromScreen,
      });
    }
  }, [product?.name, product?.sku, getPriceFinalValue]);

  useEffect(() => {
    hasShownEndedModalRef.current = false;
    prevRemainingMsRef.current = null;

    // 定时器防串扰：仅在商品详情页获得焦点时运行倒计时。
    // 详情页压在路由栈底（失焦）时若继续跑定时器，倒计时到点会先把
    // 弹框 state 置 true，等用户返回时再次弹窗（PLP/Cart/Checkout 同理）。
    // 失焦期间闪购结束的话，回到前台时本 effect 会重新执行并立即检查兜底。
    if (!isFocused || !isFlashSale || !normalizedEndDate) {
      setRemainingMs(
        isFlashSale && normalizedEndDate
          ? getRemainingMs(normalizedEndDate)
          : null,
      );
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      return;
    }

    // 异步竞态守卫：effect 被 cleanup（失焦/数据变化/卸载）之后，
    // 异步回调里不允许再弹窗
    let isActive = true;

    // 弹框全局去重：与其他 3 个页面共用 FLASH_SALE_MODAL_SHOWN 标记
    // （按闪购结束时间戳识别）：同一轮闪购任一页面已弹过，本页（含重新
    // 获得焦点时）不再重复弹；同一商品配置新一轮闪购后标记失效会重新弹
    const flashSaleEndMs = normalizedEndDate.getTime();
    const tryShowEndedModal = async () => {
      if (!isActive || !mountedRef.current) {
        return;
      }
      const alreadyShown = await isFlashSaleModalShownFor(flashSaleEndMs);
      if (!isActive || !mountedRef.current) {
        return;
      }
      if (alreadyShown) {
        hasShownEndedModalRef.current = true;
        return;
      }
      hasShownEndedModalRef.current = true;
      markFlashSaleModalShown(flashSaleEndMs);
      setShowFlashSaleEndedModal(true);
    };

    const initialRemaining = getRemainingMs(normalizedEndDate);
    prevRemainingMsRef.current = initialRemaining;

    const updateRemaining = () => {
      if (!mountedRef.current) {
        return;
      }
      const nextRemaining = getRemainingMs(normalizedEndDate);
      const prevRemaining = prevRemainingMsRef.current;
      prevRemainingMsRef.current = nextRemaining;
      setRemainingMs(nextRemaining);
      if (
        nextRemaining === 0 &&
        prevRemaining !== null &&
        prevRemaining > 0 &&
        isFlashSale &&
        !hasShownEndedModalRef.current
      ) {
        tryShowEndedModal();
      }
      if (nextRemaining === 0 && countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };

    updateRemaining();
    // 回到前台时倒计时可能已在失焦期间归零（prevRemaining 断档，
    // 过渡条件检测不到），这里兜底触发一次弹框检查（含全局去重）
    if (
      initialRemaining === 0 &&
      isFlashSale &&
      !hasShownEndedModalRef.current
    ) {
      tryShowEndedModal();
    }
    countdownIntervalRef.current = setInterval(updateRemaining, 1000);

    return () => {
      isActive = false;
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [isFocused, isFlashSale, normalizedEndDate]);

  const formattedCountdown = useMemo(() => {
    if (remainingMs == null || remainingMs === 0) {
      return null;
    }
    const totalSeconds = Math.floor(remainingMs / 1000);
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60)
      .toString()
      .padStart(2, '0');
    return `${hours} : ${minutes} : ${seconds}`;
  }, [remainingMs]);

  const showFlashSaleBadge = isFlashSale && formattedCountdown !== null;
  const showFlashSaleCountdown =
    showFlashSaleBadge && Boolean(flashSaleEndDate);

  /**
   * Flash Sale弹窗点击「刷新」：刷新当前商品数据，并广播通知其他页面
   * （PLP/Cart/Checkout）回到前台时静默刷新
   */
  const handleFlashSaleModalRefresh = useCallback(() => {
    // 广播：其他 3 个页面重新获得焦点时各自静默刷新一次
    notifyFlashSaleEndedRefreshed();
    // 本页立即刷新，并标记本页已消费本次广播（返回本页时不重复刷新）
    markFlashSaleSilentRefreshed(flashSalePageKeyRef.current);
    handleRefreshPage();
  }, [handleRefreshPage]);

  const [activeSection, setActiveSection] = useState('description');
  const [activeSlide, setActiveSlide] = useState(0);
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
  // bottom sheet scroll metrics for custom scrollbar
  const [scrollContainerHeight, setScrollContainerHeight] = useState(0);
  const [scrollContentHeight, setScrollContentHeight] = useState(1);
  const [scrollOffsetY, setScrollOffsetY] = useState(0);
  // sizing to cap visible items to 4
  const [modalContainerHeight, setModalContainerHeight] = useState(0);
  const [headerBlockHeight, setHeaderBlockHeight] = useState(0);
  const [firstItemHeight, setFirstItemHeight] = useState(0);

  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showStrickyHeader, setShowStrickyHeader] = useState(false);

  const [expandProductDescription, setExpandProductDescription] =
    useState(false);
  const [expandedHowToUseSections, setExpandedHowToUseSections] =
    useState(false);
  // const [isProductDesriptionShowMore, setIsProductDesriptionShowMore] = useState(false);
  const [isHowToUseShowMore, setIsHowToUseShowMore] = useState(false);

  const [productDescriptionContent, setProductDescriptionContent] =
    useState('');
  const [howToUseContent, setHowToUseContent] = useState('');
  // ---- GWP from cart API ----
  const {getFreeGiftRules} = useCarts({});
  const [giftItems, setGiftItems] = useState([]);
  const [gwpProgress, setGwpProgress] = useState(0);
  const [bannerParts, setBannerParts] = useState({
    before: 'Purchase ',
    highlightAmount: 'IDR 1,500,000',
    middle: '',
    highlightQty: '',
    after: ' more to get free gifts !',
  });
  const [isEligibleBanner, setIsEligibleBanner] = useState(false);
  const [gwpDetail, setGwpDetail] = useState(null);
  const [gwpItemsRaw, setGwpItemsRaw] = useState([]);
  const [bannerPayload, setBannerPayload] = useState(null);
  const [isGwpLoading, setIsGwpLoading] = useState(false);
  const [isGwpOptimisticUpdate, setIsGwpOptimisticUpdate] = useState(false);

  const cartQty = useReactiveVar(rxCartQty);
  const cartQtyPrevRef = useRef(cartQty);
  const cartQtyRefreshTimer = useRef(null);
  useEffect(() => {
    if (!showGwp) {
      return;
    }
    if (typeof cartQty !== 'number') {
      return;
    }
    if (cartQtyPrevRef.current === cartQty) {
      return;
    }
    const prev =
      typeof cartQtyPrevRef.current === 'number' ? cartQtyPrevRef.current : 0;
    const isDecrease = cartQty < prev;
    if (cartQtyRefreshTimer.current) {
      clearTimeout(cartQtyRefreshTimer.current);
    }
    // Don't set loading here if there's already an optimistic update in progress
    if (!isGwpOptimisticUpdate) {
      setIsGwpOptimisticUpdate(false);
      setIsGwpLoading(true);
    }
    cartQtyRefreshTimer.current = setTimeout(() => {
      refetchGwpData(cartQty, false, isDecrease);
    }, 500);
    cartQtyPrevRef.current = cartQty;
    return () => {
      if (cartQtyRefreshTimer.current) {
        clearTimeout(cartQtyRefreshTimer.current);
      }
    };
  }, [cartQty, showGwp, refetchGwpData, isGwpOptimisticUpdate]);

  const refetchGwpData = useCallback(
    async (quantity, isOptimistic = false, isDecrease = false) => {
      if (!showGwp) {
        return;
      }

      if (
        !isDecrease &&
        bannerPayload &&
        bannerPayload.missing_eligible_qty === 0 &&
        bannerPayload.missing_eligible_amount === 0
      ) {
        // Already eligible, but still need to handle loading state
        if (isOptimistic) {
          setIsGwpOptimisticUpdate(true);
          setIsGwpLoading(true);
          // Set a timeout to stop loading since no API call will be made
          setTimeout(() => {
            setIsGwpLoading(false);
            setIsGwpOptimisticUpdate(false);
          }, 100);
        } else {
          // Non-optimistic call when already eligible - just ensure loading is stopped
          setIsGwpLoading(false);
          setIsGwpOptimisticUpdate(false);
        }
        return;
      }

      if (isOptimistic) {
        setIsGwpOptimisticUpdate(true);
        setIsGwpLoading(true);
        return;
      }

      setIsGwpOptimisticUpdate(false);
      setIsGwpLoading(true);
      try {
        const rules = await getFreeGiftRules?.();
        if (Array.isArray(rules) && rules.length > 0) {
          const rule = rules[0];
          const p = Number(rule?.progress_bar ?? 0);
          setGwpProgress(Math.min(isNaN(p) ? 0 : p, 100));

          const from = rule?.detail?.event_time?.from_date ?? '';
          const to = rule?.detail?.event_time?.to_date ?? '';
          const mapped = (rule?.items ?? []).map(it => {
            const salableQty = it?.stock_item?.salable_qty ?? 0;
            const inStock = it?.stock_status === 'IN_STOCK' && salableQty > 0;
            const originalAmount = it?.price?.regularPrice?.amount?.value ?? 0;
            const currency = it?.price?.regularPrice?.amount?.currency ?? 'IDR';
            const formattedOriginal = numberFormat(
              currency,
              originalAmount,
              ',',
              2,
            );
            const freePrice = numberFormat(currency, 0);
            return {
              id: String(it?.id ?? it?.sku ?? Math.random()),
              name: it?.name ?? '',
              sku: it?.sku ?? '',
              url_key: it?.url_key ?? '',
              price: freePrice,
              originalPrice: formattedOriginal,
              stock: salableQty,
              stock_info: '*Limited stock available',
              image: it?.image?.url ?? '',
              is_in_stock: inStock,
              event_time: `${from}${to ? ' - ' + to : ''}`,
            };
          });
          if (mapped.length > 0) {
            setGiftItems(mapped);
          }
          setGwpDetail(rule?.detail || null);
          setGwpItemsRaw(Array.isArray(rule?.items) ? rule.items : []);
          setBannerPayload({
            notification_message: rule?.notification_message,
            missing_eligible_qty: rule?.missing_eligible_qty,
            missing_eligible_amount: rule?.missing_eligible_amount,
            progress_bar: rule?.progress_bar,
            is_eligible: rule?.is_eligible,
          });
          const missingAmount = Number(rule?.missing_eligible_amount ?? 0);
          const missingQty = Number(rule?.missing_eligible_qty ?? 0);
          const isEligible =
            !!rule?.is_eligible || (missingAmount <= 0 && missingQty <= 0);
          setIsEligibleBanner(isEligible);
          if (isEligible) {
            setBannerParts({
              before: 'You just get free gifts!',
              highlightAmount: '',
              middle: '',
              highlightQty: '',
              after: '',
            });
          } else if (missingAmount > 0 && missingQty > 0) {
            const amt = numberFormat('IDR', missingAmount, ',', 0);
            setBannerParts({
              before: 'Purchase ',
              highlightAmount: amt,
              middle: ' and ',
              highlightQty: `${missingQty} ${
                missingQty === 1 ? 'product' : 'products'
              }`,
              after: ' more to get free gifts !',
            });
          } else if (missingAmount > 0) {
            const amt = numberFormat('IDR', missingAmount, ',', 0);
            setBannerParts({
              before: 'Purchase ',
              highlightAmount: amt,
              middle: '',
              highlightQty: '',
              after: ' more to get free gifts !',
            });
          } else {
            // only qty remaining
            setBannerParts({
              before: 'Purchase ',
              highlightAmount: '',
              middle: '',
              highlightQty: `${missingQty} ${
                missingQty === 1 ? 'product' : 'products'
              }`,
              after: ' more to get free gifts !',
            });
          }
        }
      } catch (e) {
      } finally {
        setIsGwpLoading(false);
      }
    },
    [showGwp, getFreeGiftRules],
  );

  const showVariantPopup = action => {
    const variantToUse = Object.keys(selectedVariant ?? {}).length
      ? selectedVariant
      : product?.variants[0];
    setSelectedVariant(variantToUse);

    picker.openSync({
      product,
      action,
      initVariant: variantToUse,
      initVariantOpt:
        variantToUse?.attributes?.map(attr => ({
          uid: attr.uid,
          code: attr.code,
        })) ?? [],
    });
  };

  // FooterComponent for ImageViewer
  const FooterComponent = useCallback(
    () => (
      <RenderIf condition={userType !== USER_GUEST}>
        <WishListButton
          styleProp={{
            backgroundColor: Colors.BLACK,
          }}
          item={product}
          productId={product?.id}
          wishlistItemId={product.wishlistId}
          productName={product.name}
          productSku={product.sku}
          productCurrency={isProductReady ? getPriceCurrency : ''}
          productPrice={isProductReady ? getPriceFinalValue : 0}
          callback={refetchWishlist}>
          <CustomView
            horizontalCenter
            verticalCenter
            padding={10}
            width={Mixins.MAX_WIDTH}
            backgroundColor={Colors.BLACK}>
            <CustomView
              horizontalCenter
              verticalCenter
              paddingVertical={10}
              paddingHorizontal={20}
              marginVertical={20}
              backgroundColor={Colors.PRIMARY}
              width={200}
              BorderRadius={5}>
              <Text white bold>
                {product.wishlistId
                  ? t('product_detail.removeWishlist')
                  : t('product_detail.addWishlist')}
              </Text>
            </CustomView>
          </CustomView>
        </WishListButton>
      </RenderIf>
    ),
    [
      userType,
      product,
      isProductReady,
      getPriceCurrency,
      getPriceFinalValue,
      refetchWishlist,
      t,
    ],
  );

  useEffect(() => {
    (async () => {
      try {
        const rules = await getFreeGiftRules?.();
        if (Array.isArray(rules) && rules.length > 0) {
          const rule = rules[0];
          // progress bar
          const p = Number(rule?.progress_bar ?? 0);
          setGwpProgress(Math.min(isNaN(p) ? 0 : p, 100));

          const from = rule?.detail?.event_time?.from_date ?? '';
          const to = rule?.detail?.event_time?.to_date ?? '';
          const mapped = (rule?.items ?? []).map(it => {
            const salableQty = it?.stock_item?.salable_qty ?? 0;
            const inStock = it?.stock_status === 'IN_STOCK' && salableQty > 0;
            const originalAmount = it?.price?.regularPrice?.amount?.value ?? 0;
            const currency = it?.price?.regularPrice?.amount?.currency ?? 'IDR';
            const formattedOriginal = numberFormat(
              currency,
              originalAmount,
              ',',
              2,
            );
            const freePrice = numberFormat(currency, 0);
            return {
              id: String(it?.id ?? it?.sku ?? Math.random()),
              name: it?.name ?? '',
              sku: it?.sku ?? '',
              url_key: it?.url_key ?? '',
              price: freePrice,
              originalPrice: formattedOriginal,
              stock: salableQty,
              stock_info: '*Limited stock available',
              image: it?.image?.url ?? '',
              is_in_stock: inStock,
              event_time: `${from}${to ? ' - ' + to : ''}`,
            };
          });
          if (mapped.length > 0) {
            setGiftItems(mapped);
          }
          setGwpDetail(rule?.detail || null);
          setGwpItemsRaw(Array.isArray(rule?.items) ? rule.items : []);
          setBannerPayload({
            notification_message: rule?.notification_message,
            missing_eligible_qty: rule?.missing_eligible_qty,
            missing_eligible_amount: rule?.missing_eligible_amount,
            progress_bar: rule?.progress_bar,
            is_eligible: rule?.is_eligible,
          });
          // banner text parts based on missing values
          const missingAmount = Number(rule?.missing_eligible_amount ?? 0);
          const missingQty = Number(rule?.missing_eligible_qty ?? 0);
          const isEligible =
            !!rule?.is_eligible || (missingAmount <= 0 && missingQty <= 0);
          setIsEligibleBanner(isEligible);
          if (isEligible) {
            setBannerParts({
              before: 'You just get free gifts!',
              highlightAmount: '',
              middle: '',
              highlightQty: '',
              after: '',
            });
          } else if (missingAmount > 0 && missingQty > 0) {
            const amt = numberFormat('IDR', missingAmount, ',', 0);
            setBannerParts({
              before: 'Purchase ',
              highlightAmount: amt,
              middle: ' and ',
              highlightQty: `${missingQty} ${
                missingQty === 1 ? 'product' : 'products'
              }`,
              after: ' more to get free gifts !',
            });
          } else if (missingAmount > 0) {
            const amt = numberFormat('IDR', missingAmount, ',', 0);
            setBannerParts({
              before: 'Purchase ',
              highlightAmount: amt,
              middle: '',
              highlightQty: '',
              after: ' more to get free gifts !',
            });
          } else {
            setBannerParts({
              before: 'Purchase ',
              highlightAmount: '',
              middle: '',
              highlightQty: `${missingQty} ${
                missingQty === 1 ? 'product' : 'products'
              }`,
              after: ' more to get free gifts !',
            });
          }
        }
      } catch (e) {}
    })();
  }, []);

  // const tabRef = useRef(null);
  // const [tabPosition, setTabPostion] = useState(0);

  const scrollRef = useRef(null);
  const descriptionRef = useRef(null);
  const [descriptionPositionY, setDescriptionPositionY] = useState(0);
  const howToUseRef = useRef(null);
  const [howToUseRefPositionY, setHowtoUsePositionY] = useState(0);
  const reviewsRef = useRef(null);
  const [reviewsPositionY, setReviewsPositionY] = useState(0);
  const [statusBarHeight, setStatusBarHeight] = useState(0); // 记录屏幕高度 除去状态栏的高度 和 头部
  const insets = useSafeAreaInsets();
  const progressWidth = `${gwpProgress}%`;
  const bannerTokens = useMemo(() => {
    if (isEligibleBanner) {
      return [{text: 'You just get free gifts!', highlight: false}];
    }
    const arr = [];
    if (bannerParts.before) {
      arr.push({text: bannerParts.before, highlight: false});
    }
    if (bannerParts.highlightAmount) {
      arr.push({text: ` ${bannerParts.highlightAmount}`, highlight: true});
    }
    if (bannerParts.middle) {
      arr.push({text: ` ${bannerParts.middle}`, highlight: false});
    }
    if (bannerParts.highlightQty) {
      arr.push({text: ` ${bannerParts.highlightQty}`, highlight: true});
    }
    if (bannerParts.after) {
      arr.push({text: ` ${bannerParts.after}`, highlight: false});
    }
    return arr;
  }, [bannerParts, isEligibleBanner]);
  const screenWidth = Dimensions.get('window').width;
  const giftItemWidth = giftItems.length === 1 ? screenWidth - 40 : 320;

  const HEADER_HEIGHT = 56; //头部UI高度
  const STICKY_HEADER_HEIGHT = 48; //置顶UI高度
  const scrollY = useRef(new Animated.Value(0)).current;

  const productGallery = useMemo(() => {
    let first = product?.media_gallery || [];

    if (first.length < 1) {
      first = [
        {
          label: '',
          url: imageUrl ?? 'https://fakeimg.pl/600x500?text=No+Image',
        },
      ];
    } else {
      first = [
        ...first
          .filter(item => item.__typename === 'ProductVideo')
          .map(item => ({...item, url: item.url?.split('?')?.[0]})),
        ...first.filter(item => item.__typename === 'ProductImage'),
      ];
    }

    const gallery = {
      first,
    };

    product?.variants?.forEach(variant => {
      const uid = variant.product?.uid;

      if (!uid) {
        return;
      }

      gallery[uid] =
        variant.product?.media_gallery?.map(image => ({
          ...image,
          uid,
          url: image.url,
        })) ?? [];
    });

    return gallery;
  }, [product, imageUrl]);

  const curVariantLabel = useMemo(() => {
    const found = selectedVariant?.attributes?.find(
      attr => attr.code === 'oms_variant',
    );
    return found?.label || t('product_detail.chooseVariant');
  }, [selectedVariant]);

  const offers = useMemo(() => {
    if (product?.__typename === TYPENAME_CONFIGURABLE) {
      return selectedVariant?.product?.offers;
    }
    return product?.offers;
  }, [product, selectedVariant]);

  // item price for firebase event
  const itemPrice =
    product.__typename === TYPENAME_BUNDLE
      ? bundlePriceCustomization
      : isVariantProduct
      ? configurableFinalPrice
      : getPriceFinalValue;

  const stockLabel =
    product?.stock_status === IN_STOCK
      ? t('product_detail.inStock')
      : t('product_detail.oos');

  const isProductOutOfStock = product?.stock_status !== IN_STOCK;

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({y: 0, animated: true});
  };

  const scrollToDescription = () => {
    scrollRef.current?.scrollTo({y: descriptionPositionY, animated: true});
  };

  const scrollToHowToUse = () => {
    scrollRef.current?.scrollTo({y: howToUseRefPositionY, animated: true});
  };

  const scrollToReview = () => {
    scrollRef.current?.scrollTo({y: reviewsPositionY, animated: true});
  };
  const handleScroll = Animated.event(
    [{nativeEvent: {contentOffset: {y: scrollY}}}],
    {
      useNativeDriver: false,
      listener: event => {
        const offsetY = event.nativeEvent.contentOffset.y;
        updateActiveSection(offsetY);
        updateBackToTop(offsetY);
      },
    },
  );

  const updateActiveSection = offsetY => {
    if (offsetY >= descriptionPositionY) {
      setShowStrickyHeader(true);
      if (offsetY >= descriptionPositionY && offsetY < howToUseRefPositionY) {
        if (activeSection !== 'description') {
          setActiveSection('description');
        }
      } else if (
        offsetY >= howToUseRefPositionY &&
        offsetY < reviewsPositionY
      ) {
        if (activeSection !== 'how to use') {
          setActiveSection('how to use');
        }
      } else if (offsetY >= reviewsPositionY) {
        if (activeSection !== 'reviews') {
          setActiveSection('reviews');
        }
      }
    } else {
      if (showStrickyHeader) {
        setShowStrickyHeader(false);
      }
    }
  };

  const updateBackToTop = offsetY => {
    if (offsetY > MAX_HEIGHT * 1) {
      setShowBackToTop(true);
    } else {
      setShowBackToTop(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      // 静默刷新：其他页面的闪购结束弹框点击过「刷新」后，
      // 回到本页时静默刷新一次商品数据（闪购价已恢复原价）
      if (shouldSilentRefreshFlashSale(flashSalePageKeyRef.current)) {
        markFlashSaleSilentRefreshed(flashSalePageKeyRef.current);
        handleRefreshPage();
      }
      return () => {
        // 当页面失去焦点时隐藏按钮
        setShowBackToTop(false);
      };
    }, [handleRefreshPage]),
  );

  useEffect(() => {
    setStatusBarHeight(
      Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight,
    );
  }, [insets]);

  useEffect(() => {
    if (
      !loading &&
      product.sku &&
      product?.description?.html !== null &&
      product?.description?.html !== ''
    ) {
      // const descriptionhtmlContent = product?.description?.html;
      let finalHtmlBlock = product?.description?.html
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
      finalHtmlBlock = '<div>' + finalHtmlBlock + '</div>';
      setProductDescriptionContent(finalHtmlBlock);
    }
  }, [product?.description?.html]);

  useEffect(() => {
    if (
      !loading &&
      product.sku &&
      product?.how_to_use !== null &&
      product?.how_to_use !== ''
    ) {
      const howToUsehtmlContent = product?.how_to_use;

      const howtoUseparts = product?.how_to_use?.split('<br />', 4) || [];
      if (howtoUseparts.length > 3) {
        setIsHowToUseShowMore(true);
      }

      if (howtoUseparts.length > 3 || isHowToUseShowMore) {
        if (expandedHowToUseSections) {
          setHowToUseContent(howToUsehtmlContent);
        } else {
          setHowToUseContent(
            // howtoUseparts.slice(0, 3).join('<br />' + '<br/>...'),
            howToUsehtmlContent,
          );
        }
      } else {
        setHowToUseContent(howToUsehtmlContent);
      }
    }
  }, [expandedHowToUseSections, product?.how_to_use]);

  const renderDesriptionContent = () => {
    return (
      <CustomView>
        <RenderHTML
          htmlBlock={productDescriptionContent}
          tagsStyles={descriptionStyle}
        />
        <RenderIf condition={false}>
          <CustomView
            onPress={() =>
              setExpandProductDescription(!expandProductDescription)
            }
            flex
            horizontalCenter
            paddingHorizontal={10}>
            {expandProductDescription ? (
              <View style={{flexDirection: 'row'}}>
                <Text small_12 color={Colors.PRIMARY}>
                  Show Less
                </Text>
                <Image
                  style={{width: 16, height: 16}}
                  source={require('@app/assets/images/arrow_up.png')}
                />
              </View>
            ) : (
              <CustomView horizontalCenter row>
                <Text small_12 color={Colors.PRIMARY}>
                  Show More
                </Text>
                <Image
                  style={{width: 16, height: 16}}
                  source={require('@app/assets/images/arrow_down.png')}
                />
              </CustomView>
            )}
          </CustomView>
        </RenderIf>
      </CustomView>
    );
  };

  const renderHowtoUseContent = () => {
    return (
      <View>
        <RenderHTML
          tagsStyles={CmsStyles.tagStylesPrivacyPolicy}
          htmlBlock={howToUseContent}
          classesStyles={CmsStyles.classesStylesPrivacyPolicy}
        />
        <RenderIf condition={isHowToUseShowMore && false}>
          <CustomView
            onPress={() =>
              setExpandedHowToUseSections(!expandedHowToUseSections)
            }
            flex
            horizontalCenter
            paddingHorizontal={30}>
            {expandedHowToUseSections ? (
              <View style={{flexDirection: 'row'}}>
                <Text style={{fontSize: 12, color: Colors.PRIMARY}}>
                  Show Less
                </Text>
                <Image
                  style={{width: 16, height: 16}}
                  source={require('@app/assets/images/arrow_up.png')}
                />
              </View>
            ) : (
              <CustomView row>
                <Text style={{color: Colors.PRIMARY}}>Show More</Text>
                <Image
                  style={{width: 16, height: 16}}
                  source={require('@app/assets/images/arrow_down.png')}
                />
              </CustomView>
            )}
          </CustomView>
        </RenderIf>
      </View>
    );
  };

  const renderReviewsContent = productReviewsContent => {
    if (totalReview > 0) {
      return (
        <CustomView paddingHorizontal={20} paddingTop={10}>
          <CustomView spaceBetween row>
            <Text style={{fontSize: 18, fontWeight: 'bold'}}>
              {t('product_detail.reviews')}
            </Text>
            <RenderIf condition={totalReview > 2}>
              <TouchableOpacity onPress={goToProductReview}>
                <CustomView
                  row
                  horizontalCenter
                  style={{marginTop: Platform.OS === 'ios' ? 3 : 2}}>
                  <Text
                    style={{
                      fontSize: 12,
                      marginLeft: 5,
                      color: Colors.GRAY_DARK,
                    }}>
                    See More
                  </Text>
                  <Image
                    source={require('@app/assets/images/arrow_right_gray.png')}
                    style={{width: 16, height: 16}}
                  />
                </CustomView>
              </TouchableOpacity>
            </RenderIf>
          </CustomView>
          <CustomView flex row horizontalCenter marginVertical={16}>
            <CustomView marginRight={5}>
              <Rating sizeIcon={12} count={starRatingProduct} />
            </CustomView>
            <Text
              small
              color={Colors.BLACK}
              style={{paddingTop: Platform.OS === 'ios' ? 0 : 3}}>
              {starRatingProduct}
            </Text>
            <Text
              small
              color={Colors.BLACK}
              style={{
                marginLeft: 10,
                paddingTop: Platform.OS === 'ios' ? 0 : 3,
              }}>
              {totalReview} {t('product_detail.reviews')}
            </Text>
          </CustomView>
          {renderReviewItem(productReviewsContent)}
        </CustomView>
      );
    } else {
      return (
        <CustomView paddingHorizontal={30}>
          <Text>{t('product_detail.noReviews')}</Text>
        </CustomView>
      );
    }
  };

  const renderReviewItem = data => {
    return data.slice(0, 2).map((review, index) => {
      return (
        <CustomView paddingVertical={5} key={index}>
          <CustomView row spaceBetween>
            <Text style={{fontWeight: 'bold'}}>{review.nickname}</Text>
            <Text style={{fontSize: 12, color: Colors.GRAY_DARK}}>
              {formatDateNative(review.created_at)}
            </Text>
          </CustomView>
          <CustomView row marginVertical={8}>
            <CustomView marginRight={5}>
              <Rating sizeIcon={12} count={review.ratings[0]?.value} />
            </CustomView>
            <Text
              style={{
                color: Colors.BLACK,
                fontSize: 12,
                marginLeft: 5,
                marginTop: Platform.OS === 'ios' ? 1 : 3,
              }}>
              {review.ratings[0]?.value}
            </Text>
          </CustomView>
          <Text style={{color: Colors.GRAY_DARK}} numberOfLines={3}>
            {review.detail}
          </Text>
        </CustomView>
      );
    });
  };

  const formatDateNative = dateString => {
    const date = new Date(dateString);
    const day = date.getDate(); // 获取日
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const month = months[date.getMonth()]; // 获取月份并转换为英文缩写
    const year = date.getFullYear(); // 获取年

    return `${day} ${month} ${year}`; // 返回格式化后的日期
  };

  const goToProductReview = () => {
    navigateTo(modules.product_review.enable, modules.product_review.name, {
      skuProduct: product.sku,
    });
  };

  const measureView = () => {
    /**只测一次***/
    if (
      descriptionPositionY === 0 &&
      descriptionRef.current !== null &&
      howToUseRef.current !== null &&
      reviewsRef.current !== null
    ) {
      descriptionRef.current?.measure((x, y, width, height, pageX, pageY) => {
        setDescriptionPositionY(
          pageY - HEADER_HEIGHT - statusBarHeight - STICKY_HEADER_HEIGHT,
        );
      });

      howToUseRef.current?.measure((x, y, width, height, pageX, pageY) => {
        setHowtoUsePositionY(
          pageY - HEADER_HEIGHT - statusBarHeight - STICKY_HEADER_HEIGHT,
        );
      });

      reviewsRef.current?.measure((x, y, width, height, pageX, pageY) => {
        setReviewsPositionY(
          pageY - HEADER_HEIGHT - statusBarHeight - STICKY_HEADER_HEIGHT,
        );
      });
    }
  };

  const renderStrickyHeader = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
        }}>
        <TouchableOpacity
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            height: 48,
          }}
          onPress={scrollToDescription}>
          <Text
            numberOfLines={1}
            style={{
              fontWeight: activeSection === 'description' ? 'bold' : null,
              fontSize: 16,
              paddingLeft: 2,
              paddingRight: 2,
              color:
                activeSection === 'description' ? Colors.PRIMARY : Colors.BLACK,
            }}>
            {t('product_detail.itemDescription')}
          </Text>
          <View
            style={{
              height: 2,
              width: '100%',
              backgroundColor:
                activeSection === 'description' ? Colors.PRIMARY : Colors.WHITE,
              marginTop: 10,
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            height: 48,
          }}
          onPress={scrollToHowToUse}>
          <Text
            numberOfLines={1}
            style={{
              fontWeight: activeSection === 'how to use' ? 'bold' : null,
              fontSize: 16,
              paddingLeft: 2,
              paddingRight: 2,
              maxlines: 1,
              color:
                activeSection === 'how to use' ? Colors.PRIMARY : Colors.BLACK,
            }}>
            {t('product_detail.howToUse')}
          </Text>
          <View
            style={{
              height: 2,
              width: '100%',
              backgroundColor:
                activeSection === 'how to use' ? Colors.PRIMARY : Colors.WHITE,
              marginTop: 10,
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={scrollToReview}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            height: 48,
          }}>
          <Text
            numberOfLines={1}
            style={{
              fontWeight: activeSection === 'reviews' ? 'bold' : null,
              fontSize: 16,
              color:
                activeSection === 'reviews' ? Colors.PRIMARY : Colors.BLACK,
            }}>
            {t('product_detail.reviews')}
          </Text>
          <View
            style={{
              height: 2,
              width: '100%',
              backgroundColor:
                activeSection === 'reviews' ? Colors.PRIMARY : Colors.WHITE,
              marginTop: 10,
            }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderSectionItem = () => {
    return (
      <View>
        <View collapsable={false} ref={descriptionRef} style={{paddingTop: 10}}>
          {product?.description?.html !== '' ? (
            renderDesriptionContent()
          ) : (
            <CustomView paddingHorizontal={30}>
              <Text>{t('product_detail.notAvailableYet')}</Text>
            </CustomView>
          )}
        </View>

        <View
          style={{
            borderColor: ColorsPaper.grey200,
            borderBottomWidth: 1,
            marginTop: 10,
          }}
        />

        <View collapsable={false} ref={howToUseRef} style={{paddingTop: 10}}>
          {product?.how_to_use !== null ? (
            renderHowtoUseContent()
          ) : (
            <CustomView paddingHorizontal={30}>
              <Text>{t('product_detail.notAvailableYet')}</Text>
            </CustomView>
          )}
        </View>

        <View
          style={{
            borderColor: ColorsPaper.grey200,
            borderBottomWidth: 1,
            marginTop: 10,
          }}
        />

        <View collapsable={false} ref={reviewsRef}>
          {renderReviewsContent(productReviews)}
          <AddReviewBlock
            t={t}
            product={product}
            refetchProductReviews={refetchProductReviews}
          />
        </View>

        <View
          style={{
            borderColor: ColorsPaper.grey200,
            borderBottomWidth: 1,
            marginTop: 10,
          }}
        />
      </View>
    );
  };

  const _renderImageItem = ({item, index}) => {
    if (item.type === 'video') {
      return (
        <CustomView
          key={`pdp-video-slider${index}`}
          horizontalCenter
          verticalCenter
          style={styles.videoContainer}>
          {product.sale || showFlashSaleBadge || showDiscountRibbon ? (
            <CustomView
              style={{
                position: 'absolute',
                top: 16,
                left: 20,
                zIndex: 2,
                gap: 12,
              }}>
              {product.sale ? <Sale sale={product.sale} /> : null}
              {showFlashSaleBadge ? (
                <FlashSaleIcon width={67} height={67} />
              ) : null}
              {showDiscountRibbon ? (
                <CustomView>
                  <Text style={styles.discountText}>
                    {Math.floor(product?.discount_percentage)}
                    <Text style={{fontSize: 6, color: Colors.RED}}>%</Text>
                  </Text>
                  <DiscountIcon width={67} height={67} />
                </CustomView>
              ) : null}
            </CustomView>
          ) : null}
          <VideoWidget
            src={item.url}
            autoplay={false}
            useContainerHeight={false}
            product={product}
            activeIndex={activeSlide}
            currentIndex={index}
          />
        </CustomView>
      );
    }

    // 普通图片项
    return (
      <CustomView
        key={`pdp-image-slider${index}`}
        horizontalCenter
        verticalCenter
        onPress={() => onItemClickPreviewImage(item.url)}>
        {product.sale || showFlashSaleBadge || showDiscountRibbon ? (
          <CustomView
            style={{
              position: 'absolute',
              top: 16,
              left: 20,
              zIndex: 2,
              gap: 12,
            }}>
            {product.sale ? <Sale sale={product.sale} /> : null}
            {showFlashSaleBadge ? (
              <FlashSaleIcon width={67} height={67} />
            ) : null}
            {showDiscountRibbon ? (
              <CustomView>
                <Text style={styles.discountText}>
                  {Math.floor(product?.discount_percentage)}
                  <Text style={{fontSize: 6, color: Colors.RED}}>%</Text>
                </Text>
                <DiscountIcon width={67} height={67} />
              </CustomView>
            ) : null}
          </CustomView>
        ) : null}
        <RenderIf condition={item.url}>
          <FastImage
            key={`pdp-image-${index}`}
            style={styles.productImage}
            resizeMode={FastImage.resizeMode.contain}
            source={{
              uri: item.url,
              priority: FastImage.priority.normal,
              cache: FastImage.cacheControl.immutable,
            }}
          />
        </RenderIf>
        {isProductOutOfStock && (
          <View
            pointerEvents="none"
            style={[styles.outOfStockOverlay, styles.productOutOfStockOverlay]}>
            <Text style={styles.outOfStockText}>{t('product_detail.oos')}</Text>
          </View>
        )}
      </CustomView>
    );
  };

  const carouselStyle = {
    overflow: 'visible',
    paddingBottom: 25,
    backgroundColor: 'transparent',
  };

  const handleSnapToItem = index => {
    if (isVariantProduct) {
      const currUid = selectedGallery[index]?.uid;

      const current =
        product?.variants.find(item => {
          return item.product.uid === currUid;
        }) || {};

      setSelectedVariant(current);
      setSelectedVariantOpt(
        current.attributes?.map(item => ({uid: item.uid, code: item.code})) ||
          [],
      );
    }
    setActiveSlide(index);
  };

  const handleVariant = item => {
    const isSelected = selectedVariant?.product?.uid === item.product?.uid;

    if (isSelected) {
      setSelectedVariant(null);
      setSelectedVariantOpt([]);
      setSelectedGallery(productGallery.first);

      if (carouselRef.current) {
        carouselRef.current?.snapToItem(0, false);
        setActiveSlide(0);
      }

      return;
    }

    setSelectedVariant(item);

    setSelectedVariantOpt(
      item.attributes?.map(attr => ({
        uid: attr.uid,
        code: attr.code,
      })) || [],
    );

    if (!carouselRef.current) {
      return;
    }

    item.product?.uid && setSelectedGallery(productGallery[item.product.uid]);
    carouselRef.current?.snapToItem(0, false);
    setActiveSlide(0);
  };

  useEffect(() => {
    if (Object.keys(productGallery ?? {}).length === 0) {
      return;
    }

    setSelectedGallery(
      productGallery[selectedVariant?.product?.uid] ?? productGallery.first,
    );
  }, [productGallery, selectedVariant?.product?.uid]);

  useEffect(() => {
    if (
      Object.keys(picker?.selectedVariant ?? {}).length > 0 &&
      picker?.isButtonDisabled
    ) {
      handleVariant(picker.selectedVariant);
    }
  }, [picker?.selectedVariant, picker?.isButtonDisabled]);

  return (
    <>
      <NavBar
        useWhite
        useBack
        useShadow={false}
        childrenRight={<AtomRightCart onPressCart={onPressCart} />}
      />
      <View style={{flex: 1}}>
        <RenderIf condition={showStrickyHeader}>
          {renderStrickyHeader()}
        </RenderIf>
        <ScrollView
          ref={scrollRef}
          overScrollMode="never"
          style={styles.mainContainer}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={measureView}
          contentContainerStyle={{
            paddingBottom: 80,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <RenderIf condition={isProductNotFound}>
            <CustomView
              horizontalCenter
              verticalCenter
              marginTop={0.4 * Mixins.MAX_HEIGHT}>
              <Text>{t('product_detail.productNotFound')}</Text>
            </CustomView>
          </RenderIf>
          <RenderIf condition={!loading && product.sku}>
            <>
              <CustomView flex horizontalStart>
                <CustomView flex style={{position: 'relative'}}>
                  <Carousel
                    ref={carouselRef}
                    data={selectedGallery}
                    renderItem={_renderImageItem}
                    sliderWidth={Mixins.MAX_WIDTH}
                    itemWidth={Mixins.MAX_WIDTH}
                    itemHeight={Mixins.MAX_HEIGHT * 0.5}
                    onSnapToItem={handleSnapToItem}
                    containerCustomStyle={carouselStyle}
                  />
                  <Pagination
                    containerStyle={styles.sliderPaginationStyles}
                    dotsLength={selectedGallery.length}
                    activeDotIndex={activeSlide}
                    dotStyle={styles.sliderPaginationDot}
                    inactiveDotStyle={styles.sliderPaginationDotInactive}
                    inactiveDotOpacity={0.4}
                    inactiveDotScale={1}
                    dotContainerStyle={{
                      marginHorizontal: selectedGallery.length < 15 ? 5 : 1,
                    }}
                  />
                  <RenderIf
                    condition={
                      product?.stock_status &&
                      product?.stock_status !== IN_STOCK
                    }>
                    <CustomView
                      row
                      verticalCenter
                      style={{
                        width: Mixins.MAX_WIDTH,
                        backgroundColor: 'rgba(0, 0, 0, 0.51)',
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        marginTop: 4,
                        marginBottom: 42,
                        position: 'relative',
                        zIndex: 2,
                      }}>
                      <CustomView
                        width={24}
                        height={24}
                        marginRight={10}
                        style={{
                          borderRadius: 12,
                          backgroundColor: Colors.GRAY_SMOOTH5,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Svg
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg">
                          <Path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM12 13C11.4477 13 11 12.5523 11 12V8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8V12C13 12.5523 12.5523 13 12 13ZM11 16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12 15C11.4477 15 11 15.4477 11 16Z"
                            fill="white"
                          />
                        </Svg>
                      </CustomView>
                      <Text color={Colors.WHITE} style={{flex: 1}} bold>
                        We are temporarily out of stock. More inventory is
                        expected soon
                      </Text>
                    </CustomView>
                  </RenderIf>

                  {/*<RenderIf condition={brandProduct}>*/}
                  {/*  <Image*/}
                  {/*    source={require('@app/assets/images/guardian_official.png')}*/}
                  {/*    style={{*/}
                  {/*      width: 63,*/}
                  {/*      height: 63,*/}
                  {/*      position: 'absolute',*/}
                  {/*      resizeMode: 'contain',*/}
                  {/*      top: 10,*/}
                  {/*      left: 10,*/}
                  {/*    }}*/}
                  {/*  />*/}
                  {/*</RenderIf>*/}
                  <RenderIf condition={promoProduct}>
                    <View
                      style={{
                        backgroundColor: Colors.RED_LIGHT_1,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderTopRightRadius: 20,
                        borderBottomRightRadius: 20,
                        width: 189,
                        height: 33,
                        position: 'absolute',
                        resizeMode: 'contain',
                        bottom: Platform.OS === 'ios' ? 40 : 25,
                      }}>
                      <Text
                        style={{
                          color: Colors.WHITE,
                          fontSize: 18,
                          fontWeight: 'bold',
                        }}>
                        {promoProduct}
                      </Text>
                    </View>
                  </RenderIf>
                </CustomView>

                {/* product variants */}
                <RenderIf condition={isVariantProduct}>
                  <CustomView row marginTop={16} paddingHorizontal={20}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '500',
                        color: Colors.BLACK,
                      }}>
                      {curVariantLabel}
                    </Text>
                  </CustomView>
                  <FlatList
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      marginTop: 4,
                      paddingHorizontal: 20,
                    }}
                    horizontal
                    data={product.variants}
                    keyExtractor={item => item.product.sku}
                    renderItem={({item}) => {
                      if (!item.product.thumbnail?.url) {
                        return null;
                      }
                      return (
                        <TouchableOpacity
                          style={{position: 'relative'}}
                          onPress={() => handleVariant(item)}>
                          <Image
                            source={{uri: item.product.thumbnail?.url}}
                            style={{
                              borderRadius: 4,
                              width: 48,
                              height: 48,
                              marginRight: 12,
                              borderWidth: 2,
                              borderColor:
                                item.product?.sku ===
                                selectedVariant?.product?.sku
                                  ? Colors.PRIMARY
                                  : '#FFE7BA',
                            }}
                          />
                          <RenderIf
                            condition={item.product?.stock_status !== IN_STOCK}>
                            <CustomView
                              verticalCenter
                              width={56}
                              height={20}
                              style={{
                                position: 'absolute',
                                top: 14,
                                left: -4,
                                right: 0,
                                bottom: 0,
                                borderRadius: 26,
                                backgroundColor: '#808080',
                                zIndex: 1,
                              }}>
                              <Text
                                style={{
                                  color: Colors.WHITE,
                                  fontSize: 8,
                                  fontWeight: '500',
                                  textAlign: 'center',
                                }}>
                                Out of Stock
                              </Text>
                            </CustomView>
                          </RenderIf>
                          <RenderIf
                            condition={item.product?.is_flash_sale === 1}>
                            <CustomView
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                zIndex: 2,
                              }}>
                              <FlashSaleBoltIcon width={16} height={16} />
                            </CustomView>
                          </RenderIf>
                        </TouchableOpacity>
                      );
                    }}
                  />
                </RenderIf>

                {/* Flash Sale 倒计时条：位于变体小图下方、商品标题上方 */}
                <RenderIf condition={showFlashSaleCountdown}>
                  <CustomView
                    style={{
                      width: Mixins.MAX_WIDTH,
                      marginTop: 12,
                      marginBottom: 4,
                    }}>
                    <FlashSaleCountdownBar
                      startDate={flashSaleStartDate}
                      endDate={flashSaleEndDate}
                      isActive={showFlashSaleBadge}
                    />
                  </CustomView>
                </RenderIf>

                <CustomView
                  paddingHorizontal={20}
                  paddingVertical={10}
                  width={Mixins.MAX_WIDTH}>
                  {/*<RenderIf condition={brandProduct}>*/}
                  {/*  <Text bold>{brandProduct}</Text>*/}
                  {/*</RenderIf>*/}
                  <RenderIf condition={product?.brand_info?.name}>
                    <TouchableOpacity onPress={onPressBrandInfo}>
                      <Text style={styles.brandBy}>
                        {'by '}
                        <Text style={styles.brandName}>
                          {Capitalize(product?.brand_info?.name)}
                        </Text>
                      </Text>
                    </TouchableOpacity>
                  </RenderIf>
                  <Text style={styles.productName}>
                    {Capitalize(product.name)}
                  </Text>

                  <PriceRowBlock
                    key={priceProps?.product?.uid}
                    {...priceProps}
                    promoProduct={promoProduct}
                    configurableFinalPrice={configurableFinalPrice}
                    bundlePriceCustomization={bundlePriceCustomization}
                    stockLabel={stockLabel}
                  />
                  <RenderIf
                    condition={
                      product?.halal_indicator || product?.bpom_number
                    }>
                    <CustomView row marginTop={8} style={{gap: 16}}>
                      <RenderIf condition={!product?.halal_indicator}>
                        <CustomView row horizontalCenter style={{gap: 4}}>
                          <SafeguardIcon width={14} height={14} />
                          <Text style={styles.complianceText}>
                            {t('product_detail.halalCertified')}
                          </Text>
                        </CustomView>
                      </RenderIf>
                      <RenderIf condition={product?.bpom_number}>
                        <CustomView row horizontalCenter style={{gap: 4}}>
                          <SafeguardIcon width={14} height={14} />
                          <Text style={styles.complianceText}>
                            {t('product_detail.bpomNumber')} :{' '}
                            {product.bpom_number}
                          </Text>
                        </CustomView>
                      </RenderIf>
                    </CustomView>
                  </RenderIf>
                  <RenderIf condition={!!product?.allergens}>
                    <CustomView
                      row
                      horizontalCenter
                      marginTop={8}
                      style={{gap: 4}}>
                      <WarningTriangleIcon width={16} height={16} />
                      <Text style={styles.complianceText}>
                        {product.allergens}
                      </Text>
                    </CustomView>
                  </RenderIf>

                  {/*<CustomView row spaceBetween>*/}
                  {/*<CustomView flex>*/}
                  {/*  <Text small color={Colors.GRAY_DARK2}>*/}
                  {/*    SKU #{product.sku}*/}
                  {/*  </Text>*/}
                  {/*</CustomView>*/}
                  <CustomView flex row horizontalCenter marginVertical={4}>
                    <CustomView marginRight={10}>
                      <Rating sizeIcon={12} count={starRatingProduct} />
                    </CustomView>
                    <RenderIf condition={starRatingProduct > 0}>
                      <Text
                        small
                        color={Colors.BLACK}
                        style={{paddingTop: Platform.OS === 'ios' ? 0 : 5}}>
                        {starRatingProduct}
                      </Text>
                    </RenderIf>
                    <Text
                      small
                      color={Colors.BLACK}
                      style={{
                        marginLeft: 10,
                        paddingTop: Platform.OS === 'ios' ? 0 : 5,
                      }}>
                      {totalReview} {t('product_detail.reviews')}
                    </Text>
                  </CustomView>
                  {/*</CustomView>*/}
                  {/*<Divider borderWidth={3} />*/}
                  <RenderIf condition={false}>
                    <ConfigurableOptions
                      t={t}
                      product={product}
                      setSku={setSkuProduct}
                      setSelectedVariant={setSelectedVariant}
                      selectedVariantOpt={selectedVariantOpt}
                      setSelectedVariantOpt={setSelectedVariantOpt}
                      setDisabledAddToCart={setDisabledAddToCart}
                    />
                    <Divider borderWidth={3} />
                  </RenderIf>
                  <RenderIf condition={product.__typename === TYPENAME_BUNDLE}>
                    <BundleProduct
                      t={t}
                      product={product}
                      selectedOptions={selectedOptions}
                      setSelectedOptions={setSelectedOptions}
                      setBundleItemsCount={setBundleItemsCount}
                      setBundlePriceCustomization={setBundlePriceCustomization}
                      setDisabledAddToCart={setDisabledAddToCart}
                    />
                    <Divider borderWidth={3} />
                  </RenderIf>
                  {/*<PriceRowBlock*/}
                  {/*  product={product}*/}
                  {/*  getPriceRange={getPriceRange}*/}
                  {/*  getPriceCurrency={getPriceCurrency}*/}
                  {/*  getPriceRegularValue={getPriceRegularValue}*/}
                  {/*  getPriceFinalValue={getPriceFinalValue}*/}
                  {/*  getDiscountPercent={getDiscountPercent}*/}
                  {/*  promoProduct={promoProduct}*/}
                  {/*  configurableFinalPrice={configurableFinalPrice}*/}
                  {/*  bundlePriceCustomization={bundlePriceCustomization}*/}
                  {/*  stockLabel={stockLabel}*/}
                  {/*/>*/}
                  {/*<CustomView flex style={{marginBottom: 10}} />*/}
                  {/*<Divider borderWidth={3} />*/}
                </CustomView>

                <CustomView
                  paddingHorizontal={20}
                  paddingVertical={4}
                  width={Mixins.MAX_WIDTH}>
                  <ProductBadges item={offers} isDetails />
                </CustomView>

                <CustomView
                  paddingHorizontal={20}
                  paddingVertical={4}
                  width={Mixins.MAX_WIDTH}>
                  <CustomView
                    row
                    spaceBetween
                    style={{marginBottom: 10, marginTop: -10}}>
                    <RenderIf condition={true}>
                      <WishListButton
                        item={product}
                        productId={product?.id}
                        wishlistItemId={product.wishlistId}
                        productName={product.name}
                        productSku={product.sku}
                        productCurrency={isProductReady ? getPriceCurrency : ''}
                        productPrice={isProductReady ? getPriceFinalValue : 0}>
                        <CustomView row verticalCenter>
                          {/*<FontAwesomeIcons*/}
                          {/*  name={product.wishlistId ? 'heart' : 'heart-o'}*/}
                          {/*  size={28}*/}
                          {/*  color={*/}
                          {/*    product.wishlistId*/}
                          {/*      ? Colors.PRIMARY*/}
                          {/*      : Colors.GRAY_MEDIUM*/}
                          {/*  }*/}
                          {/*  style={{marginRight: 8}}*/}
                          {/*/>*/}
                          <Image
                            source={
                              product.wishlistId
                                ? require('@app/assets/images/favorite_click.png')
                                : require('@app/assets/images/favorite_unclick.png')
                            }
                            style={{
                              width: 20,
                              height: 20,
                              marginRight: 8,
                              top: 3,
                            }}
                          />
                          {/*<Text underline color={Colors.PRIMARY} style={{top: 3}}>*/}
                          {/*  {t('product_detail.saveWishlist')}*/}
                          {/*</Text>*/}
                          <Text
                            small
                            color={Colors.BLACK}
                            style={{
                              top: 3,
                              paddingTop: Platform.OS === 'ios' ? 0 : 1,
                            }}>
                            {t('product_detail.saveWishlist')}
                          </Text>
                        </CustomView>
                      </WishListButton>
                    </RenderIf>
                    <RenderIf condition={true}>
                      <SocialShareBlock
                        url={`${Config.PWA_BASE_URL}/${product.url_key}.html`}
                        title={product.name}
                        sku={product.sku}
                        message={t('product_detail.kindlyCheck')}
                        defaultTitle={t('product_detail.share')}
                      />
                    </RenderIf>
                  </CustomView>
                  {/*<Divider borderWidth={3} />*/}
                </CustomView>

                {showGwp && (
                  <View style={styles.freeGiftContainer}>
                    <Text style={styles.freeGiftText}>Free Gift</Text>
                    <TouchableOpacity
                      onPress={() =>
                        navigateTo(
                          modules.detailed_rules.enable,
                          modules.detailed_rules.name,
                          {detail: gwpDetail},
                        )
                      }>
                      <Text style={styles.freeGiftDetailedRules}>
                        Detailed Rules
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                {showGwp && (
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progress, {width: progressWidth}]} />
                    </View>
                    <View style={styles.giftIconContainer}>
                      <Image
                        source={require('@app/assets/images/giftLogo.png')}
                        style={{
                          width: 20,
                          height: 20,
                          tintColor: gwpProgress >= 100 ? '#FFFFFF' : '#BDBDBD',
                        }}
                      />

                      {gwpProgress >= 100 && (
                        <View
                          style={{
                            ...styles.giftIconContainer,
                            position: 'absolute',
                            backgroundColor: '#FF8200',
                            borderColor: '#FF8200',
                            zIndex: -1,
                          }}
                        />
                      )}
                    </View>
                  </View>
                )}
                {showGwp && (
                  <TouchableOpacity
                    style={styles.promoBannerContainer}
                    onPress={() =>
                      navigateTo(
                        modules.gwp_list.enable,
                        modules.gwp_list.name,
                        {
                          detail: gwpDetail,
                          items: gwpItemsRaw,
                          bannerData: bannerPayload,
                        },
                      )
                    }>
                    <View style={styles.promoBannerTextContainer}>
                      {isGwpLoading ? (
                        <ActivityIndicator
                          size="small"
                          color={isGwpOptimisticUpdate ? '#FF8200' : '#FF8200'}
                        />
                      ) : (
                        <>
                          {isEligibleBanner && (
                            <Image
                              source={require('@app/assets/images/checkedOK.png')}
                              style={{width: 16, height: 16, marginRight: 6}}
                            />
                          )}
                          <Text style={styles.promoBannerText}>
                            {bannerTokens.map((tk, idx) => (
                              <Text
                                key={`tk-${idx}`}
                                style={
                                  tk.highlight
                                    ? [
                                        styles.promoBannerAmount,
                                        {color: '#FF8200'},
                                      ]
                                    : styles.promoBannerText
                                }>
                                {tk.text}
                              </Text>
                            ))}
                          </Text>
                        </>
                      )}
                    </View>
                    <FeatherIcon name="chevron-right" size={22} color="#333" />
                  </TouchableOpacity>
                )}

                {showGwp && (
                  <>
                    <TouchableOpacity
                      style={styles.viewAllContainer}
                      onPress={() => setBottomSheetVisible(true)}>
                      <Text style={styles.viewAllText}>View all</Text>
                      <FeatherIcon
                        name="chevron-right"
                        size={18}
                        color="#FF8200"
                      />
                    </TouchableOpacity>

                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      data={giftItems}
                      keyExtractor={item => item.id}
                      contentContainerStyle={styles.giftProductListContainer}
                      renderItem={({item}) => (
                        <TouchableOpacity
                          style={[
                            styles.giftProductContainer,
                            {width: giftItemWidth},
                          ]}
                          onPress={() => {
                            navigation.push('ProductDetail', {
                              productSku: item?.sku,
                              productUrlKey: item?.url_key,
                            });
                          }}>
                          <View style={styles.giftProductTopContainer}>
                            <View style={styles.giftProductImageContainer}>
                              <Image
                                source={{
                                  uri: item.image,
                                }}
                                style={styles.giftProductImage}
                              />
                              {!item.is_in_stock && (
                                <View style={styles.outOfStockOverlay}>
                                  <Text style={styles.outOfStockText}>
                                    Out of Stock
                                  </Text>
                                </View>
                              )}
                            </View>
                            <View style={styles.giftProductInfo}>
                              <Text
                                style={[
                                  styles.giftProductName,
                                  !item.is_in_stock && styles.disabledText,
                                ]}
                                numberOfLines={2}
                                ellipsizeMode="tail">
                                {item.name}
                              </Text>
                              <View style={styles.giftPriceContainer}>
                                <Text
                                  style={[
                                    styles.giftPrice,
                                    !item.is_in_stock && styles.disabledText,
                                  ]}>
                                  {item.price}
                                </Text>
                                <Text
                                  style={[
                                    styles.giftOriginalPrice,
                                    !item.is_in_stock && styles.disabledText,
                                  ]}>
                                  {item.originalPrice}
                                </Text>
                                <View
                                  style={
                                    !item.is_in_stock
                                      ? styles.giftTagOutOfStock
                                      : styles.giftTag
                                  }>
                                  <Text
                                    style={[
                                      styles.giftTagText,
                                      !item.is_in_stock &&
                                        styles.disabledTextImg,
                                    ]}>
                                    Gift
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>
                          <View style={styles.stockInfoContainer}>
                            <Text
                              style={[
                                styles.stockText,
                                !item.is_in_stock && styles.outOfStockColor,
                              ]}>
                              Stock: {item.stock}
                            </Text>
                            {item.stock <= 0 && (
                              <Text
                                style={[
                                  styles.stockText,
                                  styles.outOfStockColor,
                                ]}>
                                *Sorry, this gift has been fully redeemed
                              </Text>
                            )}
                            {item.stock > 0 && (
                              <Text
                                style={[
                                  styles.stockText,
                                  !item.is_in_stock && styles.outOfStockColor,
                                ]}>
                                {item.stock_info}
                              </Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      )}
                    />
                  </>
                )}

                {/* Bottom Sheet Modal */}
                {showGwp && (
                  <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isBottomSheetVisible}
                    statusBarTranslucent={true}
                    onRequestClose={() => setBottomSheetVisible(false)}>
                    <View style={styles.modalRoot}>
                      <Pressable
                        style={styles.modalBackdrop}
                        onPress={() => setBottomSheetVisible(false)}
                      />
                      <View
                        style={styles.modalContainer}
                        onLayout={e =>
                          setModalContainerHeight(e.nativeEvent.layout.height)
                        }>
                        <View
                          style={styles.modalHeader}
                          onLayout={e =>
                            setHeaderBlockHeight(e.nativeEvent.layout.height)
                          }
                        />
                        <View style={styles.bottomSheetHeader}>
                          <Text style={styles.bottomSheetTitle}>
                            Gift With Purchase
                          </Text>
                          <TouchableOpacity
                            onPress={() => setBottomSheetVisible(false)}>
                            <FeatherIcon name="x" size={20} color="#333" />
                          </TouchableOpacity>
                        </View>
                        <View style={styles.fullWidthSeparator} />
                        <View style={styles.bottomSheetBannerContainer}>
                          {isEligibleBanner && (
                            <Image
                              source={require('@app/assets/images/checkedOK.png')}
                              style={{width: 16, height: 16, marginRight: 6}}
                            />
                          )}
                          <Text style={styles.promoBannerText}>
                            {bannerTokens.map((tk, idx) => (
                              <Text
                                key={`modal-tk-${idx}`}
                                style={
                                  tk.highlight
                                    ? [
                                        styles.promoBannerAmount,
                                        {color: '#FF8200'},
                                      ]
                                    : styles.promoBannerText
                                }>
                                {tk.text}
                              </Text>
                            ))}
                          </Text>
                        </View>
                        <ScrollView
                          showsVerticalScrollIndicator={false}
                          persistentScrollbar={false}
                          scrollEnabled={true}
                          nestedScrollEnabled={true}
                          overScrollMode="never"
                          scrollEventThrottle={16}
                          onLayout={e =>
                            setScrollContainerHeight(
                              e.nativeEvent.layout.height,
                            )
                          }
                          onContentSizeChange={(w, h) =>
                            setScrollContentHeight(h)
                          }
                          onScroll={e =>
                            setScrollOffsetY(e.nativeEvent.contentOffset.y)
                          }
                          style={[
                            styles.modalScrollView,
                            firstItemHeight > 0
                              ? {
                                  maxHeight: Math.min(
                                    modalContainerHeight -
                                      headerBlockHeight -
                                      80,
                                    firstItemHeight * 4 + 24,
                                  ),
                                }
                              : null,
                          ]}
                          contentContainerStyle={styles.modalScrollContent}>
                          {giftItems.map((item, idx) => (
                            <TouchableOpacity
                              key={item.id}
                              style={styles.bottomSheetItemContainer}
                              onLayout={
                                idx === 0
                                  ? e =>
                                      setFirstItemHeight(
                                        e.nativeEvent.layout.height,
                                      )
                                  : undefined
                              }
                              onPress={() => {
                                setBottomSheetVisible(false);
                                navigation.push('ProductDetail', {
                                  productSku: item?.sku,
                                  productUrlKey: item?.url_key,
                                });
                              }}>
                              <View style={styles.bottomSheetItemTopRow}>
                                <View style={styles.bottomSheetItemImageWrap}>
                                  <Image
                                    source={{uri: item.image}}
                                    style={styles.bottomSheetItemImage}
                                  />
                                  {(!item.is_in_stock || item.stock <= 0) && (
                                    <View style={styles.outOfStockOverlay}>
                                      <Text style={styles.outOfStockText}>
                                        Out of Stock
                                      </Text>
                                    </View>
                                  )}
                                </View>
                                <View style={styles.bottomSheetItemInfo}>
                                  <Text
                                    style={[
                                      styles.giftProductName,
                                      (!item.is_in_stock || item.stock <= 0) &&
                                        styles.disabledText,
                                    ]}
                                    numberOfLines={2}
                                    ellipsizeMode="tail">
                                    {item.name}
                                  </Text>
                                  <View style={styles.giftPriceContainer}>
                                    <View
                                      style={
                                        !item.is_in_stock || item.stock <= 0
                                          ? styles.giftTagOutOfStock
                                          : styles.giftTag
                                      }>
                                      <Text
                                        style={[
                                          styles.giftTagText,
                                          (!item.is_in_stock ||
                                            item.stock <= 0) &&
                                            styles.disabledTextImg,
                                        ]}>
                                        Gift
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              </View>
                              {(item.stock > 0 && item.is_in_stock) ||
                              item.stock <= 0 ? (
                                <View style={styles.stockInfoRow}>
                                  <View style={styles.infoPill}>
                                    <Text
                                      style={[
                                        styles.infoPillText,
                                        item.stock <= 0 &&
                                          styles.outOfStockColor,
                                      ]}>
                                      Stock: {item.stock}
                                    </Text>
                                  </View>
                                  {item.stock <= 0 && (
                                    <View style={styles.infoPill}>
                                      <Text
                                        style={[
                                          styles.infoPillText,
                                          styles.outOfStockColor,
                                        ]}>
                                        *Sorry, this gift has been fully
                                        redeemed
                                      </Text>
                                    </View>
                                  )}
                                  {item.stock > 0 && (
                                    <View style={styles.infoPill}>
                                      <Text style={styles.infoPillText}>
                                        {item.stock_info}
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              ) : (
                                <View style={styles.stockInfoRow}>
                                  <Text
                                    style={[
                                      styles.outOfStockColor,
                                      styles.textFontSize,
                                    ]}>
                                    Out of Stock
                                  </Text>
                                  <Text
                                    style={[
                                      styles.outOfStockColor,
                                      styles.textFontSize,
                                    ]}>
                                    {item.stock_info}
                                  </Text>
                                </View>
                              )}
                              <View style={styles.eventTimePill}>
                                <Text style={styles.eventTimePillText}>
                                  Event time: {item.event_time}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                        {/* Custom Scrollbar */}
                        <View style={styles.scrollbarTrack}>
                          {(() => {
                            const hasOverflow =
                              scrollContentHeight > scrollContainerHeight;
                            const ratio = hasOverflow
                              ? scrollContainerHeight / scrollContentHeight
                              : 1;
                            const barHeight = Math.max(
                              14,
                              scrollContainerHeight * ratio * 0.35,
                            );
                            const maxOffset = Math.max(
                              1,
                              scrollContentHeight - scrollContainerHeight,
                            );
                            const top = hasOverflow
                              ? (scrollOffsetY / maxOffset) *
                                (scrollContainerHeight - barHeight)
                              : 0;
                            return (
                              <View
                                style={[
                                  styles.scrollbarThumb,
                                  {height: 150, top, width: 6},
                                ]}
                              />
                            );
                          })()}
                        </View>
                      </View>
                    </View>
                  </Modal>
                )}

                <View style={{flex: 1, backgroundColor: 'white'}}>
                  {/*{AccordionCustom}*/}
                  {/*<ProductDetailDescription*/}
                  {/*  t={t}*/}
                  {/*  product={product}*/}
                  {/*  productReviews={productReviews}*/}
                  {/*  starRatingProduct={starRatingProduct}*/}
                  {/*  totalReview={totalReview}*/}
                  {/*  refetchProductReviews={refetchProductReviews}*/}
                  {/*/>*/}
                  <RenderIf condition={!showStrickyHeader}>
                    {renderStrickyHeader()}
                  </RenderIf>
                  {renderSectionItem()}
                </View>

                {/*<RenderIf condition={activeSection.includes(2)}>*/}
                {/*  <AddReviewBlock*/}
                {/*    t={t}*/}
                {/*    product={product}*/}
                {/*    refetchProductReviews={refetchProductReviews}*/}
                {/*  />*/}
                {/*</RenderIf>*/}

                <RelatedProducts
                  data={relatedProducts}
                  onNavigateToProductDetail={onNavigateToProductDetail}
                />

                <ProductRecommend
                  data={recommendProducts}
                  productCrosssellLoading={productCrosssellLoading}
                  onNavigateToProductDetail={onNavigateToProductDetail}
                />
              </CustomView>

              <ImageView
                images={[{uri: imageUrl}]}
                imageIndex={0}
                visible={visibleImageView}
                onRequestClose={() => onItemClickPreviewImage(false)}
                FooterComponent={FooterComponent}
              />
            </>
          </RenderIf>
        </ScrollView>
        <RenderIf condition={showBackToTop}>
          <TouchableOpacity
            style={{
              position: 'absolute',
              right: 10,
              bottom: 60 + insets.bottom,
              borderRadius: 30,
              width: 60,
              height: 60,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={scrollToTop}>
            <Image
              source={require('@app/assets/images/back_to_top.png')}
              style={{height: 48, width: 48}}
            />
          </TouchableOpacity>
        </RenderIf>

        <RenderIf condition={!loading && product?.sku}>
          <ButtonAddToCart
            item={product}
            type={product?.__typename}
            parentSku={product?.sku}
            selectedVariant={selectedVariant}
            disabled={disabledAddToCart}
            selectedOptions={selectedOptions}
            itemPrice={itemPrice}
            currency={getPriceCurrency}
            onQuantityChange={refetchGwpData}
            onAddToCartByVariant={() =>
              showVariantPopup(CART_ACTIONS.ADD_TO_CART)
            }
            onNotifyMe={onNotifyMe}
            onBuyNowByVariant={() => showVariantPopup(CART_ACTIONS.BUY_NOW)}
          />
        </RenderIf>
        <PdpLoadingOverlay
          visible={
            loading || refreshing || (!product.sku && !isProductNotFound)
          }
        />
      </View>
      <FlashSaleEndedModal
        visible={showFlashSaleEndedModal}
        onClose={() => setShowFlashSaleEndedModal(false)}
        onRefresh={handleFlashSaleModalRefresh}
      />
      <VariantPickerModal
        ref={skuModalRef}
        {...picker}
        initProduct={product}
        promoProduct={promoProduct}
        bundlePriceCustomization={bundlePriceCustomization}
        onSelectVariant={value => {
          handleVariant(value);
        }}
      />
    </>
  );
};

export default ProductDetailScreen;
