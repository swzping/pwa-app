import {gql} from '@apollo/client';
import {filterGraphql} from '@app/services/helper';

export const GET_CMS_BLOCKS = gql(
  filterGraphql(`
    query CmsBlocks($identifiers: [String]) {
      cmsBlocks(identifiers: $identifiers) {
        items {
          identifier
          content
        }
      }
    }
`),
);

export const SUBMIT_CONTACT_FORM = gql(
  filterGraphql(`
    mutation contactusFormSubmit(
      $email: String!
      $fullname: String!
      $message: String!
      $telephone: String!
    ) {
      contactusFormSubmit(
        input: {
          email: $email
          fullname: $fullname
          message: $message
          telephone: $telephone
        }
      ) {
        success_message
      }
    }
`),
);
