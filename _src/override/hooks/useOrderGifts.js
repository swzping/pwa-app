import {useApolloClient} from '@apollo/client';
import {GET_FREE_GIFTS_FOR_ORDER} from '@app/services/queries/gwp';

const useOrderGifts = () => {
  const client = useApolloClient();

  const getFreeGiftsForOrder = async orderId => {
    if (!orderId) {
      return [];
    }
    try {
      const res = await client.query({
        query: GET_FREE_GIFTS_FOR_ORDER,
        variables: {orderId},
        fetchPolicy: 'cache-first',
        context: {method: 'GET'},
      });
      const gifts = res?.data?.freeGiftsForOrder ?? [];
      return gifts;
    } catch (err) {
      return [];
    }
  };

  return {getFreeGiftsForOrder};
};

export default useOrderGifts;
