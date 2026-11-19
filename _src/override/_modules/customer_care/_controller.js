import React, {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import useCustomQuery from '@app/hooks/useCustomQuery';
import useCustomMutation from '@app/hooks/useCustomMutation';
import {RESPONSE_SUCCEED_CONTACT} from '@app/helpers/Constants';
import {GET_CMS_BLOCKS} from '@app/services/queries/cms';

import {SUBMIT_CONTACT_FORM} from '@app/_modules/customer_care/services/schema';
import Views from '@app/_modules/customer_care/_view';
import {modules} from '@root/swift.config';

const CustomerCare = () => {
  if (!modules.customer_care.enable) {
    return null;
  }

  /**
   * ---------------------------------------------------- *
   * @var hooks
   * ---------------------------------------------------- *
   */
  const {t} = useTranslation();
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [cmsPage, setCmsPage] = useState(null);
  const {onRefetchData: onPostContactForm} = useCustomMutation({
    schema: SUBMIT_CONTACT_FORM,
  });
  const {data} = useCustomQuery({
    schema: GET_CMS_BLOCKS,
    useInitData: true,
    variables: {
      identifiers: ['contact'],
    },
  });

  /**
   * ---------------------------------------------------- *
   * @function {lifecycle}
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    if (data && data?.data) {
      setCmsPage(data?.data.cmsBlocks.items[0].content);
      setLoading(false);
    }
  }, [data]);

  /**
   * ---------------------------------------------------- *
   * @function onSubmit
   * @summary on event request to server
   * ---------------------------------------------------- *
   */
  const onSubmit = async data2 => {
    setLoadingSubmit(true);
    setShowMessage(false);
    const variables = {
      email: data2.email,
      fullname: data2.fullName,
      message: data2.message,
      telephone: data2.telephone,
    };
    try {
      const res = await onPostContactForm({
        params: variables,
        paramsOpt: {isReturn: true},
      });

      const successMessage = res?.data?.contactusFormSubmit?.success_message;
      if (successMessage && successMessage.includes(RESPONSE_SUCCEED_CONTACT)) {
        setShowMessage(true);
      }
      setLoadingSubmit(false);
    } catch (err) {
      setLoadingSubmit(false);
    }
  };

  /**
   * ---------------------------------------------------- *
   * @constant {controllerProps}
   * @summary set controller props
   * ---------------------------------------------------- *
   */
  const controllerProps = {
    t,
    loading,
    loadingSubmit,
    showMessage,
    cmsPage,
    onSubmit,
  };

  return <Views {...controllerProps} />;
};

export default CustomerCare;
