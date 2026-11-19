import React from 'react';
import {StyleSheet, Linking} from 'react-native';
import {TouchableRipple} from 'react-native-paper';
import {Colors, Mixins} from '@app/styles';
import {navigateTo} from '@app/helpers/Navigation';
import {modules} from '@root/swift.config';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import SocialMediaButton from '@app/_modules/auth_signin/atoms/SocialMediaButton';

const FooterSectionItem = ({item, followUs}) => {
  if (followUs) {
    return <SocialMediaButton item={item} />;
  }

  return (
    <TouchableRipple
      style={styles.regularItem}
      onPress={async () => {
        if (item?.identifier) {
          navigateTo(modules.cms_page.enable, modules.cms_page.name, {
            identifier: item?.identifier,
            type: item?.type,
            title: item.label,
          });
        }
        if (item?.url) {
          const isSupported = await Linking.canOpenURL(item?.url);
          if (isSupported) {
            await Linking.openURL(item?.url);
          }
        }
      }}>
      <Text large center>
        {item.label}
      </Text>
    </TouchableRipple>
  );
};

const FooterSection = ({followUs = false, title, sectionData}) => {
  const renderFooterSectionItem = () => {
    return sectionData.map((item, index) => {
      return (
        <FooterSectionItem key={index + 1} item={item} followUs={followUs} />
      );
    });
  };

  return (
    <CustomView horizontalCenter paddingBottom={20} width={Mixins.MAX_WIDTH}>
      <Text bold xlarge style={{marginBottom: 8}}>
        {title}
      </Text>
      <CustomView flex style={{flexDirection: followUs ? 'row' : 'column'}}>
        {renderFooterSectionItem()}
      </CustomView>
    </CustomView>
  );
};

export default FooterSection;

const styles = StyleSheet.create({
  regularItem: {
    marginBottom: 7,
    width: Mixins.MAX_WIDTH * 0.5,
    alignItems: 'center',
  },
  iconItem: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: Colors.WHITE,
    borderRadius: 50,
  },
});
