import React, {useEffect, useState} from 'react';
import {ActivityIndicator} from 'react-native-paper';
import {useReactiveVar} from '@apollo/client';
import {Colors} from '@app/styles';
import {MAX_WIDTH, normalize} from '@app/styles/mixins';
import {rxUserTheme} from '@app/services/cache';
import {FlatList, Image, ScrollView} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NavBar from '@app/components/NavBar';
import RenderIf from '@app/components/RenderIf';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';

import Config from 'react-native-config';
import FastImage from '@d11/react-native-fast-image';

import styles from '@app/_modules/main_categories/styles';

/**
 * ----------------------------------------- *
 * @component CategoryName
 * @param {Object} Views.propTypes
 * @summary Text Component for categories
 * @returns Text Components
 * ----------------------------------------- *
 */
const RenderName = ({parentId, name}) => {
  if (!parentId) {
    if (name.includes('<span')) {
      return (
        <Text primary bold style={[styles.vesMenuText]}>
          {name.split('<span')[0]}
        </Text>
      );
    }
    return (
      <Text style={[styles.vesMenuText, styles.vesMenuChildText]}>{name}</Text>
    );
  }

  return (
    <Text style={[styles.vesMenuText, {width: MAX_WIDTH * 0.7}]}>{name}</Text>
  );
};

/**
 * ----------------------------------------- *
 * @component CategoryVesMenu
 * @param {Object} Views.propTypes
 * @summary Component for ves menu
 * @returns Components
 * ----------------------------------------- *
 */
const CategoryVesMenu = ({
  category,
  visible,
  parentId,
  selectedCategoryVesMenu,
  setSelectedCategoryVesMenu,
  onPressCategory,
}) => {
  const isShow = selectedCategoryVesMenu.includes(category.id);
  if (category?.name && visible) {
    return (
      <CustomView
        horizontalStart
        style={{
          paddingLeft: parentId ? 0 : 15,
          ...styles.vesMenuWrapper,
        }}
        onPress={
          category.children?.length
            ? () => {
                if (parentId) {
                  if (selectedCategoryVesMenu.includes(category.id)) {
                    setSelectedCategoryVesMenu(
                      selectedCategoryVesMenu.filter(
                        item => item !== category.id,
                      ),
                    );
                  } else {
                    setSelectedCategoryVesMenu([
                      ...selectedCategoryVesMenu,
                      category.id,
                    ]);
                  }
                } else {
                  if (selectedCategoryVesMenu.includes(category.id)) {
                    setSelectedCategoryVesMenu([]);
                  } else {
                    setSelectedCategoryVesMenu([category.id]);
                  }
                }
              }
            : () => {
                onPressCategory(category.id, category.name);
              }
        }>
        <CustomView style={styles.vesMenuNameWrapper}>
          <RenderName parentId={parentId} name={category.name} />
          {category.children?.length > 0 && (
            <Icon
              name={isShow ? 'chevron-down' : 'chevron-right'}
              style={{marginLeft: parentId ? 60 : 0}}
              size={normalize(25)}
            />
          )}
        </CustomView>
        {isShow &&
          category.children?.length > 0 &&
          category.children
            .slice(0, Config.VESMENU_ITEM || 5)
            .map((child, index) => {
              if (isShow) {
                if (index === 0) {
                  return (
                    <CustomView
                      key={`ves-menu-${index}`}
                      keyIndex={`ves-menu-${index}`}
                      horizontalStart>
                      <CategoryVesMenu
                        category={{name: 'View All', id: category.id}}
                        visible={isShow}
                        parentId={category.id}
                        selectedCategoryVesMenu={selectedCategoryVesMenu}
                        setSelectedCategoryVesMenu={setSelectedCategoryVesMenu}
                        onPressCategory={onPressCategory}
                      />
                      <CategoryVesMenu
                        category={child}
                        visible={isShow}
                        parentId={category.id}
                        selectedCategoryVesMenu={selectedCategoryVesMenu}
                        setSelectedCategoryVesMenu={setSelectedCategoryVesMenu}
                        onPressCategory={onPressCategory}
                      />
                    </CustomView>
                  );
                }
                return (
                  <CategoryVesMenu
                    key={`ves-menu-${index}`}
                    category={child}
                    visible={isShow}
                    parentId={category.id}
                    selectedCategoryVesMenu={selectedCategoryVesMenu}
                    setSelectedCategoryVesMenu={setSelectedCategoryVesMenu}
                    onPressCategory={onPressCategory}
                  />
                );
              }
              return null;
            })}
      </CustomView>
    );
  }
  return null;
};

