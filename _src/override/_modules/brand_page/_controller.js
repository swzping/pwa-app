import React, {useEffect, useState} from 'react';
import {modules} from '@root/swift.config';
import {GET_ALL_BRANDS} from '@app/_modules/brand_page/services/schema';
import Views from '@app/_modules/brand_page/_view';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {navigateTo} from '@app/helpers/Navigation';
import {useTranslation} from 'react-i18next';
import _ from 'lodash';
import {BRAND} from '@app/helpers/Constants';

const BrandController = () => {
  if (!modules.brand_page.enable) {
    return null;
  }

  /**
   * ---------------------------------------------------- *
   * @var hooks
   * ---------------------------------------------------- *
   */
  const {t} = useTranslation();
  const [allData, setAllData] = useState([]);
  const [dataFilter, setDataFilter] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const {data: dataAllBrands, loading} = useCustomQuery({
    schema: GET_ALL_BRANDS,
    useInitData: true,
  });

  /**
   * ----------------------------------------- *
   * @dependency [dataAllBrands]
   * @summary set list product review from remote
   * ----------------------------------------- *
   */
  useEffect(() => {
    if (dataAllBrands && dataAllBrands?.data) {
      const {getBrandList} = dataAllBrands?.data;
      const sortedItems = _(getBrandList.items)
        .sortBy(i => i.name)
        .groupBy(o => o.name[0].toUpperCase())
        .map((data, letter) => ({letter, data}))
        .value();
      setDataFilter(sortedItems);
      setAllData(sortedItems);
    }
  }, [dataAllBrands]);

  /**
   * ----------------------------------------- *
   * @function onPressFilter
   * @summary filter list brand
   * ----------------------------------------- *
   */
  const onPressFilter = item => {
    if (item === 'All') {
      setDataFilter(allData);
      setActiveFilter(item);
    } else {
      const newData = allData.find(e => e.letter === item);
      setDataFilter([newData]);
      setActiveFilter(item);
    }
  };

  const onPressBrand = ({item}) => {
    navigateTo(modules.product_list.enable, modules.product_list.name, {
      type: BRAND,
      category_url: item.category_url,
      categoryName: item.name,
    });
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
    data: dataFilter,
    loading,
    onPressCart,
    activeFilter,
    onPressFilter,
    onPressBrand,
  };

  return <Views {...controllerProps} />;
};

export default BrandController;
