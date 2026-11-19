import React from 'react';
// import useCustomQuery from '@app/hooks/useCustomQuery';
import {navigateUrlToPage} from '@app/helpers/Navigation';
// import {
//   GET_CATEGORIES_BY_ID,
//   GET_CATEGORIES_PARENTS,
// } from '@app/components/AddonCategorySlider/services/schema';
// import {
//   GET_CATEGORIES_BY_ID,
//   GET_CATEGORIES_PARENTS,
// } from '@app/components/AddonCategorySlider/services/schema';
import Views from '@app/components/AddonCategorySlider/views';
import {rxAppLoading} from '@app/services/cache';
import {URL_RESOLVER} from '@app/_modules/product_list/services/schema';
import {useLazyQuery} from '@apollo/client';
import {useTranslation} from 'react-i18next';
// import _ from 'lodash';

const CategorySlider = ({
  // categoryId = null,
  categorySliderData = null,
  customFrameHeight,
  frameStyle,
  frameListStyle,
  frameListContainerStyle,
}) => {
  /**
   * ----------------------------------------- *
   * @constant
   * @summary collections constant
   * ----------------------------------------- *
   */
  const {t} = useTranslation();
  const [onGetResolver] = useLazyQuery(URL_RESOLVER, {fetchPolicy: 'no-cache'});
  // const [setQuery] = useState(GET_CATEGORIES_PARENTS);
  // const {loading} = useCustomQuery({
  //   schema: categoryId ? GET_CATEGORIES_BY_ID : GET_CATEGORIES_PARENTS,
  //   useInitData: true,
  //   variables: {id: categoryId},
  // });

  /**
   * ----------------------------------------- *
   * @dependency [categoryId]
   * @summary set query and variables when
   * category change
   * ----------------------------------------- *
   */
  /*
  useEffect(() => {
    if (categoryId) {
      setQuery(GET_CATEGORIES_BY_ID);
    }
  }, [categoryId]);
  */

  /**
   * ----------------------------------------- *
   * @function onNavigateToProductList
   * @param {object} item
   * @summary navigate to product list
   * ----------------------------------------- *
   */
  /*
  const onNavigateToProductList = ({
    categoryIdParam,
    categoryNameParam,
    categoryIdentifierParam,
  }) => {
    if (
      categoryIdentifierParam === TYPE_BRANDS ||
      categoryIdentifierParam?.includes(TYPE_BRANDS)
    ) {
      navigateTo(modules.brand_page.enable, modules.brand_page.name);
    } else if (categoryIdentifierParam === CATALOG) {
      Linking.openURL('https://guardianindonesia.co.id/catalog');
    } else if (categoryIdentifierParam?.includes('blog')) {
      navigateTo(modules.blog_list.enable, modules.blog_list.name);
    } else if (
      categoryIdentifierParam?.includes('promotion') ||
      categoryIdentifierParam?.includes('produk-sponsor') ||
      categoryIdentifierParam?.includes('produk-trending')
    ) {
      let url = _.replace(categoryIdentifierParam, '?page=1', '');
      url = _.replace(url, '.html', '');
      navigateTo(modules.product_list.enable, modules.product_list.name, {
        type: BRAND,
        category_url: url,
        categoryName: categoryNameParam,
      });
    } else if (categoryIdentifierParam) {
      const urlCategoryUrl = _.replace(categoryIdentifierParam, '?page=1', '');
      const isPLP = urlCategoryUrl?.includes('.html');
      // IS PLP
      if (isPLP) {
        const urlSlug = urlCategoryUrl?.replace('.html', '');
        navigateTo(modules.product_list.enable, modules.product_list.name, {
          type: BRAND,
          category_url: urlSlug,
          categoryName: categoryNameParam,
        });
        // NOT PLP
      } else {
        const url = _.replace(
          categoryIdentifierParam,
          'https://guardianindonesia.co.id/',
          '',
        );
        let isPageBuilder = false;
        if (categoryNameParam.startsWith('Review Produk')) {
          isPageBuilder = true;
        }
        if (categoryNameParam.startsWith('Guardian Family')) {
          isPageBuilder = true;
        }
        navigateTo(modules.cms_page.enable, modules.cms_page.name, {
          identifier: url,
          type: TYPE_PAGE,
          title: categoryNameParam,
          tagsStyles: CmsStyles.tagStylesPrivacyPolicy,
          classesStyles: CmsStyles.classesStylesPrivacyPolicy,
          isPageBuilder,
        });
      }
    } else {
      navigateTo(modules.main_categories.enable, modules.main_categories.name, {
        variables: {
          type: 'category',
          categoryId: categoryIdParam,
          categoryName: categoryNameParam,
        },
      });
    }
  };
  */

  const onNavigateToPage = async item => {
    rxAppLoading(true);
    const res = await onGetResolver({
      variables: {url: item.url_redirection},
    });
    rxAppLoading(false);

    const fullUrl = item.url_redirection;
    const type = res?.data?.urlResolver?.type;
    const id = res?.data?.urlResolver?.id;
    const url_key = res?.data?.urlResolver?.relative_url?.replace('.html', '');

    navigateUrlToPage({t, fullUrl, type, id, url_key});
  };

  return (
    <Views
      // loading={loading}
      categories={categorySliderData}
      // onNavigateToProductList={onNavigateToProductList}
      onNavigateToPage={onNavigateToPage}
      customFrameHeight={customFrameHeight}
      frameStyle={frameStyle}
      frameListStyle={frameListStyle}
      frameListContainerStyle={frameListContainerStyle}
    />
  );
};

export default CategorySlider;
