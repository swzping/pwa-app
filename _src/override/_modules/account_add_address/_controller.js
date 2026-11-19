import React, {useState, useEffect} from 'react';
import Views from '@app/_modules/account_add_address/_view';
import {useTranslation} from 'react-i18next';
import useCustomQuery from '@app/hooks/useCustomQuery';
import useCustomMutation from '@app/hooks/useCustomMutation';
import {useReactiveVar} from '@apollo/client';
import {ADD_ADDRESS} from '@app/_modules/account/services/schema';
import {useRefetchAddress} from '@app/hooks/useRefetchAddress';
import {useRefetchShipping} from '@app/hooks/useRefetchShipping';
import {rxCartId, rxAppSnackbar, rxUserType} from '@app/services/cache';
import {
  SET_BILLING_ADDRESS,
  SET_SHIPPING_ADDRESS,
} from '@app/_modules/cart/services/schema';
import {
  GET_CITY_LIST,
  GET_COUNTRY_LIST,
  GET_REGION_LIST,
  UPDATE_ADDRESS,
} from '@app/_modules/account/services/schema';

import _ from 'lodash';
/**
 * ---------------------------------------------------- *
 * @component AddAddressController
 * @param {Object} props
 * @summary Controller for Address Information screen
 * ---------------------------------------------------- *
 */

