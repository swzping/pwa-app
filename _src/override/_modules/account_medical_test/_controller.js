import React, {useEffect, useState} from 'react';
import useCustomQuery from '@app/hooks/useCustomQuery';
import Views from '@app/_modules/account_medical_test/_view';
import {modules} from '@root/swift.config';
import {useTranslation} from 'react-i18next';
import {GET_CMS_PAGE} from '@app/_modules/cms_page/services/schema';
import {GET_CUSTOMER_MEDICAL_TEST} from '@app/_modules/account_medical_test/services/schema';
import {useRoute} from '@react-navigation/native';

const MedicalTest = () => {
  if (!modules.account_medical_test.enable) {
    return null;
  }

  const {t} = useTranslation();
  const route = useRoute();
  const isSuccessRegister = route?.params?.isSuccessRegister ?? false;

  const [medicalData, setMedicalData] = useState({
    test_tanggal: null,
    test_lokasi: null,
    test_gula_darah_hasil: null,
    test_kolesterol_hasil: null,
    test_tekanan_darah_hasil: null,
    test_asam_urat_hasil: null,
  });
  const [cmsStoreInfo, setCmsStoreInfo] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: dataMedicalTest,
    loading,
    onRefetchData: onRefetchMedicalTest,
  } = useCustomQuery({
    schema: GET_CUSTOMER_MEDICAL_TEST,
    useInitData: true,
    variables: {},
    opts: {fetchPolicy: 'no-cache'},
  });
  const {data: cmsStore} = useCustomQuery({
    schema: GET_CMS_PAGE,
    useInitData: true,
    variables: {
      identifier: 'medical-test',
    },
    opts: {fetchPolicy: 'no-cache'},
  });

  useEffect(() => {
    const cmsPage = cmsStore?.data?.cmsPage;
    if (cmsPage) {
      setCmsStoreInfo(cmsPage);
    }
  }, [cmsStore]);

  useEffect(() => {
    if (dataMedicalTest?.data?.customer) {
      setMedicalData(dataMedicalTest?.data?.customer);
    }
  }, [dataMedicalTest]);

  const onRefresh = async () => {
    setRefreshing(true);
    await onRefetchMedicalTest({});
    setRefreshing(false);
  };

  const isHasMedicalData =
    medicalData.test_tanggal ||
    medicalData.test_lokasi ||
    medicalData.test_gula_darah_hasil ||
    medicalData.test_kolesterol_hasil ||
    medicalData.test_tekanan_darah_hasil ||
    medicalData.test_asam_urat_hasil;

  const viewProps = {
    t,
    loading,
    refreshing,
    onRefresh,
    isSuccessRegister,
    isHasMedicalData,
    medicalData,
    cmsStoreInfo,
  };

  return <Views {...viewProps} />;
};

export default MedicalTest;