const CategoriesScreen = ({
  t,
  loading,
  categories: categoriesData,
  onPressCategory,
  vesMenu = null,
}) => {
  /**
   * ----------------------------------------- *
   * @constant
   * @summary list of constant local state
   * ----------------------------------------- *
   */
  const [selectedCategoryVesMenu, setSelectedCategoryVesMenu] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [imageErrors, setImageErrors] = useState({});
  const scheme = useReactiveVar(rxUserTheme);

  /**
   * ----------------------------------------- *
   * @dependency [categoriesData]
   * @summary set list category from remote
   * ----------------------------------------- *
   */
  useEffect(() => {
    if (categoriesData) {
      if (vesMenu) {
        setCategories(categoriesData.items);
      } else {
        const dataTmp = categoriesData.children.filter(
          category => category.include_in_menu === 1,
        );
        setCategories(dataTmp);
      }
    }
  }, [categoriesData]);

  /**
   * ----------------------------------------- *
   * @component CategoryChildren
   * @param {Object} Views.propTypes
   * @summary Component for category have children
   * @returns Components
   * ----------------------------------------- *
   */
  const CategoryChildren = ({categoryChildren, visible, styleProp = {}}) => {
    if (categoryChildren && visible) {
      return (
        <CustomView
          border={1}
          borderColor={scheme === 'dark' ? Colors.WHITE : Colors.BLACK}
          style={[styles.childrenContainer, styleProp]}>
          {categoryChildren.map((child, index) => {
            return (
              <CustomView
                key={`category-child-${child.id}`}
                keyIndex={`category-child-${child.id}`}>
                <CustomView
                  onPress={
                    child.children?.length
                      ? () => {
                          if (selectedSubCategory === child.id) {
                            setSelectedSubCategory(null);
                          } else {
                            setSelectedSubCategory(child.id);
                          }
                        }
                      : () => {
                          onPressCategory(child.id);
                        }
                  }
                  style={[
                    styles.childrenItemContainer,
                    {
                      borderBottomWidth:
                        index === categoryChildren.length - 1 ? 0 : 1,
                    },
                  ]}>
                  <Text>{child.name}</Text>
                </CustomView>
                {child.children ? (
                  <CustomView marginHorizontal={25}>
                    <CategoryChildren
                      categoryChildren={child.children}
                      visible={child.id === selectedSubCategory}
                      styleProp={{borderWidth: 0}}
                    />
                  </CustomView>
                ) : null}
              </CustomView>
            );
          })}
        </CustomView>
      );
    } else {
      return null;
    }
  };

  /**
   * ----------------------------------------- *
   * @component CategoryHeader
   * @param {Object} Views.propTypes
   * @summary Component for category header
   * @returns Components
   * ----------------------------------------- *
   */
  const CategoryHeader = ({item}) => {
    const selected = item.id === selectedCategory;
    let imageSourceCondition = item.image_path && item.image_path !== '';
    if (imageErrors[item.id]) {
      imageSourceCondition = false;
    }
    return (
      <CustomView marginVertical={6}>
        <CustomView
          onPress={() => {
            if (selected) {
              setSelectedCategory(null);
            } else {
              setSelectedCategory(item.id);
            }
          }}
          style={[
            styles.headerContainer,
            {
              borderBottomLeftRadius: selected ? 0 : 15,
              borderBottomRightRadius: selected ? 0 : 15,
            },
          ]}>
          <RenderIf condition={imageSourceCondition}>
            <FastImage
              key={item.id}
              style={styles.headerImage}
              source={{
                uri: item.small_image.url.toString(),
                priority: FastImage.priority.normal,
                cache: FastImage.cacheControl.immutable,
              }}
              onError={() => {
                const newImageErrors = {
                  ...imageErrors,
                  [item.id]: true,
                };
                setImageErrors(newImageErrors);
              }}
              resizeMode={FastImage.resizeMode.contain}
            />
          </RenderIf>
          <RenderIf condition={!imageSourceCondition}>
            <Image
              source={require('@app/assets/images/placeholder.png')}
              style={styles.headerImage}
            />
          </RenderIf>
          <Text
            style={{
              paddingHorizontal: normalize(20),
            }}>
            {item.name}
          </Text>
        </CustomView>
        <CategoryChildren
          categoryChildren={item.children}
          visible={selectedCategory === item.id}
        />
      </CustomView>
    );
  };

  /**
   * ----------------------------------------- *
   * @function renderCategoryVesMenu
   * @summary Component for category ves menu
   * @returns Components
   * ----------------------------------------- *
   */
  const renderCategoryVesMenu = () => {
    if (categories?.length > 0) {
      return categories.map(category => {
        return (
          <CategoryVesMenu
            key={`category-${category.id}`}
            category={category}
            visible={true}
            selectedCategoryVesMenu={selectedCategoryVesMenu}
            setSelectedCategoryVesMenu={setSelectedCategoryVesMenu}
            onPressCategory={onPressCategory}
          />
        );
      });
    }
    return <Text>{t('main_categories.view.noData')}</Text>;
  };

  /**
   * ----------------------------------------- *
   * @function renderCategory
   * @summary Component for category
   * @returns Components
   * ----------------------------------------- *
   */
  const renderCategory = () => {
    if (loading) {
      return <ActivityIndicator />;
    } else {
      if (vesMenu) {
        return <ScrollView>{renderCategoryVesMenu()}</ScrollView>;
      } else {
        return (
          <FlatList
            data={categories}
            renderItem={CategoryHeader}
            keyExtractor={item => item.url_key}
            style={styles.listContainer}
          />
        );
      }
    }
  };

  //TODO : fix navbar position
  return (
    <>
      <NavBar title={t('main_categories.title.categories')} />
      <CustomView flex horizontalCenter verticalCenter>
        {renderCategory()}
      </CustomView>
    </>
  );
};

export default CategoriesScreen;
