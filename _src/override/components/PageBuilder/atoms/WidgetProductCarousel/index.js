import React, {useEffect, useState, useRef} from 'react';
import useCustomQuery from '@app/hooks/useCustomQuery';
import Views from '@app/components/PageBuilder/atoms/WidgetProductCarousel/_view';
import {GET_PRODUCTS_ON_CATALOG_PRODUCTS} from '@app/_modules/product_list/services/schema';
import {modules} from '@root/swift.config';
import {navigateTo} from '@app/helpers/Navigation';
import {useTranslation} from 'react-i18next';

const pageSize = 10;
const WidgetProductCarousel = ({data}) => {
  const mount = useRef();
  const {t} = useTranslation();
  const [items, setItems] = useState([]);
  const {
    data: dataProducts,
    loading,
    // onRefetchData,
  } = useCustomQuery({
    schema: GET_PRODUCTS_ON_CATALOG_PRODUCTS,
    useInitData: true,
    opts: {fetchPolicy: 'no-cache', context: {method: 'POST'}},
    variables: {
      pageSize,
      currentPage: 1,
      categoryId: data.category_id,
      sortBy: {
        stock_status: 'DESC',
      },
    },
  });
  mount.current = true;
  // useEffect(() => {
  //   if (data && mount.current) {
  //     onRefetchData({
  //       params: {
  //         pageSize,
  //         currentPage: 1,
  //         categoryId: data.category_id,
  //       },
  //     });
  //     return () => (mount.current = false);
  //   }
  // }, [data]);

  useEffect(() => {
    if (dataProducts && dataProducts?.data?.products?.items) {
      setItems(dataProducts?.data?.products?.items);
    }
  }, [dataProducts]);

  const onNavigateToPLP = () => {
    navigateTo(modules.product_list.enable, modules.product_list.name, {
      type: 'category',
      categoryId: data.category_id,
      categoryName: data.title,
    });
  };

  const props = {
    t,
    loading,
    items,
    itemsPageSize: pageSize,
    title: data?.title,
    titleBgColor: data?.titleBgColor,
    bodyBgColor: data?.bodyBgColor,
    titleColor: data?.titleColor,
    onNavigateToPLP,
  };

  return <Views {...props} />;
};

export default WidgetProductCarousel;
