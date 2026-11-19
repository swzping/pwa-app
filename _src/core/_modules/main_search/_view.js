import React from 'react';
import {FlatList} from 'react-native';
import {TouchableRipple, Text, ActivityIndicator} from 'react-native-paper';
import {modules} from '@root/swift.config';

import FastImage from '@d11/react-native-fast-image';
import PropTypes from 'prop-types';
import CustomView from '@app/components/CustomView';
import NavBar from '@app/components/NavBar';
import RenderIf from '@app/components/RenderIf';

import styles from '@app/_modules/main_search/styles';
/**
 * ---------------------------------------------------- *
 * @components Views
 * @summary this is expample views
 * ---------------------------------------------------- *
 */
const Views = ({
  data,
  loading,
  searchText,
  onSearchTextChange,
  onNavigateProductDetail,
}) => {
  if (!modules.main_search.enable) {
    return null;
  }
  return (
    <CustomView>
      <NavBar
        useBack
        useSearch
        searchText={searchText}
        onSearchTextChange={onSearchTextChange}
      />
      <RenderIf condition={loading}>
        <ActivityIndicator style={{marginTop: 50}} />
      </RenderIf>
      <RenderIf condition={!loading}>
        <FlatList
          style={styles.resultContainer}
          data={data?.data?.products?.items || []}
          keyExtractor={item => item.name}
          renderItem={({item}) => {
            const getFinalPrice = item?.price_range?.maximum_price?.final_price;
            return (
              <TouchableRipple onPress={() => onNavigateProductDetail(item)}>
                <CustomView style={styles.resultItemContainer}>
                  <CustomView>
                    <FastImage
                      key={item.url_key}
                      style={styles.resultImage}
                      resizeMode={FastImage.resizeMode.contain}
                      source={{
                        uri: item.small_image.url,
                        priority: FastImage.priority.normal,
                        cache: FastImage.cacheControl.immutable,
                      }}
                    />
                  </CustomView>
                  <CustomView>
                    <Text style={{marginHorizontal: 15, fontWeight: 'bold'}}>
                      {item.name}
                    </Text>
                    <Text style={{marginHorizontal: 15}}>
                      {getFinalPrice.currency} {getFinalPrice.value}
                    </Text>
                  </CustomView>
                </CustomView>
              </TouchableRipple>
            );
          }}
        />
      </RenderIf>
    </CustomView>
  );
};

Views.propTypes = {
  // use for handler loading
  loading: PropTypes.bool.isRequired,
  // data for search result to display
  data: PropTypes.array.isRequired,
  // event for search text change
  onSearchTextChange: PropTypes.func.isRequired,
};

export default Views;
