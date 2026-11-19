import React, {useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator,Image, TouchableOpacity, View} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';

import {useFocusEffect} from '@react-navigation/native';

import {useReactiveVar} from '@apollo/client';
import {modules} from '@root/swift.config';

import Text from '@app/components/Text';
import {numberFormat} from '@app/helpers/General';
import {navigateTo} from '@app/helpers/Navigation';
import useCarts from '@app/hooks/carts/useCarts';
import useOrderGifts from '@app/hooks/useOrderGifts';
import {rxCartDataItem, rxCartQty} from '@app/services/cache';

import styles from './styles';

const GwpOffer = ({
  items = [],
  orderId,
  initialVisible = 2,
  onPressChevron,
  showStatus = true,
  onlyWhenEligible = false,
  showEligibleBadge = true,
  showLimitedStockText = true,
}) => {
  const [expanded, setExpanded] = useState(false);
  const {getFreeGiftRules} = useCarts({});
  const {getFreeGiftsForOrder} = useOrderGifts();

  const [apiItems, setApiItems] = useState([]);
  const [isGwpActive, setIsGwpActive] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [missingAmount, setMissingAmount] = useState(0);
  const [missingQty, setMissingQty] = useState(0);

  const [loading, setLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  const didFetchRef = useRef(false);
  const cartData = useReactiveVar(rxCartDataItem);
  const cartQty = useReactiveVar(rxCartQty);
  const lastCartHash = useRef(null);
  const lastQtyRef = useRef(cartQty);

  // 订单模式：获取订单礼物
  useEffect(() => {
    if (!orderId) {
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const gifts = await getFreeGiftsForOrder(orderId);
        if (Array.isArray(gifts) && gifts.length > 0) {
          const mapped = gifts.map(it => ({
            id: String(it?.id ?? it?.sku ?? Math.random()),
            name: it?.name ?? '',
            image: it?.image?.url ?? '',
            sku: it?.sku ?? '',
            url_key: it?.url_key ?? '',
            stock_status: it?.stock_status,
            salable_qty: it?.stock_item?.salable_qty ?? 0,
          }));
          setApiItems(mapped);
          setIsEligible(true);
          setIsGwpActive(true);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      return;
    }
    if (!cartData || !Array.isArray(cartData)) {
      return;
    }

    const currentHash = JSON.stringify(
      cartData.map(item => ({
        id: item.id,
        quantity: item.quantity,
        sku: item.product?.sku,
      })),
    );

    if (lastCartHash.current === currentHash) {
      return;
    }

    lastCartHash.current = currentHash;

    const timer = setTimeout(async () => {
      if (!getFreeGiftRules) {
        return;
      }

      setLoading(true);
      try {
        const rules = await getFreeGiftRules();
        const rule = Array.isArray(rules) && rules.length > 0 ? rules[0] : null;
        if (!rule) {
          setApiItems([]);
          setIsEligible(false);
          setIsGwpActive(false);
          setLoading(false);
          return;
        }

        const mapped = (rule.items || []).map(it => ({
          id: String(it?.id ?? it?.sku ?? Math.random()),
          name: it?.name ?? '',
          image: it?.image?.url ?? '',
          sku: it?.sku ?? '',
          url_key: it?.url_key ?? '',
          stock_status: it?.stock_status,
          salable_qty: it?.stock_item?.salable_qty ?? 0,
        }));
        const amt = Number(rule?.missing_eligible_amount ?? 0);
        const qty = Number(rule?.missing_eligible_qty ?? 0);
        const finalEligible = !!rule?.is_eligible;

        setIsEligible(finalEligible);
        setIsGwpActive(!!rules.length);
        setMissingAmount(amt);
        setMissingQty(qty);
        setApiItems(finalEligible ? mapped : []);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [cartData, orderId]);

  useEffect(() => {
    if (orderId) {
      return;
    }
    if (!getFreeGiftRules || didFetchRef.current || hasInitialized) {
      return;
    }
    didFetchRef.current = true;
    setHasInitialized(true);

    (async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 250));
      try {
        const rules = await getFreeGiftRules();
        const rule = Array.isArray(rules) && rules.length > 0 ? rules[0] : null;
        if (!rule) {
          setApiItems([]);
          setIsEligible(false);
          setIsGwpActive(false);
          setLoading(false);
          return;
        }

        const mapped = (rule.items || []).map(it => ({
          id: String(it?.id ?? it?.sku ?? Math.random()),
          name: it?.name ?? '',
          image: it?.image?.url ?? '',
          sku: it?.sku ?? '',
          url_key: it?.url_key ?? '',
          stock_status: it?.stock_status,
          salable_qty: it?.stock_item?.salable_qty ?? 0,
        }));
        const amt = Number(rule?.missing_eligible_amount ?? 0);
        const qty = Number(rule?.missing_eligible_qty ?? 0);
        const finalEligible = !!rule?.is_eligible;

        setIsEligible(finalEligible);
        setIsGwpActive(!!rules.length);
        setMissingAmount(amt);
        setMissingQty(qty);
        setApiItems(finalEligible ? mapped : []);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      return;
    }
    if (typeof cartQty !== 'number') {
      return;
    }
    if (lastQtyRef.current === cartQty) {
      return;
    }
    lastQtyRef.current = cartQty;
    const timer = setTimeout(async () => {
      if (!getFreeGiftRules) {
        return;
      }
      setLoading(true);
      try {
        const rules = await getFreeGiftRules();
        const rule = Array.isArray(rules) && rules.length > 0 ? rules[0] : null;
        if (!rule) {
          setApiItems([]);
          setIsEligible(false);
          setIsGwpActive(false);
          setLoading(false);
          return;
        }
        const mapped = (rule.items || []).map(it => ({
          id: String(it?.id ?? it?.sku ?? Math.random()),
          name: it?.name ?? '',
          image: it?.image?.url ?? '',
          sku: it?.sku ?? '',
          url_key: it?.url_key ?? '',
          stock_status: it?.stock_status,
          salable_qty: it?.stock_item?.salable_qty ?? 0,
        }));
        const amt = Number(rule?.missing_eligible_amount ?? 0);
        const qty = Number(rule?.missing_eligible_qty ?? 0);
        const finalEligible = !!rule?.is_eligible;
        setIsEligible(finalEligible);
        setIsGwpActive(!!rules.length);
        setMissingAmount(amt);
        setMissingQty(qty);
        setApiItems(finalEligible ? mapped : []);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [cartQty, orderId]);

  useFocusEffect(
    React.useCallback(() => {
      if (orderId) {
        return;
      }
      let isActive = true;
      (async () => {
        if (!getFreeGiftRules) {
          return;
        }
        try {
          const rules = await getFreeGiftRules();
          if (!isActive) {
            return;
          }
          const rule =
            Array.isArray(rules) && rules.length > 0 ? rules[0] : null;
          if (!rule) {
            setApiItems([]);
            setIsEligible(false);
            setIsGwpActive(false);
            return;
          }
          const amt = Number(rule?.missing_eligible_amount ?? 0);
          const qty = Number(rule?.missing_eligible_qty ?? 0);
          const finalEligible = !!rule?.is_eligible;
          setIsEligible(finalEligible);
          setIsGwpActive(!!rules.length);
          setMissingAmount(amt);
          setMissingQty(qty);
          const mapped = (rule.items || []).map(it => ({
            id: String(it?.id ?? it?.sku ?? Math.random()),
            name: it?.name ?? '',
            image: it?.image?.url ?? '',
            sku: it?.sku ?? '',
            url_key: it?.url_key ?? '',
            stock_status: it?.stock_status,
            salable_qty: it?.stock_item?.salable_qty ?? 0,
          }));
          setApiItems(finalEligible ? mapped : []);
        } catch (e) {}
      })();
      return () => {
        isActive = false;
      };
    }, [orderId]),
  );

  const itemsToUse = apiItems.length ? apiItems : items;
  const visibleList = expanded
    ? itemsToUse
    : itemsToUse.slice(0, initialVisible);

  const bannerTokens = useMemo(() => {
    if (isEligible) {
      return [{text: 'You just get free gifts!', highlight: false}];
    }
    const arr = [{text: '', highlight: false}];
    if (missingAmount > 0) {
      arr.push({
        text: ` ${numberFormat('IDR', missingAmount, ',', 0)}`,
        highlight: true,
      });
    }
    if (missingAmount > 0 && missingQty > 0) {
      arr.push({text: ' and', highlight: false});
    }
    if (missingQty > 0) {
      arr.push({
        text: ` ${missingQty} ${missingQty === 1 ? 'product' : 'products'}`,
        highlight: true,
      });
    }
    arr.push({text: ' away from free gifts!', highlight: false});
    return arr;
  }, [isEligible, missingAmount, missingQty]);

  const renderStatus = () => {
    if (!showStatus) {
      return null;
    }
    if (loading) {
      return (
        <View style={styles.statusBanner}>
          <View style={styles.statusRow}>
            <ActivityIndicator size="small" color="#FF8A2B" />
            <TouchableOpacity onPress={onPressChevron}>
              <Icon name="chevron-right" size={18} color="#9E9E9E" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return isEligible ? (
      <View style={styles.successBanner}>
        {/* 自绘绿色胶囊 */}
        <View style={styles.successTextContainer}>
          <Image
            source={require('@app/assets/images/freeIcon.png')}
            style={{width: 20, height: 20, resizeMode: 'contain'}}
          />
          <Text style={styles.successText}>You just get free gifts!</Text>
        </View>
      </View>
    ) : (isGwpActive
     ? ( <View style={styles.statusBanner}>
        {/* 自绘橙色胶囊 */}
        <View style={styles.pill}>
          <Image
            source={require('@app/assets/images/noFreeIcon.png')}
            style={{width: 20, height: 20, resizeMode: 'contain'}}
          />
          <Text style={styles.pillText}>Don't miss the offer!</Text>
        </View>
        {/* 文案 + 箭头 */}
        <View style={styles.statusRow}>
          <View style={{flex: 1}}>
            <Text style={styles.statusText}>
              {bannerTokens.map((tk, idx) => (
                <Text
                  key={`tk-${idx}`}
                  style={
                    tk.highlight ? styles.statusHighlight : styles.statusText
                  }>
                  {tk.text}
                </Text>
              ))}
            </Text>
          </View>
          <TouchableOpacity onPress={onPressChevron}>
            <Icon name="chevron-right" size={18} color="#9E9E9E" />
          </TouchableOpacity>
        </View>
      </View>)
     : null
    );
  };

  if (onlyWhenEligible) {
    if (loading) {
      return null;
    }
    if (!isEligible) {
      return null;
    }
  }

  return (
    <View style={styles.container}>
      {renderStatus()}
      {!loading && isEligible && (
        <Text style={styles.headerTitle}>{itemsToUse.length} item gift</Text>
      )}
      {!loading && !isEligible && isGwpActive && showLimitedStockText && (
        <Text style={styles.headerTitle}>*Limited stock available</Text>
      )}
      {!loading &&
        visibleList.map((it, idx) => {
          const eligible = isEligible;
          return (
            <View key={it.id} style={styles.card}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.row}
                onPress={() =>
                  navigateTo(
                    modules.product_detail.enable,
                    modules.product_detail.name,
                    {productSku: it?.sku, productUrlKey: it?.url_key},
                  )
                }>
                <View style={{position: 'relative'}}>
                  <Image source={{uri: it.image}} style={styles.image} />
                  {(it?.stock_status !== 'IN_STOCK' ||
                    (it?.salable_qty ?? 0) <= 0) && (
                    <View style={styles.oosOverlay}>
                      <Text style={styles.oosText}>Out of Stock</Text>
                    </View>
                  )}
                </View>
                <View style={{flex: 1}}>
                  <Text
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    style={styles.name}>
                    {it.name}
                  </Text>
                  <View style={styles.giftTag}>
                    <Text style={styles.giftTagText}>Gift</Text>
                  </View>
                </View>
              </TouchableOpacity>
              {eligible && showEligibleBadge && (
                <View style={styles.checkBadge}>
                  <Image
                    source={require('@app/assets/images/meetCondition.png')}
                    style={{width: 20, height: 20, resizeMode: 'contain'}}
                  />
                </View>
              )}
            </View>
          );
        })}
      {!loading && itemsToUse.length > initialVisible && (
        <TouchableOpacity
          onPress={() => setExpanded(prev => !prev)}
          style={styles.footer}>
          <Text style={styles.footerText}>
            {expanded ? 'Show less' : 'Show more'}
          </Text>
          <Icon
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#212121"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default GwpOffer;
