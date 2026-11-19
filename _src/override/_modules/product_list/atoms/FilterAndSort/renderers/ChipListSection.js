import React, {useEffect, useMemo, useState} from 'react';
import {TextInput, TouchableOpacity} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

import i18next from 'i18next';

import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {Colors} from '@app/styles';

import FilterChip from '../atoms/FilterChip';
import styles from '../styles';

const VISIBLE_LIMIT = 6;

/**
 * ---------------------------------------------------- *
 * Chip group renderer: optional client-side search box
 * + wrap of chips + show more/less toggle. While a
 * search text is active the visible limit is lifted so
 * every match is shown.
 * ---------------------------------------------------- *
 */
const ChipListSection = ({
  aggregation,
  draftValues,
  onToggleOption,
  onSelectSingle,
  singleSelect = false,
  searchable = true,
  collapsed = false,
}) => {
  const [searchText, setSearchText] = useState('');
  const [showAll, setShowAll] = useState(false);

  // collapsing a section forgets its transient UI state
  useEffect(() => {
    if (collapsed) {
      setSearchText('');
      setShowAll(false);
    }
  }, [collapsed]);

  const {matches, shown} = useMemo(() => {
    const options = aggregation?.options ?? [];
    const query = searchText.trim().toLowerCase();
    const filtered = query
      ? options.filter(option =>
          String(option?.label ?? '')
            .toLowerCase()
            .includes(query),
        )
      : options;
    const limit = query || showAll ? filtered.length : VISIBLE_LIMIT;
    return {
      matches: filtered,
      shown: filtered.slice(0, limit),
    };
  }, [aggregation?.options, searchText, showAll]);

  const facetTotal = aggregation?.count;
  const totalCount = facetTotal || matches.length;
  const hiddenCount = Math.max(totalCount - shown.length, 0);

  const selectedValues = draftValues ?? [];

  const getOptionLabel = option => {
    const name = String(option?.label ?? '');
    return name;
    // return Number.isFinite(option?.count) ? `${name} (${option.count})` : name;
  };

  return (
    <CustomView>
      {searchable ? (
        <CustomView paddingBottom={10}>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder={i18next.t('product_list.view.searchOption', {
              label: aggregation?.label ?? '',
            })}
            placeholderTextColor={'#9E9E9E'}
            style={[styles.searchInput, {paddingLeft: 32}]}
            autoCapitalize="none"
            returnKeyType="search"
          />
          <Icon
            name="search-outline"
            size={16}
            color={'#9E9E9E'}
            style={{position: 'absolute', left: 12, top: 12}}
          />
        </CustomView>
      ) : null}
      <CustomView row style={{flexWrap: 'wrap', alignItems: 'flex-start'}}>
        {shown.map(option => (
          <FilterChip
            key={option.value}
            label={getOptionLabel(option)}
            selected={selectedValues.includes(option.value)}
            onPress={() => {
              if (singleSelect && !selectedValues.includes(option.value)) {
                // single-select facet: picking one replaces the
                // previous pick (PRD: Promotion is single-select);
                // draft contract is {code: [values]} — pass an array,
                // a bare string would freeze every later tap at the
                // hook's Array.isArray guard
                onSelectSingle(aggregation.attribute_code, [option.value]);
              } else {
                onToggleOption(aggregation.attribute_code, option.value);
              }
            }}
          />
        ))}
        {shown.length === 0 ? (
          <Text small color={Colors.GRAY_SMOOTH5}>
            {i18next.t('product_list.view.noOption')}
          </Text>
        ) : null}
      </CustomView>

      {/* show more/less */}
      {!searchText && hiddenCount > 0 ? (
        <TouchableOpacity
          style={styles.showMoreLink}
          onPress={() => setShowAll(true)}>
          <Text small color={Colors.PRIMARY}>
            {i18next.t('product_list.view.showMore', {count: totalCount})}
          </Text>
        </TouchableOpacity>
      ) : null}
      {!searchText && showAll && matches.length > VISIBLE_LIMIT ? (
        <TouchableOpacity
          style={styles.showMoreLink}
          onPress={() => setShowAll(false)}>
          <Text small color={Colors.PRIMARY}>
            {i18next.t('product_list.view.showLess', {count: totalCount})}
          </Text>
        </TouchableOpacity>
      ) : null}
    </CustomView>
  );
};

export default ChipListSection;
