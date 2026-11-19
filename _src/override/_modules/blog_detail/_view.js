/* eslint-disable no-shadow */
import React from 'react';
import {ScrollView} from 'react-native';
import {Colors, Mixins, CmsStyles} from '@app/styles';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import FooterBlog from '@app/_modules/blog_list/atoms/FooterBlog/index';
import {TYPE_SHIMMER_BLOG_DETAIL} from '@app/helpers/Constants';

import NavBar from '@app/components/NavBar';
import CustomView from '@app/components/CustomView';
import SocialShareBlock from '@app/components/SocialShareBlock';
import Text from '@app/components/Text';
import Config from 'react-native-config';
import FastImage from '@d11/react-native-fast-image';
import styles from '@app/_modules/blog_detail/styles';
import AtomRightCart from '@app/_modules/product_list/atoms/RightCart/index';
import RenderHTML from '@app/components/RenderHTML';
import RenderIf from '@app/components/RenderIf';
import ShimmerSkeleton from '@app/components/_ShimmerSkeleton';

const BlogDetailScreen = ({
  blogDetail,
  blogLoading,
  onPressCart,
  categoryIds,
  blogList,
  onPressBlog,
  categoryList,
  onPressCategory,
}) => {
  const {t} = useTranslation();

  const RenderNode = ({TDefaultRenderer, tnode, ...defaultRendererProps}) => {
    return (
      <TDefaultRenderer tnode={tnode} {...defaultRendererProps}>
        {tnode.attributes?.class?.includes('offset-sm-1') && (
          <CustomView horizontalCenter>
            <FastImage
              key={blogDetail.id}
              style={styles.blogImageContainer}
              resizeMode={FastImage.resizeMode.stretch}
              source={{
                uri:
                  tnode.domNode?.children[1]?.attribs?.src ||
                  tnode.domNode?.children[0]?.attribs?.src,
                priority: FastImage.priority.normal,
                cache: FastImage.cacheControl.immutable,
              }}
            />
          </CustomView>
        )}
      </TDefaultRenderer>
    );
  };

  const renderers = {
    div: RenderNode,
  };

  const BlogDetail = ({blogDetail, blogLoading}) => {
    if (!blogDetail) {
      if (blogLoading) {
        return (
          <CustomView paddingTop={30}>
            <ShimmerSkeleton type={TYPE_SHIMMER_BLOG_DETAIL} />
          </CustomView>
        );
      } else {
        return (
          <CustomView flex horizontalCenter verticalCenter>
            <Text>{t('blog_detail.view.noDetail')}</Text>
          </CustomView>
        );
      }
    } else {
      return (
        <ScrollView>
          <CustomView>
            <CustomView horizontalStart marginHorizontal={'5%'} paddingTop={20}>
              <Text bold large>
                {blogDetail.title}
              </Text>
              <Text small color={Colors.GRAY_DARK}>
                {blogDetail.created_at}
              </Text>
            </CustomView>
            <RenderIf condition={blogDetail.featured_image_url}>
              <CustomView horizontalCenter>
                <FastImage
                  key={blogDetail.id}
                  style={styles.blogImageContainer}
                  resizeMode={FastImage.resizeMode.stretch}
                  source={{
                    uri: blogDetail.featured_image_url,
                    priority: FastImage.priority.normal,
                    cache: FastImage.cacheControl.immutable,
                  }}
                />
              </CustomView>
            </RenderIf>
            <CustomView horizontalStart marginVertical={10}>
              <CustomView marginVertical={10} paddingRight={'5%'}>
                <RenderHTML
                  htmlBlock={blogDetail.content}
                  tagsStyles={CmsStyles.tagStylesBlogDetail}
                  classesStyles={CmsStyles.classesStylesBlogDetail}
                  renderers={renderers}
                />
              </CustomView>
            </CustomView>
            <CustomView
              borderColor={Colors.GRAY_LIGHT}
              paddingVertical={10}
              marginHorizontal={10}
              style={{borderTopWidth: 1, borderBottomWidth: 1}}>
              <CustomView width={'50%'}>
                <SocialShareBlock
                  url={`${Config.PWA_BASE_URL}/blog/${blogDetail.url_key}`}
                  title={blogDetail.title}
                  message={t('blog_detail.view.checkArticle')}
                />
              </CustomView>
            </CustomView>
            <CustomView
              row
              marginHorizontal={'5%'}
              marginTop={'5%'}
              style={{width: Mixins.MAX_WIDTH - 40, flexWrap: 'wrap'}}>
              <Text bold style={{textTransform: 'uppercase'}}>
                {t('blog_list.view.postedIn')}{' '}
              </Text>
              {categoryIds ? (
                categoryIds.map(item => (
                  <CustomView
                    marginHorizontal={5}
                    onPress={() => onPressCategory(item.id)}>
                    <Text
                      color={Colors.PRIMARY}
                      style={{textTransform: 'capitalize'}}>
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
            <CustomView
              row
              marginHorizontal={'5%'}
              style={{width: Mixins.MAX_WIDTH - 40, flexWrap: 'wrap'}}>
              <Text bold style={{textTransform: 'uppercase'}}>
                {t('blog_detail.view.tags')}{' '}
              </Text>
              {blogDetail.tag_names ? (
                blogDetail.tag_names.map(item => (
                  <CustomView marginHorizontal={5}>
                    <Text
                      color={Colors.PRIMARY}
                      style={{textTransform: 'capitalize'}}>
                      {item}
                    </Text>
                  </CustomView>
                ))
              ) : (
                <Text marginHorizontal={5} bold>
                  -
                </Text>
              )}
            </CustomView>
            <FooterBlog
              blog={blogList}
              onPressBlog={onPressBlog}
              category={categoryList}
              onPressCategory={onPressCategory}
            />
          </CustomView>
        </ScrollView>
      );
    }
  };

  return (
    <SafeAreaView>
      <NavBar
        useWhite
        useBack
        childrenRight={<AtomRightCart onPressCart={onPressCart} />}
      />
      <BlogDetail blogDetail={blogDetail} blogLoading={blogLoading} />
    </SafeAreaView>
  );
};

export default BlogDetailScreen;
