import {useCallback, useState} from 'react';

import {useReactiveVar} from '@apollo/client';

import {useTranslation} from 'react-i18next';
import lGet from 'lodash/get';

import {SET_PRODUCT_ALERT_NOTIFY} from '@app/components/ButtonNotifyMe/services/schema';
import {USER_GUEST} from '@app/helpers/Constants';
import useCustomMutation from '@app/hooks/useCustomMutation';
import {
  rxAppSnackbar,
  rxUserInformation,
  rxUserType,
} from '@app/services/cache';

const useNotifyMe = productId => {
  const {t} = useTranslation();

  const userType = useReactiveVar(rxUserType);
  const getUserType = useReactiveVar(rxUserType);
  const getRxUserData = useReactiveVar(rxUserInformation);

  const [loading, setLoading] = useState(false);

  const {onRefetchData: setProductAlertNotify} = useCustomMutation({
    schema: SET_PRODUCT_ALERT_NOTIFY,
    configErr: {
      isBypass: true,
    },
  });

  const onNotifyMe = useCallback(async () => {
    if (getUserType === USER_GUEST) {
      rxAppSnackbar({message: t('label.pleaseLoginFirst')});
      return;
    }

    if (!productId || !getRxUserData?.email) {
      return;
    }

    setLoading(true);
    try {
      const res = await setProductAlertNotify({
        paramsOpt: {isReturn: true},
        params: {
          email: getRxUserData.email,
          productId,
        },
      });

      if (res) {
        const message = lGet(res, 'data.ProductAlertNotifyInStock.message');
        rxAppSnackbar({message: message});
      }
    } catch (error) {
      rxAppSnackbar({message: t('label.somethingWentWrong')});
    } finally {
      setLoading(false);
    }
  }, [userType, productId, getRxUserData?.email, setProductAlertNotify, t]);

  return {
    onNotifyMe,
    loading,
  };
};

export default useNotifyMe;
