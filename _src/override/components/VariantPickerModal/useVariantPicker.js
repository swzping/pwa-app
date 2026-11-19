import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {useReactiveVar} from '@apollo/client';
import FastImage from '@d11/react-native-fast-image';
import {modules} from '@root/swift.config';

import {GET_PRODUCT_BY_URL_KEY} from '@app/_modules/product_detail/services/schema';
import {
  CART_ACTIONS,
  TYPE_FAILED,
  TYPENAME_VARIANT,
  USER_GUEST,
} from '@app/helpers/Constants';
import {navigateTo} from '@app/helpers/Navigation';
import {thumborSquareImage} from '@app/helpers/Thumbor';
import addToCartHook from '@app/hooks/carts/addToCart';
import useCarts from '@app/hooks/carts/useCarts';
import useCustomQuery from '@app/hooks/useCustomQuery';
import useNotifyMe from '@app/hooks/useNotifyMe';
import {rxProductIdCartItemIdMap, rxUserType} from '@app/services/cache';

import {findMatchedVariant, getVariantStockStatus} from './variantHelpers';
import {HEADER_IMAGE_SIZE, SWATCH_IMAGE_SIZE} from './VariantOptions';

const ALERT_AUTO_DISMISS_MS = 3000;
const FALLBACK_POSITION = Infinity;

/**
 * Warm up the native image cache (memory + disk) for all variant images
 * (swatches + header images) right after product data is available, so they
 * render instantly when the modal is presented instead of downloading
 * one-by-one after mount.
 */
const preloadVariantImages = productData => {
  const sources = [];

  (productData?.configurable_options || []).forEach(group => {
    (group?.values || []).forEach(item => {
      if (
        item.swatch_data?.__typename === 'ImageSwatchData' &&
        item.swatch_data.thumbnail
      ) {
        sources.push({
          uri: thumborSquareImage(
            item.swatch_data.thumbnail,
            SWATCH_IMAGE_SIZE,
          ),
          priority: FastImage.priority.normal,
          cache: FastImage.cacheControl.immutable,
        });
      }
    });
  });

  // Header image of every variant (shown when a variant gets selected)
  (productData?.variants || []).forEach(variant => {
    const url = variant?.product?.small_image?.url;
    if (url) {
      sources.push({
        uri: thumborSquareImage(url, HEADER_IMAGE_SIZE),
        priority: FastImage.priority.high,
        cache: FastImage.cacheControl.immutable,
      });
    }
  });

  // Default header image (parent product gallery image)
  const defaultHeaderUrl = productData?.media_gallery?.find(
    item => item.__typename === 'ProductImage',
  )?.url;
  if (defaultHeaderUrl) {
    sources.push({
      uri: thumborSquareImage(defaultHeaderUrl, HEADER_IMAGE_SIZE),
      priority: FastImage.priority.high,
      cache: FastImage.cacheControl.immutable,
    });
  }

  if (sources.length > 0) {
    FastImage.preload(sources);
  }
};

