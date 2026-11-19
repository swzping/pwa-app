import React, {useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

import Config from 'react-native-config';
import {Button, TouchableRipple} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {modules} from '@root/swift.config';

import styles from '@app/_modules/account/styles';
import AddressListIcon from '@app/assets/svgs/account/AddressListIcon';
import AskThePharmaristIcon from '@app/assets/svgs/account/AskThePharmaristIcon';
import CustomerServiceIcon from '@app/assets/svgs/account/CustomerServiceIcon';
import ECatalogueIcon from '@app/assets/svgs/account/ECatalogueIcon';
import FaqIcon from '@app/assets/svgs/account/FaqIcon';
import MemebershipIcon from '@app/assets/svgs/account/MemebershipIcon';
import MyOrdersIcon from '@app/assets/svgs/account/MyOrdersIcon';
import MyProfileIcon from '@app/assets/svgs/account/MyProfileIcon';
import PointHistoryIcon from '@app/assets/svgs/account/PointHistoryIcon';
import HealtyHeart from '@app/assets/svgs/HealtyHeart';
import CheckBox from '@app/components/CheckBox/index';
import CustomView from '@app/components/CustomView/index';
import LoyaltyCard from '@app/components/LoyaltyCard';
import NavBar from '@app/components/NavBar/index';
import RenderIf from '@app/components/RenderIf';
import Text from '@app/components/Text';
import {
  ASK_PHARMACIST_WHATSAPP_URL,
  TYPE_PAGE,
  USER_CUSTOMER,
} from '@app/helpers/Constants';
import {navigateTo} from '@app/helpers/Navigation';
import {onGoStore} from '@app/helpers/Version';
import {Colors} from '@app/styles';
import {normalize} from '@app/styles/mixins';

const ICON_SIZE = 28;

const getSvgComponentByLabel = label => {
  switch (label) {
    case 'My Profile':
      return MyProfileIcon;
    case 'Address List':
      return AddressListIcon;
    case 'Ask the Pharmacist':
      return AskThePharmaristIcon;
    case 'E-Catalogue':
      return ECatalogueIcon;
    case 'FAQ':
      return FaqIcon;
    case 'My Orders':
      return MyOrdersIcon;
    case 'Contact Us':
    case 'Customer':
      return CustomerServiceIcon;
    case 'Membership Benefit':
      return MemebershipIcon;
    case 'Point History':
      return PointHistoryIcon;
    default:
      return null;
  }
};

const RegisterMedicalRecordModal = ({
  t,
  visible,
  setVisible,
  onRegisterMedicalTest,
}) => {
  const [checked, setChecked] = useState(false);
  return (
    <Modal visible={visible} onRequestClose={() => setVisible(false)}>
      <CustomView>
        <NavBar
          center
          useClose
          useWhite
          useBackPress={() => setVisible(false)}
          title={t('account.tnc')}
        />
        <CustomView style={styles.modalMedicalContainer}>
          <CustomView style={styles.modalMedicalContent}>
            <CustomView>
              <Text style={styles.modalMedicalText}>
                {t('account.termRegisMedical')}
              </Text>
            </CustomView>
            <CustomView row horizontalCenter marginTop={10}>
              <CheckBox
                checkedColor={Colors.PRIMARY}
                uncheckedColor={'red'}
                onPress={() => setChecked(!checked)}
                size={20}
                selected={checked}
              />
              <CustomView style={styles.modalMedicalTextAgreeWrapper}>
                <Text style={styles.modalMedicalTextAgree}>
                  {t('account.iAgree')}
                </Text>
              </CustomView>
            </CustomView>
          </CustomView>
          <Button
            mode={'contained'}
            onPress={() => {
              if (checked) {
                setVisible(false);
                onRegisterMedicalTest();
              }
            }}
            labelStyle={{
              textTransform: 'none',
              fontSize: normalize(17),
              fontWeight: 'bold',
            }}
            style={{
              padding: 5,
              marginBottom: 10,
              borderRadius: 10,
              backgroundColor: checked ? Colors.PRIMARY : Colors.GRAY_MEDIUM,
            }}>
            {t('account.label.registerMedicalTest')}
          </Button>
        </CustomView>
      </CustomView>
    </Modal>
  );
};

const LoadingModal = ({visible}) => {
  return (
    <Modal visible={visible} transparent>
      <CustomView style={styles.loadingModal}>
        <CustomView style={styles.loadingModalContent}>
          <ActivityIndicator size={50} color={Colors.PRIMARY} />
        </CustomView>
      </CustomView>
    </Modal>
  );
};

// 水平卡片菜单项
const AccountMenuCard = ({
  label,
  icon,
  IconComponent,
  onPress,
  disabled = false,
}) => {
  const SvgIcon = getSvgComponentByLabel(label);
  const primaryColor = Colors?.PRIMARY || '#FF8200';
  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      style={[styles.menuCard, disabled && {opacity: 0.3}]}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}>
      <CustomView horizontalCenter verticalCenter>
        {SvgIcon ? (
          <CustomView style={styles.iconContainer}>
            <SvgIcon width={ICON_SIZE} height={ICON_SIZE} fill={primaryColor} />
          </CustomView>
        ) : IconComponent ? (
          <CustomView style={styles.iconContainer}>{IconComponent}</CustomView>
        ) : icon ? (
          <CustomView style={styles.iconContainer}>
            <Icon name={icon} color={primaryColor} size={ICON_SIZE} />
          </CustomView>
        ) : null}
        <Text
          style={styles.menuCardText}
          numberOfLines={2}
          ellipsizeMode="tail">
          {label}
        </Text>
      </CustomView>
    </TouchableOpacity>
  );
};