const Controller = ({navigation, route}) => {
  const param = _.get(route, 'params.addressData');
  const [loading, setLoading] = useState(false);

  const [modalLocation, setModalLocation] = useState({
    pinpoint: false,
  });
  const [selectedLocation, setSelectedLocation] = useState({
    pinpoint: {
      longitude: '0',
      latitude: '0',
    },
    country: {},
    region: {},
    district: {},
    subdistrict: {},
    urbanVillage: {},
    postalCode: {},
  });
  const [countryList, setCountryList] = useState([]);
  const [regionList, setRegionList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [subdistrictList, setSubdistrictList] = useState([]);
  const [villageList, setVillageList] = useState([]);
  const [postCodeList, setPostCodeList] = useState([]);
  const {t} = useTranslation();

  useEffect(() => {
    if (param) {
      getRegions({
        params: {
          country_id: _.get(param, 'country_id'),
        },
      });
      const paramToState = {
        pinpoint: {
          longitude: _.get(param, 'custom_attributes[1].value'),
          latitude: _.get(param, 'custom_attributes[0].value'),
        },
        country: {full_name_locale: 'Indonesia', id: 'ID'},
        region: {},
        district: {},
        subdistrict: {},
        urbanVillage: {},
        postalCode: {},
      };
      setSelectedLocation(paramToState);
    }
  }, []);

  const {data: countryData} = useCustomQuery({
    schema: GET_COUNTRY_LIST,
    useInitData: true,
  });

  const {data: regionData, onRefetchData: getRegions} = useCustomQuery({
    schema: GET_REGION_LIST,
  });

  const {data: cityData, onRefetchData: getCities} = useCustomQuery({
    schema: GET_CITY_LIST,
  });

  const userType = useReactiveVar(rxUserType);
  const cartId = useReactiveVar(rxCartId);

  const {refetch: refetchAddress} = useRefetchAddress();
  const {refetch: refetchShipping} = useRefetchShipping();

  const {onRefetchData: updateAddressHook} = useCustomMutation({
    schema: UPDATE_ADDRESS,
  });
  const {onRefetchData: addAddressHook} = useCustomMutation({
    schema: ADD_ADDRESS,
  });
  const {onRefetchData: selectShippingAddressHook} = useCustomMutation({
    schema: SET_SHIPPING_ADDRESS,
  });
  const {onRefetchData: selectBillingAddressHook} = useCustomMutation({
    schema: SET_BILLING_ADDRESS,
  });

  const onSelectShippingAddressGuest = async address => {
    const resShipping = await selectShippingAddressHook({
      params: {
        input: {
          cart_id: cartId,
          shipping_addresses: [{address: address}],
        },
      },
      paramsOpt: {isReturn: true},
    });

    const resBilling = await selectBillingAddressHook({
      params: {
        input: {
          cart_id: cartId,
          billing_address: {address: address},
        },
      },
      paramsOpt: {isReturn: true},
    });

    if (resShipping && resBilling) {
      await refetchShipping(resShipping.data.setShippingAddressesOnCart);
    }
  };

  const onSaveAddress = async data => {
    setLoading(true);
    const city = `${data.district}, ${data.subdistrict}, ${data.urbanVillage}`;
    const street = _.compact([data.streetAddress, data.detailedAddress]);
    if (userType === 'guest') {
      try {
        await onSelectShippingAddressGuest({
          city,
          country_code: _.get(selectedLocation, 'country.country_id'),
          firstname: data.firstName,
          lastname: data.lastName,
          street,
          postcode: data.postalCode,
          region_id: _.get(selectedLocation, 'region.region_id'),
          telephone: data.phoneNumber,
        });
        setLoading(false);
        navigation.goBack();
      } catch (err) {
        setLoading(false);
      }
    } else {
      try {
        const pinPointData = [
          {
            attribute_code: 'latitude',
            value: _.get(selectedLocation, 'pinpoint.latitude'),
          },
          {
            attribute_code: 'longitude',
            value: _.get(selectedLocation, 'pinpoint.longitude'),
          },
        ];

        if (param) {
          const res = await updateAddressHook({
            params: {
              id: param.addressId,
              city,
              country_code: _.get(selectedLocation, 'country.country_id'),
              firstname: data.firstName,
              lastname: data.lastName,
              street,
              postcode: data.postalCode,
              region: data.region,
              region_code: _.get(selectedLocation, 'region.code'),
              region_id: _.get(selectedLocation, 'region.region_id'),
              telephone: data.phoneNumber,
              default_billing: data.defaultBilling,
              default_shipping: data.defaultShipping,
              custom_attributes: pinPointData,
            },
            paramsOpt: {isReturn: true},
          });
          const customerAddress = _.get(res, 'data.updateCustomerAddress');
          if (customerAddress) {
            await refetchAddress(customerAddress);
            await refetchShipping();
            setLoading(false);
            navigation.goBack();
          } else {
            rxAppSnackbar({message: res.message || t('account_add_address.error.message')});

            setLoading(false);
          }
        }

        if (!param) {
          const res = await addAddressHook({
            variables: {
              city,
              country_code: _.get(selectedLocation, 'country.country_id'),
              firstname: data.firstName,
              lastname: data.lastName,
              street,
              postcode: data.postalCode,
              region: data.region,
              region_code: _.get(selectedLocation, 'region.code'),
              region_id: _.get(selectedLocation, 'region.region_id'),
              telephone: data.phoneNumber,
              default_billing: data.defaultBilling,
              default_shipping: data.defaultShipping,
              custom_attributes: pinPointData,
            },
            paramsOpt: {isReturn: true},
          });

          const customerAddress = _.get(res, 'data.createCustomerAddress');
          if (customerAddress) {
            await refetchAddress(customerAddress);
            await refetchShipping();
            setLoading(false);
            navigation.goBack();
          } else {
            rxAppSnackbar({message: t('account_add_address.error.message')});

            setLoading(false);
          }
        }
      } catch (err) {
        console.log(err);
        // rxAppSnackbar({message: ErrorStackParser.graphQLErrors[0].message});
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (countryData && countryData.data) {
      const {full_name_locale, id} = countryData?.data.country;
      let countryListTmp = [
        {
          name: full_name_locale,
          country_id: id,
        },
      ];
      setCountryList(countryListTmp);
      setLoading(false);
    }
  }, [countryData]);

  useEffect(() => {
    const regions = _.get(regionData, 'data.getRegions.item');
    if (regions) {
      setRegionList(regions);
    }
    setLoading(false);
  }, [regionData]);

  useEffect(() => {
    const cities = _.get(cityData, 'data.getCityByRegionId.item');

    if (cities) {
      const tempCities = cities.map(item => {
        const name = _.split(item.city, ', ');
        if (name[0]) {
          return {
            ...item,
            name: name[0],
          };
        }
      });

      const uniqCities = _.uniqBy(tempCities, 'name');

      setCityList(uniqCities);
      setLoading(false);
    }
  }, [cityData]);

  useEffect(() => {
    const cities = _.get(cityData, 'data.getCityByRegionId.item');
    const selectedDistrict = _.get(selectedLocation, 'district.name');
    if (selectedDistrict) {
      const tempSubdistrict = _.filter(cities, item =>
        _.includes(item.city, selectedDistrict),
      ).map(item => {
        const name = _.split(item.city, ', ');
        if (name[1]) {
          return {...item, name: name[1]};
        }
      });

      const uniqSubdistrict = _.uniqBy(tempSubdistrict, 'name');

      setSubdistrictList(uniqSubdistrict);
      setLoading(false);
    }
  }, [selectedLocation.district]);

  useEffect(() => {
    const cities = _.get(cityData, 'data.getCityByRegionId.item');
    const selSubdistrict = _.get(selectedLocation, 'subdistrict.name');
    if (selSubdistrict) {
      const tempVillages = _.filter(cities, item =>
        _.includes(item.city, selSubdistrict),
      ).map(item => {
        const name = _.split(item.city, ', ');
        if (name[2]) {
          return {...item, name: name[2]};
        }
      });

      const uniqVillage = _.uniqBy(tempVillages, 'name');

      setVillageList(uniqVillage);
      setLoading(false);
    }
  }, [selectedLocation.subdistrict]);

  useEffect(() => {
    const cities = _.get(cityData, 'data.getCityByRegionId.item');
    const selVillage = _.get(selectedLocation, 'urbanVillage.name');
    if (selVillage) {
      const tempPostCode = _.filter(cities, item =>
        _.includes(item.city, selVillage),
      ).map(item => {
        const postcode = _.split(item.postcode, ', ');
        if (postcode[0]) {
          return {...item, name: postcode[0]};
        }
      });

      const uniqPostCode = _.uniqBy(tempPostCode, 'postcode');
      setPostCodeList(uniqPostCode);
      setLoading(false);
    }
  }, [selectedLocation.urbanVillage]);

  const onModalClose = modalName => {
    const valModal = _.set(modalName, modalName, false);
    setModalLocation(valModal);
  };

  const onModalOpen = modalName => {
    const valModal = _.set({...modalName}, modalName, true);
    setModalLocation(valModal);
  };

  const onSetPinPoint = val => {
    const valPinPoint = _.set({...selectedLocation}, 'pinpoint', val);
    setSelectedLocation(valPinPoint);
    onModalClose('pinpoint');
  };

  const onSelectLocation = ({selected, fieldName}) => {
    setLoading(true);
    const valList = _.set({...selectedLocation}, fieldName, selected);
    if (fieldName === 'country') {
      setCityList([]);
      setRegionList([]);
      setSubdistrictList([]);
      setVillageList([]);
      setPostCodeList([]);
      getRegions({
        params: {
          country_id: selected.country_id,
        },
      });
    }
    if (fieldName === 'region') {
      setCityList([]);
      setSubdistrictList([]);
      setVillageList([]);
      setPostCodeList([]);
      getCities({
        params: {
          region_id: selected.region_id,
        },
      });
    }
    if (fieldName === 'district') {
      setSubdistrictList([]);
      setVillageList([]);
      setPostCodeList([]);
    }
    if (fieldName === 'subdistrict') {
      setVillageList([]);
      setPostCodeList([]);
    }
    if (fieldName === 'urbanVillage') {
      setPostCodeList([]);
    }
    if (fieldName === 'postalCode') {
      setLoading(false);
    }
    setSelectedLocation(valList);
  };

  return (
    <Views
      t={t}
      isEdit={param}
      onSetPinPoint={onSetPinPoint}
      onModalOpen={onModalOpen}
      onModalClose={onModalClose}
      onSelectLocation={onSelectLocation}
      countryList={countryList}
      regionList={regionList}
      cityList={cityList}
      subdistrictList={subdistrictList}
      villageList={villageList}
      postCodeList={postCodeList}
      modalLocation={modalLocation}
      selectedLocation={selectedLocation}
      onSaveAddress={onSaveAddress}
      loading={loading}
    />
  );
};

export default Controller;
