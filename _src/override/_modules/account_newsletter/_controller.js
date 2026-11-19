import React, {useState} from 'react';
import {rxAppSnackbar} from '@app/services/cache';
import {modules} from '@root/swift.config';
import {ACCOUNT_NEWSLETTER} from '@app/_modules/account_newsletter/services/schema';
import Views from '@app/_modules/account_newsletter/_view';
import useCustomMutation from '@app/hooks/useCustomMutation';
import {navigateTo} from '@app/helpers/Navigation';
import {
  ERROR_CANNOT_SUBSCRIBE,
  TYPE_FAILED,
  ERROR_EMAIL_ALREADY_SUBSCRIBE,
  SUBSCRIBED,
  EMAIL_SUBSCRIBED,
} from '@app/helpers/Constants';
import {useTranslation} from 'react-i18next';

const NewsLetter = () => {
  if (!modules.account_newsletter.enable) {
    return null;
  }

  const {t} = useTranslation();
  const [alert, setAlert] = useState(false);
  const {onRefetchData, loading} = useCustomMutation({
    schema: ACCOUNT_NEWSLETTER,
  });

  /**
   * ---------------------------------------------------- *
   * @function onPostData
   * @summary post data for track order
   * ---------------------------------------------------- *
   */

  const onPostData = async params => {
    setAlert(false);
    try {
      const res = await onRefetchData({
        paramsOpt: {isReturn: true},
        params: {
          email: params.email,
        },
      });
      const message = res?.message;
      if (message) {
        const isUserError =
          message.includes(ERROR_CANNOT_SUBSCRIBE) ||
          message.includes(ERROR_EMAIL_ALREADY_SUBSCRIBE);
        if (isUserError) {
          throw message;
        }
      } else if (res?.data?.subscribeEmailToNewsletter?.status === SUBSCRIBED) {
        rxAppSnackbar({message: EMAIL_SUBSCRIBED});
      }
    } catch (err) {
      setAlert({type: TYPE_FAILED, message: err.toString()});
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function onPostError
   * @summary on event for error in forms
   * ---------------------------------------------------- *
   */
  const onPostError = () => {
    rxAppSnackbar({message: t('account_newsletter.error.completeAll')});
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
    t,
    onPostData,
    onPostError,
    loading,
    onPressCart,
    alert,
  };

  return <Views {...controllerProps} />;
};

export default NewsLetter;
