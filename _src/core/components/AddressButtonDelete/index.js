import React, {useState} from 'react';
import useCustomMutation from '@app/hooks/useCustomMutation';
import {ActivityIndicator} from 'react-native-paper';
import {DELETE_ADDRESS} from '@app/_modules/account/services/schema';
import {useRefetchAddress} from '@app/hooks/useRefetchAddress';

import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {useReactiveVar} from '@apollo/client';
import {rxUserTheme} from '@app/services/cache';
import {Colors} from '@app/styles';
import {DARK} from '@app/helpers/Constants';

const DeleteAddressButton = ({addressId, styleProp = {}}) => {
  const [loading, setLoading] = useState(false);
  const scheme = useReactiveVar(rxUserTheme);

  const {onRefetchData: deleteAddressHook} = useCustomMutation({
    schema: DELETE_ADDRESS,
  });
  const {refetch} = useRefetchAddress();

  const onDeleteAddress = async () => {
    try {
      setLoading(true);
      await deleteAddressHook({
        params: {
          id: addressId,
        },
        paramsOpt: {isReturn: true},
      });
      await refetch();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      // console.log(error);
    }
  };

  return (
    <>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <CustomView
          onPress={onDeleteAddress}
          borderColor={scheme === DARK ? Colors.WHITE : Colors.BLACK}
          borderRadius={15}
          paddingHorizontal={10}
          paddingVertical={3}
          style={[styleProp]}>
          <Text small>Del</Text>
        </CustomView>
      )}
    </>
  );
};

export default DeleteAddressButton;
