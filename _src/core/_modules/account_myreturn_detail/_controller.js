import React, {useMemo, useState} from 'react';
import {ActivityIndicator} from 'react-native-paper';
import {useReactiveVar} from '@apollo/client';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {GET_UPDATE_FORM_RMA} from '@app/_modules/account_myreturn_detail/services/schema';
import {rxUserInformation} from '@app/services/cache';
import {modules} from '@root/swift.config';
import {useTranslation} from 'react-i18next';

import RMAFormModal from '@app/_modules/account/atoms/RMAFormModal';
import RenderIf from '@app/components/RenderIf';
import Text from '@app/components/Text';
import CustomView from '@app/components/CustomView';

const ReturnDetail = ({route}) => {
  if (!modules.account_myreturn_detail.enable) {
    return null;
  }
  const {t} = useTranslation();
  const accountInformation = useReactiveVar(rxUserInformation);
  const {increment_id, order_number} = route.params;

  const [rmaFormVisibility, setRmaFormVisibility] = useState(true);

  const {data, loading, error} = useCustomQuery({
    schema: GET_UPDATE_FORM_RMA,
    useInitData: true,
    variables: {
      email: accountInformation.email,
      increment_id,
    },
    opts: {fetchPolicy: 'network-only'},
  });

  const rmaFormData = useMemo(() => {
    if (data?.data) {
      return data?.data.getUpdateFormDataAwRma?.detail_rma;
    }
    return null;
  }, [data]);

  const customFieldFormData = useMemo(() => {
    if (data?.data) {
      return data?.data.getUpdateFormDataAwRma?.form_data;
    }
    return null;
  }, [data]);

  if (loading) {
    return <ActivityIndicator />;
  }
  if (error) {
    return (
      <CustomView horizontalCenter verticalCenter>
        <Text>{t('account_myreturn_detail.error.message')}</Text>
      </CustomView>
    );
  }

  return (
    <>
      <RenderIf condition={rmaFormData}>
        <RMAFormModal
          type="update-request"
          orderNumber={order_number}
          incrementId={increment_id}
          rmaFormData={rmaFormData}
          customFieldFormData={customFieldFormData}
          visible={rmaFormVisibility}
          setVisible={setRmaFormVisibility}
        />
      </RenderIf>
    </>
  );
};

export default ReturnDetail;
