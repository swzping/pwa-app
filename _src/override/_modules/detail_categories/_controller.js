import React, {useState, useEffect} from 'react';
import {navigateTo} from '@app/helpers/Navigation';
import {Storage} from '@app/helpers/Storage';
import {useReactiveVar} from '@apollo/client';
import {rxUserInformation} from '@app/services/cache';
import {useTranslation} from 'react-i18next';

import Views from '@app/_modules/detail_categories/_view';
import {modules} from '@root/swift.config';

const DetailCategories = ({route}) => {
  if (!modules.detail_categories.enable) {
    return null;
  }

  /**
   * ---------------------------------------------------- *
   * @var hooks
   * ---------------------------------------------------- *
   */
  const {item} = route.params;
  const {t} = useTranslation();
  const [isLogged, setIsLogged] = useState(false);
  const [title, setTitle] = useState('');
  const userData = useReactiveVar(rxUserInformation);

  useEffect(() => {
    if (item.name.includes('<span')) {
      const regex = /(<([^>]+)>)/gi;
      const resTitle = item.name.replace(regex, '');
      setTitle(resTitle);
    } else {
      setTitle(item.name);
    }
  });

  useEffect(() => {
    const getToken = async () => {
      const TOKEN = await Storage.get(Storage.name.TOKEN);
      if (TOKEN) {
        setIsLogged(true);
      }
    };
    getToken();
  });
  /**
   * ---------------------------------------------------- *
   * @function onPressCategory
   * @param {object} item
   * @summary for event click go to Detail Category Page
   * ---------------------------------------------------- *
   */
  const onPressCategory = (categoryId, categoryName) => {
    navigateTo(modules.product_list.enable, modules.product_list.name, {
      type: 'category',
      categoryId,
      categoryName,
    });
  };

  const onPressSignIn = () => {
    navigateTo(modules.auth_signin.enable, modules.auth_signin.name);
  };

  const onPressAccount = () => {
    navigateTo(
      modules.account_categories.enable,
      modules.account_categories.name,
    );
  };

  return (
    <Views
      t={t}
      onPress={onPressCategory}
      categories={item}
      title={title}
      onPressSignIn={onPressSignIn}
      isLogged={isLogged}
      userData={userData}
      onPressAccount={onPressAccount}
    />
  );
};

export default DetailCategories;