const AccountMenu = ({label, icon, IconComponent, onPress}) => {
  const SvgIcon = getSvgComponentByLabel(label);
  const primaryColor = Colors?.PRIMARY || '#FF8200';
  return (
    <TouchableRipple
      borderless
      onPress={onPress}
      style={{marginBottom: 10, borderRadius: 10}}>
      <CustomView
        row
        horizontalCenter
        spaceBetween
        border={1}
        borderRadius={10}
        padding={10}
        borderColor={Colors.GRAY_MEDIUM}>
        <CustomView row horizontalCenter>
          {SvgIcon ? (
            <CustomView
              style={{
                marginRight: 15,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <SvgIcon
                width={ICON_SIZE}
                height={ICON_SIZE}
                fill={primaryColor}
              />
            </CustomView>
          ) : IconComponent ? (
            <CustomView
              style={{
                marginRight: 15,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {IconComponent}
            </CustomView>
          ) : icon ? (
            <CustomView
              style={{
                marginRight: 15,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Icon name={icon} color={primaryColor} size={ICON_SIZE} />
            </CustomView>
          ) : null}
          <Text large bold color={Colors.GRAY_DARK2}>
            {label}
          </Text>
        </CustomView>
        <Icon name={'chevron-right'} color={Colors.GRAY_MEDIUM} size={28} />
      </CustomView>
    </TouchableRipple>
  );
};

const AccountScreen = ({
  t,
  onLogOut,
  userData,
  userRewardPoint,
  userWishlist,
  onNavigateMenuPage,
  onPressWishlist,
  onNavigateToMedicalTest,
  isRegisterTest,
  refreshing,
  onRefresh,
  loadingRegisterMedical,
  onRegisterMedicalTest,
  userToken,
  userType,
  onEditProfile,
  loyaltyCardRef,
  onGoCheckIt,
  noLoginGoCheckIt,
  storeConfig,
}) => {
  const [showRegisterMedicalModal, setShowRegisterMedicalModal] =
    useState(false);
  const insets = useSafeAreaInsets();

  const isLoggedIn = userToken && userType === USER_CUSTOMER;

  return (
    <View
      style={[
        {flex: 1, backgroundColor: Colors.ORANGE},
        Platform.OS === 'android' && {paddingTop: insets.top},
      ]}>
      <RenderIf condition={Platform.OS === 'ios'}>
        <SafeAreaView
          edges={['top']}
          style={{backgroundColor: Colors.ORANGE}}
        />
      </RenderIf>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          {backgroundColor: '#FFEFD0'},
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* 积分/会员卡组件 */}
        <LoyaltyCard ref={loyaltyCardRef} />

        {/* 登录状态下的内容 */}
        <RenderIf condition={isLoggedIn}>
          <CustomView marginTop={15} marginBottom={25} marginHorizontal={16}>
            <RenderIf condition={modules?.account_medical_test?.enable}>
              <RenderIf condition={!isRegisterTest}>
                <Button
                  mode={'contained'}
                  onPress={() => setShowRegisterMedicalModal(true)}
                  labelStyle={{
                    textTransform: 'none',
                    fontSize: normalize(17),
                    fontWeight: 'bold',
                  }}
                  style={{
                    padding: 5,
                    marginBottom: 10,
                    borderRadius: 10,
                    backgroundColor: Colors.PRIMARY,
                  }}>
                  {t('account.label.registerMedicalTest')}
                </Button>
              </RenderIf>
              <RenderIf condition={isRegisterTest}>
                <AccountMenu
                  key={'view-medical-test'}
                  label={t('account.label.viewMedicalTest')}
                  IconComponent={<HealtyHeart color={Colors.PRIMARY} />}
                  onPress={() => onNavigateToMedicalTest()}
                />
              </RenderIf>
            </RenderIf>
            {/* Account Information 部分 */}
            <CustomView style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Account Information</Text>
              <CustomView row style={styles.menuCardsRow}>
                <AccountMenuCard
                  label="My Profile"
                  icon="account-outline"
                  onPress={onEditProfile}
                />
                {modules.account.atoms.menus
                  .filter(item => item.enable && item.label === 'myOrders')
                  .map((item, index) => (
                    <AccountMenuCard
                      key={index}
                      label="My Orders"
                      icon={item.icon}
                      onPress={() => onNavigateMenuPage(item)}
                    />
                  ))}
                <AccountMenuCard
                  label="Wishlist"
                  icon="heart-outline"
                  onPress={onPressWishlist}
                />
                {modules.account.atoms.menus
                  .filter(item => item.enable && item.label === 'addressList')
                  .map((item, index) => (
                    <AccountMenuCard
                      key={index}
                      label="Address List"
                      icon="map-outline"
                      onPress={() => onNavigateMenuPage(item)}
                    />
                  ))}
              </CustomView>
            </CustomView>

            {/* Membership 部分 */}
            <CustomView style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Membership</Text>
              <CustomView row style={styles.menuCardsRow}>
                <AccountMenuCard
                  label="Point History"
                  icon="clock-outline"
                  onPress={() => {
                    const pointHistoryItem = modules.account.atoms.menus.find(
                      item => item.enable && item.label === 'pointHistory',
                    );
                    if (pointHistoryItem && onNavigateMenuPage) {
                      onNavigateMenuPage(pointHistoryItem);
                    }
                  }}
                />
                <AccountMenuCard
                  label="Membership Benefit"
                  icon="store-outline"
                  onPress={() => {
                    if (modules.cms_page?.enable) {
                      navigateTo(
                        modules.cms_page.enable,
                        modules.cms_page.name,
                        {
                          identifier: 'membership-benefit',
                          type: TYPE_PAGE,
                        },
                      );
                    }
                  }}
                />
                <AccountMenuCard
                  label="E-Catalogue"
                  icon="format-list-bulleted"
                  onPress={() => {
                    if (modules.cms_page?.enable) {
                      Linking.openURL(Config.PWA_BASE_URL + '/catalog');
                    }
                  }}
                />
                <AccountMenuCard
                  label="Referral"
                  icon="share-variant-outline"
                  disabled
                  onPress={() => {
                    const referralItem = modules.account.atoms.menus.find(
                      item => item.enable && item.label === 'referral',
                    );
                    if (referralItem && onNavigateMenuPage) {
                      onNavigateMenuPage(referralItem);
                    }
                  }}
                />
              </CustomView>
            </CustomView>

            {/* Event Booking */}
            <RenderIf condition={storeConfig?.dfi_event_booking_app_enabled}>
              <CustomView
                style={{
                  ...styles.sectionCard,
                  height: 78,
                  position: 'relative',
                  paddingHorizontal: 20,
                  paddingTop: 14,
                  paddingBottom: 16,
                  overflow: 'hidden',
                }}>
                <Text
                  style={{
                    color: '#212121',
                    fontSize: 16,
                    fontWeight: '700',
                  }}>
                  {t('account.title.eventBooking')}
                </Text>
                <Button
                  style={{
                    alignSelf: 'flex-start',
                    justifyContent: 'center',
                    marginTop: 4,
                    borderWidth: 1,
                    borderColor: Colors.PRIMARY,
                    borderRadius: 36,
                  }}
                  labelStyle={{
                    marginHorizontal: 8,
                    marginVertical: 4,
                    color: Colors.PRIMARY,
                    fontFamily: 'Noto Sans',
                    fontSize: 10,
                    fontWeight: '400',
                    lineHeight: 12,
                    textTransform: 'none',
                  }}
                  onPress={onGoCheckIt}>
                  {t('account.btn.goCheckIt')}
                </Button>
                <View
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: 0,
                    width: 136,
                    height: 136,
                  }}>
                  <Image
                    source={require('@app/assets/images/eventBooking.png')}
                    style={{width: '100%', height: '100%'}}
                  />
                </View>
              </CustomView>
            </RenderIf>

            {/* Help Center 部分 */}
            <CustomView style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Help Center</Text>
              <CustomView row style={styles.menuCardsRow}>
                <AccountMenuCard
                  label="Ask the Pharmacist"
                  icon="message-text-outline"
                  onPress={() => {
                    Linking.openURL(ASK_PHARMACIST_WHATSAPP_URL);
                  }}
                />
                <AccountMenuCard
                  label="Contact Us"
                  icon="account-group-outline"
                  onPress={() => {
                    if (modules.customer_care?.enable) {
                      navigateTo(
                        modules.customer_care.enable,
                        modules.customer_care.name,
                      );
                    }
                  }}
                />
                <AccountMenuCard
                  label="FAQ"
                  icon="help-circle-outline"
                  onPress={() => {
                    if (modules.cms_page?.enable) {
                      navigateTo(
                        modules.cms_page.enable,
                        modules.cms_page.name,
                        {
                          identifier: 'faqs',
                          type: TYPE_PAGE,
                        },
                      );
                    }
                  }}
                />
                <AccountMenuCard
                  label="Rate this App"
                  icon="thumb-up-outline"
                  onPress={() => {
                    onGoStore();
                  }}
                />
              </CustomView>
            </CustomView>
          </CustomView>
        </RenderIf>

        {/* 未登录状态下的内容 */}
        <RenderIf condition={!isLoggedIn}>
          <CustomView marginTop={15} marginBottom={25} marginHorizontal={16}>
            {/* Account Information 部分 */}
            <CustomView style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Account Information</Text>
              <CustomView row style={styles.menuCardsRow}>
                <AccountMenuCard
                  label="My Profile"
                  icon="account-outline"
                  disabled={true}
                  onPress={() => {
                    // 跳转到登录页面
                    if (onNavigateMenuPage) {
                      // 可以添加跳转逻辑
                    }
                  }}
                />
                <AccountMenuCard
                  label="My Orders"
                  icon="shopping-outline"
                  disabled={true}
                  onPress={() => {
                    const myOrdersItem = modules.account.atoms.menus.find(
                      item => item.enable && item.label === 'myOrders',
                    );
                    if (myOrdersItem && onNavigateMenuPage) {
                      onNavigateMenuPage(myOrdersItem);
                    }
                  }}
                />
                <AccountMenuCard
                  label="Wishlist"
                  icon="heart-outline"
                  disabled={true}
                  onPress={onPressWishlist}
                />
                <AccountMenuCard
                  label="Address List"
                  icon="map-outline"
                  disabled={true}
                  onPress={() => {
                    const addressListItem = modules.account.atoms.menus.find(
                      item => item.enable && item.label === 'addressList',
                    );
                    if (addressListItem && onNavigateMenuPage) {
                      onNavigateMenuPage(addressListItem);
                    }
                  }}
                />
              </CustomView>
            </CustomView>

            {/* Membership 部分 */}
            <CustomView style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Membership</Text>
              <CustomView row style={styles.menuCardsRow}>
                <AccountMenuCard
                  label="Point History"
                  icon="clock-outline"
                  disabled={true}
                  onPress={() => {
                    const pointHistoryItem = modules.account.atoms.menus.find(
                      item => item.enable && item.label === 'pointHistory',
                    );
                    if (pointHistoryItem && onNavigateMenuPage) {
                      onNavigateMenuPage(pointHistoryItem);
                    }
                  }}
                />
                <AccountMenuCard
                  label="Membership Benefit"
                  icon="store-outline"
                  onPress={() => {
                    if (modules.cms_page?.enable) {
                      navigateTo(
                        modules.cms_page.enable,
                        modules.cms_page.name,
                        {
                          identifier: 'membership-benefit',
                          type: TYPE_PAGE,
                        },
                      );
                    }
                  }}
                />
                <AccountMenuCard
                  label="E-Catalogue"
                  icon="format-list-bulleted"
                  onPress={() => {
                    if (modules.cms_page?.enable) {
                      Linking.openURL(Config.PWA_BASE_URL + '/catalog');
                    }
                  }}
                />
                <AccountMenuCard
                  label="Referral"
                  icon="share-variant-outline"
                  disabled={true}
                  onPress={() => {
                    const referralItem = modules.account.atoms.menus.find(
                      item => item.enable && item.label === 'referral',
                    );
                    if (referralItem && onNavigateMenuPage) {
                      onNavigateMenuPage(referralItem);
                    }
                  }}
                />
              </CustomView>
            </CustomView>
            {/* Event Booking 未登录部分 */}
            <RenderIf condition={storeConfig?.dfi_event_booking_app_enabled}>
              <CustomView
                style={{
                  ...styles.sectionCard,
                  height: 78,
                  position: 'relative',
                  paddingHorizontal: 20,
                  paddingTop: 14,
                  paddingBottom: 16,
                  overflow: 'hidden',
                }}>
                <Text
                  style={{
                    color: '#212121',
                    fontSize: 16,
                    fontWeight: '700',
                  }}>
                  {t('account.title.eventBooking')}
                </Text>
                <Button
                  style={{
                    alignSelf: 'flex-start',
                    justifyContent: 'center',
                    marginTop: 4,
                    borderWidth: 1,
                    borderColor: Colors.PRIMARY,
                    borderRadius: 36,
                  }}
                  labelStyle={{
                    marginHorizontal: 8,
                    marginVertical: 4,
                    color: Colors.PRIMARY,
                    fontFamily: 'Noto Sans',
                    fontSize: 10,
                    fontWeight: '400',
                    lineHeight: 12,
                    textTransform: 'none',
                  }}
                  onPress={noLoginGoCheckIt}>
                  {t('account.btn.goCheckIt')}
                </Button>
                <View
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: 0,
                    width: 136,
                    height: 136,
                  }}>
                  <Image
                    source={require('@app/assets/images/eventBooking.png')}
                    style={{width: '100%', height: '100%'}}
                  />
                </View>
              </CustomView>
            </RenderIf>

            {/* Help Center 部分 */}
            <CustomView style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Help Center</Text>
              <CustomView row style={styles.menuCardsRow}>
                <AccountMenuCard
                  label="Ask the Pharmacist"
                  icon="message-text-outline"
                  onPress={() => {
                    Linking.openURL(ASK_PHARMACIST_WHATSAPP_URL);
                  }}
                />
                <AccountMenuCard
                  label="Contact Us"
                  icon="account-group-outline"
                  onPress={() => {
                    if (modules.customer_care?.enable) {
                      navigateTo(
                        modules.customer_care.enable,
                        modules.customer_care.name,
                      );
                    }
                  }}
                />
                <AccountMenuCard
                  label="FAQ"
                  icon="help-circle-outline"
                  onPress={() => {
                    if (modules.cms_page?.enable) {
                      navigateTo(
                        modules.cms_page.enable,
                        modules.cms_page.name,
                        {
                          identifier: 'faqs',
                          type: TYPE_PAGE,
                        },
                      );
                    }
                  }}
                />
                <AccountMenuCard
                  label="Rate this App"
                  icon="thumb-up-outline"
                  onPress={() => {
                    onGoStore();
                  }}
                />
              </CustomView>
            </CustomView>
          </CustomView>
        </RenderIf>
        {/* <Footer /> */}
      </ScrollView>
      <LoadingModal visible={loadingRegisterMedical} />
      <RegisterMedicalRecordModal
        t={t}
        visible={showRegisterMedicalModal}
        setVisible={setShowRegisterMedicalModal}
        onRegisterMedicalTest={onRegisterMedicalTest}
      />
    </View>
  );
};

export default AccountScreen;
