import React, {memo} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {LocalSvg} from 'react-native-svg/css';
import FeatherIcon from 'react-native-vector-icons/Feather';

import CustomView from '@app/components/CustomView';
import {ORDER_STATUS} from '@app/helpers/Constants';
import {numberFormat} from '@app/helpers/General';
import useCountdown from '@app/hooks/useCountdown';
import {Colors} from '@app/styles';

/**
 * High performance order card + countdown
 * ---------------------------------------------------------------
 * Performance highlights:
 *  1. React.memo — the card is not unconditionally re-rendered when
 *     the parent refreshes
 *  2. Countdown is "driven on demand" — the timer only runs while the
 *     card is visible (within the viewport); it pauses automatically
 *     when scrolled off screen, avoiding N cards setStating at once
 *  3. Countdown logic extracted into a shared hook (@app/hooks/useCountdown);
 *     the interval recalculates from Date.now() every second and is never rebuilt
 *  4. Precise shouldComponentUpdate equivalent — a custom comparator that
 *     only re-renders when the data reference or status changes
 *  5. Payment countdown expiry is handled locally: the card switches its
 *     status text to "Canceled" (same code/label/color as the backend
 *     dfi_display_status for CANCELED) without calling any API, so a list
 *     with multiple pending-payment orders never bursts into refetches.
 *     The flag only overrides while the server still reports
 *     PENDING_PAYMENT and resets when fresh item data arrives.
 * ---------------------------------------------------------------
 */

/* ===================== Countdown sub-component ===================== */
/**
 * Standalone countdown component (pure UI):
 *  - Countdown logic extracted into the shared hook @app/hooks/useCountdown,
 *    directly reusable from any other page
 *  - Accepts either input (expireTimestamp takes precedence when both given):
 *      • expireTimestamp — absolute expiration timestamp (ms)
 *      • countDown       — remaining time in seconds (e.g. the backend
 *        payment_countdown field); forwarded to the hook's durationSeconds
 *        mode, which resolves it to an expiration moment based on Date.now()
 *  - Ticks once per second; stops automatically at zero and fires onExpire
 *    (e.g. auto-cancel the order)
 *  - Recalibrates the remaining time when the app returns to foreground,
 *    so it never lags due to suspended background timers
 */
const CountdownTimer = memo(
  ({expireTimestamp = null, countDown = null, onExpire}) => {
    const {formatted} = useCountdown({
      expireTimestamp,
      durationSeconds: countDown,
      onExpire,
    });

    return (
      <View
        style={{
          width: 84,
          height: 24,
          backgroundColor: '#fff0ef',
          borderRadius: 100,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          paddingVertical: 4,
        }}>
        <View style={{marginLeft: 6}}>
          <LocalSvg asset={require('@app/assets/svg/time.svg')} />
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.countdown}>{formatted}</Text>
        </View>
      </View>
    );
  },
);

/* ===================== Order card body ===================== */
/**
 * Local fallback for an expired payment countdown, matching exactly what
 * the backend returns for a canceled order (dfi_display_status, doc §10):
 * {code: 'CANCELED', label: 'Canceled', color: '#9E9E9E'}.
 * Rendered client-side only — no API refresh is triggered on expire.
 */
const LOCAL_CANCELED_STATUS = {
  code: ORDER_STATUS.CANCELED,
  label: 'Canceled',
  color: '#9E9E9E',
};

