import React, {useCallback, useEffect, useState} from 'react';
import {useMutation, useReactiveVar} from '@apollo/client';
import {DELETE_CUSTOMER} from '@app/_modules/account_deletion/services/schema';
import {rxAppSnackbar, rxUserInformation} from '@app/services/cache';
import {useTranslation} from 'react-i18next';
import Views from '@app/_modules/account_deletion/view';
import {modules} from '@root/swift.config';
import _ from 'lodash';
import {navigateTo} from '@app/helpers/Navigation';
import {onSessionExpired} from '@app/hooks/customer/useDataCustomer';

const Controller = () => {
  const {t} = useTranslation();
  if (!modules.account_deletion.enable) {
    return null;
  }

  const userInfo = useReactiveVar(rxUserInformation);
  const [email, setEmail] = useState(null);

  const [postDeleteCustomer, {data, error, loading}] =
    useMutation(DELETE_CUSTOMER);

  useEffect(() => {
    if (error !== undefined) {
      rxAppSnackbar({
        message: t('account_deletion.error'),
      });
    }
  }, [error]);

  const clearUser = async () => {
    try {
      await onSessionExpired();
      navigateTo(modules.main_home.enable, modules.main_home.name);
    } catch (err) {
      console.log('[err] hapus akun', err);
    }
  };

  useEffect(() => {
    const emailTemp = _.get(userInfo, 'email');
    if (emailTemp) {
      setEmail(emailTemp);
    }
  }, [userInfo]);

  useEffect(() => {
    const success = _.get(data, 'deleteCustomer.success');
    if (success) {
      rxAppSnackbar({
        message: `${t('account_deletion.success')} ${email} ${t(
          'account_deletion.success1',
        )}`,
      });
      clearUser();
    }
  }, [data]);

  const onDelete = useCallback(() => {
    if (email) {
      let variables = {
        input: {
          email,
        },
      };
      postDeleteCustomer({variables});
    }
  }, [email]);

  return <Views t={t} onDelete={onDelete} loading={loading} />;
};

export default Controller;
