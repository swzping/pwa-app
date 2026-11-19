import gql from 'graphql-tag';
import {filterGraphql} from '@app/services/helper';

export const OSMOS_GET_PRODUCT_BY_SKU = gql(
  filterGraphql(`
    query osmosGetProductBySku($sku: String!) {
      products(filter: {sku: {eq: $sku}}, pageSize: 1) {
        items {
          url_key
          sku
        }
      }
    }
  `),
);

export const OSMOS_GET_BRAND_LIST = gql(
  filterGraphql(`
    query osmosGetBrandList {
      getBrandList {
        items {
          attribute_id
          category_url
          name
        }
      }
    }
  `),
);
