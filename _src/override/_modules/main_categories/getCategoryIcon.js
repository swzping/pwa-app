import React from 'react';
import {Colors} from '@app/styles/index';
import Icon from 'react-native-vector-icons/Foundation';
import Icon2 from 'react-native-vector-icons/Fontisto';
import BabyIcon from '@app/assets/svgs/Baby';
import GuardianIcon from '@app/assets/svgs/Guardian';
import BodyIcon from '@app/assets/svgs/Body';
import HairIcon from '@app/assets/svgs/Hair';
import CosmeticIcon from '@app/assets/svgs/Cosmetic';
import FaceIcon from '@app/assets/svgs/Face';
import ToothIcon from '@app/assets/svgs/Tooth';

export const getCategoryIcon = (cateId, isActive) => {
  const iconProps = {
    width: 32,
    height: 32,
    color: isActive ? Colors.PRIMARY : '#939393',
  };
  switch (cateId) {
    case 34:
      return <BabyIcon {...iconProps} />;
    case 12:
      return <GuardianIcon {...iconProps} />;
    case 253:
      return <FaceIcon {...iconProps} />;
    case 6:
      return <CosmeticIcon {...iconProps} />;
    case 19:
      return <BodyIcon {...iconProps} />;
    case 22:
      return <ToothIcon {...iconProps} />;
    case 32:
      return <HairIcon {...iconProps} />;
    case 250:
      return <Icon name={'burst-new'} color={iconProps.color} size={34} />;
    case 37:
      return <Icon2 name={'male'} color={iconProps.color} size={30} />;
    case 173:
      return <Icon2 name={'move-h-a'} color={iconProps.color} size={30} />;
    default:
      return <GuardianIcon {...iconProps} />;
  }
};
