import React from 'react';
import { Mixins } from '@app/styles';
import { ScrollView, View } from 'react-native';
import BannerSlider from '@app/components/BannerSlider/index';
import CategorySlider from '@app/components/AddonCategorySlider';
import ProductSlider from '@app/components/AddonProductSlider/index';
import BrandSlider from '@app/components/AddonBrandSlider';
import Blog from '@app/components/Blog/index';
import NavBar from '@app/components/NavBar/index';
import Divider from '@app/components/Divider';
import AtomNavBarRight from '@app/_modules/main_home/atoms/NavBarRight';

import styles from '@app/_modules/main_home/styles';

const HomeScreen = ({ bannerSlider, onNavigateTrackOrder }) => {
  return (
    <View>
      <NavBar
        useLogo
        childrenRight={
          <AtomNavBarRight onNavigateTrackOrder={onNavigateTrackOrder} />
        }
      />
      <ScrollView contentContainerStyle={styles.containerScroll}>
        <BannerSlider
          autoplay={true}
          data={bannerSlider}
          clickable={true}
          styleFrame={{
            width: Mixins.MAX_WIDTH,
            alignSelf: 'center',
            flex: 1,
          }}
        />
        <CategorySlider />
        <Divider />

        <ProductSlider categoryId={44} title="Home" />
        <Divider />

        <BrandSlider />
        <Divider />

        <ProductSlider categoryId={12} title="Men Tops" />
        <Divider />

        <ProductSlider categoryId={3} title="Gear" />
        <Divider />

        <Blog />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
