import React from 'react';
import { FlatList, View, ScrollView, SectionList } from 'react-native';
import { Colors, Mixins } from '@app/styles';
import FeaturedBrand from '@app/components/FeaturedBrand/index';
import { filterBrands } from '@app/helpers/Constants';

import NavBar from '@app/components/NavBar/index';
import Text from '@app/components/Text';
import CustomView from '@app/components/CustomView';
import AtomRightCart from '@app/_modules/product_list/atoms/RightCart/index';
import RenderIf from '@app/components/RenderIf/index';
import ShimmerSkeleton from '@app/components/_ShimmerSkeleton';
import { TYPE_SHIMMER_FEATURED_BRAND } from '@app/helpers/Constants';

const BrandScreen = ({
  t,
  data,
  loading,
  onPressCart,
  onPressFilter,
  activeFilter,
  onPressBrand,
}) => {
  const RenderFilterBrand = ({ item }) => {
    return (
      <CustomView onPress={() => onPressFilter(item)}>
        <CustomView
          border={1}
          padding={2}
          margin={2}
          backgroundColor={activeFilter === item && Colors.PRIMARY}
          borderColor={
            activeFilter === item ? Colors.PRIMARY : Colors.GRAY_MEDIUM
          }
          width={Mixins.MAX_WIDTH / 11}
          horizontalCenter
          verticalCenter>
          <Text color={activeFilter === item && Colors.WHITE}>{item}</Text>
        </CustomView>
      </CustomView>
    );
  };

  const RenderItem = ({ item }) => {
    return (
      <CustomView
        marginRight={10}
        paddingVertical={10}
        onPress={() => onPressBrand({ item })}>
        <Text underline>{item.name}</Text>
      </CustomView>
    );
  };

  return (
    <View>
      <NavBar
        useWhite
        useBack
        childrenRight={<AtomRightCart onPressCart={onPressCart} />}
      />
      <ScrollView>
        <CustomView
          backgroundColor={Colors.PRIMARY}
          horizontalCenter
          verticalCenter
          paddingVertical={20}>
          <Text center bold color={Colors.WHITE} style={{ fontSize: 32 }}>
            {t('brand_page.view.brands')}
          </Text>
        </CustomView>
        <CustomView
          paddingVertical={'10%'}
          borderColor={Colors.GRAY_LIGHT}
          style={{ borderBottomWidth: 1 }}>
          <FeaturedBrand useTitle={false} />
        </CustomView>
        <RenderIf condition={loading}>
          <ShimmerSkeleton type={TYPE_SHIMMER_FEATURED_BRAND} />
        </RenderIf>
        <RenderIf condition={!loading}>
          <CustomView
            padding={'5%'}
            borderColor={Colors.GRAY_LIGHT}
            style={{ borderBottomWidth: 1 }}>
            <FlatList
              data={filterBrands}
              keyExtractor={(item, index) => index}
              renderItem={RenderFilterBrand}
              numColumns={9}
              style={{ width: Mixins.MAX_WIDTH }}
            />
          </CustomView>
        </RenderIf>
        <SectionList
          sections={data}
          renderItem={({ item }) => <RenderItem item={item} />}
          initialNumToRender={data.length}
          keyExtractor={(item, index) => item + index}
          SectionSeparatorComponent={({ leadingItem }) =>
            leadingItem ? (
              <CustomView
                paddingVertical={'3%'}
                width={Mixins.MAX_WIDTH - 40}
                borderColor={Colors.GRAY_LIGHT}
                style={{ borderBottomWidth: 1 }}
              />
            ) : null
          }
          contentContainerStyle={{
            paddingHorizontal: '5%',
            flexWrap: 'wrap',
            flexDirection: 'row',
          }}
          renderSectionHeader={({ section: { letter } }) => (
            <CustomView width={Mixins.MAX_WIDTH} paddingVertical={'2%'}>
              <Text xlarge bold>
                {letter}
              </Text>
            </CustomView>
          )}
        />
      </ScrollView>
    </View>
  );
};

export default BrandScreen;
