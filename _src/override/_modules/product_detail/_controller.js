import React, {useCallback, useEffect, useRef, useState} from 'react';

import {useFocusEffect, useNavigation} from '@react-navigation/native';

import {useQuery, useReactiveVar} from '@apollo/client';
import {modules} from '@root/swift.config';

import {useTranslation} from 'react-i18next';

import Views from '@app/_modules/product_detail/_view';
import {
  GET_PRODUCT_BY_URL_KEY,
  GET_PRODUCT_CROSSSELL_BY_URL_KEY,
  GET_PRODUCT_REVIEWS,
} from '@app/_modules/product_detail/services/schema';
import AnalyticsHelper from '@app/helpers/Analytics';
import {TYPENAME_CONFIGURABLE, TYPENAME_SIMPLE} from '@app/helpers/Constants';
import {navigateTo} from '@app/helpers/Navigation';
import {startPerfTrace} from '@app/helpers/perf';
import {NAME, setMetricEnd, setMetricStart} from '@app/helpers/Performance';
import {warmProductCartItemMap} from '@app/hooks/carts/useCarts';
import useCustomQuery from '@app/hooks/useCustomQuery';
import useNotifyMe from '@app/hooks/useNotifyMe';
import {useRefetchWishlist} from '@app/hooks/useRefetchWishlist';
import {rxUserType, rxUserWIshlistItems} from '@app/services/cache';