const useVariantPicker = ({modalRef, onSuccess, onClose, onNotifyMe} = {}) => {
  const getRxUserType = useReactiveVar(rxUserType);
  const getRxProductIdCartItemIdMap = useReactiveVar(rxProductIdCartItemIdMap);

  const {onRefetchData: fetchProduct} = useCustomQuery({
    schema: GET_PRODUCT_BY_URL_KEY,
    opts: {fetchPolicy: 'network-only', context: {method: 'POST'}},
  });

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState({});
  const [selectedVariantOpt, setSelectedVariantOpt] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [cartAction, setCartAction] = useState(null);
  const [alert, setAlert] = useState(null);
  const [cartItemId, setCartItemId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const lastUrlKey = useRef(null);
  const cachedProduct = useRef(null);

  const {onNotifyMe: fetchNotifyMe} = useNotifyMe(selectedVariant?.product?.id);

  const {updateVariant} = useCarts({initialized: false});
  const {addToCart: addItemToCart} = addToCartHook();

  // ---- External data injection ----
  const init = useCallback(
    ({
      product: productData,
      action = CART_ACTIONS.ADD_TO_CART,
      initVariant = null,
      initVariantOpt = [],
      qty = 1,
      parentUid = null,
    }) => {
      // Start downloading variant images as early as possible (before present)
      preloadVariantImages(productData);

      setCartAction(action);
      setAlert(null);
      setProduct(productData);
      setQuantity(qty);

      switch (action) {
        case CART_ACTIONS.CHANGE:
          if (parentUid) {
            // Cart edit mode：use selected variant parent product uid
            const matched =
              findMatchedVariant(productData.variants, initVariantOpt) || {};
            setCartItemId(parentUid);
            setSelectedVariant(matched);
            setSelectedVariantOpt(initVariantOpt);
          }
          break;
        case CART_ACTIONS.ADD_TO_CART:
        case CART_ACTIONS.BUY_NOW:
          if (initVariant) {
            setSelectedVariant(initVariant);
          }

          if (initVariantOpt.length > 0) {
            if (!initVariant) {
              const matched =
                findMatchedVariant(productData.variants, initVariantOpt) || {};
              setSelectedVariant(matched);
            }
            setSelectedVariantOpt(initVariantOpt);
          }
          break;
        default:
          // Default select first variant
          const defaultVariant = productData?.variants?.[0];
          setSelectedVariant(defaultVariant || {});
          setSelectedVariantOpt(
            defaultVariant?.attributes?.map(attr => ({
              code: attr.code,
              uid: attr.uid,
            })) || [],
          );
          break;
      }
    },
    [],
  );

  const open = useCallback(
    async ({
      cacheKey,
      urlKey,
      action = CART_ACTIONS.ADD_TO_CART,
      qty = 1,
      uid = null, // Can confirm current Variant product
      parentUid = null, // For cart edit mode
    }) => {
      const isSameProduct =
        cacheKey && lastUrlKey.current === cacheKey && cachedProduct.current;

      if (isSameProduct) {
        // If the product is the same as the last one, use the cached data to open the modal immediately
        const cached = cachedProduct.current;
        setProduct(cached);

        // Reset selection state to match the uid that was actually clicked,
        // so the modal always reflects the caller's intent rather than stale
        // selections from the previous session.
        const initVariantOpt =
          cached.variants
            ?.find(item => item.product?.uid === uid)
            ?.attributes?.map(item => ({
              code: item.code,
              uid: item.uid,
            })) ?? [];

        init({
          product: cached,
          action,
          initVariantOpt,
          qty,
          parentUid,
        });

        modalRef?.current?.present();
      } else {
        reset();
        setLoading(true);
      }

      try {
        const {data: res} = await fetchProduct({
          params: {
            url_key: urlKey,
            configurableOptionValues: [],
            currentPage: 1,
            pageSize: 1,
            sortBy: {price: 'ASC'},
          },
          paramsOpt: {isReturn: true},
        });

        const result = res?.products?.items?.[0];
        if (!result) {
          return;
        }

        lastUrlKey.current = cacheKey;
        cachedProduct.current = result;

        // Warm the image cache for both branches (fresh open / background refresh)
        preloadVariantImages(result);

        if (isSameProduct) {
          // Update product data in the background, but do not open the modal again
          setProduct(result);
        } else {
          const initVariantOpt =
            result.variants
              ?.find(item => item.product?.uid === uid)
              ?.attributes?.map(item => ({
                code: item.code,
                uid: item.uid,
              })) ?? [];

          init({
            product: result,
            action,
            initVariantOpt,
            qty,
            parentUid,
          });

          modalRef?.current?.present();
        }
      } finally {
        setLoading(false);
      }
    },
    [fetchProduct, init, modalRef],
  );

  const openSync = useCallback(
    params => {
      init(params);
      modalRef?.current?.present();
    },
    [init, modalRef],
  );

  // ---- Reset ----
  const reset = useCallback(() => {
    setProduct(null);
    setSelectedVariant({});
    setSelectedVariantOpt([]);
    setQuantity(1);
    setCartAction(null);
    setAlert(null);
    setCartItemId(null);
  }, []);

  // ---- Derived data ----
  const isSelectionComplete = useMemo(
    () =>
      product?.configurable_options?.every(opt =>
        selectedVariantOpt?.some(sel => sel.code === opt.attribute_code),
      ),
    [product?.configurable_options, selectedVariantOpt],
  );

  const matchedVariant = useMemo(
    () => findMatchedVariant(product?.variants, selectedVariantOpt),
    [product?.variants, selectedVariantOpt],
  );

  const defaultHeaderImageUri = useMemo(() => {
    return (
      product?.media_gallery?.find(item => item.__typename === 'ProductImage')
        ?.url ?? null
    );
  }, [product?.media_gallery]);

  const headerImageUri = useMemo(() => {
    return selectedVariant?.product?.small_image?.url ?? null;
  }, [selectedVariant?.product?.small_image?.url]);

  const stockProps = useMemo(() => {
    return {
      ...getVariantStockStatus(matchedVariant),
      maxStock: matchedVariant?.product?.stock_item?.salable_qty,
    };
  }, [matchedVariant]);

  const isButtonDisabled = !isSelectionComplete || !matchedVariant;

  const missingOptions = useMemo(() => {
    if (!product?.configurable_options) {
      return [];
    }
    return product.configurable_options
      .filter(
        opt => !selectedVariantOpt.some(sel => sel.code === opt.attribute_code),
      )
      .map(opt => opt.label);
  }, [product?.configurable_options, selectedVariantOpt]);

  const priceProps = useMemo(() => {
    const vProduct = !isButtonDisabled
      ? selectedVariant?.product ?? {}
      : product ?? {};
    const minPrice = vProduct.price_range?.minimum_price;

    return {
      product: vProduct,
      getPriceRange: vProduct.price_range,
      getPriceCurrency: minPrice?.final_price?.currency,
      getPriceRegularValue: minPrice?.regular_price?.value,
      getPriceFinalValue: minPrice?.final_price?.value,
      getDiscountPercent: minPrice?.discount?.percent_off,
    };
  }, [product, selectedVariant?.product, isButtonDisabled]);

  const configurableFinalPrice = useMemo(() => {
    return {
      currency: product?.price_range?.minimum_price?.final_price?.currency,
      value: product?.price_range?.minimum_price?.final_price?.value,
    };
  }, [product?.price_range?.minimum_price?.final_price]);

  const sortedUids = useMemo(() => {
    const optionPositionMap = new Map(
      product?.configurable_options?.map(opt => [
        opt.attribute_code,
        opt.position ?? 0,
      ]),
    );

    return [...(selectedVariantOpt ?? [])]
      .sort((a, b) => {
        const posA = optionPositionMap.get(a.code) ?? FALLBACK_POSITION;
        const posB = optionPositionMap.get(b.code) ?? FALLBACK_POSITION;
        return posA - posB;
      })
      .map(opt => opt.uid);
  }, [product?.configurable_options, selectedVariantOpt]);

  // ---- Quantity operations ----
  const canIncrease = !stockProps.maxStock || quantity < stockProps.maxStock;
  const canDecrease = quantity > 1;

  const onIncreaseQuantity = useCallback(() => {
    if (canIncrease) {
      setQuantity(q => q + 1);
    } else {
      setAlert({
        type: TYPE_FAILED,
        message: 'The quantity has reached maximum',
      });
    }
  }, [canIncrease]);

  const onDecreaseQuantity = useCallback(
    () => canDecrease && setQuantity(q => q - 1),
    [canDecrease],
  );

  const onChangeText = text => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned === '') {
      setQuantity('');
      return;
    }

    const num = parseInt(cleaned, 10);
    if (!isNaN(num)) {
      // If have a maxStock limit, you can enforce it here or in onEndEditing
      if (num > stockProps.maxStock) {
        return setQuantity(stockProps.maxStock);
      }
      setQuantity(num);
    }
  };

  const onEndEditing = () => {
    if (quantity === '' || quantity < 1) {
      setQuantity(1);
    }
    // If need to limit the maximum available stock:
    if (quantity > stockProps.maxStock) {
      setQuantity(stockProps.maxStock);
    }
  };

  // ---- Add to cart ----
  const onAddToCart = useCallback(async () => {
    if (!modules.guest_add_to_cart.enable && getRxUserType === USER_GUEST) {
      navigateTo(modules.auth_signin.enable, modules.auth_signin.name);
      return false;
    }

    const res = await addItemToCart({
      // item 供埋点取 sku/id；types 必须显式声明为 variant：
      // GET_PRODUCT_BY_URL_KEY 的 variants 段没有 select __typename，
      // 用 selectedVariant.__typename 会拿到 undefined，被 addToCart 判成
      // simple 分支，而 simple 分支依赖 item.sku（父 configurable 的 sku 不能直接加购），
      // 最终发出 sku 缺失的 mutation 被服务端拒绝，购物车不变。
      item: matchedVariant?.product ?? selectedVariant?.product,
      quantity,
      types: TYPENAME_VARIANT,
      parentSku: product.sku,
      selectedOptions: sortedUids,
      itemPrice: priceProps.getPriceFinalValue,
      currency: priceProps.getPriceCurrency,
    });

    // 有 user_errors 视为加购失败
    const addResult = res?.data?.addProductsToCart;
    const userErrors = addResult?.user_errors?.length || 0;

    // res 为 undefined 意味着 mutation 抛异常被 addToCart 的 catch 吞掉了，
    // 绝不能当成成功（否则 BUY_NOW 会带着没加购的车跳 checkout）
    return addResult != null && userErrors === 0;
  }, [
    quantity,
    matchedVariant,
    selectedVariant,
    product,
    selectedVariantOpt,
    priceProps,
    sortedUids,
    getRxUserType,
  ]);

  // ---- Confirm ----
  const handleOk = useCallback(async () => {
    if (!isSelectionComplete) {
      setAlert({
        type: TYPE_FAILED,
        message: `Please select ${missingOptions.join(', ')}`,
      });
      return;
    }
    if (!matchedVariant) {
      return;
    }
    if (stockProps.isOutOfStock) {
      if (onNotifyMe) {
        onNotifyMe();
      } else {
        modalRef?.current?.dismiss();
        fetchNotifyMe();
      }
      return;
    }

    if (cartAction === CART_ACTIONS.CHANGE) {
      // 换规格：更新购物车 item（成功后回调 onSuccess 刷新），随后关闭弹窗
      updateVariant({
        cartItemId,
        parentSku: product.sku,
        quantity,
        variantSku: matchedVariant.product.sku,
      }).then(() => onSuccess?.());
      onClose?.();
    } else if (
      cartAction === CART_ACTIONS.BUY_NOW &&
      // 当前选中的具体变体已在购物车（map 同时按父 sku 与 configured_variant.sku 记录）：
      // 不加购，直接跳 checkout（与 simple 商品 Buy Now 方案 b 一致）
      getRxProductIdCartItemIdMap?.[matchedVariant?.product?.sku] != null
    ) {
      onClose?.();
      navigateTo(modules.cart_checkout.enable, modules.cart_checkout.name);
    } else {
      // ADD_TO_CART / BUY_NOW：加购；BUY_NOW 加购成功后跳转 checkout（与 simple 商品一致）
      setConfirmLoading(true);
      try {
        const added = await onAddToCart();
        onClose?.();
        if (cartAction === CART_ACTIONS.BUY_NOW && added) {
          navigateTo(modules.cart_checkout.enable, modules.cart_checkout.name);
        }
      } finally {
        setConfirmLoading(false);
      }
    }
  }, [
    isSelectionComplete,
    missingOptions,
    matchedVariant,
    stockProps,
    cartAction,
    cartItemId,
    product,
    quantity,
    onAddToCart,
    onSuccess,
    onClose,
  ]);

  useEffect(() => {
    if (alert?.message) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, ALERT_AUTO_DISMISS_MS);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  return {
    // State
    loading,
    product,
    selectedVariant,
    selectedVariantOpt,
    quantity,
    cartAction,
    alert,
    isSelectionComplete,
    matchedVariant,
    defaultHeaderImageUri,
    headerImageUri,
    configurableFinalPrice,
    stockProps,
    isButtonDisabled,
    confirmLoading,
    missingOptions,
    priceProps,
    canIncrease,
    canDecrease,
    // Setters
    setSelectedVariant,
    setSelectedVariantOpt,
    setQuantity,
    setAlert,
    // Actions
    init,
    open,
    openSync,
    reset,
    onIncreaseQuantity,
    onDecreaseQuantity,
    onChangeText,
    onEndEditing,
    handleOk,
  };
};

export default useVariantPicker;
