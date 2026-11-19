import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useRoute} from '@react-navigation/native';
import {modules} from '@root/swift.config';
import {GET_CMS_PAGE_WITH_APP_CONTENT} from './services/schema';
import useCustomQuery from '@app/hooks/useCustomQuery';
import Views from './_view';

const NewCmsController = props => {
  if (!modules.new_cms.enable) {
    return null;
  }

  const {t} = useTranslation();
  const route = useRoute();
  const params = route?.params;

  const identifier = params?.identifier ?? '';
  const tagsStyles = params?.tagsStyles;
  const classesStyles = params?.classesStyles;

  // 获取 CMS 页面数据
  const {data, loading, error, refetch} = useCustomQuery({
    schema: GET_CMS_PAGE_WITH_APP_CONTENT,
    useInitData: true,
    variables: {identifier, is_home: false},
    opts: {context: {method: 'GET'}},
  });

  const cmsData = data?.data?.cmsPageAppContent;
  const title = cmsData?.title ?? '';
  const content = cmsData?.page_json_content ?? '';

  const controllerProps = useMemo(
    () => ({
      ...props,
      t,
      identifier,
      title,
      content,
      loading,
      error,
      tagsStyles,
      classesStyles,
      onRefresh: refetch,
    }),
    [
      props,
      t,
      identifier,
      title,
      content,
      loading,
      error,
      tagsStyles,
      classesStyles,
      refetch,
    ],
  );

  return <Views {...controllerProps} />;
};

export default NewCmsController;
