/* eslint-disable no-unused-vars */
import React, {useState, useEffect, useRef, useCallback} from 'react';
import {Modal, StyleSheet} from 'react-native';
import {Colors, Typography} from '@app/styles';
import {useTranslation} from 'react-i18next';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {formSchema} from '@app/components/_AppModal/atoms/ModalShippingAddressForm/forms';
import {useReactiveVar} from '@apollo/client';
import {ActivityIndicator} from 'react-native-paper';
import {isIOS} from '@app/styles/mixins.new';
import {SET_GUEST_EMAIL} from '@app/_modules/cart/services/schema';
import {TouchableRipple, TextInput} from 'react-native-paper';
import {useRefetchAddress} from '@app/hooks/useRefetchAddress';
// import {guestCheckout} from '@root/swift.config';
// import {useSelectShippingAddress} from '@app/hooks/carts/useSelectShippingAddress';
// import {isThemeDark} from '@app/helpers/General';
import {rxCartId, rxAppSnackbar, rxUserType} from '@app/services/cache';
import Forms, {
  _onFormHandleResetRef,
  _onFormHandleValuesRef,
} from '@app/components/_Forms/index';
// import useDataCustomer, {
//   TYPES as CUSTOMER_TYPES,
// } from '@app/hooks/customer/useDataCustomer';
import {
  FORM_FIELD,
  TYPE_ADDRESS_FORM_COUNTRY,
  TYPE_ADDRESS_FORM_POSTAL,
  TYPE_ADDRESS_FORM_REGION,
  TYPE_ADDRESS_FORM_CITY,
  USER_GUEST,
  IS_IOS,
  // BYPASS_ERROR_CHECKOUT_MODAL_SHIPPING_USER_ADDRESS,
} from '@app/helpers/Constants';
import {
  GET_CITY_LIST,
  GET_COUNTRY_LIST,
  GET_REGION_LIST,
  ADD_ADDRESS,
  UPDATE_ADDRESS,
} from '@app/_modules/account/services/schema';
import Icon from 'react-native-vector-icons/Feather';
import Geolocation from '@react-native-community/geolocation';
// import MapView from 'react-native-maps';
// import SearchGoogleAutocomplete from '@app/components/SearchGoogleAutocomplete';
import Section from '@app/components/Section';
import useCustomMutation from '@app/hooks/useCustomMutation';
import useCustomQuery from '@app/hooks/useCustomQuery';
import NavBarCustom from '@app/components/NavBar';
import CheckBox from '@app/components/CheckBox';
import Show from '@app/components/Show';
import Label from '@app/components/Label';
import AppSnackBar from '@app/components/SnackBar';
import _ from 'lodash';

const styles = StyleSheet.create({
  mapContainerStyle: {height: 250, width: '100%', borderRadius: 6},
  navbarTitleStyle: {
    fontSize: 14,
    fontWeight: IS_IOS ? 'bold' : null,
    ...Typography.FONT_BOLD,
  },
  navbarStylesContainer: {
    borderBottomColor: Colors.GRAY_DARK4,
    borderBottomWidth: 1,
  },
  mapsFrame: {
    marginTop: 15,
    position: 'relative',
  },
  mapsBoxOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 1,
  },
});

/**
 * ---------------------------------------------------- *
 * @component compName
 * @param {callbackAutocomplete} object
 * @summary for render searching google place
 * @returns {component}
 * ---------------------------------------------------- *
 */
/*
const SearchGooglePlace = ({callbackAutocomplete}) => {
  return (
    <SearchGoogleAutocomplete
      key={'search-google'}
      useOnlySearch
      callbackAutocomplete={callbackAutocomplete}
    />
  );
};
*/

/**
 * ---------------------------------------------------- *
 * @component RenderMap
 * @param {refMarker, location, loader} object
 * @param {onRegionChange} object
 * @summary for rendering maps
 * @returns {component}
 * ---------------------------------------------------- *
 */
