import React, {useState, useEffect} from 'react';
import {Colors} from '@app/styles';
import {TYPE_SHIMMER_FOOTER} from '@app/helpers/Constants';
import {GET_CMS_BLOCKS} from '@app/services/queries/cms';
import useCustomQuery from '@app/hooks/useCustomQuery';
import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf/index';
import PageBuilder from '@app/components/PageBuilder/index';
import ShimmerSkeleton from '@app/components/_ShimmerSkeleton';
import Device from 'react-native-device-info';
import Text from '@app/components/Text/index';

const Footer = () => {
  const [cmsBlock, setCmsBlock] = useState([]);
  const {loading, data: cmsBlockData} = useCustomQuery({
    schema: GET_CMS_BLOCKS,
    useInitData: true,
    variables: {
      identifiers: 'footer_links_block',
    },
    opts: {fetchPolicy: 'cache-first', context: {method: 'GET'}},
  });

  useEffect(() => {
    if (cmsBlockData?.data && cmsBlockData?.data?.cmsBlocks?.items) {
      setCmsBlock(cmsBlockData?.data?.cmsBlocks?.items[0].content);
    }
  }, [cmsBlockData]);

  return (
    <CustomView
      marginTop={20}
      paddingTop={30}
      paddingBottom={40}
      backgroundColor={Colors.YELLOW_LIGHT}>
      <RenderIf condition={loading}>
        <ShimmerSkeleton type={TYPE_SHIMMER_FOOTER} />
      </RenderIf>
      <RenderIf condition={!loading}>
        <PageBuilder htmlBlock={cmsBlock} />
      </RenderIf>
      <CustomView horizontalCenter>
        <Text>{`v${Device.getVersion()}`}</Text>
      </CustomView>
    </CustomView>
  );
};

export default Footer;
