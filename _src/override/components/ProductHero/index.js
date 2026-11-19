import React from 'react';

import CustomView from '@app/components/CustomView/index';
import ProductHeroItem from '@app/components/ProductHero/atoms/ProductHeroItem/index';

const ProductHero = ({data}) => {
  const ProductHeroList = ({productHeroData}) => {
    return productHeroData.map((item, index) => {
      return <ProductHeroItem key={index + 1} item={item} />;
    });
  };

  /**
   * ----------------------------------------- *
   * @constant rendering
   * @summary load product hero
   * @return Sections
   * ----------------------------------------- *
   */
  return (
    <CustomView>
      <ProductHeroList productHeroData={data} />
    </CustomView>
  );
};

export default ProductHero;
