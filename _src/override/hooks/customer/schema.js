import {gql} from '@apollo/client';
import {filterGraphql} from '@app/services/helper';

const schemaHooks = () => {
  const GET_USER_STORE_CREDIT = gql(
    filterGraphql(`
        query customerStoreCredit {
            customer {
                store_credit {
                    current_balance {
                        value
                    }
                }
            }
        }
      `),
  );
  const GET_USER_REWARD_POINT = gql(
    filterGraphql(`
          query customerRewardPoints{
              customerRewardPoints {
                  balance
                  balanceCurrency
                  formatedBalanceCurrency
              }
          }
        `),
  );

  const GET_CUSTOMER_ADDRESS_SIMPLE = gql(
    filterGraphql(`
        query customerAddresses {
            customer {
                addresses {
                    id
                    default_billing
                    default_shipping
                }
            }
        }
    `),
  );

  return {
    GET_USER_STORE_CREDIT,
    GET_USER_REWARD_POINT,
    GET_CUSTOMER_ADDRESS_SIMPLE,
  };
};

export default schemaHooks;
