import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {FlatList, Modal} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {Colors} from '@app/styles';
import {debounce} from 'lodash';
import {SEARCH_PRODUCTS} from '@app/components/AddonSearchBar/services/schema';
import {navigateTo} from '@app/helpers/Navigation';

import Button from '@app/components/Button';
import CustomView from '@app/components/CustomView';
import Input from '@app/components/Input';
import RenderIf from '@app/components/RenderIf';
import Text from '@app/components/Text';
import FastImage from '@d11/react-native-fast-image';
import styles from '@app/components/AddonSearchBar/styles';
import {modules} from '@root/swift.config';
import AnalyticsHelper from '@app/helpers/Analytics';

function SearchBar() {
  const [searchText, setSearchText] = useState('');
  const [variables, setVariables] = useState(null);
  const [visible, setVisible] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  const {
    data: searchResultData,
    loading,
    onRefetchData,
  } = useCustomQuery({
    schema: SEARCH_PRODUCTS,
  });

  useEffect(() => {
    const search = debounce(text => {
      setVariables({
        search: text,
        currentPage: 1,
        pageSize: 7,
        sortBy: {price: 'ASC'},
      });
    }, 100);

    if (searchText !== '') {
      search(searchText);
    } else {
      setVisible(false);
    }
  }, [searchText]);

  useEffect(() => {
    onRefetchData({params: variables});
  }, [variables]);

  useEffect(() => {
    if (searchResultData?.data?.products) {
      setSearchResult(searchResultData?.data.products.items);
      AnalyticsHelper.eventSearch(searchText.toString());
    }
  }, [searchResultData]);

  return (
    <>
      <Button
        label="Search here..."
        styleProp={styles.searchButton}
        onPress={() => setVisible(true)}
      />

      <Modal visible={visible} onRequestClose={() => setVisible(false)}>
        <SafeAreaView>
          <Input
            placeholder="Search here..."
            styleProp={styles.searchInput}
            textStyleProp={{paddingHorizontal: 20}}
            placeholderTextColor={Colors.BLACK}
            onChangeText={setSearchText}
            value={searchText}
            autoFocus={true}
          />
        </SafeAreaView>
        <RenderIf condition={!loading}>
          <FlatList
            style={styles.resultContainer}
            data={searchResult}
            keyExtractor={item => item.name}
            renderItem={({item}) => {
              const {
                price_range: {
                  maximum_price: {final_price},
                },
              } = item;
              return (
                <CustomView
                  style={styles.resultItemContainer}
                  onPress={() => {
                    navigateTo(
                      modules.product_detail.enable,
                      modules.product_detail.name,
                      {productUrlKey: item.url_key},
                    );
                    setVisible(false);
                    setSearchText('');
                    setSearchResult([]);
                  }}>
                  <FastImage
                    key={item.url_key}
                    style={styles.resultImage}
                    source={{
                      uri: item.small_image.url,
                      priority: FastImage.priority.normal,
                      cache: FastImage.cacheControl.immutable,
                    }}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                  <CustomView row spaceBetween flex>
                    <Text style={{marginHorizontal: 15}}>{item.name}</Text>
                    <Text style={{marginHorizontal: 15}}>
                      {final_price.currency} {final_price.value}
                    </Text>
                  </CustomView>
                </CustomView>
              );
            }}
          />
        </RenderIf>
        <RenderIf condition={loading}>
          <ActivityIndicator />
        </RenderIf>
      </Modal>
    </>
  );
}

export default SearchBar;
