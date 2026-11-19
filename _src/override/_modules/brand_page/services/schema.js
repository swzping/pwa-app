import {gql} from '@apollo/client';
import {filterGraphql} from '@app/services/helper';

export const GET_ALL_BRANDS = gql(
  filterGraphql(`
  query getBrands{
    getBrandList{
      page_size 
      featured{
        attribute_id 
        logo
        name
        sort_order
        is_active
        category_url
        __typename
      }
      items{
        attribute_id
        logo
        name
        sort_order
        is_active
        category_url
        __typename
      }
      __typename
    }
  }
`),
);
