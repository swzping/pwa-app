import {gql} from '@apollo/client';
import {filterGraphql} from '@app/services/helper';

export const ACCOUNT_NEWSLETTER = gql(
  filterGraphql(`
  mutation SubscribeToNewsletter($email: String!) {
    subscribeEmailToNewsletter(email: $email) {
      status
      __typename
    }
  }
`),
);
