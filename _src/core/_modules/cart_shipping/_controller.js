import React, {useState, useEffect} from 'react';
import {useReactiveVar} from '@apollo/client';
import useCustomMutation from '@app/hooks/useCustomMutation';
import {useRefetchShipping} from '@app/hooks/useRefetchShipping';
import {navigateTo} from '@app/helpers/Navigation';
import {modules} from '@root/swift.config';
import {
  rxUserType,
  rxCartId,
  rxCartIsVirtual,
  rxCartShippingAddress,
  rxCartBillingAddress,
  rxCartShippingMethod,
  rxCartExtraFee,
  rxCartAppliedStoreCredit,
  rxCartGiftCard,
  rxUserAddresses,
  rxCartShipping,
  rxAppSnackbar,
} from '@app/services/cache';

import useCarts, {TYPES} from '@app/hooks/carts/useCarts';

import {
  SET_BILLING_ADDRESS,
  SET_GUEST_EMAIL,
  SET_SHIPPING_ADDRESS,
  SET_SHIPPING_METHOD,
} from '@app/_modules/cart/services/schema';
import {
  SHIPPING_ADDRESS_ID,
  SHIPPING_METHOD_CODE,
} from '@app/helpers/Constants';

import Views from '@app/_modules/cart_shipping/_view';
import crashlytics from '@react-native-firebase/crashlytics';
import useStoreConfig from '@app/hooks/useStoreConfig';
import {useTranslation} from 'react-i18next';

