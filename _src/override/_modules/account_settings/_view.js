import React from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

import Config from 'react-native-config';
import DeviceInfo from 'react-native-device-info';
import IconFeather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { modules } from '@root/swift.config';

import AboutUsIcon from '@app/assets/svgs/settings/AboutUsIcon';
import AskPharmacistIcon from '@app/assets/svgs/settings/AskPharmacistIcon';
// import BlogIcon from '@app/assets/svgs/settings/BlogIcon';
import BrandsIcon from '@app/assets/svgs/settings/BrandsIcon';
import ContactUsIcon from '@app/assets/svgs/settings/ContactUsIcon';
import ECatalogIcon from '@app/assets/svgs/settings/ECatalogIcon';
import FacebookIcon from '@app/assets/svgs/settings/FacebookIcon';
import FaqIcon from '@app/assets/svgs/settings/FaqIcon';
import HowToShopIcon from '@app/assets/svgs/settings/HowToShopIcon';
import InstagramIcon from '@app/assets/svgs/settings/InstagramIcon';
import PrivacyPolicyIcon from '@app/assets/svgs/settings/PrivacyPolicyIcon';
import TermsConditionsIcon from '@app/assets/svgs/settings/TermsConditionsIcon';
import TiktokIcon from '@app/assets/svgs/settings/TiktokIcon';
import XIcon from '@app/assets/svgs/settings/XIcon';
import YoutubeIcon from '@app/assets/svgs/settings/YoutubeIcon';
import Circle from '@app/components/Circle';
import CustomView from '@app/components/CustomView';
import NavBar from '@app/components/NavBar/index';
import RenderIf from '@app/components/RenderIf';
// import ReturnRefundIcon from '@app/assets/svgs/settings/ReturnRefundIcon';
// import LimitationLiabilityIcon from '@app/assets/svgs/settings/LimitationLiabilityIcon';
import Text from '@app/components/Text';
import {
  ASK_PHARMACIST_WHATSAPP_URL,
  TYPE_PAGE,
} from '@app/helpers/Constants';
import { navigateTo } from '@app/helpers/Navigation';
import { Colors } from '@app/styles';

const SettingsMenuItem = ({
  icon,
  label,
  onPress,
  showBadge = false,
  IconComponent,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
      }}>
      <CustomView
        style={{
          width: 32,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}>
        {IconComponent ? (
          <IconComponent width={22} height={22} fill="#222222" />
        ) : (
          <Icon name={icon} size={22} color="#4F4F4F" />
        )}
      </CustomView>
      <Text style={{ flex: 1, fontSize: 16, color: '#000000' }}>{label}</Text>
      {showBadge && (
        <Circle
          color={'#4CAF50'}
          number={1}
          textColor={'#FFFFFF'}
          textSize={10}
          size={18}
          topPosition={-8}
          rightPosition={-8}
        />
      )}
      <IconFeather name="chevron-right" size={20} color="#CCCCCC" />
    </TouchableOpacity>
  );
};

const SectionTitle = ({ title }) => {
  return (
    <Text
      style={{
        fontSize: 14,
        fontWeight: '700',
        color: '#666666',
        marginTop: 24,
        marginBottom: 12,
        marginHorizontal: 20,
        textTransform: 'uppercase',
      }}>
      {title}
    </Text>
  );
};

const SOCIAL_ICON_SIZE = 52;

const SocialMediaIcon = ({ icon, IconComponent, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: 6,
      }}>
      <CustomView
        style={{
          width: SOCIAL_ICON_SIZE,
          height: SOCIAL_ICON_SIZE,
          borderRadius: SOCIAL_ICON_SIZE / 2,
          backgroundColor: '#FFFFFF',
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#E0E0E0',
        }}>

        {IconComponent ? (
          <IconComponent fill="#222222" />
        ) : (
          <Icon name={icon} size={28} color="#4F4F4F" />
        )}
      </CustomView>
    </TouchableOpacity>
  );
};

