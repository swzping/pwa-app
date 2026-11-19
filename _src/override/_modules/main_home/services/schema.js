import {gql} from '@apollo/client';

export const GET_SEARCH_PLACEHOLDER = gql`
  {
    getProductSearchPlaceholder {
      text
    }
  }
`;
