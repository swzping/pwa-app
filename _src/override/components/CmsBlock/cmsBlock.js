import React, { useState, useEffect } from 'react';
import { Pressable } from "react-native"
import PageBuilder from '@app/components/Cms';
import { GET_COMMON_CMS_BLOCKS } from '@app/services/queries/cms';
import useCustomQuery from '@app/hooks/useCustomQuery';
import { extractMobileImageSrc, extractMobileImageLink } from './utils/getBannerImgUrl'
import FastImage from '@d11/react-native-fast-image';
import { resolveLinkAndNavigate } from '@app/helpers/Navigation';
const CmsBlock = ({ identifier, noPadding }) => {
  const [htmlBlock, setHtmlBlock] = useState(null);
  const { data } = useCustomQuery({
    schema: GET_COMMON_CMS_BLOCKS,
    useInitData: true,
    variables: {
      identifier,
    },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  useEffect(() => {
    if (data && data?.data) {
      setHtmlBlock(data?.data.cmsBlockAppContent.block_json_content);
    }
  }, [data]);

  if (!htmlBlock) {
    return null;
  }

  if (identifier == 'hello-banner' && extractMobileImageSrc(htmlBlock)) {
    return (
      <Pressable onPress={() => resolveLinkAndNavigate(extractMobileImageLink(htmlBlock))} activeOpacity={0.8}>
        <FastImage
          pointerEvents="none"
          key={extractMobileImageSrc(htmlBlock)}
          style={{
            height: 50,
          }}
          resizeMode={FastImage.resizeMode.stretch}
          source={{
            uri: extractMobileImageSrc(htmlBlock),
            priority: FastImage.priority.normal,
            cache: FastImage.cacheControl.immutable,
          }}
        />
      </Pressable>
    )
  }

  return (
    <PageBuilder
      htmlStr={htmlBlock}
      noPadding={noPadding}
      useFlashList={false}
    />
  );
};

export default CmsBlock;
