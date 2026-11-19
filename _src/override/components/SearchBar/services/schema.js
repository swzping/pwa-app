import {gql} from '@apollo/client';
import {filterGraphql} from '@app/services/helper';

const price_range = `
  price_range {
    minimum_price {
      discount {
        amount_off
        percent_off
      }
      regular_price {
        value
        currency
      }
      final_price {
        currency
        value
      }
    }
    maximum_price {
      discount {
        amount_off
        percent_off
      }
      regular_price {
        value
        currency
      }
      final_price {
        currency
        value
      }
    }
  }
`;

export const GET_AUTOCOMPLETE_RESULT = gql(
  filterGraphql(`
    query getAutocompleteResults($search: String!) {
      products(search: $search, currentPage: 1, pageSize: 3) {
        aggregations {
          label
          count
          attribute_code
          options {
            label
            value
          }
        }
        items {
          id
          name
          small_image {
            url
          }
          sku
          url_key
          url_suffix
          ${price_range}
          price {
            regularPrice {
              amount {
                value
                currency
              }
            }
          }
        }
        page_info {
          total_pages
        }
        total_count
      }
    }
  `),
);
