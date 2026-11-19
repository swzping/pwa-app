import React, {useMemo, useState} from 'react';
import {Text} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {useReactiveVar} from '@apollo/client';
import {rxUserInformation} from '@app/services/cache';
import {
  GET_CUSTOMER_ORDER,
  GET_FORM_DATA_RMA,
} from '@app/_modules/account_purchases_detail/services/schema';

import Views from '@app/_modules/account_purchases_detail/_view';
import {modules} from '@root/swift.config';
import {useTranslation} from 'react-i18next';

const PurchaseDetail = ({route}) => {
  if (!modules.account_purchases_detail.enable) {
    return null;
  }

  const accountInformation = useReactiveVar(rxUserInformation);
  const {email, order_number} = route.params;
  // prettier-ignore
  let filterInput = email === undefined ? {ids: {eq: order_number}} : {email, ids: {eq: order_number}};

  const [rmaFormVisibility, setRmaFormVisibility] = useState(false);

  const {formDataRMAData, onRefetchData: loadFormDataRMA} = useCustomQuery({
    schema: GET_FORM_DATA_RMA,
  });
  const {t} = useTranslation();

  const onRequestReturn = async () => {
    await loadFormDataRMA({
      params: {
        email: accountInformation.email,
        order_number,
      },
    });
  };

  const rmaFormData = useMemo(() => {
    if (formDataRMAData?.data) {
      setRmaFormVisibility(true);
      return formDataRMAData.data.getNewFormDataAwRma;
    }
    return null;
  }, [formDataRMAData]);

  const {data, loading, error} = useCustomQuery({
    schema: GET_CUSTOMER_ORDER,
    useInitData: true,
    variables: {
      filters: filterInput,
    },
  });

  if (loading) {
    return <ActivityIndicator />;
  }
  if (error) {
    return <Text>{JSON.stringify(error)}</Text>;
  }

  return (
    <Views
      t={t}
      item={data}
      onRequestReturn={onRequestReturn}
      rmaFormData={rmaFormData}
      formDataLoading={formDataRMAData.loading}
      rmaFormVisibility={rmaFormVisibility}
      setRmaFormVisibility={setRmaFormVisibility}
    />
  );
};

export default PurchaseDetail;
