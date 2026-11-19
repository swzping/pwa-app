import React, {useMemo} from 'react';
import {ScrollView} from 'react-native';
import {FlatList} from 'react-native';

import {List} from 'react-native-paper';
import {Appbar} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

import {isEmpty} from 'lodash';

import {getCategoryIcon} from '@app/_modules/main_categories/getCategoryIcon';
import styles from '@app/_modules/main_categories/styles';
import ShimmerSkeleton from '@app/components/_ShimmerSkeleton';
import CustomView from '@app/components/CustomView/index';
import RenderIf from '@app/components/RenderIf';
import SearchBar from '@app/components/SearchBar/index';
import Text from '@app/components/Text/index';
import {TYPE_SHIMMER_CATEGORY_LIST} from '@app/helpers/Constants';
import {Colors} from '@app/styles/index';
import {
  trackCategoryFirstModuleClick,
  trackCategorySecondModuleClick,
  trackCategoryThirdModuleClick,
} from '@app/track';

const CategoriesScreen = ({
  t,
  loading,
  categories,
  onPressCategory,
  onPressCategoryDetail,
  vesMenu = null,
  activeCategory,
}) => {
  const subListData = useMemo(() => {
    if (!activeCategory || isEmpty(activeCategory)) {
      return [];
    }
    const {name, category_id, children} = activeCategory;
    let childrenWithFirstLink = [];
    childrenWithFirstLink = children?.map(item => {
      if (item?.children?.length > 0) {
        return {
          ...item,
          children: [
            {
              name: 'All ' + item.name,
              category_id: item.category_id,
              children: [],
            },
            ...item.children,
          ],
        };
      } else {
        return item;
      }
    });
    return [
      {
        name: 'All ' + name,
        category_id,
        children: [],
        isFirstItem: true,
      },
      ...childrenWithFirstLink,
    ];
  }, [activeCategory]);

  /**
   * ----------------------------------------- *
   * @component CategoryName
   * @param {Object} Views.propTypes
   * @profiler {Sentry}
   * @summary Text Component for categories
   * @returns Text Components
   * ----------------------------------------- *
   */
  const RenderName = ({name, isActive}) => {
    let result = name;
    if (name.includes('<span')) {
      const regex = /(<([^>]+)>)/gi;
      if (name.split('<span')[0]) {
        result = name.split('Di ')[1].replace(regex, '');
      }
      if (name.includes('yellow-link') || name.includes('bg-red-link')) {
        result = name.replace(regex, '');
      }
    }
    return (
      <Text
        style={styles.vesMenuText}
        color={isActive ? Colors.PRIMARY : Colors.GRAY_DARK}>
        {result}
      </Text>
    );
  };

  /**
   * ----------------------------------------- *
   * @component CategoryHeader
   * @param {Object} Views.propTypes
   * @summary Component for category header
   * @returns Components
   * ----------------------------------------- *
   */
  const CategoryHeader = ({item, index}) => {
    const key = `category-header-item-${index}-${item.category_id}`;
    const isActive = activeCategory?.category_id === item.category_id;
    return (
      <CustomView
        key={key}
        width={'100%'}
        paddingHorizontal={15}
        paddingTop={15}
        paddingBottom={10}
        horizontalCenter
        verticalCenter
        backgroundColor={isActive ? Colors.WHITE : '#F5F5F5'}
        onPress={() => {
          if (item.children.length === 0) {
            onPressCategory(item.category_id, item.name);
          } else {
            onPressCategoryDetail({...item, index});
          }
          trackCategoryFirstModuleClick({
            first_level_module: item.name,
            first_level_module_rank: index + 1,
          });
        }}>
        <CustomView horizontalCenter marginBottom={10}>
          {getCategoryIcon(item.category_id, isActive)}
        </CustomView>
        <RenderName name={item.name} isActive={isActive} />
      </CustomView>
    );
  };

  return (
    <CustomView flex={1}>
      <RenderIf condition={loading}>
        <SafeAreaView />
        <ShimmerSkeleton type={TYPE_SHIMMER_CATEGORY_LIST} />
      </RenderIf>
      <CustomView flex horizontalCenter verticalCenter>
        <RenderIf condition={!loading}>
          <CustomView paddingHorizontal={12} paddingTop={10} paddingBottom={5}>
            <Appbar.Header
              style={{
                backgroundColor: Colors.WHITE,
                elevation: 0,
              }}>
              <SearchBar
                outStyles={{
                  borderWidth: 1,
                  borderColor: Colors.PRIMARY,
                }}
              />
            </Appbar.Header>
          </CustomView>
          <CustomView flex row>
            <CustomView width={110} backgroundColor={Colors.WHITE}>
              <FlatList
                overScrollMode="never"
                data={categories}
                renderItem={CategoryHeader}
                keyExtractor={(item, index) => {
                  return `category-item-${index}-${item.category_id}`;
                }}
                style={styles.listContainer}
              />
            </CustomView>
            <CustomView
              flexNumber={1}
              backgroundColor={Colors.WHITE}
              paddingHorizontal={10}>
              <ScrollView>
                <List.Section>
                  {subListData?.map((subCate, subIndex) => {
                    const {category_id, name, children, isFirstItem} = subCate;
                    if (children?.length < 1) {
                      return (
                        <List.Accordion
                          title={name}
                          key={category_id}
                          right={props =>
                            isFirstItem ? (
                              <Icon name="chevron-right" size={18} />
                            ) : null
                          }
                          onPress={() => {
                            onPressCategory(category_id, name);
                            trackCategorySecondModuleClick({
                              first_level_module: activeCategory.name,
                              first_level_module_rank: activeCategory.index + 1,
                              second_level_module: name,
                              second_level_module_rank: subIndex + 1,
                            });
                          }}
                          style={styles.categoryList}
                          titleStyle={styles.categoryListTitle}
                        />
                      );
                    } else {
                      return (
                        <List.Accordion
                          title={name}
                          key={category_id}
                          titleStyle={styles.categoryListTitle}
                          style={styles.categoryList}
                          onPress={() => {
                            trackCategorySecondModuleClick({
                              first_level_module: activeCategory.name,
                              first_level_module_rank: activeCategory.index + 1,
                              second_level_module: name,
                              second_level_module_rank: subIndex + 1,
                            });
                          }}>
                          {children?.map((thrdCate, thrdIndex) => {
                            if (thrdCate.children?.length < 1) {
                              return (
                                <List.Item
                                  title={thrdCate.name}
                                  titleStyle={styles.categoryListTitle}
                                  style={styles.categoryListItem}
                                  onPress={() => {
                                    onPressCategory(
                                      thrdCate.category_id,
                                      thrdCate.name,
                                    );
                                    trackCategoryThirdModuleClick({
                                      first_level_module: activeCategory.name,
                                      first_level_module_rank:
                                        activeCategory.index + 1,
                                      second_level_module: name,
                                      second_level_module_rank: subIndex + 1,
                                      third_level_module: thrdCate.name,
                                      third_level_module_rank: thrdIndex + 1,
                                    });
                                  }}
                                />
                              );
                            } else {
                              return (
                                <List.Accordion
                                  title={thrdCate.name}
                                  titleStyle={styles.categoryListTitle}
                                  style={styles.categoryList}
                                  key={thrdCate.category_id}>
                                  {thrdCate.children.map(
                                    (fourthCate) => {
                                      return (
                                        <List.Item
                                          title={fourthCate.name}
                                          key={fourthCate.category_id}
                                          titleStyle={styles.categoryListTitle}
                                          style={styles.categoryListItem}
                                          onPress={() => {
                                            onPressCategory(
                                              fourthCate.category_id,
                                              fourthCate.name,
                                            );
                                          }}
                                        />
                                      );
                                    },
                                  )}
                                </List.Accordion>
                              );
                            }
                          })}
                        </List.Accordion>
                      );
                    }
                  })}
                </List.Section>
              </ScrollView>
            </CustomView>
          </CustomView>
        </RenderIf>
      </CustomView>
    </CustomView>
  );
};

export default CategoriesScreen;
