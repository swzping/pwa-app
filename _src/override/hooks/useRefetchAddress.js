import {useEffect, useMemo,useState} from 'react';

import {useReactiveVar} from '@apollo/client';

import _ from 'lodash';

import {isNewAddress,parseAddress} from '@app/helpers/Address';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {useSelectShippingAddress} from '@app/hooks/useSelectShippingAddress';
import {
  rxCartDataAddress,
  rxUserAddresses,
  rxUserInformation,
} from '@app/services/cache';
import {GET_USER_DATA} from '@app/services/queries/user';

export function useRefetchAddress(isBypassSetShipping = false) {
  const currentAddressState = useReactiveVar(rxUserAddresses);
  const getRxCartAddress = useReactiveVar(rxCartDataAddress);

  const [userDataParams, setUserDataParams] = useState(null);
  const {onRefetchData: loadUserData, data: userData} = useCustomQuery({
    schema: GET_USER_DATA,
    opts: {fetchPolicy: 'no-cache'},
  });

  const userDataState = useMemo(() => {
    if (userDataParams) {
      return userDataParams;
    }
    if (userData?.data) {
      return userData.data;
    }
    return null;
  }, [userDataParams, userData]);

  const refetch = async userDataParam => {
    if (userDataParam) {
      setUserDataParams(userDataParam);
    } else {
      setUserDataParams(null);
      try {
        await loadUserData({params: null});
      } catch (error) {
        throw new Error(error);
      }
    }
  };

  const {setDefautShippingToCart} = useSelectShippingAddress();

  useEffect(() => {
    if (userDataState && userDataState?.customer) {
      // user information
      if (userDataState.customer.firstname) {
        const {
          firstname,
          lastname,
          email,
          customer_email,
          phonenumber,
          whatsapp_number,
        } = userDataState.customer;
        const accountInformationState = {
          __typename: 'AccountInformation',
          firstname,
          lastname,
          email: email || customer_email,
          phonenumber,
          whatsapp_number,
        };
        rxUserInformation(accountInformationState);
      }

      // addresses
      if (userDataState.customer.addresses) {
        const {addresses} = userDataState.customer;
        // set cart address
        if (!isBypassSetShipping) {
          if (
            getRxCartAddress === null ||
            _.size(_.get(getRxCartAddress, 'shipping_addresses')) === 0 ||
            getRxCartAddress?.billing_address === null
          ) {
            addresses.map(async item => {
              const {default_shipping, id} = item;
              if (default_shipping) {
                const res = await setDefautShippingToCart(id);
                const resCart = _.get(res, 'data.setBillingAddressOnCart.cart');
                // set address
                if (resCart) {
                  let dataAddress = {
                    shipping_addresses: null,
                    billing_address: null,
                  };
                  const shippingAddress = _.get(resCart, 'shipping_addresses');
                  const billingAddress = _.get(resCart, 'billing_address');
                  if (shippingAddress) {
                    dataAddress.shipping_addresses = shippingAddress;
                  }
                  if (billingAddress) {
                    dataAddress.billing_address = billingAddress;
                  }

                  rxCartDataAddress(dataAddress);
                }
              }
            });
          }
        }

        const parsedAddresses = parseAddress(addresses);
        rxUserAddresses(parsedAddresses);
      }
    } else if (userDataState && userDataState?.id) {
      const {default_shipping, id} = userDataState;
      let currentAddresses = [...currentAddressState];

      if (isNewAddress(currentAddresses, id)) {
        currentAddresses = [
          ...currentAddresses,
          ...parseAddress([userDataState]),
        ];
      } else {
        currentAddresses = currentAddresses.map(address => {
          if (address.addressId === userDataState.id) {
            return parseAddress([userDataState])[0];
          } else {
            return address;
          }
        });
      }
      rxUserAddresses(currentAddresses);

      if (default_shipping) {
        currentAddresses.map(address => {
          address.default_shipping = false;
        });
        setDefautShippingToCart(id);
      }
    }
  }, [userDataState]);

  return {refetch};
}
