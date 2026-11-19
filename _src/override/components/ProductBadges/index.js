import React from 'react';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text/index';
import {StyleSheet} from 'react-native';

const ProductBadges = ({item = [], isDetails = false, handlePressMore}) => {
  const styles = StyleSheet.create({
    badgeContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 4,
    },
    badge: {
      borderRadius: 2,
      paddingVertical: 2,
      paddingHorizontal: 8,
      alignSelf: 'flex-start',
      backgroundColor: '#FFD38B',
      maxWidth: 117,
      overflow: 'hidden',
    },
    badgeComplete: {
      borderRadius: 2,
      paddingVertical: 2,
      paddingHorizontal: 8,
      alignSelf: 'flex-start',
      backgroundColor: '#FFD38B',
    },
    badgeText: {
      color: 'rgba(255, 130, 0, 1)',
      fontSize: 10,
      fontWeight: '700',
      flexShrink: 1,
    },
    detailContainer: {
      marginTop: 8,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E5E5',
    },
    description: {
      color: '#333',
      fontSize: 10,
      marginTop: 8,
    },
  });

  const displayedBadges = item?.slice(0, 2) || [];
  const hasMore = (item?.length || 0) > 2;

  const getBadgeBgColor = (promotionType) => {
    switch (promotionType) {
      case 'Coupon':
        return '#FFD38B';
      case 'Free Gift':
        return '#DAECDA';
      case 'QD':
        return '#FFEC99';
      default:
        return '#B9D8FC';
    }
  };

  const getBadgeColor = (promotionType) => {
    switch (promotionType) {
      case 'Coupon':
        return '#FF8200';
      case 'Free Gift':
        return '#46A147';
      case 'QD':
        return '#B39100';
      default:
        return '#336ADD';
    }
  };

  return (
    <>
      {isDetails ? (
        <CustomView style={{ marginTop: -18, marginBottom: 8 }}>
          {item?.map((badge, index) => {
            return (
              <CustomView key={`badge-${index}`} style={styles.detailContainer}>
                <CustomView style={[styles.badgeComplete, {backgroundColor: getBadgeBgColor(badge.promotion_type)}]}>
                  <Text style={[styles.badgeText, {color: getBadgeColor(badge.promotion_type)}]}>
                    {badge.name}
                  </Text>
                </CustomView>
                { badge?.description && (
                  <Text style={[styles.description]}>
                    {badge.description}
                  </Text>
                )}
              </CustomView>
            );
          })}
        </CustomView>
      ) : (
        <CustomView style={styles.badgeContainer}>
          {displayedBadges.map((badge, index) => (
            <CustomView
              key={`badge-${index}`}
              style={[styles.badge, {backgroundColor: getBadgeBgColor(badge.promotion_type)}]}>
              <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.badgeText, {color: getBadgeColor(badge.promotion_type)}]}>
                {badge.name}
              </Text>
            </CustomView>
          ))}
          {hasMore && (
            <CustomView
              onPress={handlePressMore}
              style={[
                styles.badge,
                {backgroundColor: '#DAECDA', width: 26, alignItems: 'center', justifyContent: 'center'},
              ]}>
              <Text style={[styles.badgeText, {color: '#46A147'}]}>...</Text>
            </CustomView>
          )}
        </CustomView>
      )}
    </>
  );
};

export default ProductBadges;