const Shipping = () => {
  if (!modules.cart_shipping.enable) {
    return null;
  }
  const {data: items} = useCarts({
    initialized: true,
    type: TYPES.ITEM,
  });
  const {data: prices, setCart: setPrices} = useCarts({
    initialized: true,
    type: TYPES.PRICE,
  });

  /**
   * ----------------------------------------- *
   * @const {reactive variable}
   * @summary reactive variable collection
   * ----------------------------------------- *
   */
  const {t} = useTranslation();
  const cartIsVirtual = useReactiveVar(rxCartIsVirtual);
  const userType = useReactiveVar(rxUserType);
  const cartId = useReactiveVar(rxCartId);
  const dataExtraFee = useReactiveVar(rxCartExtraFee);
  const selectedShippingAddress = useReactiveVar(rxCartShippingAddress);
  const selectedBillingAddress = useReactiveVar(rxCartBillingAddress);
  const selectedShippingMethod = useReactiveVar(rxCartShippingMethod);
  const dataAppliedStoreCredit = useReactiveVar(rxCartAppliedStoreCredit);
  const appliedGiftCard = useReactiveVar(rxCartGiftCard);
  const userAddresses = useReactiveVar(rxUserAddresses);
  const activeSections = useReactiveVar(rxCartShipping);

  /**
   * ----------------------------------------- *
   * @const {local variable}
   * @summary local variable collection
   * ----------------------------------------- *
   */
  const {refetch: refetchShipping} = useRefetchShipping();
  const {storeConfig: coreConfig} = useStoreConfig({useInitData: true});

  /**
   * ----------------------------------------- *
   * @dependency []
   * @summary setting client state
   * ----------------------------------------- *
   */
  useEffect(() => {
    refetchShipping();
  }, []);

  /**
   * ----------------------------------------- *
   * @block {guest}
   * @summary block for handling guest email
   * ----------------------------------------- *
   */
  const [isEmailFilled, setIsEmailFilled] = useState(false);
  const {onRefetchData: setGuestEmailHook} = useCustomMutation({
    schema: SET_GUEST_EMAIL,
  });
  const onSetGuestEmail = async email => {
    if (email !== '') {
      await setGuestEmailHook({
        params: {
          input: {
            cart_id: cartId,
            email: email,
          },
        },
        paramsOpt: {isReturn: true},
      });
      setIsEmailFilled(true);
      rxAppSnackbar({
        message: `Guest email has been set to ${email}`,
      });
    }
  };
  /**
   * end of @block {guest}
   */

  /**
   * ----------------------------------------- *
   * @block {shippingAddress}
   * @summary block for handling shipping address
   * ----------------------------------------- *
   */
  const {onRefetchData: selectShippingAddressHook} = useCustomMutation({
    schema: SET_SHIPPING_ADDRESS,
  });
  const {onRefetchData: selectBillingAddressHook} = useCustomMutation({
    schema: SET_BILLING_ADDRESS,
  });
  const [shippingAddressLoading, setShippingAddressLoading] = useState(false);
  const onSelectShippingAddress = async address => {
    setShippingAddressLoading(true);
    try {
      let resShipping;
      if (!cartIsVirtual) {
        resShipping = await selectShippingAddressHook({
          params: {
            input: {
              cart_id: cartId,
              shipping_addresses: [{customer_address_id: address.addressId}],
            },
          },
          paramsOpt: {isReturn: true},
        });
      } else {
        resShipping = true;
      }

      const resBilling = await selectBillingAddressHook({
        params: {
          input: {
            cart_id: cartId,
            billing_address: {customer_address_id: address.addressId},
          },
        },
        paramsOpt: {isReturn: true},
      });

      console.log(resShipping, resBilling, {
        variables: {
          input: {
            cart_id: cartId,
            billing_address: {customer_address_id: address.addressId},
          },
        },
      });
      if (resShipping && resBilling) {
        crashlytics().setAttribute(
          SHIPPING_ADDRESS_ID,
          address.addressId.toString(),
        );
        refetchShipping(resBilling?.data?.setBillingAddressOnCart);
        rxCartShippingMethod(null);
        setShippingAddressLoading(false);
      } else {
        setShippingAddressLoading(false);
      }
    } catch (err) {
      console.log('[err] set shipping address', err);
      setShippingAddressLoading(false);
    }
  };
  /**
   * end of @block {shippingAddress}
   */

  /**
   * ----------------------------------------- *
   * @block {shippingMethod}
   * @summary block for handling shipping method
   * ----------------------------------------- *
   */
  const updateSections = activeSection => {
    rxCartShipping(activeSection);
  };
  const getTitleGroupingShipping = keyTitle => {
    switch (keyTitle) {
      case 'sg-freeshipping':
        return {
          title: 'Free Shipping',
          icon: 'inbox',
        };
      case 'sg-express':
        return {
          title: 'Express',
          icon: 'motorcycle',
        };
      case 'sg-nextday':
        return {
          title: 'Next Day',
          icon: 'car',
        };
      default:
        return {
          title: 'Reguler',
          icon: 'truck',
        };
    }
  };
  const groupingShipping = (available, config) => {
    const resultGroupingShipping = [];
    if (available && available.length > 0) {
      Object.keys(config).map((key, index) => {
        const shippingConfigs = config[key].toLowerCase().split(',');
        const filteredShipping = available.filter(item => {
          const firstConfig = `${item.carrier_code}_${item.method_code}`;
          const secondConfig = `${item.carrier_code}_${item.carrier_title}-${item.method_title}`;
          return (
            shippingConfigs.includes(firstConfig.toLocaleLowerCase()) ||
            shippingConfigs.includes(secondConfig.toLocaleLowerCase())
          );
        });
        if (selectedShippingMethod) {
          if (
            filteredShipping.filter(
              item => item.method_code === selectedShippingMethod.method_code,
            ).length > 0
          ) {
            if (activeSections.length === 0) {
              updateSections([index]);
            }
          }
        }
        const singleShippingConfig = getTitleGroupingShipping(key);
        resultGroupingShipping.push({
          title: singleShippingConfig.title,
          icon: singleShippingConfig.icon,
          value: filteredShipping,
        });
      });
    }
    return resultGroupingShipping;
  };
  const shippingConfig = coreConfig
    ? JSON.parse(coreConfig.shipments_configuration)
    : null;
  const availableShippingMethods =
    selectedShippingAddress && shippingConfig
      ? groupingShipping(
          selectedShippingAddress.available_shipping_methods,
          shippingConfig,
        )
      : [];
  const {onRefetchData: selectShippingMethodHook} = useCustomMutation({
    schema: SET_SHIPPING_METHOD,
  });
  const [shippingMethodLoading, setShippingMethodLoading] = useState(false);
  const onSelectShippingMethod = async method => {
    if (method.error_message) {
    } else {
      setShippingMethodLoading(true);
      try {
        const res = await selectShippingMethodHook({
          params: {
            input: {
              cart_id: cartId,
              shipping_methods: [
                {
                  carrier_code: method.carrier_code,
                  method_code: method.method_code,
                },
              ],
            },
          },
          paramsOpt: {isReturn: true},
        });
        if (res) {
          crashlytics().setAttribute(
            SHIPPING_METHOD_CODE,
            method.carrier_code.toString(),
          );
          setPrices();
          refetchShipping(res?.data?.setShippingMethodsOnCart);
          setShippingMethodLoading(false);
        } else {
          throw res;
        }
      } catch (error) {
        console.log('ERROR SET SHIPPING METHOD ', error);
      }
    }
  };
  /**
   * end of @block {shippingMethod}
   */

  /**
   * ----------------------------------------- *
   * @block {addtional}
   * @summary block for handling additional
   * ----------------------------------------- *
   */
  const onNavigateToPayment = () => {
    if (cartIsVirtual) {
      if (selectedBillingAddress) {
        navigateTo(modules.cart_payment.enable, modules.cart_payment.name);
      }
    } else {
      if (!selectedShippingAddress) {
        rxAppSnackbar({
          message: 'Please select your shipping address first',
        });
      } else if (!selectedShippingMethod) {
        rxAppSnackbar({
          message: 'Please select your shipping method first',
        });
      } else {
        if (userType === 'guest') {
          if (isEmailFilled) {
            navigateTo(modules.cart_payment.enable, modules.cart_payment.name);
          } else {
            rxAppSnackbar({
              message: 'Please fill guest email first',
            });
          }
        } else {
          navigateTo(modules.cart_payment.enable, modules.cart_payment.name);
        }
      }
    }
  };
  /**
   * end of @block {addtional}
   */
  return (
    <Views
      t={t}
      onNavigateToPayment={onNavigateToPayment}
      cart={items}
      userAddresses={userAddresses}
      selectedShippingAddress={selectedShippingAddress}
      selectedBillingAddress={selectedBillingAddress}
      onSelectShippingAddress={onSelectShippingAddress}
      shippingAddressLoading={shippingAddressLoading}
      availableShippingMethods={availableShippingMethods}
      selectedShippingMethod={selectedShippingMethod}
      onSelectShippingMethod={onSelectShippingMethod}
      shippingMethodLoading={shippingMethodLoading}
      userType={userType}
      onSetGuestEmail={onSetGuestEmail}
      isEmailFilled={isEmailFilled}
      activeSections={activeSections}
      updateSections={updateSections}
      dataPrices={prices}
      dataExtraFee={dataExtraFee}
      dataAppliedStoreCredit={dataAppliedStoreCredit}
      appliedGiftCard={appliedGiftCard}
    />
  );
};

export default Shipping;
