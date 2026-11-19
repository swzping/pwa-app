import React, {useEffect, useState} from 'react';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {GET_FEATURED_BRANDS} from '@app/components/FeaturedBrand/services/schema';

import Views from '@app/components/FeaturedBrand/views';

const FeaturedBrand = ({useTitle = true}) => {
  /**
   * ----------------------------------------- *
   * @constant
   * @summary collections constant
   * ----------------------------------------- *
   */
  const [featuredBrands, setFeaturedBrands] = useState([]);
  const {data, loading} = useCustomQuery({
    schema: GET_FEATURED_BRANDS,
    useInitData: true,
  });

  /**
   * ----------------------------------------- *
   * @dependency [categoryId]
   * @summary set query and variables when
   * category change
   * ----------------------------------------- *
   */
  useEffect(() => {
    if (data?.data?.getBrandList) {
      let finalFeaturedBrands = [];
      const featured = data?.data?.getBrandList?.featured;
      featured.map(value => {
        const URLDirection = `${value.category_url}.html`;
        const pushData = {
          image_id: value.attribute_id,
          image_url: value.logo,
          url_redirection: URLDirection,
        };
        finalFeaturedBrands.push(pushData);
      });
      setFeaturedBrands(finalFeaturedBrands);
    }
  }, [data]);

  return (
    <Views loading={loading} brands={featuredBrands} useTitle={useTitle} />
  );
};

export default FeaturedBrand;
