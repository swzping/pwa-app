import React, {useMemo} from 'react';
import {Alert} from 'react-native';

import {modules} from '@root/swift.config';

import {useTranslation} from 'react-i18next';

import {REVOKE_CUSTOMER_TOKEN} from '@app/_modules/account/services/schema';
import Views from '@app/_modules/account_categories/_view';
import {navigateTo} from '@app/helpers/Navigation';
import {getRevokeTokenOpts} from '@app/helpers/TokenRefresh';
import {onSessionExpired} from '@app/hooks/customer/useDataCustomer';
import useCustomMutation from '@app/hooks/useCustomMutation';
import {rxAppLoading} from '@app/services/cache';

const AccountCategories = () => {
  if (!modules.account_categories.enable) {
    return null;
  }

  const {t} = useTranslation();
  const {onRefetchData: onRevokeCustomerToken} = useCustomMutation({
    schema: REVOKE_CUSTOMER_TOKEN,
  });
  /**
   * ---------------------------------------------------- *
   * @function onPressDetail
   * @param {object} item
   * @summary for event click go to Detail Category Page
   * ---------------------------------------------------- *
   */
  const onPressDetail = () => {
    navigateTo(
      modules.account_myaccount.enable,
      modules.account_myaccount.name,
      {
        type: 'category',
      },
    );
  };

  /**
   * ---------------------------------------------------- *
   * @function onPressTrackOrder
   * @summary for event click go to Press Track Order Page
   * ---------------------------------------------------- *
   */
  const onPressTrackOrder = () => {
    navigateTo(
      modules.account_trackorder.enable,
      modules.account_trackorder.name,
    );
  };

  /**
   * ---------------------------------------------------- *
   * @function onPressRewardPoint
   * @summary for event click go to Reward Point Page
   * ---------------------------------------------------- *
   */
  const onPressRewardPoint = () => {
    navigateTo(
      modules.account_rewardpoint.enable,
      modules.account_rewardpoint.name,
    );
  };

  /**
   * ---------------------------------------------------- *
   * @function onPressReferFriend
   * @summary for event click go to Refer Friend Page
   * ---------------------------------------------------- *
   */
  const onPressReferFriend = () => {
    navigateTo(
      modules.account_refer_friend.enable,
      modules.account_refer_friend.name,
    );
  };
  /**
   * ---------------------------------------------------- *
   * @function onPressProductReview
   * @summary for event click go to Product Review Page
   * ---------------------------------------------------- *
   */
  const onPressProductReview = () => {
    navigateTo(
      modules.account_product_review.enable,
      modules.account_product_review.name,
    );
  };

  /**
   * ---------------------------------------------------- *
   * @function onPressNewsletter
   * @summary for event click go to Newsletter Page
   * ---------------------------------------------------- *
   */
  const onPressNewsletter = () => {
    navigateTo(
      modules.account_newsletter.enable,
      modules.account_newsletter.name,
    );
  };

  /**
   * ---------------------------------------------------- *
   * @function onPressOrderHistory
   * @summary for event click go to Newsletter Page
   * ---------------------------------------------------- *
   */
  const onPressOrderHistory = () => {
    navigateTo(
      modules.account_purchases.enable,
      modules.account_purchases.name,
    );
  };

  /**
   * ---------------------------------------------------- *
   * @function onPressAccountInformation
   * @summary for event click go to Newsletter Page
   * ---------------------------------------------------- *
   */
  const onPressAccountInformation = () => {
    navigateTo(modules.account.enable, modules.account.name);
  };

  /**
   * ---------------------------------------------------- *
   * @function onPressStoreCredit
   * @summary for event click go to Newsletter Page
   * ---------------------------------------------------- *
   */
  const onPressStoreCredit = () => {
    navigateTo(
      modules.account_storecredit.enable,
      modules.account_storecredit.name,
    );
  };

  /**
   * ---------------------------------------------------- *
   * @function onLogOut
   * @summary clear all client and local storage
   * ---------------------------------------------------- *
   */
  const onLogOut = async () => {
    Alert.alert(t('logout.title'), t('logout.subtitle'), [
      {
        text: t('label.cancel'),
        cancelable: true,
        style: 'cancel',
      },
      {
        text: t('logout.title'),
        onPress: async () => {
          try {
            rxAppLoading(true);
             const revokeOpts = await getRevokeTokenOpts();
            await onRevokeCustomerToken({
              params: null,
              paramsOpt: {opts: revokeOpts},
            });
            await onSessionExpired();

            rxAppLoading(false);
          } catch (err) {
            rxAppLoading(false);
            console.log('[err] logout-2', err);
          }
        },
        style: 'default',
      },
    ]);
  };

  /**
   * ---------------------------------------------------- *
   * @const getHiddenMenus
   * @summary for hidden menus data loop
   * ---------------------------------------------------- *
   */
  const getHiddenMenus = useMemo(() => {
    return [
      {
        label: t('account_categories.orderHistory'),
        onPress: onPressOrderHistory,
      },
      {
        label: t('account_categories.accountInformation'),
        onPress: onPressAccountInformation,
      },
      {
        label: t('account_categories.rewardPoint'),
        onPress: onPressRewardPoint,
      },
      {
        label: t('account_categories.trackingOrder'),
        onPress: onPressTrackOrder,
      },
      {
        label: t('account_categories.storeCredit'),
        onPress: onPressStoreCredit,
      },
      {
        label: t('account_categories.productReview'),
        onPress: onPressProductReview,
      },
      {
        label: t('account_categories.newsletter'),
        onPress: onPressNewsletter,
      },
      {
        label: t('account_categories.referFriend'),
        onPress: onPressReferFriend,
      },
    ];
  }, []);

  return (
    <Views
      t={t}
      getHiddenMenus={getHiddenMenus}
      onPress={onPressDetail}
      onLogOut={onLogOut}
      onPressTrackOrder={onPressTrackOrder}
      onPressRewardPoint={onPressRewardPoint}
      onPressReferFriend={onPressReferFriend}
      onPressProductReview={onPressProductReview}
      onPressNewsletter={onPressNewsletter}
    />
  );
};

export default AccountCategories;
