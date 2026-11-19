import React from 'react';
import {View, StyleSheet} from 'react-native';
import Swiper from '@app/components/Swiper';
import ImageWidget from '../Image';

const BrandsWidget = ({position, contentType, items}) => {
  return (
    <View style={styles.container}>
      <Swiper rows={2} slidesPerView={3} spaceBetween={12}>
        {items.map((brand, index) => (
          <ImageWidget
            position={`${position}-${index}`}
            contentType={contentType}
            key={index}
            link={brand.link}
            desktopImage={brand.image || ''}
            mobileImage={brand.image || ''}
            customStyles={{
              container: styles.image,
            }}
          />
        ))}
      </Swiper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  image: {
    width: '100%',
    borderRadius: 8,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: '#FFF',
    marginBottom: 12,
  },
});

export default BrandsWidget;
