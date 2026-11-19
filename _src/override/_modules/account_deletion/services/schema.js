import gql from 'graphql-tag';

export const DELETE_CUSTOMER = gql`
  mutation deleteCustomerAcount {
    deleteCustomerAcount {
      status
      message
    }
  }
`;