const SettingsScreen = ({
  t,
  loading,
  isSubscribed,
  onChangeSubscription,
  onLogOut,
  onDeleteAccount,
  isLoggedIn = true,
}) => {
  const showAlert = () =>
    Alert.alert(t('logout.title'), t('logout.subtitle'), [
      {
        text: t('label.cancel'),
        cancelable: true,
        style: 'cancel',
      },
      {
        text: t('logout.title'),
        onPress: onLogOut,
        style: 'default',
      },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <NavBar
        useWhite
        useBack
        center
        titleBold
        childrenRight={<CustomView width={'12%'} />}
        title={t('account_settings.title.settings')}
      />
      <ScrollView style={{ flex: 1 }}>
        {/* Account Section - 只在已登录时显示 */}
        <RenderIf condition={isLoggedIn}>
          <SectionTitle title="Account" />
          <SettingsMenuItem
            icon="account-outline"
            label="My Profile"
            onPress={() => {
              if (modules.account_update_information?.enable) {
                navigateTo(
                  modules.account_update_information.enable,
                  modules.account_update_information.name,
                );
              }
            }}
          />
          <SettingsMenuItem
            icon="lock-outline"
            label="Change Password"
            onPress={() => {
              if (modules.account_change_password?.enable) {
                navigateTo(
                  modules.account_change_password.enable,
                  modules.account_change_password.name,
                );
              }
            }}
          />
        </RenderIf>

        {/* Info Guardian Section */}
        <SectionTitle title="Info Guardian" />
        <SettingsMenuItem
          IconComponent={AboutUsIcon}
          label="About Us"
          onPress={() => {
            if (modules.account_about_us?.enable) {
              navigateTo(
                modules.account_about_us.enable,
                modules.account_about_us.name,
              );
            } else if (modules.cms_page?.enable) {
              navigateTo(modules.cms_page.enable, modules.cms_page.name, {
                identifier: 'guardian-about-us',
                type: TYPE_PAGE,
              });
            }
          }}
        />
        <SettingsMenuItem
          IconComponent={FaqIcon}
          label="FAQ"
          onPress={() => {
            if (modules.cms_page?.enable) {
              navigateTo(modules.cms_page.enable, modules.cms_page.name, {
                identifier: 'faqs',
                type: TYPE_PAGE,
              });
            }
          }}
        />
        <SettingsMenuItem
          IconComponent={ContactUsIcon}
          label="Contact Us"
          onPress={() => {
            if (modules.customer_care?.enable) {
              navigateTo(
                modules.customer_care.enable,
                modules.customer_care.name,
              );
            }
          }}
        />
        <SettingsMenuItem
          IconComponent={ECatalogIcon}
          label="E-Catalogue"
          onPress={() => {
            if (modules.cms_page?.enable) {
              Linking.openURL(Config.PWA_BASE_URL + '/catalog');
            }
          }}
        />
        {/* <SettingsMenuItem
          IconComponent={BlogIcon}
          label="Blog"
          onPress={() => {
            if (modules.blog_list?.enable) {
              navigateTo(modules.blog_list.enable, modules.blog_list.name);
            }
          }}
        /> */}
        <SettingsMenuItem
          IconComponent={BrandsIcon}
          label="Brands"
          onPress={() => {
            if (modules.brand_page?.enable) {
              navigateTo(modules.brand_page.enable, modules.brand_page.name);
            }
          }}
        />
        <SettingsMenuItem
          IconComponent={AskPharmacistIcon}
          label="Ask The Pharmacist"
          onPress={() => {
            Linking.openURL(ASK_PHARMACIST_WHATSAPP_URL);
          }}
        />

        {/* Regulation Section */}
        <SectionTitle title="Regulation" />
        <SettingsMenuItem
          IconComponent={HowToShopIcon}
          label="How To Shop"
          onPress={() => {
            if (modules.cms_page?.enable) {
              navigateTo(modules.cms_page.enable, modules.cms_page.name, {
                identifier: 'how-to-shop',
                type: TYPE_PAGE,
              });
            }
          }}
        />
        <SettingsMenuItem
          IconComponent={PrivacyPolicyIcon}
          label="Privacy Policy"
          onPress={() => {
            if (modules.cms_page?.enable) {
              navigateTo(modules.cms_page.enable, modules.cms_page.name, {
                identifier: 'privacy-policy',
                type: TYPE_PAGE,
              });
            }
          }}
        />
        <SettingsMenuItem
          IconComponent={TermsConditionsIcon}
          label="Terms & Conditions"
          onPress={() => {
            if (modules.cms_page?.enable) {
              navigateTo(modules.cms_page.enable, modules.cms_page.name, {
                identifier: 'terms-conditions',
                type: TYPE_PAGE,
              });
            }
          }}
        />
        {/* <SettingsMenuItem
          IconComponent={ReturnRefundIcon}
          label="Return & Refund Policy"
          onPress={() => {
            if (modules.cms_page?.enable) {
              navigateTo(modules.cms_page.enable, modules.cms_page.name, {
                identifier: 'return-refund',
                type: TYPE_PAGE,
              });
            }
          }}
        /> */}
        {/* <SettingsMenuItem
          IconComponent={LimitationLiabilityIcon}
          label="Limitation Of Liability"
          onPress={() => {
            if (modules.cms_page?.enable) {
              navigateTo(modules.cms_page.enable, modules.cms_page.name, {
                identifier: 'pembatasan-tanggung-jawab',
                type: TYPE_PAGE,
              });
            }
          }}
        /> */}

        {/* Follow us Section */}
        <SectionTitle title="Follow us" />
        <CustomView
          row
          style={{
            marginBottom: 24,
            marginTop: 8,
            paddingHorizontal: 20,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
          <SocialMediaIcon
            IconComponent={InstagramIcon}
            onPress={() => Linking.openURL('https://www.instagram.com/guardian_id')}
          />
          <SocialMediaIcon
            IconComponent={FacebookIcon}
            onPress={() => Linking.openURL('https://www.facebook.com/GuardianIndo')}
          />
          <SocialMediaIcon
            IconComponent={TiktokIcon}
            onPress={() => Linking.openURL('https://www.tiktok.com/@guardianid?')}
          />
          <SocialMediaIcon
            IconComponent={YoutubeIcon}
            onPress={() => Linking.openURL('https://youtube.com/@guardianindonesiaofficial')}
          />
          <SocialMediaIcon
            IconComponent={XIcon}
            onPress={() => Linking.openURL('https://x.com/GuardianID?s=20')}
          />
        </CustomView>

        {/* Version */}
        <Text
          style={{
            textAlign: 'center',
            fontSize: 14,
            color: '#666666',
            marginBottom: 24,
          }}>
          Version {DeviceInfo.getVersion()}
        </Text>

        {/* Logout Button - 只在已登录时显示 */}
        <RenderIf condition={isLoggedIn}>
          <CustomView paddingHorizontal={20} marginBottom={16}>
            <TouchableOpacity
              onPress={showAlert}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderWidth: 1,
                borderColor: '#E0E0E0',
              }}>
              <IconFeather
                name="log-out"
                size={20}
                color={Colors.PRIMARY || '#FF8200'}
                style={{ marginRight: 12 }}
              />
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#000000' }}>
                {t('account_settings.btn.logout')}
              </Text>
            </TouchableOpacity>
          </CustomView>

          {/* Delete Account Link - 只在已登录时显示 */}
          <TouchableOpacity
            onPress={onDeleteAccount}
            style={{
              paddingVertical: 16,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}>
            <Text
              style={{
                fontSize: 14,
                color: Colors.PRIMARY,
                textDecorationLine: 'underline',
                textAlign: 'center',
              }}>
              I want to delete my account
            </Text>
          </TouchableOpacity>
        </RenderIf>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
