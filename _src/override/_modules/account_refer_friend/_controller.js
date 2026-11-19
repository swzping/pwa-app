import React from 'react';
import {modules} from '@root/swift.config';
import {navigateTo} from '@app/helpers/Navigation';
import {rxAppSnackbar} from '@app/services/cache';
import {useTranslation} from 'react-i18next';
import {
  GET_REFERAL_LINK_INFO,
  IS_REFERAL_GENERATED,
  GENERATE_REFERAL,
} from '@app/_modules/account_refer_friend/services/schema';

import Views from '@app/_modules/account_refer_friend/_view';
import useCustomQuery from '@app/hooks/useCustomQuery';
import useCustomMutation from '@app/hooks/useCustomMutation';
import Clipboard from '@react-native-clipboard/clipboard';

const AccountReferFriend = () => {
  if (!modules.account_refer_friend.enable) {
    return null;
  }

  /**
   * ---------------------------------------------------- *
   * @var hooks
   * ---------------------------------------------------- *
   */
  const {t} = useTranslation();
  const {
    data: referalData,
    onRefetchData: getReferralLinkInfo,
    loading,
  } = useCustomQuery({
    schema: GET_REFERAL_LINK_INFO,
    useInitData: true,
  });
  const {data: isReferralInfoGenerated} = useCustomQuery({
    schema: IS_REFERAL_GENERATED,
    useInitData: true,
  });
  const {onRefetchData} = useCustomMutation({
    schema: GENERATE_REFERAL,
  });

  /**
   * ---------------------------------------------------- *
   * @function onPressGenerate
   * @summary generate referal link
   * ---------------------------------------------------- *
   */

  const onPressGenerate = async () => {
    await onRefetchData({});
    await getReferralLinkInfo({});
  };

  /**
   * ----------------------------------------- *
   * @function onPressCopy
   * @summary Copy text to clipboard
   * ----------------------------------------- *
   */
  const onPressCopy = text => {
    Clipboard.setString(text);
    rxAppSnackbar({message: t('account_refer_friend.successCopyClipboard'), type: 'success'});
  };

  /**
   * ----------------------------------------- *
   * @function onPressCart
   * @summary navigate to product detail
   * ----------------------------------------- *
   */
  const onPressCart = () => {
    navigateTo(modules.cart.enable, modules.cart.name);
  };

  /**
   * ---------------------------------------------------- *
   * @constant controllerProps
   * @return {object}
   * ---------------------------------------------------- *
   */
  const controllerProps = {
    onPressGenerate,
    onPressCopy,
    loading,
    onPressCart,
    referalData: referalData?.data?.getReferralLinkInfo,
    isReferralInfoGenerated:
      isReferralInfoGenerated?.data?.isReferralInfoGenerated,
  };

  return <Views {...controllerProps} />;
};

export default AccountReferFriend;