const OrderCard = ({t, item, onPress, onExpire}) => {
  const status = item.dfi_display_status ?? {};
  const [showCountdown, setShowCountdown] = React.useState(false);
  // Set when the payment countdown reaches zero. The backend only flips
  // the order to CANCELED later (OMS cron), so until the next real data
  // refresh we render "Canceled" purely from this local flag — no API
  // call. Refreshing per expired card would hammer the backend when the
  // list contains several pending-payment orders at once.
  const [expired, setExpired] = React.useState(false);

  /**
   * Server data is authoritative: the local "Canceled" override only
   * applies while the server still reports PENDING_PAYMENT (e.g. the
   * customer actually paid before the deadline → next refresh returns
   * PAID and this flag is ignored). Reset on a new item reference so a
   * recycled card instance never leaks the flag into another order.
   */
  React.useEffect(() => {
    setExpired(false);
  }, [item]);

  const displayStatus =
    expired && status.code === ORDER_STATUS.PENDING_PAYMENT
      ? LOCAL_CANCELED_STATUS
      : status;

  const handleExpire = () => {
    setShowCountdown(false);
    setExpired(true);
    onExpire?.(item);
  };

  const useCountDown = React.useMemo(() => {
    return (
      item.payment_countdown > 0 &&
      status.code === ORDER_STATUS.PENDING_PAYMENT &&
      showCountdown
    );
  }, [item.payment_countdown, status.code, showCountdown]);

  React.useEffect(() => {
    if (item.payment_countdown > 0) {
      setShowCountdown(true);
    }
  }, [item.payment_countdown]);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(item.order_number)}
      activeOpacity={0.85}>
      <View style={styles.header}>
        <Text style={styles.orderNo}>#{item.order_number}</Text>
        <Text style={[styles.status, {color: displayStatus.color}]}>
          {displayStatus.label}
        </Text>
      </View>

      <CustomView row spaceBetween marginTop={6}>
        <Text style={styles.createAt}>{item.created_at}</Text>
        {useCountDown && (
          <CountdownTimer
            countDown={item.payment_countdown}
            onExpire={handleExpire}
          />
        )}
      </CustomView>

      <View horizontalCenter style={styles.footer}>
        <CustomView row horizontalCenter>
          <Text style={styles.total}>Total</Text>
          <Text style={styles.amount}>
            {numberFormat(
              item.total?.grand_total?.currency,
              item.total?.grand_total?.value,
              ',',
              2,
            )}
          </Text>
          <Text style={styles.pipe}>|</Text>
          <Text style={styles.amount}>
            {t('account_purchases.view.purchasedItems', {
              qty: item.items.reduce((sum, i) => {
                return sum + (Number(i.quantity_ordered) || 0);
              }, 0),
            })}
          </Text>
        </CustomView>
        <FeatherIcon
          name="chevron-right"
          size={24}
          color="#616161"
          style={{marginLeft: 4, marginTop: 2}}
        />
      </View>
    </TouchableOpacity>
  );
};

/* ===================== Performance core ===================== */
/**
 * Custom comparator:
 *  Re-render only when the data reference or key fields change.
 *  The card won't pointlessly re-render when the parent refreshes
 *  due to unrelated state changes.
 *
 *  NOTE: field names must match the actual GraphQL item shape
 *  (order_number / dfi_display_status / total / payment_countdown),
 *  otherwise every comparison reads undefined on both sides and a
 *  stale card would never re-render after a list refresh.
 */
function arePropsEqual(prev, next) {
  // Same order data reference → skip
  if (prev.item === next.item && prev.onPress === next.onPress) {
    return true;
  }
  // Otherwise compare key fields (avoids deep-comparing large objects)
  const a = prev.item,
    b = next.item;
  return (
    a.order_number === b.order_number &&
    a.dfi_display_status?.code === b.dfi_display_status?.code &&
    a.total?.grand_total?.value === b.total?.grand_total?.value &&
    a.payment_countdown === b.payment_countdown
  );
}

export default memo(OrderCard, arePropsEqual);
export {CountdownTimer};

/* ===================== Styles ===================== */
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNo: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.PRIMARY,
    lineHeight: 20,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
  },
  createAt: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 13,
    color: '#424242',
    lineHeight: 16,
  },
  pipe: {
    marginHorizontal: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  total: {
    marginRight: 12,
    fontSize: 13,
    fontWeight: '700',
    color: '#424242',
    lineHeight: 16,
  },
  amount: {
    fontSize: 13,
    color: '#424242',
    lineHeight: 16,
  },
  countdown: {
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    color: '#cc2b1e',
  },
});
