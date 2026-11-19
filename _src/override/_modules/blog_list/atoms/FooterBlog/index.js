import React from 'react';
import {useTranslation} from 'react-i18next';
import {Colors} from '@app/styles';
import Text from '@app/components/Text';
import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf';
import {FlatList, ScrollView} from 'react-native';
import Shimmer from '@app/components/_Shimmer/index';

const FooterBlog = ({
  blog,
  isLoadingBlog,
  onPressBlog,
  category,
  onPressCategory,
}) => {
  const {t} = useTranslation();
  return (
    <CustomView paddingHorizontal={'5%'}>
      <ScrollView>
        <RenderIf condition={category}>
          <CustomView paddingVertical={10}>
            {isLoadingBlog && (
              <Shimmer wrapperStyle={{height: 90, width: '100%'}} />
            )}
            {!isLoadingBlog && (
              <Text
                color={Colors.GRAY_DARK2}
                style={{textTransform: 'uppercase'}}>
                {t('blog_list.view.categories')}
              </Text>
            )}

            <FlatList
              data={category}
              renderItem={({item}) => (
                <CustomView
                  paddingVertical={10}
                  borderColor={Colors.GRAY_LIGHT}
                  style={{borderBottomWidth: 1}}
                  onPress={() => onPressCategory(item.id)}>
                  <Text small color={Colors.GRAY_DARK2}>
                    {item.name}
                  </Text>
                </CustomView>
              )}
              keyExtractor={item => item.id}
            />
          </CustomView>
        </RenderIf>
        <RenderIf condition={blog}>
          <CustomView paddingVertical={10}>
            <Text style={{textTransform: 'uppercase'}}>
              {t('blog_list.view.recentPost')}
            </Text>
            <FlatList
              data={blog}
              renderItem={({item}) => (
                <CustomView
                  paddingVertical={5}
                  onPress={() =>
                    onPressBlog({id: item.id, categoryIds: item.categoryIds})
                  }>
                  <Text small color={Colors.PRIMARY}>
                    {item.title}
                  </Text>
                </CustomView>
              )}
              keyExtractor={item => item.id}
            />
          </CustomView>
        </RenderIf>
      </ScrollView>
    </CustomView>
  );
};

export default FooterBlog;
