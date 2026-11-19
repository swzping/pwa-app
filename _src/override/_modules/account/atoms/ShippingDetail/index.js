import React, {useState} from 'react';
import {useReactiveVar} from '@apollo/client';
import {WebView} from 'react-native-webview';
import {formatDateTime} from '@app/helpers/General';
import {rxAppSnackbar} from '@app/services/cache';
import {Colors} from '@app/styles';
import {normalize} from '@app/styles/mixins';
import {ActivityIndicator} from 'react-native-paper';
import {Modal, SafeAreaView, TouchableOpacity} from 'react-native';
import {rxUserTheme} from '@app/services/cache';
import {useTranslation} from 'react-i18next';

import Button from '@app/components/Button';
import RenderIf from '@app/components/RenderIf';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';

import Icon from 'react-native-vector-icons/Ionicons';
import styles from '@app/_modules/account/atoms/ShippingDetail/styles';

const LiveTrackingWebView = ({
  liveTrackingUrl,
  showLiveTrackModal,
  setShowLiveTrackModal,
  liveTrackLoading,
  setLiveTrackLoading,
}) => {
  const {t} = useTranslation();
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={showLiveTrackModal}
      onRequestClose={() => {
        setShowLiveTrackModal(false);
      }}>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: Colors.WHITE,
        }}>
        <CustomView verticalCenter horizontalCenter style={{flex: 1}}>
          <CustomView
            verticalCenter
            horizontalCenter
            style={[styles.container]}>
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={() => setShowLiveTrackModal(false)}>
              <Icon
                name="ios-arrow-back"
                size={normalize(35)}
                color={Colors.GRAY_DARK}
              />
            </TouchableOpacity>
            <CustomView style={styles.titleContainer}>
              <Text bold xlarge>
                {t('account.view.liveTracking')}
              </Text>
            </CustomView>
          </CustomView>
          <RenderIf condition={liveTrackLoading}>
            <CustomView
              verticalCenter
              horizontalCenter
              style={styles.loadingContainer}>
              <ActivityIndicator color={Colors.PRIMARY} />
            </CustomView>
          </RenderIf>
          <WebView
            onLoadEnd={() => setLiveTrackLoading(false)}
            onError={() => {
              setLiveTrackLoading(false);
              setShowLiveTrackModal(false);
              rxAppSnackbar({
                message: t('account.error.liveTracking'),
              });
            }}
            source={{uri: liveTrackingUrl}}
            style={{flex: 1}}
          />
        </CustomView>
      </SafeAreaView>
    </Modal>
  );
};

