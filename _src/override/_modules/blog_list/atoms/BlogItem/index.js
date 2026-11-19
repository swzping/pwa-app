import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mixins, Colors } from '@app/styles';
import { TouchableRipple } from 'react-native-paper';
import Text from '@app/components/Text';
import FastImage from '@d11/react-native-fast-image';
import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf';
import PageBuilder from '@app/components/PageBuilder/index';

const BlogItem = ({ blog, onPressBlog, onPressCategory }) => {
  const { t } = useTranslation();
  return (
    <CustomView padding={'5%'}>
      <CustomView>
        <TouchableRipple
          onPress={() =>
            onPressBlog({ id: blog.id, categoryIds: blog.categoryIds })
          }>
          <Text xlarge bold>
            {blog.title}
          </Text>
        </TouchableRipple>

        <Text small color={Colors.GRAY_DARK}>
          {blog.created_at}
        </Text>
        <CustomView style={{ width: '30%', justifyContent: 'flex-start' }}>
          <RenderIf condition={blog.featured_image_url !== ''}>
            <FastImage
              key={blog.id}
              resizeMode={FastImage.resizeMode.stretch}
              style={{
                width: Mixins.MAX_WIDTH - 40,
                height: 250,
              }}
              source={{
                uri: blog.featured_image_url,
                priority: FastImage.priority.normal,
                cache: FastImage.cacheControl.immutable,
              }}
            />
          </RenderIf>
        </CustomView>
        <CustomView marginTop={5}>
          <RenderIf condition={blog.short_content}>
            <PageBuilder htmlBlock={blog.short_content} />
          </RenderIf>
          <RenderIf condition={!blog.short_content}>
            <Text color={Colors.GRAY_DARK}>
              {t('blog_list.view.noDescription')}
            </Text>
          </RenderIf>
          <CustomView
            onPress={() =>
              onPressBlog({ id: blog.id, categoryIds: blog.categoryIds })
            }
            width={'50%'}
            padding={10}
            marginTop={15}
            backgroundColor={Colors.PRIMARY}>
            <Text
              center
              color={Colors.WHITE}
              style={{ textTransform: 'uppercase' }}>
              {t('blog_list.view.readMore')}
            </Text>
          </CustomView>
          <CustomView
            row
            marginTop={'5%'}
            style={{ width: Mixins.MAX_WIDTH - 40, flexWrap: 'wrap' }}>
            <Text bold style={{ textTransform: 'uppercase' }}>
              {t('blog_list.view.postedIn')}{' '}
            </Text>
            {blog.categoryIds ? (
              blog.categoryIds.map(item => (
                <CustomView
                  marginHorizontal={5}
                  onPress={() => onPressCategory(item.id)}>
                  <Text
                    color={Colors.PRIMARY}
                    style={{ textTransform: 'capitalize' }}>
                    {item.name}
                  </Text>
                </CustomView>
              ))
            ) : (
              <Text marginHorizontal={5} bold>
                -
              </Text>
            )}
          </CustomView>
        </CustomView>
      </CustomView>
    </CustomView>
  );
};

export default BlogItem;
