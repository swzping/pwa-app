import React, {useContext, useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import RenderIf from '@app/components/RenderIf/index';
import Text from '@app/components/Text';
import CustomView from '@app/components/CustomView';
import {CheckoutContext} from '@app/_modules/cart_checkout/_controller';

import useCustomMutation from '@app/hooks/useCustomMutation';
import {SET_APOTEK_LOCATION} from '@app/_modules/cart_checkout/services/schema';
import {rxCartId} from '@app/services/cache';
import {useReactiveVar} from '@apollo/client';
import useCarts, {TYPES} from '@app/hooks/carts/useCarts';
import {shortenText} from '@app/helpers/General';
import Shimmer from '@app/components/_Shimmer/index';
import {
  FlatList,
  Image,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {Colors, Mixins} from '@app/styles';
import {SCREEN_HEIGHT, SCREEN_WIDTH} from 'react-native-normalize';

const BlockApotek = ({apotekList}) => {
  const {t} = useTranslation();
  const getRxCartId = useReactiveVar(rxCartId);
  const ctxCheckout = useContext(CheckoutContext);
  const {onRefetchData: onSetApotekLocation} = useCustomMutation({
    schema: SET_APOTEK_LOCATION,
  });

  const {setCart: setDataCartAddress} = useCarts({
    initialized: true,
    type: TYPES.ADDRESS,
  });

  const {setCart: setPrices} = useCarts({
    initialized: false,
    type: TYPES.PRICE,
  });

  const [modalVisible, setModalVisible] = useState(false);

  const BottomSelectModalWithFlastList = ({onItemSelected}) => {
    const renderItem = ({item, index}) => {
      const itemSelected =
        item.loc_code === ctxCheckout?.selectedApotek?.loc_code;
      return (
        <TouchableWithoutFeedback
          onPress={() => {
            if (index !== 0 || itemSelected) {
              return;
            }
            onItemSelected(item);
          }}>
          <View
            style={{
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: 'row',
              padding: 10,
              borderBottomWidth: 1,
              height: 48,
              borderBottomColor: Colors.GRAY_LIGHT,
              backgroundColor: Colors.WHITE,
            }}>
            <Text
              style={{
                fontSize: 14,
                color: itemSelected
                  ? Colors.PRIMARY
                  : index === 0
                  ? Colors.BLACK
                  : '#ccc',
              }}>
              {item.loc_name}
            </Text>
            <RenderIf condition={itemSelected}>
              <Image
                source={require('@app/assets/images/right.png')}
                style={{width: 20, height: 20}}
              />
            </RenderIf>
          </View>
        </TouchableWithoutFeedback>
      );
    };

    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          flex: 1,
          justifyContent: 'flex-end',
        }}>
        <View
          style={{
            height: (apotekList.length + 1) * 48 + 20,
            justifyContent: 'flex-end',
            flexDirection: 'column',
            backgroundColor: Colors.WHITE,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              height: 48,
              fontSize: 14,
              backgroundColor: Colors.WHITE,
            }}>
            <Text
              style={{
                flex: 1,
                color: Colors.BLACK,
                fontSize: 14,
                fontWeight: 'bold',
                textAlign: 'center',
              }}>
              Pharmacy
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                alignItems: 'flex-end',
                paddingVertical: 15,
                paddingHorizontal: 20,
              }}>
              <Image
                source={require('@app/assets/images/delete.png')}
                style={{width: 14, height: 14}}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              width: Mixins.MAX_WIDTH,
              backgroundColor: Colors.GRAY_LIGHT,
              height: 1,
            }}
          />
          <FlatList
            data={apotekList}
            keyExtractor={item => item.loc_code}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    );
  };

  // Set Apotek to cart
  const setApotekLocation = async data => {
    const variables = {
      cartId: getRxCartId,
      loc_code: data.loc_code,
      store_address: data.loc_street,
    };
    try {
      ctxCheckout?.setIsCart({
        ...ctxCheckout?.isCart,
        loadingButtonOrder: true,
      });
      const res = await onSetApotekLocation({
        params: variables,
        paramsOpt: {isReturn: true},
      });

      const cartRes = res?.data?.setStoreLocation?.cart;
      if (cartRes) {
        await setDataCartAddress(cartRes);
        await setPrices();
        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          loadingButtonOrder: false,
        });
        ctxCheckout?.setSelectedApotek({...data, selected: true});
      }
    } catch (err) {
      console.log('[err] set apotek', err);
      ctxCheckout?.setIsCart({
        ...ctxCheckout?.isCart,
        loadingButtonOrder: false,
      });
    }
  };

  const setInitialApotek = async data => {
    const variables = {
      cartId: getRxCartId,
      loc_code: data.loc_code,
      store_address: data.loc_street,
    };
    try {
      const res = await onSetApotekLocation({
        params: variables,
        paramsOpt: {isReturn: true},
      });

      const cartRes = res?.data?.setStoreLocation?.cart;
      if (cartRes) {
        ctxCheckout?.setSelectedApotek({...data, selected: true});
      }
    } catch (err) {
      console.log('[err] set apotek', err);
    }
  };
  useEffect(() => {
    if (apotekList?.length > 0) {
      setInitialApotek(apotekList[0]);
    }
  }, [apotekList]);

  let value = t('cart_checkout.selectApotek');
  if (ctxCheckout?.selectedApotek?.loc_name) {
    value = ctxCheckout?.selectedApotek?.loc_name;
  }
  const isLoading = ctxCheckout?.isCart?.loadingButtonOrder;

  return (
    <CustomView paddingHorizontal={15} paddingVertical={20}>
      <Text
        bold
        style={{
          marginBottom: 10,
          fontSize: 16,
        }}>
        Pharmacy Description
      </Text>
      <Text style={{fontSize: 14}}>Please Select Pharmacy</Text>
      <RenderIf condition={!apotekList.length}>
        <CustomView width={'100%'} marginTop={10}>
          <Shimmer
            wrapperStyle={{borderRadius: 5, height: 60, width: '100%'}}
          />
        </CustomView>
      </RenderIf>
      <RenderIf condition={apotekList.length}>
        {/*<InputField*/}
        {/*  name={'apotek_location'}*/}
        {/*  label={''}*/}
        {/*  value={shortenText(value, 42)}*/}
        {/*  data={apotekListData}*/}
        {/*  onPress={pressProps => {*/}
        {/*    if (isLoading) {*/}
        {/*      rxAppSnackbar({message: t('cart_checkout.error.loadingMessage')});*/}
        {/*    } else {*/}
        {/*      setApotekLocation(pressProps.selected);*/}
        {/*    }*/}
        {/*  }}*/}
        {/*  onChange={() => {}}*/}
        {/*  type={FORM_FIELD.INPUT_DROPDOWN}*/}
        {/*/>*/}
        <TouchableOpacity
          onPress={() => {
            if (!isLoading) {
              setModalVisible(true);
            }
          }}>
          <View
            style={{
              marginTop: 10,
              height: 40,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: Colors.GRAY_LIGHT,
              borderRadius: 5,
            }}>
            <Text style={{fontSize: 14, color: Colors.BLACK, paddingLeft: 10}}>
              {shortenText(value, 42)}
            </Text>
            <Image
              source={require('@app/assets/images/arrow_down.png')}
              style={{width: 24, height: 24, marginRight: 10}}
            />
          </View>
        </TouchableOpacity>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
          {
            <BottomSelectModalWithFlastList
              onItemSelected={item => {
                setApotekLocation(item);
                setModalVisible(false);
              }}
            />
          }
        </Modal>
      </RenderIf>
    </CustomView>
  );
};

export default BlockApotek;
