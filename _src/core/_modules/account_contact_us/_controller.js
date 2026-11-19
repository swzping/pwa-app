import React, {useEffect, useState} from 'react';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {GET_CONTACT_CMS} from '@app/_modules/account_contact_us/services/schema';

import Views from '@app/_modules/account_contact_us/_view';
import {modules} from '@root/swift.config';

const Controller = props => {
  if (!modules.account_contact_us.enable) {
    return null;
  }
  const [contactCMS, setContactCMS] = useState(null);
  const [title, setTitle] = useState(null);
  const {data, loading} = useCustomQuery({
    schema: GET_CONTACT_CMS,
    useInitData: true,
  });

  /**
   * [METHOD]
   * get data cms from server
   */
  useEffect(() => {
    if (data?.data?.cmsBlocks?.items.length > 0) {
      setContactCMS(data?.data.cmsBlocks.items[0].content);
      setTitle(data?.data.cmsBlocks.items[0].title);
    }
  }, [data]);

  /**
   * [PROPS]
   * set controller props
   */
  const controllerProps = {
    loading,
    contactCMS,
    title,
  };

  return <Views {...props} {...controllerProps} />;
};

export default Controller;
