import {gql} from '@apollo/client';

import client from '@app/services/api';

const GET_BECON_CUSTOME_TOKEN = gql`
  mutation {
    generateBeconCustomerToken
  }
`;

export async function fetchBeconCustomerToken() {
  try {
    // 获取becon token
    const result = await client.query({
      query: GET_BECON_CUSTOME_TOKEN,
      variables: {},
      fetchPolicy: 'no-cache',
    });
    return result?.data?.generateBeconCustomerToken || '';
  } catch (error) {
    throw {
      code: 'UNAUTHORIZED',
      message: 'User not logged in',
    };
  }
}
