import {gql} from '@apollo/client';

import {filterGraphql} from '@app/services/helper';

const wishlistSchema = () => {
  const add = gql`
    mutation addWishlist(
      $wishlistId: ID!
      $wishlistItems: [WishlistItemInput!]!
    ) {
      addProductsToWishlist(
        wishlistId: $wishlistId
        wishlistItems: $wishlistItems
      ) {
        __typename
        wishlist {
          __typename
          id
          items_v2 {
            items {
              id
              added_at
              product {
                id
                name
                sku
                url_key
                type_id
                price_range {
                  maximum_price {
                    regular_price {
                      currency
                      value
                    }
                    final_price {
                      currency
                      value
                    }
                    discount {
                      amount_off
                      percent_off
                    }
                  }
                }
                price_tiers {
                  quantity
                  final_price {
                    value
                    currency
                  }
                  discount {
                    amount_off
                    percent_off
                  }
                }
                thumbnail {
                  url
                  label
                }
              }
            }
          }
        }
      }
    }
  `;

  const remove = gql`
    mutation removeWishlist($wishlistId: ID!, $wishlistItemsIds: [ID!]!) {
      removeProductsFromWishlist(
        wishlistId: $wishlistId
        wishlistItemsIds: $wishlistItemsIds
      ) {
        __typename
        wishlist {
          __typename
          id
          items_v2 {
            items {
              id
              added_at
              product {
                id
                name
                sku
                url_key
                type_id
                price_range {
                  maximum_price {
                    regular_price {
                      currency
                      value
                    }
                    final_price {
                      currency
                      value
                    }
                    discount {
                      amount_off
                      percent_off
                    }
                  }
                }
                price_tiers {
                  quantity
                  final_price {
                    value
                    currency
                  }
                  discount {
                    amount_off
                    percent_off
                  }
                }
                thumbnail {
                  url
                  label
                }
              }
            }
          }
        }
      }
    }
  `;

  const getInformation = gql(
    filterGraphql(`
      query customer {
        customer {
          wishlist {
            id
            items_count
          }
        }
      }
  `),
  );

  const customer = gql`
    query customer {
      customer {
        wishlist {
          id
          items_count
          items_v2 {
            items {
              id
              added_at
              product {
                id
                name
                sku
                url_key
                type_id
                price_range {
                  maximum_price {
                    regular_price {
                      currency
                      value
                    }
                    final_price {
                      currency
                      value
                    }
                    discount {
                      amount_off
                      percent_off
                    }
                  }
                }
                price_tiers {
                  quantity
                  final_price {
                    value
                    currency
                  }
                  discount {
                    amount_off
                    percent_off
                  }
                }
                thumbnail {
                  url
                  label
                }
              }
            }
          }
        }
      }
    }
  `;
  const get = gql(filterGraphql(customer.loc.source.body));

  return {add, remove, get, getInformation};
};

export default wishlistSchema;
