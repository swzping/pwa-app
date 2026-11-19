import {useMutation} from '@apollo/client';
import {COLLECT_COUPON} from '@app/services/mutations/collectCoupon';

const useCollectCoupon = () => {
  const [collectCoupon, {loading, error, data}] = useMutation(COLLECT_COUPON);

  const collectCouponMutation = async couponCode => {
    try {
      const result = await collectCoupon({
        variables: {
          couponCode,
        },
      });
      return result;
    } catch (err) {
      throw err;
    }
  };

  return {
    collectCoupon: collectCouponMutation,
    loading,
    error,
    data,
  };
};

export default useCollectCoupon;
