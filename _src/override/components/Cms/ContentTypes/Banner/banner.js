import React, {useCallback} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ImageBackground,
} from 'react-native';
import {useReactiveVar} from '@apollo/client';
import ImageWidget from '../Image';
import {resolveLinkAndNavigate} from '@app/helpers/Navigation';
import {handleOsmosAdPress} from '@app/helpers/Osmos';
import {rxUserInformation} from '@app/services/cache';

const BannerWidget = ({
  position,
  link,
  desktop_image = '',
  mobile_image = '',
  content,
  button,
  backgroundType,
  videoSrc,
  borderRadius = 12,
  noPadding,
  showPromotion,
  promotionId,
  promotionName,
  creativeName,
  creativeSlot,
  customStyles = {},
  isOsmosAd = false,
  clickType,
  clickValue,
  uclid,
  ...rest
}) => {
  const userInformation = useReactiveVar(rxUserInformation);
  const dynamicStyles = {
    borderRadius,
  };

  const handlePress = useCallback(async () => {
    if (isOsmosAd) {
      if (!link && !clickValue) {
        return;
      }

      await handleOsmosAdPress({
        link,
        clickType,
        clickValue,
        uclid,
        userInformation,
      });
      return;
    }

    if (!link) {
      return;
    }

    resolveLinkAndNavigate(link);
  }, [clickType, clickValue, isOsmosAd, link, uclid, userInformation]);

  if (content || button) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        disabled={!link && !(isOsmosAd && clickValue)}
        style={[styles.container, customStyles.container]}>
        <ImageBackground
          source={{
            uri: mobile_image || desktop_image,
          }}
          imageStyle={{borderRadius}}
          style={[styles.backgroundImage, dynamicStyles]}>
          <View style={[styles.overlayContent, customStyles.content]}>
            {content && (
              <View style={styles.contentContainer}>
                {content.title && (
                  <Text style={[styles.title, customStyles.title]}>
                    {content.title}
                  </Text>
                )}
                {content.description && (
                  <Text
                    style={[styles.description, customStyles.description]}
                    numberOfLines={3}
                    ellipsizeMode="tail">
                    {content.description}
                  </Text>
                )}
              </View>
            )}
            {button && (
              <TouchableOpacity
                style={[styles.button, customStyles.button]}
                onPress={handlePress}>
                <Text style={[styles.buttonText, customStyles.buttonText]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  }

  return (
    <ImageWidget
      position={position}
      link={link}
      desktopImage={desktop_image}
      mobileImage={mobile_image}
      borderRadius={borderRadius}
      showPromotion={showPromotion}
      promotionId={promotionId}
      promotionName={promotionName}
      creativeName={creativeName}
      creativeSlot={creativeSlot}
      noPadding={noPadding}
      isOsmosAd={isOsmosAd}
      clickType={clickType}
      clickValue={clickValue}
      uclid={uclid}
      customStyles={{
        container: customStyles.container,
      }}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  imageContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  backgroundImage: {
    width: '100%',
    aspectRatio: 343 / 160,
    justifyContent: 'flex-end',
  },
  overlayContent: {
    flex: 1,
    maxWidth: '70%',
    padding: 16,
  },
  contentContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  description: {
    fontSize: 14,
    color: '#FFF',
    marginTop: 4,
  },
  button: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderRadius: 11,
  },
  buttonText: {
    fontSize: 12,
    color: '#000',
    fontWeight: 'bold',
  },
});

export default BannerWidget;
