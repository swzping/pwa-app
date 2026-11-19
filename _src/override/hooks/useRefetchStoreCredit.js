import {useEffect, useMemo, useState} from 'react';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {loadingStop} from '@app/helpers/General';
import {rxUserStoreCredit} from '@app/services/cache';
import {GET_USER_STORE_CREDIT} from '@app/services/queries/user';

export function useRefetchStoreCredit() {
  const [userDataParams, setUserDataParams] = useState(null);
  const {onRefetchData: loadUserData, data: userData} = useCustomQuery({
    schema: GET_USER_STORE_CREDIT,
    opts: {fetchPolicy: 'network-only'},
  });

  /**
   * ---------------------------------------------------- *
   * @dependency [userDataParams, userData]
   * @summary set wishlist data to useMemo const
   * ---------------------------------------------------- *
   */
  const userDataState = useMemo(() => {
    if (userDataParams) {
      return userDataParams;
    }
    if (userData?.data) {
      return userData.data;
    }
    return null;
  }, [userDataParams, userData]);

  /**
   * ---------------------------------------------------- *
   * @function refetch
   * @param Object wishlist
   * @summary set data to local state or get from remote
   * ---------------------------------------------------- *
   */
  const refetch = async userDataParam => {
    if (userDataParam) {
      setUserDataParams(userDataParam);
    } else {
      try {
        await loadUserData({params: null});
      } catch (error) {
        throw new Error(error);
      }
    }
  };

  /**
   * ---------------------------------------------------- *
   * @dependency [userDataState]
   * @summary populate wishlist item and set to reactive
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    if (userDataState && userDataState?.customerRewardPoints) {
      rxUserStoreCredit(userDataState?.customerRewardPoints);
      loadingStop();
    }
  }, [userDataState]);

  return {refetch};
}
