import React from 'react';
import { Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MixinsNew } from '@app/styles';
import { TouchableRipple, Text, MD2Colors as ColorsPaper } from 'react-native-paper';
import { navigateTo } from '@app/helpers/Navigation';
import { modules } from '@root/swift.config';
import {
  formatDateNotif as formatDateBlog,
  shortenText,
  trimHTMLTags,
} from '@app/helpers/General';

import FastImage from '@d11/react-native-fast-image';
import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf';

const BlogItem = ({ blog }) => {
  const { t } = useTranslation();
  return (
    <CustomView
      style={{
        ...MixinsNew.padding({ left: 20, top: 10, bottom: 10, right: 20 }),
      }}>
      <TouchableRipple
        style={{
          borderWidth: 1,
          borderColor: ColorsPaper.grey300,
          borderRadius: 5,
        }}
        onPress={() =>
          navigateTo(modules.blog_detail.enable, modules.blog_detail.name, {
            blogId: blog.id,
          })
        }>
        <CustomView style={{ flexDirection: 'row' }}>
          <CustomView style={{ width: '30%', justifyContent: 'flex-start' }}>
            <RenderIf condition={blog.featured_image_url === ''}>
              <Image
                source={require('@app/assets/images/placeholder.png')}
                style={{
                  ...MixinsNew.borderRadius({ topLeft: 5, bottomLeft: 5 }),
                  width: 100,
                  height: 100,
                }}
              />
            </RenderIf>
            <RenderIf condition={blog.featured_image_url !== ''}>
              <FastImage
                key={blog.id}
                resizeMode={FastImage.resizeMode.stretch}
                style={{
                  width: 100,
                  height: 100,
                }}
                source={{
                  uri: blog.featured_image_url,
                  priority: FastImage.priority.normal,
                  cache: FastImage.cacheControl.immutable,
                }}
              />
            </RenderIf>
          </CustomView>
          <CustomView style={{ width: '70%', ...MixinsNew.padding(10) }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{blog.title}</Text>
            <Text style={{ color: ColorsPaper.grey500, fontSize: 10 }}>
              {formatDateBlog(blog.created_at)}
            </Text>
            <Text style={{ fontSize: 12, ...MixinsNew.margin({ top: 5 }) }}>
              {blog.short_content === ''
                ? t('label.noData')
                : shortenText(trimHTMLTags(blog.short_content), 100)}
            </Text>
          </CustomView>
        </CustomView>
      </TouchableRipple>
    </CustomView>
  );
};

export default BlogItem;
