import React, {useEffect, useRef, useState} from 'react';

import Config from 'react-native-config';

import {modules} from '@root/swift.config';

import {useTranslation} from 'react-i18next';

import Views from '@app/_modules/main_categories/_view';
import {
  GET_CATEGORIES,
  GET_CATEGORIES_VES_MENU,
} from '@app/_modules/main_categories/services/schema';
import AnalyticsHelper, {EVENT_TOKEN} from '@app/helpers/Analytics';
import {navigateTo} from '@app/helpers/Navigation';
import {startPerfTrace} from '@app/helpers/perf';
import useCustomQuery from '@app/hooks/useCustomQuery';

const Categories = () => {
  if (!modules.main_categories.enable) {
    return null;
  }

  /**
   * ---------------------------------------------------- *
   * @var hooks
   * ---------------------------------------------------- *
   */
  const {t} = useTranslation();
  const mount = useRef();
  const categoryTraceRef = useRef();
  const {data, loading} = useCustomQuery({
    schema: Config.IS_VESMENU ? GET_CATEGORIES_VES_MENU : GET_CATEGORIES,
    useInitData: true,
  });
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState({});
  /**
   * ---------------------------------------------------- *
   * @dependency []
   * @summary for react lifecycle
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    if (!data || !data?.data) {
      return;
    }
    const tmpData = Config.IS_VESMENU
      ? data?.data?.vesMenu
      : data?.data?.categoryList[0];

    let cateList;
    let defaultShowCateData = {};
    if (tmpData) {
      if (Config.IS_VESMENU) {
        cateList = tmpData.items;
      } else {
        cateList = tmpData.children.filter(
          category => category.include_in_menu === 1,
        );
      }
      const defaultIndex = cateList.findIndex(
        item => item?.children?.length > 0,
      );
      if (defaultIndex !== -1) {
        defaultShowCateData = {
          ...cateList[defaultIndex],
          index: defaultIndex,
        };
      }
    }
    setCategories(cateList);
    setActiveCategory(defaultShowCateData);
    stopCategoryInitTrace();
  }, [data]);
  useEffect(() => {
    mount.current = true;
    startCategoryInitTrace();
    return () => {
      mount.current = false;
      if (categoryTraceRef.current) {
        categoryTraceRef.current.stop();
        categoryTraceRef.current = null;
      }
    };
  }, []);

  /**
   * ---------------------------------------------------- *
   * @function onPressCategory
   * @param {String} CategoryId CategoryName
   * @summary for event click go to PLP
   * ---------------------------------------------------- *
   */
  const onPressCategory = (categoryId, categoryName) => {
    AnalyticsHelper.trackAdjustEvent(EVENT_TOKEN.CATEGORY);
    navigateTo(modules.product_list.enable, modules.product_list.name, {
      type: 'category',
      categoryId,
      categoryName,
    });
  };

  /**
   * ---------------------------------------------------- *
   * @function onPressCategoryDetail
   * @param {object} item
   * @summary for event click go to Detail Category Page
   * ---------------------------------------------------- *
   */
  const onPressCategoryDetail = item => {
    AnalyticsHelper.trackAdjustEvent(EVENT_TOKEN.CATEGORY);
    setActiveCategory(item);
  };

  // 开始 categoriesPageInit trace
  const startCategoryInitTrace = async () => {
    categoryTraceRef.current = await startPerfTrace('categoryPageInit');
    categoryTraceRef.current.startTime = Date.now();
  };
  // 结束 stopCategoryInit trace
  const stopCategoryInitTrace = async () => {
    if (categoryTraceRef.current) {
      const duration = Date.now() - categoryTraceRef.current.startTime;
      categoryTraceRef.current.putMetric('duration_ms', duration);
      categoryTraceRef.current.putAttribute('status', 'success');
      categoryTraceRef.current.stop();
      categoryTraceRef.current = null;
    }
  };

  return (
    <Views
      t={t}
      vesMenu={Config.IS_VESMENU}
      onPress={onPressCategory}
      loading={loading}
      onPressCategory={onPressCategory}
      onPressCategoryDetail={onPressCategoryDetail}
      categories={categories}
      activeCategory={activeCategory}
    />
  );
};

export default Categories;
