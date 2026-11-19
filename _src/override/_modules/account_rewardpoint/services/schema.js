import {gql} from '@apollo/client';
import {filterGraphql} from '@app/services/helper';

export const GET_CUSTOMER_REWARD_POINTS = gql(
  filterGraphql(`
  query getRewardPoint($pageSize: Int, $currentPage: Int) {
    customerRewardPoints {
      balance
      balanceCurrency
      formatedBalanceCurrency
      formatedSpendRate
      spendRate
      transaction_history(pageSize: $pageSize, currentPage: $currentPage) {
        items {
          transactionId
          balance
          comment
          expirationDate
          points
          transactionDate
          __typename
        }
        page_info {
          current_page
          page_size
          total_pages
          __typename
        }
        total_count
        __typename
      }
      __typename
    }
  }
`),
);
