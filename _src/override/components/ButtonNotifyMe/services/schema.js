import {gql} from '@apollo/client';
import {filterGraphql} from '@app/services/helper';

export const SET_PRODUCT_ALERT_NOTIFY = gql(
  filterGraphql(`
  mutation NotifyProduct(
    $email: String!
    $productId: Int!
  ) {
    ProductAlertNotifyInStock(input: {email: $email, product_id: $productId}){
      id
      message
    }
  }
`),
);
