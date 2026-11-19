import React from 'react';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {navigateTo} from '@app/helpers/Navigation';
import {
  GET_CATEGORIES,
  GET_CATEGORIES_VES_MENU,
} from '@app/_modules/main_categories/services/schema';

import Config from 'react-native-config';
import Views from '@app/_modules/main_categories/_view';
import {modules} from '@root/swift.config';
import {useTranslation} from 'react-i18next';

const Categories = () => {
  if (!modules.main_categories.enable) {
    return null;
  }

  const {t} = useTranslation();
  const {data, loading} = useCustomQuery({
    schema: Config.IS_VESMENU ? GET_CATEGORIES_VES_MENU : GET_CATEGORIES,
    useInitData: true,
  });

  const onPressCategory = (categoryId, categoryName) => {
    navigateTo(modules.product_list.enable, modules.product_list.name, {
      type: 'category',
      categoryId,
      categoryName,
    });
  };

  return (
    <Views
      t={t}
      vesMenu={Config.IS_VESMENU}
      onPress={onPressCategory}
      loading={loading}
      categories={
        Config.IS_VESMENU ? data?.data?.vesMenu : data?.data?.categoryList[0]
      }
      onPressCategory={onPressCategory}
    />
  );
};

export default Categories;
