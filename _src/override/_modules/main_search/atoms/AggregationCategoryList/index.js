import React from 'react';
import {pushTo} from '@app/helpers/Navigation';
import {modules} from '@root/swift.config';
import {SEARCH} from '@app/helpers/Constants';
// import {Colors} from '@app/styles';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {useNavigation} from '@react-navigation/native';
import styles from '@app/_modules/main_search/styles';

const AggregationCategoryList = ({data, searchText}) => {
  const navigation = useNavigation();
  /**
   * ----------------------------------------- *
   * @function onPressCategory
   * @summary navigate to product list
   * ----------------------------------------- *
   */
  const onPressCategory = ({categoryId, categoryName}) => {
    pushTo(navigation, modules.product_list.enable, modules.product_list.name, {
      type: SEARCH,
      categoryId,
      categoryName,
      search: searchText,
    });
  };

  return (
    <CustomView>
      {data.map((item, index) => {
        return (
          <CustomView
            key={index}
            style={styles.resultCataItem}
            verticalCenter
            paddingVertical={12}>
            <Text
              small
              onPress={() =>
                onPressCategory({
                  categoryId: parseInt(item.value),
                  categoryName: item.label,
                })
              }>
              <Text bold>{searchText}</Text> in {item.label}
            </Text>
          </CustomView>
        );
      })}
    </CustomView>
  );
};

export default AggregationCategoryList;
