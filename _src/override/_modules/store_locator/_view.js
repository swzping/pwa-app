import React from 'react';
import {
  FlatList,
  TextInput,
  StyleSheet,
  Text as RNText,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator } from 'react-native-paper';
import { rxUserTheme } from '@app/services/cache';
import { useReactiveVar } from '@apollo/client';
import CustomView from '@app/components/CustomView/index';
import Text from '@app/components/Text/index';
import { Colors, Mixins, Typography } from '@app/styles';
import RenderIf from '@app/components/RenderIf';
import { DARK } from '@app/helpers/Constants';
import styles from '@app/_modules/store_locator/styles';
import NavBar from '@app/components/NavBar/index';
import BuildingIcon from '@app/assets/svgs/Building';
import MapsIcon from '@app/assets/svgs/Maps';
import RenderHtml from 'react-native-render-html';
import IconIon from 'react-native-vector-icons/Ionicons';
import SearchIcon from '@app/assets/svgs/SearchIconV2';
import LocalStore from '@app/assets/svgs/localStore';

const StoreLocatorScreen = ({
  t,
  // location,
  loading,
  // listVisible,
  dataFilter,
  search,
  // storeLocation,
  onChangeSearch,
  // onPressStore,
  onPressDirection,
  // onPressAccordion,
}) => {
  const scheme = useReactiveVar(rxUserTheme);
  const { width } = useWindowDimensions();

  /**
   * ---------------------------------------------------- *
   * @function normalizeField
   * @param {String} fieldValue
   * @summary 标准化字段值：小写、去除所有空格（用于匹配）
   * ---------------------------------------------------- *
   */
  const normalizeField = fieldValue => {
    return (fieldValue || '').toLowerCase().replace(/\s+/g, ''); // 去除所有空格
  };

  /**
   * ---------------------------------------------------- *
   * @function tokenizeQuery
   * @param {String} query
   * @summary 将查询分割成词元（tokens）
   * ---------------------------------------------------- *
   */
  const tokenizeQuery = query => {
    const normalized = query.toLowerCase().trim().replace(/\s+/g, ' '); // 合并多个空格为单个空格
    return normalized.split(' ').filter(token => token.length > 0);
  };

  /**
   * ---------------------------------------------------- *
   * @function findMatchPositions
   * @param {String} text - 原始文本
   * @param {String} token - 搜索词元
   * @summary 在文本中找到所有匹配位置（去除空格后匹配，但返回原始文本中的位置）
   * ---------------------------------------------------- *
   */
  const findMatchPositions = (text, token) => {
    const normalizedText = normalizeField(text);
    const normalizedToken = token.replace(/\s+/g, '').toLowerCase();
    const positions = [];

    if (!normalizedText.includes(normalizedToken)) {
      return positions;
    }

    // 构建原始文本字符到规范化文本字符的映射
    const charMap = [];
    let normalizedIndex = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text[i].toLowerCase();
      if (char.replace(/\s+/g, '') !== '') {
        charMap.push({
          originalIndex: i,
          normalizedIndex: normalizedIndex++,
        });
      } else {
        charMap.push({
          originalIndex: i,
          normalizedIndex: -1, // 空格字符
        });
      }
    }

    // 在去除空格后的文本中找到所有匹配位置
    let searchIndex = 0;
    while (true) {
      const index = normalizedText.indexOf(normalizedToken, searchIndex);
      if (index === -1) {
        break;
      }

      // 找到原始文本中对应的起始位置
      const startMap = charMap.find(m => m.normalizedIndex === index);
      if (!startMap) {
        searchIndex = index + 1;
        continue;
      }

      const startPos = startMap.originalIndex;

      // 找到原始文本中对应的结束位置
      const endNormalizedIndex = index + normalizedToken.length - 1;
      const endMap = charMap.find(
        m => m.normalizedIndex === endNormalizedIndex,
      );
      if (!endMap) {
        searchIndex = index + 1;
        continue;
      }

      // 找到结束位置后，继续查找直到匹配到足够的字符（跳过空格）
      let endPos = endMap.originalIndex;
      let tokenCharsMatched = 0;
      for (
        let i = startPos;
        i < text.length && tokenCharsMatched < normalizedToken.length;
        i++
      ) {
        const char = text[i].toLowerCase();
        if (char.replace(/\s+/g, '') !== '') {
          tokenCharsMatched++;
          endPos = i;
        }
      }

      positions.push({ start: startPos, end: endPos + 1 });
      searchIndex = index + 1;
    }

    return positions;
  };

  /**
   * ---------------------------------------------------- *
   * @function highlightText
   * @param {String} text - 要显示的文本
   * @param {String} searchText - 搜索关键词
   * @param {Object} style - 基础样式
   * @param {String} highlightColor - 高亮颜色（默认橙色 #FF8200）
   * @summary 高亮显示匹配的文本（支持去除空格匹配）
   * ---------------------------------------------------- *
   */
  const highlightText = (
    text,
    searchText,
    style = {},
    highlightColor = '#FF8200',
  ) => {
    if (!text) {
      return <RNText style={style} />;
    }

    const textStr = String(text);

    // 如果没有搜索文本，直接返回普通文本
    if (!searchText || searchText.trim() === '') {
      return <RNText style={style}>{textStr}</RNText>;
    }

    // 词元化搜索文本
    const tokens = tokenizeQuery(searchText);

    if (tokens.length === 0) {
      return <RNText style={style}>{textStr}</RNText>;
    }

    // 找到所有词元的匹配位置
    const allPositions = [];
    tokens.forEach(token => {
      const positions = findMatchPositions(textStr, token);
      allPositions.push(...positions);
    });

    if (allPositions.length === 0) {
      return <RNText style={style}>{textStr}</RNText>;
    }

    // 合并重叠的位置
    const mergedPositions = [];
    allPositions.sort((a, b) => a.start - b.start);

    let current = allPositions[0];
    for (let i = 1; i < allPositions.length; i++) {
      if (allPositions[i].start <= current.end) {
        // 重叠，合并
        current.end = Math.max(current.end, allPositions[i].end);
      } else {
        // 不重叠，保存当前并开始新的
        mergedPositions.push(current);
        current = allPositions[i];
      }
    }
    mergedPositions.push(current);

    // 构建高亮文本
    const parts = [];
    let lastIndex = 0;

    mergedPositions.forEach(({ start, end }) => {
      // 添加匹配前的文本
      if (start > lastIndex) {
        parts.push({
          text: textStr.substring(lastIndex, start),
          highlight: false,
        });
      }
      // 添加匹配的文本
      parts.push({
        text: textStr.substring(start, end),
        highlight: true,
      });
      lastIndex = end;
    });

    // 添加剩余的文本
    if (lastIndex < textStr.length) {
      parts.push({
        text: textStr.substring(lastIndex),
        highlight: false,
      });
    }

    return (
      <RNText style={style}>
        {parts.map((part, index) => (
          <RNText
            key={index}
            style={
              part.highlight
                ? {
                  color: highlightColor,
                  fontWeight: 'bold',
                }
                : {}
            }>
            {part.text}
          </RNText>
        ))}
      </RNText>
    );
  };

  const renderListStore = ({ item }) => {
    const searchText = search?.trim() || '';
    const baseTextStyle = {
      ...Typography.FONT_REGULAR,
      fontSize: Mixins.normalize(17),
      fontWeight: 'bold',
    };
    const addressTextStyle = {
      ...Typography.FONT_REGULAR,
      color: Colors.GRAY_DARK,
      fontSize: Mixins.normalize(15),
    };
    const phoneTextStyle = {
      ...Typography.FONT_REGULAR,
      color: Colors.GRAY_DARK,
      fontSize: Mixins.normalize(15),
    };

    return (
      <CustomView
        borderRadius={10}
        style={{ borderBottomWidth: 1 }}
        margin={10}
        borderColor={Colors.GRAY_LIGHT}
        backgroundColor={scheme === DARK ? Colors.DARK : Colors.WHITE}
        width={Mixins.MAX_WIDTH * 0.9}
        paddingBottom={10}>
        <CustomView flex>
          <CustomView flex row horizontalCenter spaceBetween>
            <CustomView paddingVertical={10}>
              <CustomView
                style={styles.headerIcon}
                horizontalCenter
                verticalCenter>
                <BuildingIcon />
              </CustomView>
            </CustomView>
            <CustomView width={Mixins.MAX_WIDTH * 0.9 - Mixins.normalize(55)}>
              {highlightText(item.store_name, searchText, baseTextStyle)}
            </CustomView>
          </CustomView>
          <CustomView padding={5}>
            <RNText numberOfLines={5} style={addressTextStyle}>
              {`${t('store_locator.address').toUpperCase()} : `}
            </RNText>
            <CustomView>
              {highlightText(item.address, searchText, addressTextStyle)}
            </CustomView>
            <CustomView marginTop={5}>
              <RNText style={phoneTextStyle}>
                {'UNIT : '}
                {item.phone || ''}
              </RNText>
            </CustomView>
            <RenderHtml
              contentWidth={width}
              source={{ html: item.store_description || '' }}
              tagsStyles={styles}
              baseStyle={{
                ...Typography.FONT_REGULAR,
                color: Colors.GRAY_DARK,
                fontSize: Mixins.normalize(15),
              }}
            />
          </CustomView>
          <CustomView
            horizontalEnd
            padding={5}
            onPress={() => onPressDirection({ item })}>
            <CustomView flex row marginRight={5}>
              <CustomView marginRight={5}>
                <MapsIcon />
              </CustomView>
              <Text bold small>
                {t('store_locator.view.direction')}
              </Text>
            </CustomView>
          </CustomView>
        </CustomView>
      </CustomView>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <NavBar
        useWhite
        useBack
        center
        titleBold
        useShadow={false}
        stylesContainer={{
          borderBottomWidth: 1,
          borderBottomColor: Colors.GRAY_LIGHT,
        }}
        title={t('store_locator.apotekList')}
      />
      <RenderIf condition={loading}>
        <CustomView flex horizontalCenter verticalCenter marginTop={100}>
          <ActivityIndicator size={36} color={Colors.PRIMARY} />
        </CustomView>
      </RenderIf>
      <RenderIf condition={!loading}>
        {/* 搜索框 */}
        <CustomView
          marginHorizontal={15}
          marginTop={25}
          marginBottom={15}
          paddingHorizontal={15}
          paddingVertical={12}
          borderRadius={30}
          backgroundColor={scheme === DARK ? Colors.DARK : '#F0F0F0'}
          style={{
            borderWidth: scheme === DARK ? 1 : 0,
            borderColor: scheme === DARK ? Colors.GRAY_LIGHT : 'transparent',
          }}>
          <CustomView row horizontalCenter>
            <CustomView marginRight={12} justifyContent="center">
              <SearchIcon width={22} height={22} color={'#BDBDBD'} />
            </CustomView>
            <CustomView flex={1}>
              <TextInput
                value={search}
                onChangeText={onChangeSearch}
                placeholder={t('store_locator.placeholder.searchStore')}
                placeholderTextColor={Colors.GRAY_MEDIUM}
                style={[
                  searchInputStyles.input,
                  {
                    color: scheme === DARK ? Colors.WHITE : Colors.BLACK,
                  },
                ]}
                returnKeyType="search"
                clearButtonMode="never"
              />
            </CustomView>
            <RenderIf condition={search && search.length > 0}>
              <CustomView
                onPress={() => onChangeSearch('')}
                marginLeft={8}
                padding={4}
                justifyContent="center">
                <IconIon
                  name="close-circle"
                  color={Colors.GRAY_MEDIUM}
                  size={20}
                />
              </CustomView>
            </RenderIf>
          </CustomView>
        </CustomView>

        <CustomView horizontalCenter>
          <FlatList
            data={dataFilter}
            keyExtractor={(item, index) => item.index || `store-${index}`}
            renderItem={renderListStore}
            showsVerticalScrollIndicator={false}
            style={{
              marginBottom: 120,
            }}
            contentContainerStyle={{
              paddingBottom: 200,
            }}
            ListEmptyComponent={
              <CustomView
                marginTop={80}
                horizontalCenter
                verticalCenter
                style={{ minHeight: 300 }}>
                <CustomView horizontalCenter marginBottom={10}>
                  <LocalStore width={60} height={60} />
                </CustomView>
                <Text color={Colors.GRAY_DARK} center>
                  {search && search.length > 0
                    ? t('store_locator.noSearchResult')
                    : t('store_locator.noData')}
                </Text>
              </CustomView>
            }
          />
        </CustomView>
      </RenderIf>
    </View>
  );
};

const searchInputStyles = StyleSheet.create({
  input: {
    fontSize: Mixins.normalize(15),
    paddingVertical: 0,
    ...Typography.FONT_REGULAR,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default StoreLocatorScreen;
