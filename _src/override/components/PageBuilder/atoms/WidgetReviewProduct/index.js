import React from 'react';
import {navigateTo} from '@app/helpers/Navigation';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {MixinsNew, Colors} from '@app/styles/index';
import FastImage from '@d11/react-native-fast-image';
import RenderIf from '@root/_src/core/components/RenderIf/index';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {modules} from '@root/swift.config';

const WidgetReviewProduct = ({children}) => {
  const onPressLink = async uri => {
    const endpoint = uri.split('/');
    const urlKey = endpoint[3]?.split('.html');
    navigateTo(modules.product_detail.enable, modules.product_detail.name, {
      productUrlKey: urlKey[0],
    });
  };
  return (
    <CustomView
      horizontalCenter
      backgroundColor={Colors.GRAY_SMOOTH3}
      width={MixinsNew.MAX_WIDTH}>
      <CustomView
        width={MixinsNew.MAX_WIDTH - 40}
        border={1}
        marginVertical={10}
        padding={'5%'}
        borderColor={'#5366ff'}>
        <CustomView
          horizontalCenter
          backgroundColor={Colors.WHITE}
          border={1}
          borderColor={Colors.GRAY_LIGHT}
          padding={'5%'}>
          <RenderIf
            condition={
              children[0]?.children[0]?.children[0]?.children[0]?.children[0]
                ?.attribs?.src
            }>
            <CustomView
              onPress={() =>
                onPressLink(
                  children[0]?.children[0]?.children[0]?.children[0]?.attribs
                    ?.href,
                )
              }>
              <FastImage
                resizeMode={FastImage.resizeMode.stretch}
                style={{
                  width: 150,
                  height: 150,
                }}
                source={{
                  uri: children[0]?.children[0]?.children[0]?.children[0]
                    ?.children[0]?.attribs?.src,
                  priority: FastImage.priority.normal,
                  cache: FastImage.cacheControl.immutable,
                }}
              />
            </CustomView>
          </RenderIf>
          <RenderIf
            condition={
              children[0]?.children[0]?.children[0]?.children[0]?.attribs?.src
            }>
            <FastImage
              resizeMode={FastImage.resizeMode.stretch}
              style={{
                width: 150,
                height: 150,
              }}
              source={{
                uri: children[0]?.children[0]?.children[0]?.children[0]?.attribs
                  ?.src,
                priority: FastImage.priority.normal,
                cache: FastImage.cacheControl.immutable,
              }}
            />
          </RenderIf>
          <CustomView row marginTop={'3%'}>
            <Text color={Colors.BLACK}>
              {
                children[0]?.children[0]?.children[0]?.children[1]?.children[0]
                  ?.children[0]?.data
              }
            </Text>
            <RenderIf
              condition={
                children[0]?.children[0]?.children[0]?.children[1]?.children[1]
                  ?.children?.length > 0
              }>
              {children[0]?.children[0]?.children[0]?.children[1]?.children[1]?.children.map(
                child => (
                  <CustomView>
                    <RenderIf condition={child.attribs?.class === 'fa fa-star'}>
                      <Icon name={'star'} size={18} color={Colors.RED} />
                    </RenderIf>
                    <RenderIf
                      condition={child.attribs?.class === 'fa fa-star-o'}>
                      <Icon
                        name={'star-outline'}
                        size={18}
                        color={Colors.RED}
                      />
                    </RenderIf>
                    <RenderIf
                      condition={child.attribs?.class === 'fa fa-star-half-o'}>
                      <Icon name={'star-half'} size={18} color={Colors.RED} />
                    </RenderIf>
                  </CustomView>
                ),
              )}
            </RenderIf>
          </CustomView>
          <Text bold>
            {
              children[0]?.children[0]?.children[0]?.children[2]?.children[0]
                ?.data
            }
          </Text>
          <RenderIf
            condition={
              children[0]?.children[0]?.children[0]?.children[3]?.children[0]
                ?.data
            }>
            <Text center>
              {
                children[0]?.children[0]?.children[0]?.children[3]?.children[0]
                  ?.data
              }
            </Text>
          </RenderIf>
          {children[0]?.children[0]?.children[0]?.children[3]?.children[0]
            ?.children?.length > 0 && (
            <Text
              center
              onPress={() =>
                onPressLink(
                  children[0]?.children[0]?.children[0]?.children[3]
                    ?.children[0]?.attribs?.href,
                )
              }>
              {
                children[0]?.children[0]?.children[0]?.children[3]?.children[0]
                  ?.children[0]?.data
              }
            </Text>
          )}
        </CustomView>
        <CustomView
          backgroundColor={Colors.WHITE}
          border={1}
          borderColor={Colors.GRAY_LIGHT}
          marginVertical={'5%'}
          padding={'5%'}>
          <RenderIf
            condition={
              children[1]?.children[0]?.children[0]?.children[0]?.children[0]
                ?.children[0]?.children?.length > 0
            }>
            {children[1].children[0].children[0].children[0].children[0].children[0].children.map(
              child => (
                <CustomView>
                  <RenderIf condition={child.attribs.class.includes('name')}>
                    <Text bold>{child.children[0].data}</Text>
                  </RenderIf>
                  <RenderIf condition={!child.attribs.class.includes('name')}>
                    <Text>{child.children[0].data}</Text>
                  </RenderIf>
                </CustomView>
              ),
            )}
          </RenderIf>
        </CustomView>
        <CustomView
          backgroundColor={Colors.WHITE}
          border={1}
          borderColor={Colors.GRAY_LIGHT}
          padding={'5%'}>
          <RenderIf
            condition={
              children[1].children[1].children[0].children[0].children[0]
                .children[0].children?.length > 0
            }>
            <CustomView row style={{flexWrap: 'wrap'}}>
              {children[1].children[1].children[0].children[0].children[0].children[0].children.map(
                child => {
                  return (
                    <CustomView
                      row
                      horizontalCenter
                      marginVertical={10}
                      marginRight={20}>
                      <CustomView
                        backgroundColor={Colors.RED}
                        padding={10}
                        marginRight={10}
                        borderRadius={5}>
                        <Text bold color={Colors.WHITE}>
                          {child.children[0]?.children[0]?.data}
                        </Text>
                      </CustomView>
                      <Text bold>{child.children[2]?.children[0]?.data}</Text>
                    </CustomView>
                  );
                },
              )}
            </CustomView>
          </RenderIf>
          <Text>
            {
              children[1].children[1]?.children[0]?.children[0]?.children[0]
                ?.children[1]?.children[0]?.children[0]?.data
            }
          </Text>
        </CustomView>
      </CustomView>
    </CustomView>
  );
};

export default WidgetReviewProduct;