/*
const RenderMap = ({
  t,
  refMarker,
  location,
  loader,
  isConfirmPinLocation,
  setIsConfirmPinLocation,
  onRegionChange,
}) => {
  const getCoordinate = {
    latitude: Number(location.latitude),
    longitude: Number(location.longitude),
  };
  const getIntialRegion = {
    ...getCoordinate,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };
  if (loader) {
    return (
      <Section marginTop={15} horizontalCenter>
        <ActivityIndicator size="large" />
      </Section>
    );
  }

  return (
    <Section style={styles.mapsFrame}>
      <Show when={!isConfirmPinLocation}>
        <Section
          padding={10}
          horizontalCenter
          verticalCenter
          style={styles.mapsBoxOverlay}>
          <Section bg={Colors.WHITE} padding={10} borderRadius={5}>
            <TouchableRipple onPress={() => setIsConfirmPinLocation(true)}>
              <Section row>
                <CheckBox
                  checkedColor={Colors.PRIMARY}
                  selected={false}
                  onPress={() => setIsConfirmPinLocation(true)}
                  size={16}
                />
                <Section flex={1} marginLeft={10} verticalCenter>
                  <Label>
                    {t('cart_checkout.label.pleaseConfirmLocation')}
                  </Label>
                </Section>
              </Section>
            </TouchableRipple>
            <Section marginBottom={10}>
              <Section marginTop={10} marginBottom={10}>
                <Label color={Colors.GRAY_DARK}>
                  {t('cart_checkout.label.byClickConfirm')}
                </Label>
              </Section>
              <Label color={Colors.GRAY_DARK}>
                - {t('cart_checkout.label.agreeThatAddress')}
              </Label>
              <Label color={Colors.GRAY_DARK}>
                - {t('cart_checkout.label.anyShippingError')}
              </Label>
            </Section>
          </Section>
        </Section>
      </Show>
      <MapView
        ref={refMarker}
        showsUserLocation
        showsMyLocationButton
        style={[styles.mapContainerStyle]}
        initialRegion={getIntialRegion}
        onRegionChangeComplete={region => onRegionChange(region)}
        provider="google"
        onMapReady={() => {}}>
        <MapView.Marker title={t('yourPosition')} coordinate={getCoordinate} />
      </MapView>
    </Section>
  );
};
*/

/**
 * ---------------------------------------------------- *
 * @function onFilterCities
 * @param {cities, include, filterBy, indexReturn} object
 * @summary for filter cities based on needed object
 * ---------------------------------------------------- *
 */
export const onFilterCities = ({cities, include, filterBy, indexReturn}) => {
  const getFilterValue = _.filter(cities, item =>
    _.includes(item.city, include),
  ).map(item => {
    const getDataSplit = _.split(item[filterBy], ', ');
    if (getDataSplit[indexReturn]) {
      return {...item, name: getDataSplit[indexReturn]};
    }
  });

  return getFilterValue;
};

