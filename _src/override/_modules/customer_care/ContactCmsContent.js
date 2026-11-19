import React, {useMemo} from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import Text from '@app/components/Text';
import CustomView from '@app/components/CustomView';
import SocialMediaButton from '@app/_modules/auth_signin/atoms/SocialMediaButton';
import {Colors} from '@app/styles';
import {parseCustomerCareContent} from '@app/_modules/customer_care/contactContentParser';

const ContactCmsContent = ({htmlBlock}) => {
  const {bannerImage, bannerTitle, sections} = useMemo(
    () => parseCustomerCareContent(htmlBlock),
    [htmlBlock],
  );

  return (
    <CustomView width={'100%'}>
      <ImageBackground
        source={{uri: bannerImage}}
        resizeMode="cover"
        style={styles.banner}>
        <View style={styles.bannerOverlay} />
        <Text white bold center scaling={false} style={styles.bannerTitle}>
          {bannerTitle}
        </Text>
      </ImageBackground>

      {sections.map(section => (
        <CustomView
          key={section.title}
          verticalCenter
          paddingHorizontal={18}
          paddingVertical={22}
          marginBottom={12}
          backgroundColor={'#F7F5F2'}
          style={styles.card}>
          <Text bold center scaling={false} style={styles.cardTitle}>
            {section.title}
          </Text>
          {section.title.toLowerCase() === 'get in touch' ? (
            <CustomView
              row
              verticalCenter
              horizontalCenter
              marginTop={8}
              style={styles.socialRow}>
              {section.content.map((item, index) => (
                <SocialMediaButton key={`${item.type}-${index}`} item={item} />
              ))}
            </CustomView>
          ) : (
            section.content.map((value, index) => (
              <Text
                key={`${section.title}-${index}`}
                center
                scaling={false}
                style={styles.cardText}>
                {value}
              </Text>
            ))
          )}
        </CustomView>
      ))}
    </CustomView>
  );
};

export default ContactCmsContent;

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    height: 165,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bannerTitle: {
    fontSize: 22,
    lineHeight: 28,
  },
  card: {
    minHeight: 118,
    width: '100%',
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 12,
  },
  cardText: {
    color: Colors.BLACK,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 2,
  },
  socialRow: {
    flexWrap: 'wrap',
  },
});