const Controller = props => {
  if (!modules.product_detail.enable) {
    return null;
  }

  /**
   * ---------------------------------------------------- *
   * @const {hooks}
   * ---------------------------------------------------- *
   */
  const refFirebaseDetail = useRef();
  const navigation = useNavigation();
  const userType = useReactiveVar(rxUserType);
  const wishlist = useReactiveVar(rxUserWIshlistItems);
  const {t} = useTranslation();
  const {refetch: refetchWishlist} = useRefetchWishlist();
  const {productUrlKey, uid, productSku} = props.route.params;
  const pdpTraceRef = useRef(null);
  const [product, setProduct] = useState({});
  const [skuProduct, setSkuProduct] = useState(product.sku);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recommendProducts, setRecommendProducts] = useState([]);
  const [currentPageReview, setCurrentPageReview] = useState(1);
  const [imageUrl, setImageUrl] = useState(null);
  const [promoProduct, setPromoProduct] = useState(null);
  const [brandProduct, setBrandProduct] = useState(null);
  const [starRatingProduct, setStarRatingProduct] = useState(0);
  const [visibleImageView, setVisibleImageView] = useState(false);
  const [disabledAddToCart, setDisabledAddToCart] = useState(true);
  const [productReviews, setProductReviews] = useState([]);
  const [totalReview, setTotalReview] = useState(0);
  const [stockStatus, setStockStatus] = useState(product.stock_status);
  const [selectedVariantOpt, setSelectedVariantOpt] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [bundleItemsCount, setBundleItemsCount] = useState(0);
  const [configurableFinalPrice, setConfigurableFinalPrice] = useState(null);
  const [bundlePriceCustomization, setBundlePriceCustomization] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [priceProps, setPriceProps] = useState({});

  // price
  const getPriceRange = product?.price_range;
  const getMinPrice = getPriceRange?.minimum_price;
  const getPriceCurrency = getMinPrice?.final_price.currency;
  const getPriceRegularValue = getMinPrice?.regular_price.value;
  const getPriceFinalValue = getMinPrice?.final_price.value;
  const getDiscountPercent = getMinPrice?.discount?.percent_off;

  const isSamePrice = getPriceRegularValue === getPriceFinalValue;
  const isProductReady = Object.keys(product)?.length > 0;
  const pageSizeReview = 10;

  const {
    data,
    loading,
    refetch: refetchProduct,
  } = useQuery(GET_PRODUCT_BY_URL_KEY, {
    variables: {
      url_key: productUrlKey,
      configurableOptionValues: [],
      currentPage: 1,
      pageSize: 1,
      sortBy: {price: 'ASC'},
    },
    fetchPolicy: 'network-only',
    context: {
      method: 'POST',
    },
  });

  const isProductNotFound =
    !loading && !refreshing && !data?.products?.items?.length;

  const {data: productCrosssell, loading: productCrosssellLoading} =
    useCustomQuery({
      schema: GET_PRODUCT_CROSSSELL_BY_URL_KEY,
      useInitData: true,
      variables: {
        url_key: productUrlKey,
        currentPage: 1,
        pageSize: 1,
        sortBy: {price: 'ASC'},
      },
      opts: {fetchPolicy: 'network-only', context: {method: 'GET'}},
    });

  const {data: productReviewsData, onRefetchData: refetchProductReviews} =
    useCustomQuery({
      schema: GET_PRODUCT_REVIEWS,
      useInitData: false,
      variables: {
        sku: skuProduct,
        currentPage: currentPageReview,
        pageSize: pageSizeReview,
      },
      opts: {fetchPolicy: 'network-only'},
    });

  //start pdp init trace
  useEffect(() => {
    startPdpInitTrace();
    return () => {
      if (pdpTraceRef.current) {
        pdpTraceRef.current.stop();
        pdpTraceRef.current = null;
      }
    };
  }, []);

  /**
   * ---------------------------------------------------- *
   * @dependency [data, wishlist]
   * @summary for checking wishlist data
   * @todo : check on each variant stock
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    const getDefaultVariant = variants => {
      // 优先按变体产品 uid 匹配（购物车/深链/闪购卡片带 uid 进来）；订单详情等
      // 入口拿不到变体 uid，只有下单时的 product_sku，故再按 sku 兜底匹配，
      // 使从订单页点进 configurable 闪购变体时能预选到对应规格并带出闪购上下文。
      let matchedVariant = uid
        ? variants.find(v => v.product?.uid === uid)
        : null;
      if (!matchedVariant && productSku) {
        matchedVariant = variants.find(v => v.product?.sku === productSku);
      }

      if (matchedVariant) {
        setSelectedVariant(matchedVariant);
        // 深链/闪购卡片带 uid 进来时，除了设 selectedVariant（价格/库存/步进器据此），
        // 还要把该变体的属性反填进 selectedVariantOpt，否则变体选择器 UI 不会高亮
        // 到对应那一列（VariantOptions 的选中判定依赖 selectedVariantOpt 里的 {code, uid}）。
        setSelectedVariantOpt(
          (matchedVariant.attributes || []).map(attr => ({
            code: attr.code,
            uid: attr.uid,
          })),
        );

        if (matchedVariant.product?.small_image?.url) {
          setImageUrl(matchedVariant.product.small_image.url);
        }

        if (matchedVariant.product?.stock_status) {
          setStockStatus(matchedVariant.product.stock_status);
        }
      }
    };

    const getProductDetail = async () => {
      if (data === undefined) {
        await setMetricStart({
          name: NAME.PRODUCT_DETAIL,
          refFirebase: refFirebaseDetail,
        });
      } else {
        if (data?.products) {
          let productTmp = data?.products?.items[0];
          let wishlistId = null;
          if (wishlist) {
            wishlist.forEach(wishlistItem => {
              if (wishlistItem.productId === productTmp.id) {
                wishlistId = wishlistItem.wishlistId;
              }
            });
          }

          productTmp = {...productTmp, wishlistId};

          if (productTmp?.__typename === TYPENAME_SIMPLE) {
            setDisabledAddToCart(false);
          }

          if (
            productTmp?.__typename === TYPENAME_CONFIGURABLE &&
            productTmp?.variants?.length > 0
          ) {
            setDisabledAddToCart(false);
            getDefaultVariant(productTmp.variants);
          } else {
            setImageUrl(productTmp?.image?.url);
          }

          setProduct(productTmp);
          setRelatedProducts(productTmp?.related_products);

          // 停止 pdpInit trace（当商品数据加载完成时）
          stopPdpInitTrace();

          await setMetricEnd({refFirebase: refFirebaseDetail});
        }
      }
    };
    getProductDetail();
    getMoreInfoProduct();
    countStarRatingProduct();
  }, [data, wishlist]);

  /**
   * ---------------------------------------------------- *
   * @dependency [productReviewsData]
   * @summary for set state product reviews data
   * @todo : set state when there are changes
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    if (productReviewsData && productReviewsData?.data) {
      setProductReviews(
        productReviewsData?.data?.getProductReviews?.items || [],
      );
      setTotalReview(
        productReviewsData?.data?.getProductReviews?.totalCount || 0,
      );
    }
  }, [productReviewsData]);

  useEffect(() => {
    if (productCrosssell && productCrosssell?.data) {
      const productData = productCrosssell?.data?.products?.items?.[0];
      setRecommendProducts(productData?.crosssell_products);
    }
  }, [productCrosssell]);

  /**
   * ----------------------------------------- *
   * @function onLogProductToAnalytics
   * @summary log product detail to analytics
   * @profiler {googleAnalytics} PDP
   * ----------------------------------------- *
   */
  const onLogProductToAnalytics = () => {
    const {id, name, description} = product;
    const paramItem = {
      currency: getPriceCurrency,
      value: getPriceFinalValue,
      items: [
        {
          item_id: id?.toString() || '',
          item_list_id: description?.html?.toString(),
          item_name: name,
          price: getPriceFinalValue,
        },
      ],
    };
    AnalyticsHelper.eventViewItemGA(paramItem);
  };

  /**
   * ---------------------------------------------------- *
   * @function onItemClickPreviewImage
   * @param {object} status
   * @summary for event click image preview
   * ---------------------------------------------------- *
   */
  const onItemClickPreviewImage = image_url => {
    if (image_url) {
      setImageUrl(image_url);
    }
    setVisibleImageView(!!image_url);
  };

  /**
   * ----------------------------------------- *
   * @function onNavigateToProductDetail
   * @summary navigate to product detail
   * ----------------------------------------- *
   */
  const onNavigateToProductDetail = ({
    productUrlKey: UrlKey,
    productSku: Sku,
  }) => {
    navigation.push(modules.product_detail.name, {
      productUrlKey: UrlKey,
      productSku: Sku,
    });
  };

  /**
   * ---------------------------------------------------- *
   * @function getMoreInfoProduct
   * @summary for set state more info product stuff
   * ---------------------------------------------------- *
   */
  const getMoreInfoProduct = () => {
    if (data?.products) {
      const moreInfoProduct = data?.products?.items[0]?.more_info;
      if (moreInfoProduct?.length) {
        const brand = moreInfoProduct.filter(item => item.label === 'Brand');
        const promo = moreInfoProduct.filter(item => item.label === 'Promo');
        if (brand?.length) {
          setBrandProduct(brand[0].value);
        }
        if (promo?.length) {
          setPromoProduct(promo[0].value);
        }
      }
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function countStarRatingProduct
   * @summary for counting star rating product
   * ---------------------------------------------------- *
   */
  const countStarRatingProduct = () => {
    if (data?.products) {
      const ratingSummary = data?.products?.items[0]?.rating_summary;
      if (ratingSummary > 0) {
        setStarRatingProduct(ratingSummary / 20);
      }
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function getMoreReviews
   * @summary for getting more review data
   * ---------------------------------------------------- *
   */
  const getMoreReviews = async () => {
    const availablePageReview = totalReview / pageSizeReview;
    if (availablePageReview > currentPageReview) {
      const newCurrentPageReview = currentPageReview + 1;
      const reviewsData = await refetchProductReviews({
        params: {
          sku: skuProduct,
          currentPage: newCurrentPageReview,
          pageSize: 2,
        },
        paramsOpt: {isReturn: true},
      });
      const newProductReviews = productReviews.concat(
        reviewsData?.data?.getProductReviews?.items,
      );
      setCurrentPageReview(newCurrentPageReview);
      setProductReviews(newProductReviews);
    }
  };

  const {onNotifyMe} = useNotifyMe(selectedVariant?.product?.id);

  /**
   * ----------------------------------------- *
   * @dependency [sku]
   * @summary set image and stock status for
   * configurable product or simple product
   * ----------------------------------------- *
   */
  useEffect(() => {
    if (skuProduct) {
      refetchProductReviews({
        params: {
          sku: skuProduct,
          currentPage: currentPageReview,
          pageSize: pageSizeReview,
        },
      });
      if (product?.__typename !== TYPENAME_CONFIGURABLE) {
        setStockStatus(product.stock_status);
      }
    }
  }, [skuProduct]);

  /**
   * ----------------------------------------- *
   * @dependency [product?.sku]
   * @summary set sku from props to local state
   * ----------------------------------------- *
   */
  useEffect(() => {
    if (product?.sku) {
      setSkuProduct(product?.sku);
      onLogProductToAnalytics();
    }
  }, [product?.sku]);

  /**
   * ----------------------------------------- *
   * @function onPressCart
   * @summary navigate to product detail
   * ----------------------------------------- *
   */
  const onPressCart = () => {
    navigateTo(modules.cart.enable, modules.cart.name);
  };

  // 开始 pdpInit trace
  const startPdpInitTrace = async () => {
    pdpTraceRef.current = await startPerfTrace('productDetailPageInit');
    pdpTraceRef.current.putAttribute('product_url_key', productUrlKey || '');
    pdpTraceRef.current.putAttribute('product_sku', productSku || '');
    pdpTraceRef.current.startTime = Date.now();
  };
  // 结束 homeInit trace
  const stopPdpInitTrace = async () => {
    if (pdpTraceRef.current) {
      const duration = Date.now() - pdpTraceRef.current.startTime;
      pdpTraceRef.current.putMetric('duration_ms', duration);
      pdpTraceRef.current.putAttribute('status', 'success');
      pdpTraceRef.current.stop();
      pdpTraceRef.current = null;
    }
  };

  const handleRefreshPage = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchProduct()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchProduct]);

  /**
   * ---------------------------------------------------- *
   * @function {lifecycle}
   * @summary 每次进入/回到详情页都静默重查一次详情 + 刷新购物车数量表，
   * 无痕同步 web 端（不带 loading 遮罩）。首次进入时 useQuery(network-only)
   * 挂载已查过详情，跳过一次 refetchProduct 避免双请求；但数量表仍需预热
   * （web 可能在 app 启动后才加购）。
   * ---------------------------------------------------- *
   */
  const didPdpInitialFocusRef = useRef(true);
  useFocusEffect(
    useCallback(() => {
      warmProductCartItemMap();
      if (didPdpInitialFocusRef.current) {
        didPdpInitialFocusRef.current = false;
      } else {
        refetchProduct();
      }
    }, [refetchProduct]),
  );

  useEffect(() => {
    const vProduct = selectedVariant?.product ?? product ?? {};
    const minPrice = vProduct.price_range?.minimum_price;

    setPriceProps({
      product: vProduct,
      getPriceRange: vProduct.price_range,
      getPriceCurrency: minPrice?.final_price?.currency,
      getPriceRegularValue: minPrice?.regular_price?.value,
      getPriceFinalValue: minPrice?.final_price?.value,
      getDiscountPercent: minPrice?.discount?.percent_off,
    });

    setConfigurableFinalPrice({
      currency: minPrice?.final_price?.currency,
      value: minPrice?.final_price?.value,
    });
  }, [product, selectedVariant]);

  /**
   * ---------------------------------------------------- *
   * @constant controllerProps
   * @return {object}
   * ---------------------------------------------------- *
   */
  const controllerProps = {
    ...props,
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

    getPriceRange,
    getPriceCurrency,
    getPriceRegularValue,
    getPriceFinalValue,
    getDiscountPercent,
    isSamePrice,

    isProductReady,
    imageUrl,
    promoProduct,
    brandProduct,
    skuProduct,
    starRatingProduct,
    visibleImageView,
    disabledAddToCart,
    stockStatus,
    selectedVariant,
    selectedOptions,
    bundleItemsCount,
    configurableFinalPrice,
    getMoreReviews,
    setSkuProduct,
    refetchWishlist,
    onItemClickPreviewImage,
    onNavigateToProductDetail,
    setVisibleImageView,
    setSelectedVariant,
    selectedVariantOpt,
    setSelectedVariantOpt,
    setSelectedOptions,
    setDisabledAddToCart,
    setBundleItemsCount,
    onPressCart,
    bundlePriceCustomization,
    setBundlePriceCustomization,
    handleRefreshPage,
    onNotifyMe,
    priceProps,
  };

  return <Views {...controllerProps} />;
};

export default Controller;
