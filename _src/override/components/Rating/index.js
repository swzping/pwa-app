import React, {useState} from 'react';
import {Image, View, TouchableOpacity} from 'react-native';

import styles from '@app/components/Rating/styles';

const Rating = ({
  sizeIcon = 10,
  countMax = 5,
  gap = 3,
  click,
  count,
  onClick,
}) => {
  const [starPosition, setStarPosition] = useState(count);

  const onClickStar = index => {
    setStarPosition(index);
    onClick(index);
  };

  const renderStarClickable = () => {
    return (
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {Array.from({length: countMax}, (_, index) => (
          <TouchableOpacity key={index} onPress={() => onClickStar(index + 1)}>
            <Image
              source={
                starPosition > index
                  ? require('@app/assets/images/star_full.png')
                  : require('@app/assets/images/star_empty.png')
              }
              style={{width: sizeIcon, height: sizeIcon}}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderStar = () => {
    if (count === undefined) {
      count = 0;
    }
    if (count > countMax) {
      count = countMax;
    }

    const fullStars = Math.floor(count);
    const halfStar = count % 1 >= 0.5 ? 1 : 0;
    const emptyStars = countMax - fullStars - halfStar;
    return (
      <View style={{flexDirection: 'row'}}>
        {Array(fullStars)
          .fill()
          .map((_, index) => (
            <Image
              key={'full-' + index}
              source={require('@app/assets/images/star_full.png')}
              style={{width: sizeIcon, height: sizeIcon, marginRight: gap}}
            />
          ))}
        {halfStar === 1 && (
          <Image
            key="half"
            source={require('@app/assets/images/star_half.png')}
            style={{width: sizeIcon, height: sizeIcon, marginRight: gap}}
          />
        )}
        {Array(emptyStars)
          .fill()
          .map((_, index) => (
            <Image
              key={'empty-' + index}
              source={require('@app/assets/images/star_empty.png')}
              style={{width: sizeIcon, height: sizeIcon, marginRight: gap}}
            />
          ))}
      </View>
    );
  };

  return (
    <View style={[styles.container]}>
      {click ? renderStarClickable() : renderStar()}
    </View>
  );
};

export default Rating;