const ShippingDetail = ({shipping_description, shipping_detail}) => {
  const scheme = useReactiveVar(rxUserTheme);
  const {t} = useTranslation();

  const [showLiveTrackModal, setShowLiveTrackModal] = useState(false);
  const [liveTrackLoading, setLiveTrackLoading] = useState(false);

  if (!shipping_detail[0].data_detail) {
    return null;
  }

  if (
    shipping_detail[0]?.data_detail.includes(
      'Sorry, There is no Tracking Available.',
    )
  ) {
    return <Text>{shipping_detail[0]?.data_detail}</Text>;
  }

  const isGosend = shipping_description.toLowerCase().includes('go-send');
  const dataDetail = [];
  shipping_detail.map(detail => {
    const dataDetailString = detail.data_detail
      .replace(/\\t/g, '')
      .replace(/'/g, '"');
    dataDetail.push(JSON.parse(dataDetailString));
  });

  if (isGosend) {
    return (
      <CustomView>
        {dataDetail.map(data => {
          const {
            orderNo,
            driverId,
            driverName,
            driverPhone,
            driverPhoto,
            vehicleNumber,
            receiverName,
            orderCreatedTime,
            orderDispatchTime,
            orderArrivalTime,
            orderClosedTime,
            sellerAddressName,
            sellerAddressDetail,
            buyerAddressName,
            buyerAddressDetail,
            liveTrackingUrl,
          } = data;

          return (
            <CustomView
              backgroundColor={
                scheme === 'dark' ? Colors.GRAY_DARK : Colors.GRAY_LIGHT
              }>
              <CustomView
                radius
                horizontalStart
                paddingHorizontal={10}
                paddingVertical={20}
                marginVertical={10}>
                <CustomView horizontalStart>
                  <Text bold>
                    {t('account.view.orderNo')} {orderNo}
                  </Text>

                  <RenderIf condition={driverId}>
                    <Text>
                      {t('account.view.driverId')} {driverId}
                    </Text>
                  </RenderIf>
                  <RenderIf condition={driverName}>
                    <Text>
                      {t('account.view.driverName')} {driverName}
                    </Text>
                  </RenderIf>
                  <RenderIf condition={driverPhone}>
                    <Text>
                      {t('account.view.driverPhone')} {driverPhone}
                    </Text>
                  </RenderIf>
                  <RenderIf condition={driverPhoto}>
                    <Text>
                      {t('account.view.driverPhoto')} {driverPhoto}
                    </Text>
                  </RenderIf>
                  <RenderIf condition={vehicleNumber}>
                    <Text>
                      {t('account.view.vehicleNumber')} {vehicleNumber}
                    </Text>
                  </RenderIf>
                  <RenderIf condition={receiverName}>
                    <Text>
                      {t('account.view.recivedBy')} {receiverName}
                    </Text>
                  </RenderIf>

                  <RenderIf condition={orderCreatedTime}>
                    <Text>
                      {t('account.view.orderCreatedTime')}{' '}
                      {formatDateTime(orderCreatedTime)}
                    </Text>
                  </RenderIf>
                  <RenderIf condition={orderDispatchTime}>
                    <Text>
                      {t('account.view.orderDispatchTime')}{' '}
                      {formatDateTime(orderDispatchTime)}
                    </Text>
                  </RenderIf>
                  <RenderIf condition={orderArrivalTime}>
                    <Text>
                      {t('account.view.orderArrivalTime')}{' '}
                      {formatDateTime(orderArrivalTime)}
                    </Text>
                  </RenderIf>
                  <RenderIf condition={orderClosedTime}>
                    <Text>
                      {t('account.view.orderClosedTime')}{' '}
                      {formatDateTime(orderClosedTime)}
                    </Text>
                  </RenderIf>
                </CustomView>

                <CustomView horizontalStart marginVertical={10}>
                  <Text bold>{t('account.view.seller')} </Text>
                  <Text>{sellerAddressName}</Text>
                  <Text>{sellerAddressDetail}</Text>
                </CustomView>

                <CustomView horizontalStart marginVertical={10}>
                  <Text bold>{t('account.view.buyer')} </Text>
                  <Text>{buyerAddressName}</Text>
                  <Text>{buyerAddressDetail}</Text>
                </CustomView>

                <Button
                  label={t('account.btn.trackOrder')}
                  onPress={() => {
                    setLiveTrackLoading(true);
                    setShowLiveTrackModal(true);
                  }}
                  styleProp={styles.trackButton}
                  textStyleProp={{color: Colors.WHITE, fontWeight: 'bold'}}
                />
              </CustomView>

              <LiveTrackingWebView
                liveTrackingUrl={liveTrackingUrl}
                showLiveTrackModal={showLiveTrackModal}
                setShowLiveTrackModal={setShowLiveTrackModal}
                liveTrackLoading={liveTrackLoading}
                setLiveTrackLoading={setLiveTrackLoading}
              />
            </CustomView>
          );
        })}
      </CustomView>
    );
  } else {
    return (
      <CustomView radius>
        {dataDetail.map(data => {
          return (
            <CustomView padding={10} radius marginVertical={10} horizontalStart>
              <Text style={[styles.marginSpacingBottom]}>{data.name}</Text>
              <Text style={[styles.marginSpacingBottom]}>
                {data.description}{' '}
              </Text>

              <CustomView row spaceBetween>
                <CustomView row>
                  <Text small>{t('account.view.updatedBy')} </Text>
                  <Text small>{data.updatedBy}</Text>
                </CustomView>
                <Text small>{formatDateTime(data.updateDate)}</Text>
              </CustomView>
            </CustomView>
          );
        })}
      </CustomView>
    );
  }
};

export default ShippingDetail;
