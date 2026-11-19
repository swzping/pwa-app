import React from 'react';
import {Modal, TouchableOpacity} from 'react-native';
import {Colors} from '@app/styles';
import {useTranslation} from 'react-i18next';
import {IS_IOS} from '@app/helpers/Constants';

import Icon from 'react-native-vector-icons/Ionicons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import PageBuilder from '@app/components/PageBuilder';
import RenderIf from '@app/components/RenderIf/index';
import _ from 'lodash';

const ModalSort = ({show, cmsBlock, onPressVisible}) => {
  const {t} = useTranslation();

  return (
    <Modal
      visible={show}
      transparent={true}
      onRequestClose={() => onPressVisible(false)}>
      <CustomView
        flex
        verticalCenter
        horizontalCenter
        backgroundColor={'rgba(0, 0, 0, 0.5)'}
        onPress={() => onPressVisible(false)}
        paddingHorizontal={20}>
        <CustomView
          borderRadius={2}
          borderColor={Colors.GRAY_LIGHT}
          backgroundColor={Colors.WHITE}
          style={{borderWidth: 1, width: '100%'}}>
          <CustomView row paddingTop={10} paddingHorizontal={10}>
            <CustomView flex row horizontalCenter>
              <FeatherIcon
                name={'help-circle'}
                size={15}
                style={{
                  marginRight: 5,
                  top: IS_IOS ? 0 : -2,
                }}
              />
              <Text bold>{t('info')}</Text>
            </CustomView>
            <TouchableOpacity
              onPress={() => onPressVisible(false)}
              style={{
                flex: 1,
                alignItems: 'flex-end',
              }}>
              <Icon name="close" size={20} color={Colors.GRAY_MEDIUM} />
            </TouchableOpacity>
          </CustomView>
          <RenderIf condition={_.isEmpty(cmsBlock)}>
            <CustomView paddingHorizontal={12} paddingVertical={5}>
              <Text>{t('noData')}</Text>
            </CustomView>
          </RenderIf>
          <RenderIf condition={!_.isEmpty(cmsBlock)}>
            <PageBuilder htmlBlock={cmsBlock} />
          </RenderIf>
        </CustomView>
      </CustomView>
    </Modal>
  );
};

export default ModalSort;
