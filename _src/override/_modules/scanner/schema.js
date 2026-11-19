import {gql} from '@apollo/client';
import {filterGraphql} from '@app/services/helper';

export const GET_CATEGORY_INFO_BY_URL = gql(
  filterGraphql(`
    query Categories($urlPath: String!) {
        categories(
            filters: { 
                url_path: { 
                    eq: $urlPath
                } 
            }
        ) {
            items {
                id
                name
                uid
            }
            total_count
        }
    }
  `),
);

export const QUERY_PRODUCT_BY_BARCODE = gql(
  filterGraphql(`
    query products($barcode: String!) {
        products(
            filter: { barcodes: { like: $barcode } }
        ) {
            total_count
            items {
                id
                sku
                url_key
                name
                barcodes
            }
        }
    }
  `),
);