const AtomModalShippingAddressForm = ({
  show,
  onClose,
  isEdit,
  onRefetchDataAddress,
}) => {
  const {t} = useTranslation();
  const getRxUserType = useReactiveVar(rxUserType);
  const getRxCartId = useReactiveVar(rxCartId);
  // const isDark = isThemeDark();
  const isDark = false;
  const isGuest = getRxUserType === USER_GUEST;
  const editMode = !_.isEmpty(isEdit);
  const refMarker = useRef();
  const mount = useRef();
  // const {setShippingToGuestCart, setBillingToGuestCart} =
  //   useSelectShippingAddress();
  const [countryList, setCountryList] = useState([]);
  const [regionList, setRegionList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [postCodeList, setPostCodeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);
  const [isConfirmPinLocation, setIsConfirmPinLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    country: null,
    region: null,
    city: null,
    postalCode: null,
    pinpoint: {
      longitude: 106.841036, // default
      latitude: -6.173292, // default
    },
  });
  const {refetch: refetchAddress} = useRefetchAddress();
  const [defaultValue, setDefaultValue] = useState({
    email: '',
    firstName: '',
    lastName: '',
    country: '',
    region: '',
    city: '',
    postalCode: '',
    streetAddress: '',
    detailedAddress: '',
    phoneNumber: '',
    defaultShipping: false,
  });

  const {onRefetchData: setGuestEmailHook} = useCustomMutation({
    schema: SET_GUEST_EMAIL,
  });
  const {onRefetchData: addAddressHook} = useCustomMutation({
    schema: ADD_ADDRESS,
  });
  const {onRefetchData: updateAddressHook} = useCustomMutation({
    schema: UPDATE_ADDRESS,
  });
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
  // const {setDataResponse: getUserAddress} = useDataCustomer({
  //   initialized: false,
  //   type: CUSTOMER_TYPES.USER_ADDRESS,
  //   configErr: {
  //     logSource: BYPASS_ERROR_CHECKOUT_MODAL_SHIPPING_USER_ADDRESS,
  //     isBypass: guestCheckout.enable && isGuest ? true : false,
  //   },
  // });

  /**
   * ---------------------------------------------------- *
   * @dependency []
   * @summary for first init
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    mount.current = true;
    if (mount.current) {
      setLoadingMap(true);
      const mapConfig = isIOS
        ? {enableHighAccuracy: true, timeout: 20000, maximumAge: 3600000}
        : {};
      Geolocation.getCurrentPosition(
        async info => {
          const {longitude, latitude} = info.coords;
          setSelectedLocation({
            ...selectedLocation,
            pinpoint: {longitude, latitude},
          });
          setLoadingMap(false);
        },
        async () => setLoadingMap(false),
        mapConfig,
      );
    }

    return () => {
      mount.current = false;
    };
  }, []);

  /**
   * ---------------------------------------------------- *
   * @dependency [show]
   * @summary for detection show variable
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    if (mount.current) {
      if (show) {
        setIsConfirmPinLocation(false);
      }
      if (show && !editMode) {
        setSelectedLocation({
          ...selectedLocation,
          country: null,
          region: null,
          city: null,
          postalCode: null,
        });
        onResetDataDropdown({
          region: true,
          city: true,
          postalCode: true,
          log: 0,
        });
      }
    }
  }, [show]);

  /**
   * ---------------------------------------------------- *
   * @function getPostCode
   * @param {cities, include} object
   * @summary for get postcode from urban village
   * ---------------------------------------------------- *
   */
  const getPostCode = useCallback(
    city => {
      const postCode = [{name: city.postcode}];
      setPostCodeList(postCode);
      setLoading(false);
    },
    [isEdit],
  );

  /**
   * ---------------------------------------------------- *
   * @dependency [isEdit]
   * @summary for get regions and cities
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    if (mount.current) {
      if (editMode) {
        const getRegionAndCityAddress = async () => {
          // const var = customer || guest
          const country_id =
            _.get(isEdit, 'country_id') || _.get(isEdit, 'country.code');
          const region_id =
            _.get(isEdit, 'region_id') || _.get(isEdit, 'region.region_id');

          if (country_id) {
            await getRegions({params: {country_id}});
          }

          if (region_id) {
            const getCityData = await getCities({
              paramsOpt: {isReturn: true},
              params: {region_id},
            });

            const getCountry = _.get(countryData, 'data.country');
            const getCountryIdValue = _.get(getCountry, 'id');
            const getCountryId = {country_id: getCountryIdValue};
            const getCityAddress = _.get(isEdit, 'city');
            const cities = _.get(getCityData, 'data.getCityByRegionId.item');
            if (cities) {
              const tempCities = cities.map(item => {
                return {...item, name: item.city};
              });
              const selectedCity = tempCities.find(
                city => city.city === getCityAddress,
              );

              let getLatitude = 106.841036; //default
              let getLongitude = -6.173292; //default
              // customer only --- guest belum bisa pin
              if (!isGuest) {
                const getCustomAttr = _.get(isEdit, 'custom_attributes');
                if (getCustomAttr) {
                  getLatitude = _.find(
                    getCustomAttr,
                    item => item.attribute_code === 'latitude',
                  )?.value;
                  getLongitude = _.find(
                    getCustomAttr,
                    item => item.attribute_code === 'longitude',
                  )?.value;
                }
              }

              setCityList(tempCities);
              getPostCode(selectedCity);
              setSelectedLocation({
                country: getCountryId,
                region: {
                  region_code: isGuest
                    ? _.get(isEdit, 'region.code')
                    : _.get(isEdit, 'region_code'),
                  region_id: isGuest
                    ? _.get(isEdit, 'region.region_id')
                    : _.get(isEdit, 'region_id'),
                },
                city: selectedCity,
                postalCode: _.get(isEdit, 'postcode'),
                pinpoint: {
                  longitude: getLongitude, // default
                  latitude: getLatitude, // default
                },
              });
              const onReset = _onFormHandleResetRef.current;
              const getValues = _onFormHandleValuesRef.current;
              const country = country_id === 'ID' ? 'Indonesia' : '';
              const regionValue = isEdit
                ? _.get(isEdit, 'region.label') || _.get(isEdit, 'region')
                : '';

              const valueEdit = {
                ...getValues(),
                firstName: isEdit ? _.get(isEdit, 'firstname') : '',
                lastName: isEdit ? _.get(isEdit, 'lastname') : '',
                country: country,
                region: regionValue,
                city: isEdit ? _.get(isEdit, 'city') : '',
                postalCode: isEdit ? _.get(isEdit, 'postcode') : '',
                streetAddress: _.get(isEdit, 'street')
                  ? _.isArray(_.get(isEdit, 'street'))
                    ? _.get(isEdit, 'street[0]')
                    : _.get(isEdit, 'street')
                  : '',
                detailedAddress: _.get(isEdit, 'street[1]', ''),
                phoneNumber: isEdit ? _.get(isEdit, 'telephone') : '',
                defaultShipping: _.get(isEdit, 'default_shipping') ?? false,
              };

              if (isGuest) {
                setDefaultValue({
                  ...defaultValue,
                  ...valueEdit,
                  email: isEdit ? _.get(isEdit, 'email') : '',
                });
              } else {
                onReset(valueEdit);
              }
            } // cities
          }
        };
        getRegionAndCityAddress();
      }
    }
  }, [isEdit]);

  /**
   * ---------------------------------------------------- *
   * @dependency [countryData]
   * @summary for get country data and regions
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    if (mount.current) {
      if (countryData && countryData.data) {
        const getCountry = _.get(countryData, 'data.country');
        if (getCountry) {
          const name = _.get(getCountry, 'full_name_locale');
          const country_id = _.get(getCountry, 'id');
          const getCountryId = {country_id};
          const countryListTmp = [{name, ...getCountryId}];
          setSelectedLocation({...selectedLocation, country: getCountryId});
          setCountryList(countryListTmp);
          getRegions({params: getCountryId});
        }
        setLoading(false);
      }
    }
  }, [countryData]);

  /**
   * ---------------------------------------------------- *
   * @dependency [regionData]
   * @summary for get regions list
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    if (mount.current) {
      const regions = _.get(regionData, 'data.getRegions.item');
      if (regions) {
        setRegionList(regions);
      }
      setLoading(false);
    }
  }, [regionData]);

  /**
   * ---------------------------------------------------- *
   * @dependency [cityData]
   * @summary for get city list
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    if (mount.current) {
      const cities = _.get(cityData, 'data.getCityByRegionId.item');
      if (cities) {
        const tempCities = cities.map(item => {
          return {...item, name: item.city};
        });
        setCityList(tempCities);
        setLoading(false);
      }
    }
  }, [cityData]);

  /**
   * ---------------------------------------------------- *
   * @dependency [selectedLocation.city]
   * @summary for get postcode & auto select from selected city
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    if (mount.current) {
      const selCity = _.get(selectedLocation, 'city');
      if (selCity && selCity.postcode) {
        setPostCodeList([{name: selCity.postcode}]);
        const getValues = _onFormHandleValuesRef.current;
        const onReset = _onFormHandleResetRef.current;
        if (getValues && onReset) {
          onReset({
            ...getValues(),
            postalCode: selCity.postcode,
          });
        }
        setSelectedLocation(prev => ({
          ...prev,
          postalCode: {name: selCity.postcode},
        }));
      } else {
        setPostCodeList([]);
      }
      setLoading(false);
    }
  }, [selectedLocation.city]);

  /**
   * ---------------------------------------------------- *
   * @function onResetDataDropdown
   * @param {region, district, subdistrict} props
   * @param {urbanVillage, postalCode} props
   * @summary for reset input dropdown
   * ---------------------------------------------------- *
   */
  const onResetDataDropdown = useCallback(props => {
    const isResetRegion = _.get(props, 'region');
    const isResetCity = _.get(props, 'city');
    const isResetPostalCode = _.get(props, 'postalCode');

    if (isResetRegion) {
      setRegionList([]);
    }
    if (isResetCity) {
      setCityList([]);
    }
    if (isResetPostalCode) {
      setPostCodeList([]);
    }
  }, []);

  /**
   * ---------------------------------------------------- *
   * @function onSelectLocation
   * @param {selected, fieldName} object
   * @summary for selected location country | region | city
   * ---------------------------------------------------- *
   */
  const onSelectLocation = ({selected, fieldName}) => {
    setLoading(true);
    const valList = _.set({...selectedLocation}, fieldName, selected);
    const getValues = _onFormHandleValuesRef.current;
    const onReset = _onFormHandleResetRef.current;

    switch (fieldName) {
      case TYPE_ADDRESS_FORM_COUNTRY:
        onReset({
          ...getValues(),
          region: '',
          city: '',
          postalCode: '',
        });
        onResetDataDropdown({
          region: true,
          city: true,
          postalCode: true,
          log: 1,
        });
        valList.region = null;
        valList.city = null;
        valList.postalCode = null;
        getRegions({params: {country_id: _.get(selected, 'country_id')}});
        break;
      case TYPE_ADDRESS_FORM_REGION:
        onReset({
          ...getValues(),
          city: '',
          postalCode: '',
        });
        onResetDataDropdown({
          city: true,
          postalCode: true,
          log: 2,
        });
        valList.city = null;
        valList.postalCode = null;
        getCities({params: {region_id: _.get(selected, 'region_id')}});
        break;
      case TYPE_ADDRESS_FORM_CITY:
        onReset({
          ...getValues(),
          postalCode: '',
        });
        onResetDataDropdown({
          postalCode: true,
          log: 3,
        });
        valList.postalCode = null;
        // postCodeList 与自动选中改由 [selectedLocation.city] effect 响应式处理
        break;
      case TYPE_ADDRESS_FORM_POSTAL:
        setLoading(false);
        break;
    }
    setSelectedLocation(valList);
  };

  /**
   * ---------------------------------------------------- *
   * @function onSaveAddress
   * @param {data} object
   * @summary functionDesc
   * @returns something
   * ---------------------------------------------------- *
   */
  const onSaveAddress = async data => {
    setLoading(true);

    const latitude = _.get(selectedLocation, 'pinpoint.latitude').toString();
    const longitude = _.get(selectedLocation, 'pinpoint.longitude').toString();
    const addressData = {
      city: _.get(selectedLocation, 'city.city'),
      country_code: _.get(selectedLocation, 'country.country_id'),
      firstname: _.get(data, 'firstName'),
      lastname: _.get(data, 'lastName'),
      street: _.compact([
        _.get(data, 'streetAddress'),
        _.get(data, 'detailedAddress'),
      ]),
      postcode: _.get(data, 'postalCode'),
      region: _.get(data, 'region'),
      region_id: _.get(selectedLocation, 'region.region_id'),
      telephone: _.get(data, 'phoneNumber'),
    };

    if (isGuest) {
      try {
        const addressDataGuest = {
          ...addressData,
          latitude,
          longitude,
          region: _.get(selectedLocation, 'region.code'),
        };
        // set email guest
        await setGuestEmailHook({
          params: {input: {cart_id: getRxCartId, email: data.email}},
        });
        // set selected shipping & billing address
        // await setShippingToGuestCart({addressData: addressDataGuest});
        // await setBillingToGuestCart({
        //   addressData: addressDataGuest,
        //   sameAsShipping: true,
        // });
        await onRefetchDataAddress();
        setLoading(false);
        rxAppSnackbar({message: t('cart.successSaveAddress'), type: 'success'});
        onClose();
      } catch (err) {
        console.log('[err] set email guest & set shipping method guest', err);
        setLoading(false);
      }
    } else {
      const pinPointData = [
        {
          attribute_code: 'latitude',
          value: latitude,
        },
        {
          attribute_code: 'longitude',
          value: longitude,
        },
      ];

      const defaultShipping = _.get(data, 'defaultShipping');
      const addressDataUser = {
        ...addressData,
        default_billing: defaultShipping,
        default_shipping: defaultShipping,
        region_code: _.get(selectedLocation, 'region.code'),
        custom_attributes: pinPointData,
      };

      try {
        if (editMode) {
          const res = await updateAddressHook({
            paramsOpt: {isReturn: true},
            params: {
              id: isEdit.addressId,
              ...addressDataUser,
            },
          });
          const customerAddress = _.get(res, 'data.updateCustomerAddress');
          if (customerAddress) {
            refetchAddress();
            setLoading(false);
            rxAppSnackbar({message: t('cart.successSaveAddress'), type: 'success'});
            onClose();
          } else {
            rxAppSnackbar({message: res.message || t('account_add_address.error.message')});
            setLoading(false);
          }
        }

        if (!editMode) {
          const res = await addAddressHook({
            paramsOpt: {isReturn: true},
            params: addressDataUser,
          });

          const customerAddress = _.get(res, 'data.createCustomerAddress');
          if (customerAddress) {
            if (defaultShipping && onRefetchDataAddress) {
              await refetchAddress();
            } else {
              refetchAddress();
            }
            setLoading(false);
            rxAppSnackbar({message: t('cart.successSaveAddress'), type: 'success'});
            onClose();
          } else {
            rxAppSnackbar({message: t('account_add_address.error.message')});

            setLoading(false);
          }
        }
      } catch (err) {
        console.log('[err] save address', err);
        setLoading(false);
      }
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function onRegionChange
   * @param {latitude, longitude} region
   * @summary for set selected region when location change
   * ---------------------------------------------------- *
   */
  const onRegionChange = async region => {
    const latitude = _.get(region, 'latitude');
    const longitude = _.get(region, 'longitude');

    setSelectedLocation({
      ...selectedLocation,
      pinpoint: {
        latitude,
        longitude,
      },
    });
  };

  /**
   * ---------------------------------------------------- *
   * @function mapAnimateCamera
   * @param {object} newCoordinate
   * @summary for set camera within map view
   * ---------------------------------------------------- *
   */
  const mapAnimateCamera = newCoordinate => {
    if (refMarker) {
      refMarker.current.animateCamera({center: newCoordinate, zoom: 15}, 1000);
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function callbackSearchPlace
   * @param {location.lat, location.lng} item
   * @summary for callback while search place
   * ---------------------------------------------------- *
   */
  const callbackSearchPlace = item => {
    const {lat, lng} = item.location;
    const dataCoordinate = {latitude: lat, longitude: lng};
    setSelectedLocation({...selectedLocation, pinpoint: dataCoordinate});
    mapAnimateCamera(dataCoordinate);
  };
  /**
   * ---------------------------------------------------- *
   * @const {forms}
   * @summary schema for form builder
   * ---------------------------------------------------- *
   */
  let custom = [
    {
      name: TYPE_ADDRESS_FORM_COUNTRY,
      label: t('account_add_address.label.country'),
      textContentType: 'addressState',
      type: FORM_FIELD.INPUT_DROPDOWN,
      data: countryList,
      isVisible: _.size(countryList) > 0,
      autoCapitalized: 'none',
      rules: {required: t('formError.required.country')},
      onPress: onSelectLocation,
      defaultValue: defaultValue.country,
      isDisabled: selectedLocation.country !== null,
      inputRightCustom: selectedLocation.country !== null && (
        <TextInput.Icon
          name={() => (
            <Icon
              name={'x'}
              size={20}
              onPress={() => {
                const getValues = _onFormHandleValuesRef.current;
                const onReset = _onFormHandleResetRef.current;
                onReset({
                  ...getValues(),
                  country: null,
                  region: null,
                  city: null,
                  postalCode: null,
                });
                setSelectedLocation({
                  ...selectedLocation,
                  country: null,
                  region: null,
                  city: null,
                  postalCode: null,
                });
                onResetDataDropdown({
                  region: true,
                  city: true,
                  postalCode: true,
                  log: 6,
                });
              }}
            />
          )}
        />
      ),
    },
    {
      name: TYPE_ADDRESS_FORM_REGION,
      label: t('account_add_address.label.province'),
      textContentType: 'addressState',
      type: FORM_FIELD.INPUT_DROPDOWN,
      isVisible: _.size(regionList) > 0 && selectedLocation.country !== null,
      onPress: onSelectLocation,
      data: regionList,
      defaultValue: defaultValue.region,
      autoCapitalized: 'none',
      rules: {required: t('formError.required.region')},
      isDisabled: selectedLocation.region !== null,
      inputRightCustom: selectedLocation.region !== null && (
        <TextInput.Icon
          name={() => (
            <Icon
              name={'x'}
              size={20}
              onPress={() => {
                const getValues = _onFormHandleValuesRef.current;
                const onReset = _onFormHandleResetRef.current;
                onReset({
                  ...getValues(),
                  region: null,
                  city: null,
                  postalCode: null,
                });
                setSelectedLocation({
                  ...selectedLocation,
                  region: null,
                  city: null,
                  postalCode: null,
                });
                onResetDataDropdown({
                  city: true,
                  postalCode: true,
                  log: 7,
                });
              }}
            />
          )}
        />
      ),
    },
    {
      name: TYPE_ADDRESS_FORM_CITY,
      label: t('account_add_address.label.city'),
      textContentType: 'addressState',
      type: FORM_FIELD.INPUT_DROPDOWN,
      isVisible: _.size(cityList) > 0 && selectedLocation.region !== null,
      onPress: onSelectLocation,
      data: cityList,
      defaultValue: defaultValue.city,
      autoCapitalized: 'none',
      rules: {required: t('formError.required.city')},
      isDisabled: selectedLocation.city !== null,
      inputRightCustom: selectedLocation.city !== null && (
        <TextInput.Icon
          name={() => (
            <Icon
              name={'x'}
              size={20}
              onPress={() => {
                const getValues = _onFormHandleValuesRef.current;
                const onReset = _onFormHandleResetRef.current;
                onReset({
                  ...getValues(),
                  city: null,
                  postalCode: null,
                });
                setSelectedLocation({
                  ...selectedLocation,
                  city: null,
                  postalCode: null,
                });
                onResetDataDropdown({
                  postalCode: true,
                  log: 8,
                });
              }}
            />
          )}
        />
      ),
    },
    {
      name: TYPE_ADDRESS_FORM_POSTAL,
      label: t('account_add_address.label.postalCode'),
      textContentType: 'addressState',
      type: FORM_FIELD.INPUT_DROPDOWN,
      isVisible: _.size(postCodeList) > 0 && selectedLocation.city !== null,
      onPress: onSelectLocation,
      data: postCodeList,
      autoCapitalized: 'none',
      defaultValue: defaultValue.postalCode,
      rules: {required: t('formError.required.postalCode')},
      isDisabled: selectedLocation.postalCode !== null,
      inputRightCustom: selectedLocation.postalCode !== null && (
        <TextInput.Icon
          name={() => (
            <Icon
              name={'x'}
              size={20}
              onPress={() => {
                const getValues = _onFormHandleValuesRef.current;
                const onReset = _onFormHandleResetRef.current;
                onReset({...getValues(), postalCode: null});
                setSelectedLocation({...selectedLocation, postalCode: null});
              }}
            />
          )}
        />
      ),
    },
    {
      name: 'streetAddress',
      label: t('account_add_address.label.streetAddress'),
      textContentType: 'addressState',
      type: FORM_FIELD.INPUT,
      defaultValue: defaultValue.streetAddress,
      autoCapitalized: 'words',
      rules: {required: t('formError.required.address')},
    },
    {
      name: 'detailedAddress',
      label: t('account_add_address.label.detailedAddress'),
      textContentType: 'addressState',
      type: FORM_FIELD.INPUT,
      defaultValue: defaultValue.detailedAddress,
      autoCapitalized: 'words',
      rules: {},
    },
    // {
    //   name: 'map',
    //   type: FORM_FIELD.CUSTOM,
    //   renderItem: RenderMap({
    //     t,
    //     location: selectedLocation.pinpoint,
    //     loader: loadingMap,
    //     refMarker,
    //     isConfirmPinLocation,
    //     onRegionChange,
    //     setIsConfirmPinLocation,
    //   }),
    // },
    // {
    //   name: 'buttonPinpoint',
    //   type: FORM_FIELD.CUSTOM,
    //   isVisible: isConfirmPinLocation,
    //   renderItem: SearchGooglePlace({
    //     callbackAutocomplete: callbackSearchPlace,
    //   }),
    // },
    {
      name: 'phoneNumber',
      label: t('cart_checkout.label.phoneNumber'),
      textContentType: 'telephoneNumber',
      keyboardType: 'phone-pad',
      type: FORM_FIELD.INPUT,
      defaultValue: defaultValue.phoneNumber,
      affixLabel: '+62',
      rules: {required: t('formError.required.phoneNumber')},
    },
  ];

  if (!isGuest) {
    custom = [
      ...custom,
      {
        name: 'defaultShipping',
        label: t('cart_checkout.label.useDefaultShippingAddress'),
        type: FORM_FIELD.CHECKBOX,
        defaultValue: defaultValue.defaultShipping,
        rules: {},
      },
    ];
  }

  const forms = formSchema({
    custom,
    defVal: defaultValue,
    isGuest: isGuest,
  });

  const loadingMessage = () => {
    return rxAppSnackbar({
      message: t('cart_checkout.error.loadingMessage'),
    });
  };

  return (
    <Modal visible={show}>
      <NavBarCustom
        center
        useClose
        useWhite
        useShadow={false}
        useBackPress={loading ? loadingMessage : onClose}
        titleStyle={styles.navbarTitleStyle}
        stylesContainer={styles.navbarStylesContainer}
        title={
          _.isEmpty(isEdit)
            ? t('account_add_address.title.addAddress')
            : t('account_add_address.title.editAddress')
        }
      />
      <KeyboardAwareScrollView
        nestedScrollEnabled
        extraScrollHeight={20}
        extraHeight={100}
        style={{backgroundColor: isDark ? Colors.DARK : null}}>
        <Forms
          fields={forms}
          buttonTitle={t('account_add_address.title.submit')}
          buttonStyle={{backgroundColor: Colors.PRIMARY, borderRadius: 40}}
          buttonLabelColor={Colors.WHITE}
          onSubmit={onSaveAddress}
          loading={loading}
        />
      </KeyboardAwareScrollView>
      <AppSnackBar />
    </Modal>
  );
};

export default AtomModalShippingAddressForm;
