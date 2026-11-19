import React, {useCallback, useEffect, useMemo, useRef,useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import FeatherIcon from 'react-native-vector-icons/Feather';

import {useReactiveVar} from '@apollo/client';
import {modules} from '@root/swift.config';

import ProductItem from '@app/_modules/product_list/atoms/ProductItem';
import NavBar from '@app/components/NavBar';
import Text from '@app/components/Text';
import {navigateTo} from '@app/helpers/Navigation';
import useCarts from '@app/hooks/carts/useCarts';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {rxCartDataItem, rxCartQty} from '@app/services/cache';
import {GET_ELIGIBLE_PRODUCTS_FOR_GWP} from '@app/services/queries/gwp';
import {Mixins} from '@app/styles';

import styles from './styles';

const mapItems = (raw = []) =>
  raw.map(it => ({
    id: String(it?.id ?? it?.sku ?? Math.random()),
    name: it?.name ?? '',
    image: it?.image?.url ?? '',
    stock_status: it?.stock_status,
    salable_qty: it?.stock_item?.salable_qty ?? 0,
    sku: it?.sku,
    url_key: it?.url_key,
  }));

const GwpList = ({route}) => {
  const [expanded, setExpanded] = useState(false);
  const initialVisibleCount = 2;
  const {getFreeGiftRules} = useCarts({});
  const [rawItems, setRawItems] = useState([]);
  const [banner, setBanner] = useState({});
  const [loading, setLoading] = useState(true);
  const cartData = useReactiveVar(rxCartDataItem);
  const lastCartHash = useRef(null);
  const cartQty = useReactiveVar(rxCartQty);
  const lastQtyRef = useRef(cartQty);
  const loaderGuardRef = useRef(null);
  const pendingRefreshRef = useRef(false);
  const lastCartSnapshotRef = useRef([]);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const toastTimerRef = useRef(null);
  const hasQtyInitRef = useRef(false);
  const hasCartSnapshotInitRef = useRef(false);
  const localStyles = StyleSheet.create({
    toastWrapper: {
      position: 'absolute',
      left: 12,
      right: 12,
      top: 140,
      zIndex: 20,
    },
    toastBox: {
      backgroundColor: '#E8F5E9',
      borderWidth: 1,
      borderColor: '#2E7D32',
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 4,
      shadowOffset: {width: 0, height: 2},
    },
    toastIcon: {width: 18, height: 18, marginRight: 8},
    toastText: {color: '#1B5E20', fontWeight: '600'},
    oosOverlay: {
      position: 'absolute',
      top: 12,
      left: 12,
      right: 12,
      bottom: 12,
      backgroundColor: 'rgba(0,0,0,0.3)',
      borderRadius: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    oosText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
      textAlign: 'center',
      lineHeight: 14,
    },
  });

  useEffect(() => {
    if (!cartData || !Array.isArray(cartData)) {
      return;
    }
  }, [cartData]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const rules = await getFreeGiftRules?.();
        const rule = Array.isArray(rules) && rules.length > 0 ? rules[0] : null;
        if (rule) {
          setRawItems(rule.items || []);
          setBanner({
            is_eligible: !!rule.is_eligible,
            missing_eligible_amount: Number(rule?.missing_eligible_amount ?? 0),
            missing_eligible_qty: Number(rule?.missing_eligible_qty ?? 0),
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!cartData || !Array.isArray(cartData)) {
      return;
    }

    const currentHash = JSON.stringify(
      cartData.map(it => ({
        id: it.id,
        quantity: it.quantity,
        sku: it?.product?.sku,
      })),
    );

    const hasOptimisticEdit = cartData.some(it => it?.edit === true);
    if (hasOptimisticEdit) {
      return;
    }
    if (lastCartHash.current === currentHash && !pendingRefreshRef.current) {
      return;
    }
    try {
      if (!hasCartSnapshotInitRef.current) {
        lastCartSnapshotRef.current = cartData;
        hasCartSnapshotInitRef.current = true;
      } else {
        const prevBySku = {};
        (lastCartSnapshotRef.current || []).forEach(it => {
          prevBySku[it?.product?.sku] = Number(it?.quantity || 0);
        });
        const currBySku = {};
        (cartData || []).forEach(it => {
          currBySku[it?.product?.sku] = Number(it?.quantity || 0);
        });
        let added = false;
        Object.keys(currBySku).forEach(sku => {
          const prevQty = prevBySku[sku] || 0;
          const currQty = currBySku[sku] || 0;
          if (currQty > prevQty) {
            added = true;
          }
        });
        if (added) {
          if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
          }
          setShowAddedToast(true);
          toastTimerRef.current = setTimeout(
            () => setShowAddedToast(false),
            1500,
          );
        }
        lastCartSnapshotRef.current = cartData;
      }
    } catch (e) {}

    lastCartHash.current = currentHash;

    setLoading(true);
    if (loaderGuardRef.current) {
      clearTimeout(loaderGuardRef.current);
    }
    loaderGuardRef.current = setTimeout(() => setLoading(false), 2500);
    const timer = setTimeout(async () => {
      try {
        const rules = await getFreeGiftRules?.();
        const rule = Array.isArray(rules) && rules.length > 0 ? rules[0] : null;
        if (!rule) {
          return;
        }
        setRawItems(rule.items || []);
        setBanner({
          is_eligible: !!rule.is_eligible,
          missing_eligible_amount: Number(rule?.missing_eligible_amount ?? 0),
          missing_eligible_qty: Number(rule?.missing_eligible_qty ?? 0),
        });
      } catch (e) {
      } finally {
        if (loaderGuardRef.current) {
          clearTimeout(loaderGuardRef.current);
          loaderGuardRef.current = null;
        }
        setLoading(false);
        pendingRefreshRef.current = false;
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [cartData]);

  useEffect(() => {
    if (typeof cartQty !== 'number') {
      return;
    }
    if (!hasQtyInitRef.current) {
      hasQtyInitRef.current = true;
      lastQtyRef.current = cartQty;
      return;
    }
    if (lastQtyRef.current === cartQty) {
      return;
    }
    if (
      typeof lastQtyRef.current === 'number' &&
      cartQty > lastQtyRef.current
    ) {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      setShowAddedToast(true);
      toastTimerRef.current = setTimeout(() => setShowAddedToast(false), 1500);
    }
    if (Array.isArray(cartData) && cartData.some(it => it?.edit === true)) {
      lastQtyRef.current = cartQty;
      return;
    }
    lastQtyRef.current = cartQty;

    setLoading(true);
    if (loaderGuardRef.current) {
      clearTimeout(loaderGuardRef.current);
    }
    loaderGuardRef.current = setTimeout(() => setLoading(false), 2500);
    pendingRefreshRef.current = true;
    const waitUntilSettled = () =>
      new Promise(resolve => {
        const start = Date.now();
        const check = () => {
          const optimistic =
            Array.isArray(cartData) && cartData.some(it => it?.edit === true);
          if (!optimistic) {
            return resolve(true);
          }
          if (Date.now() - start > 1500) {
            return resolve(false);
          }
          setTimeout(check, 150);
        };
        check();
      });

    const timer = setTimeout(async () => {
      try {
        await waitUntilSettled();
        const rules = await getFreeGiftRules?.();
        const rule = Array.isArray(rules) && rules.length > 0 ? rules[0] : null;
        if (!rule) {
          return;
        }
        setRawItems(rule.items || []);
        setBanner({
          is_eligible: !!rule.is_eligible,
          missing_eligible_amount: Number(rule?.missing_eligible_amount ?? 0),
          missing_eligible_qty: Number(rule?.missing_eligible_qty ?? 0),
        });
      } catch (e) {
      } finally {
        if (loaderGuardRef.current) {
          clearTimeout(loaderGuardRef.current);
          loaderGuardRef.current = null;
        }
        setLoading(false);
        pendingRefreshRef.current = false;
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [cartQty, cartData]);

  const items = useMemo(() => mapItems(rawItems || []), [rawItems]);
  const visibleItems = useMemo(
    () => (expanded ? items : items.slice(0, initialVisibleCount)),
    [expanded, items],
  );

  const pageSize = 6;
  const [recPage, setRecPage] = useState(1);
  const [recItems, setRecItems] = useState([]);
  const [recTotal, setRecTotal] = useState(0);
  const {
    data: recData,
    onRefetchData: refetchRec,
    loading: recLoading,
  } = useCustomQuery({
    schema: GET_ELIGIBLE_PRODUCTS_FOR_GWP,
    useInitData: true,
    variables: {pageSize, currentPage: recPage},
    opts: {fetchPolicy: 'no-cache'},
  });

  useEffect(() => {
    if (recData?.data?.eligibleProductsForGWP) {
      const {items: arr, total_count} = recData.data.eligibleProductsForGWP;
      const mapped = (arr || []).map(p => ({
        id: p?.id,
        name: p?.name,
        sku: p?.sku,
        small_image: {url: p?.image?.url},
        price_range: p?.price_range,
        stock_status: p?.stock_status,
        stock_item: p?.stock_item,
        url_key: p?.url_key,
        type_id: 'simple',
        __typename: 'SimpleProduct',
      }));
      setRecItems(prev => (recPage === 1 ? mapped : [...prev, ...mapped]));
      setRecTotal(total_count || 0);
    }
  }, [recData]);

  const onLoadMoreRec = useCallback(() => {
    if (!recLoading && recItems.length < recTotal) {
      const next = recPage + 1;
      setRecPage(next);
      refetchRec({params: {pageSize, currentPage: next}});
    }
  }, [recLoading, recItems.length, recTotal, recPage]);

  const onNavigateToProductDetail = useCallback(
    ({productUrlKey, productSku}) => {
      navigateTo(modules.product_detail.enable, modules.product_detail.name, {
        productUrlKey,
        productSku,
      });
    },
    [],
  );

  const renderRecGrid = () => {
    const oneItemWidth = parseInt((Mixins.MAX_WIDTH - 24 - 10) / 2);
    return (
      <View
        style={{paddingHorizontal: 12, flexDirection: 'row', flexWrap: 'wrap'}}>
        {recItems.map((item, index) => (
          <View
            key={String(item?.id ?? index)}
            style={{
              marginBottom: 10,
              marginLeft: index % 2 === 1 ? 10 : 0,
              width: oneItemWidth,
            }}>
            <ProductItem
              item={item}
              index={index}
              itemWidth={oneItemWidth}
              onNavigateToProductDetail={onNavigateToProductDetail}
            />
          </View>
        ))}
      </View>
    );
  };

  const handleScroll = useCallback(
    ({nativeEvent}) => {
      const {layoutMeasurement, contentOffset, contentSize} = nativeEvent;
      const paddingToBottom = 200;
      if (
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom
      ) {
        onLoadMoreRec();
      }
    },
    [onLoadMoreRec],
  );
  return (
    <View style={styles.container}>
      <NavBar useBack useWhite useShadow={false} title="Gift With Purchase" />
      <View style={styles.topDivider} />
      {showAddedToast ? (
        <View style={localStyles.toastWrapper}>
          <View style={localStyles.toastBox}>
            <Image
              source={require('@app/assets/images/checkedOK.png')}
              style={localStyles.toastIcon}
            />
            <Text style={localStyles.toastText}>Added to cart !</Text>
          </View>
        </View>
      ) : null}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        {loading ? (
          <View
            style={[
              styles.bannerRow,
              {height: 56, alignItems: 'center', justifyContent: 'center'},
            ]}>
            <ActivityIndicator size="large" color="#FF8A2B" />
          </View>
        ) : !banner?.is_eligible ? (
          <View style={styles.bannerRow}>
            <Text style={styles.bannerText}>
              {banner?.missing_eligible_amount > 0 ? (
                <Text style={styles.bannerAmount}>{`IDR ${Number(
                  banner?.missing_eligible_amount,
                ).toLocaleString('en-US')}`}</Text>
              ) : null}
              {banner?.missing_eligible_amount > 0 &&
              banner?.missing_eligible_qty > 0
                ? ' and '
                : ''}
              {banner?.missing_eligible_qty > 0 ? (
                <Text style={styles.bannerAmount}>{`${
                  banner?.missing_eligible_qty
                } ${
                  banner?.missing_eligible_qty === 1 ? 'product' : 'products'
                }`}</Text>
              ) : null}
              {' away from free gifts!'}
            </Text>
          </View>
        ) : null}
        {visibleItems.map((item, idx) => {
          let hideDivider = false;
          if (items.length === 1) {
            hideDivider = true;
          } else if (expanded) {
            hideDivider = idx === visibleItems.length - 1;
          } else {
            if (items.length > initialVisibleCount) {
              hideDivider = idx === initialVisibleCount - 1; // second item when collapsed
            } else {
              hideDivider = idx === visibleItems.length - 1; // last of all when <= initialVisibleCount
            }
          }
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() =>
                onNavigateToProductDetail({
                  productUrlKey: item.url_key,
                  productSku: item.sku,
                })
              }
              style={[styles.itemCard, hideDivider && styles.itemCardNoBorder]}>
              <View style={styles.itemTopRow}>
                <View style={{position: 'relative'}}>
                  <Image source={{uri: item.image}} style={styles.itemImage} />
                  {item?.stock_status === 'OUT_OF_STOCK' ? (
                    <View pointerEvents="none" style={localStyles.oosOverlay}>
                      <Text style={localStyles.oosText}>{'Out of\nStock'}</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.itemRight}>
                  <Text
                    style={styles.itemName}
                    numberOfLines={2}
                    ellipsizeMode="tail">
                    {item.name}
                  </Text>
                  <View style={styles.giftTag}>
                    <Text style={styles.giftTagText}>Gift</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        {items.length > initialVisibleCount && (
          <TouchableOpacity
            style={styles.showLessRow}
            onPress={() => setExpanded(prev => !prev)}>
            <Text style={styles.showLessText}>
              {expanded ? 'Show less' : 'Show more'}
            </Text>
            <FeatherIcon
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#212121"
            />
          </TouchableOpacity>
        )}
        <View style={styles.bannerRowGet}>
          {banner?.is_eligible ? (
            <Image
              source={require('@app/assets/images/checkedOK.png')}
              style={{width: 20, height: 20, marginRight: -6}}
            />
          ) : null}
          <Text style={styles.bannerText}>
            {banner?.is_eligible && 'You just get free gifts!'}
          </Text>
        </View>

        {renderRecGrid()}
      </ScrollView>
    </View>
  );
};

export default GwpList;
