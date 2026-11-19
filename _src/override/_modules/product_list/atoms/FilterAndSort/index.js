import React, {useEffect, useState} from 'react';
import {FlatList, Modal, TouchableOpacity} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

import i18next from 'i18next';

import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {IS_IOS} from '@app/helpers/Constants';
import {Colors, Mixins} from '@app/styles';

import BooleanSection from './renderers/BooleanSection';
import ChipListSection from './renderers/ChipListSection';
import PriceRangeSection from './renderers/PriceRangeSection';
import {
  CATEGORY_CODES,
  draftPriceFromRange,
  getPriceBounds,
  isSingleSelectAggregation,
  isVisibleAggregation,
  RENDERER,
  resolveRendererType,
} from './filterRenderers';
import Section from './Section';

/**
 * ---------------------------------------------------- *
 * Filter bottom sheet. Sections render dynamically by
 * type (see filterRenderers.js): price slider, boolean
 * radio rows, searchable chip lists, plain chip groups.
 * Draft edits stay in the filters map owned by
 * useProductListFilter; Apply/Clear semantics are the
 * parent's.
 * ---------------------------------------------------- *
 */
const QuantityModal = ({
  visible = true,
  dataFilter,
  categoryFacet,
  onBackBackButtonPress,
  filters,
  onToggleOption,
  onSetFilterValues,
  onApplyFilter,
  onClearFilter,
  applyItemCount = null,
  search,
}) => {
  const [collapsedMap, setCollapsedMap] = useState({});
  console.log('filters======',filters);
  console.log('dataFilter======',dataFilter);

  // reopening the sheet starts all-collapsed again (the
  // component stays mounted while the Modal is hidden)
  useEffect(() => {
    if (!visible) {
      setCollapsedMap({});
    }
  }, [visible]);

  // Category facet comes from guidCategoryFacet (bootstrap
  // query), not from aggregations — normalized into an
  // aggregation-shaped section so the accordion renders it
  // like any other group. Empty on a Category page means the
  // node has no children -> facet hidden (PRD §1)
  const categorySection = (categoryFacet ?? []).length
    ? {
        attribute_code: 'category_uid',
        label: i18next.t('product_list.view.category'),
        options: categoryFacet.map(category => ({
          label: category?.name ?? '',
          value: category?.uid,
        })),
      }
    : null;

  // sections follow the aggregations response order; the
  // synthesized Category section takes the slot where the
  // aggregations array carries its category key (falls to
  // the end when there is none) instead of being pinned
  // to the front
  const listSections = [];
  let categoryPlaced = false;
  (dataFilter ?? []).forEach(aggregation => {
    if (CATEGORY_CODES.includes(aggregation?.attribute_code)) {
      if (categorySection && !categoryPlaced) {
        listSections.push(categorySection);
        categoryPlaced = true;
      }
      return;
    }
    if (isVisibleAggregation(aggregation, {isSearch: !!search})) {
      listSections.push(aggregation);
    }
  });
  if (categorySection && !categoryPlaced) {
    listSections.push(categorySection);
  }

  const toggleCollapsed = attributeCode => {
    setCollapsedMap(prev => ({...prev, [attributeCode]: !(prev[attributeCode] ?? true)}));
  };

  const renderSectionBody = aggregation => {
    const rendererType = resolveRendererType(aggregation, {
      isSearch: !!search,
    });
    const draftValues = filters[aggregation.attribute_code];
    switch (rendererType) {
      case RENDERER.PRICE: {
        const bounds = getPriceBounds(aggregation);
        return (
          <PriceRangeSection
            bounds={bounds}
            draftValue={draftValues}
            onChange={range =>
              onSetFilterValues(
                aggregation.attribute_code,
                draftPriceFromRange(range, bounds),
              )
            }
          />
        );
      }
      case RENDERER.SEARCHABLE_CHIPS:
        return (
          <ChipListSection
            aggregation={aggregation}
            draftValues={draftValues}
            onToggleOption={onToggleOption}
            onSelectSingle={onSetFilterValues}
            singleSelect={isSingleSelectAggregation(aggregation)}
            searchable
            collapsed={collapsedMap[aggregation.attribute_code] ?? true}
          />
        );
      default:
        return (
          <ChipListSection
            aggregation={aggregation}
            draftValues={draftValues}
            onToggleOption={onToggleOption}
            onSelectSingle={onSetFilterValues}
            singleSelect={isSingleSelectAggregation(aggregation)}
            searchable={false}
            collapsed={collapsedMap[aggregation.attribute_code] ?? true}
          />
        );
    }
  };

  // inline JSX (not a nested component): a new component type
  // inline JSX (not a nested component): a new component type
  // per render would remount rows on every draft change and
  // reset renderer-internal state like the chip search text
  const renderAccordion = ({item, index}) => {
    const collapsed = collapsedMap[item.attribute_code] ?? true;
    // boolean groups never expand: the checkmark lives in the
    // header where the chevron would be, and tapping the row
    // toggles the filter directly
    const isBoolean =
      resolveRendererType(item, {isSearch: !!search}) === RENDERER.BOOLEAN;
    return (
      <Section
        aggregation={item}
        collapsed={collapsed}
        onToggleCollapsed={
          isBoolean
            ? () => onToggleOption(item.attribute_code, '1')
            : () => toggleCollapsed(item.attribute_code)
        }
        trailing={
          isBoolean ? (
            <BooleanSection draftValues={filters[item.attribute_code]} />
          ) : undefined
        }
        isLast={index === listSections.length - 1}>
        {isBoolean ? null : renderSectionBody(item)}
      </Section>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onBackBackButtonPress}>
      <CustomView flex row style={{alignItems: 'flex-end'}}>
        <CustomView
          onPress={onBackBackButtonPress}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }}
        />
        <CustomView
          column
          backgroundColor={Colors.WHITE}
          width={Mixins.MAX_WIDTH}
          height={IS_IOS ? Mixins.MAX_HEIGHT - 200 : Mixins.MAX_HEIGHT - 150}
          paddingBottom={IS_IOS ? 30 : 15}
          style={{
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            borderWidth: 0.2,
            borderColor: Colors.GRAY_LIGHT,
            borderBottomColor: 'white',
          }}>
          <CustomView
            row
            height={50}
            paddingVertical={12}
            verticalCenter
            horizontalCenter
            style={{
              borderBottomWidth: 1,
              borderBottomColor: Colors.GRAY_LIGHT,
            }}>
            <Text large bold>
              {i18next.t('product_list.view.filterAndSort')}
            </Text>
            <CustomView
              onPress={onBackBackButtonPress}
              style={{
                position: 'absolute',
                right: 10,
              }}>
              <Icon name="close-outline" size={34} color={Colors.BLACK} />
            </CustomView>
          </CustomView>
          <CustomView flexNumber={1} backgroundColor={Colors.GRAY_SMOOTH}>
            <FlatList
              renderItem={renderAccordion}
              data={listSections}
              keyExtractor={item => {
                return item.attribute_code;
              }}
            />
          </CustomView>
          <CustomView
            backgroundColor={Colors.WHITE}
            verticalCenter
            width="100%"
            borderColor={Colors.GRAY_LIGHT}
            padding={12}
            >
            <CustomView
              row
              verticalCenter
              horizontalCenter
              >
              <TouchableOpacity
                style={{
                  flex: 1,
                  marginRight: 8,
                }}
                onPress={onClearFilter}>
                <CustomView
                  backgroundColor={Colors.WHITE}
                  paddingVertical={10}
                  borderRadius={8}
                  paddingHorizontal={20}
                  horizontalCenter
                  style={{
                    borderColor: Colors.PRIMARY,
                    borderWidth: 1,
                  }}>
                  <Text bold style={{fontSize: 16}} color={Colors.PRIMARY}>
                    {i18next.t('product_list.view.clearAll')}
                  </Text>
                </CustomView>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                }}
                // disabled={applyItemCount === 0}
                onPress={onApplyFilter}>
                <CustomView
                  backgroundColor={Colors.PRIMARY}
                  paddingVertical={10}
                  borderRadius={8}
                  paddingHorizontal={20}
                  horizontalCenter
                  style={{
                    borderColor: Colors.PRIMARY,
                    borderWidth: 1,
                  }}>
                  <Text bold style={{fontSize: 16}} color={Colors.WHITE}>
                    {applyItemCount == null
                      ? i18next.t('product_list.view.apply')
                      : `${i18next.t('product_list.view.apply')} (${applyItemCount} ${i18next.t('product_list.view.items')})`}
                  </Text>
                </CustomView>
              </TouchableOpacity>
            </CustomView>
          </CustomView>
        </CustomView>
      </CustomView>
    </Modal>
  );
};

export default QuantityModal;
