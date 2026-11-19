import React, {useState} from 'react';
import {
  Modal,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {TYPE_SHIMMER_MEDICAL_TEST} from '@app/helpers/Constants';
import NavBar from '@app/components/NavBar/index';
import CustomView from '@app/components/CustomView/index';
import Text from '@app/components/Text';
import RenderIf from '@app/components/RenderIf';
import ShimmerSkeleton from '@app/components/_ShimmerSkeleton';
import styles from '@app/_modules/account_medical_test/styles';
import {
  classesStylesMedicalTest,
  tagStylesMedicalTest,
} from '@app/_modules/account_medical_test/cmsStyles';
import {Colors} from '@app/styles';
import RenderHTML from '@app/components/RenderHTML/index';
import HealtyHeartBig from '@app/assets/svgs/HealtyHeartBig';

const StoreModal = ({openModal, setOpenModal, cmsStoreInfo}) => {
  return (
    <Modal visible={openModal} onRequestClose={() => setOpenModal(false)}>
      <NavBar
        center
        useClose
        useWhite
        useBackPress={() => setOpenModal(false)}
        title={cmsStoreInfo?.title}
      />
      <ScrollView>
        <RenderHTML
          htmlBlock={cmsStoreInfo?.content}
          classesStyles={classesStylesMedicalTest}
          tagsStyles={tagStylesMedicalTest}
        />
      </ScrollView>
    </Modal>
  );
};

const TestItem = ({
  title,
  value,
  unit,
  bottomBorder = false,
  isMergeTop = false,
  isMergeBottom = false,
}) => {
  const styleItemContent = isMergeTop
    ? styles.testItemContentMergeTop
    : isMergeBottom
    ? styles.testItemContentMergeBottom
    : styles.testItemContent;
  return (
    <CustomView
      style={
        bottomBorder
          ? styles.testItemWrapperWithDivider
          : styles.testItemWrapper
      }>
      <CustomView row style={[styleItemContent]}>
        <CustomView width={120}>
          <Text small style={styles.testItemTitle}>
            {title}
          </Text>
        </CustomView>
        <CustomView width={unit ? 40 : 200}>
          <Text small style={styles.testItemValue}>
            {value ?? '-'}
          </Text>
        </CustomView>
        <RenderIf condition={unit}>
          <Text small style={styles.testItemUnit}>
            {unit}
          </Text>
        </RenderIf>
      </CustomView>
    </CustomView>
  );
};

const CheckMedicalLocation = ({t, setOpenModal}) => {
  return (
    <TouchableOpacity onPress={() => setOpenModal(true)}>
      <CustomView style={styles.viewStoreWrapper}>
        <Text style={styles.viewStore}>
          {t('account_medical_test.viewAvailStore')}
        </Text>
      </CustomView>
    </TouchableOpacity>
  );
};

const SuccessRegister = ({t, setOpenModal}) => {
  const checkLocationProps = {
    t,
    setOpenModal,
  };

  return (
    <>
      <NavBar center useBack stylesContainer={styles.navbar} />
      <CustomView height={'100%'} backgroundColor={Colors.PRIMARY}>
        <CustomView horizontalCenter style={styles.iconSuccess}>
          <HealtyHeartBig />
        </CustomView>
        <CustomView>
          <Text style={styles.title}>{t('account_medical_test.thankyou')}</Text>
          <Text style={styles.title}>
            {t('account_medical_test.titleRegister')}
          </Text>
          <Text style={styles.title}>{t('account_medical_test.limited')}</Text>
        </CustomView>
        <CustomView>
          <Text style={styles.subtitle}>
            {t('account_medical_test.subtitleRegister')}
          </Text>
        </CustomView>
        <CheckMedicalLocation {...checkLocationProps} />
      </CustomView>
    </>
  );
};

const MedicalTestScreen = ({
  t,
  isHasMedicalData,
  medicalData,
  loading,
  refreshing,
  onRefresh,
  cmsStoreInfo,
  isSuccessRegister,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const modalProps = {
    openModal,
    setOpenModal,
    cmsStoreInfo,
  };

  if (isSuccessRegister) {
    const successProps = {
      t,
      setOpenModal,
    };
    return (
      <>
        <SuccessRegister {...successProps} />
        <StoreModal {...modalProps} />
      </>
    );
  }

  return (
    <>
      <NavBar center useBack stylesContainer={styles.navbar} />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <CustomView style={styles.topContainer}>
          <CustomView horizontalCenter style={styles.iconData}>
            <HealtyHeartBig />
          </CustomView>
          <CustomView>
            <Text style={styles.titleResult}>
              {t('account_medical_test.titleHasTest')}
            </Text>
          </CustomView>
          <CheckMedicalLocation t={t} setOpenModal={setOpenModal} />
        </CustomView>
        <CustomView style={styles.bottomContainer}>
          <RenderIf condition={loading}>
            <CustomView style={styles.testInfoContainer}>
              <ShimmerSkeleton type={TYPE_SHIMMER_MEDICAL_TEST} />
            </CustomView>
          </RenderIf>
          <RenderIf condition={!loading}>
            <RenderIf condition={!isHasMedicalData}>
              <CustomView style={styles.testInfoContainer}>
                <Text small center style={styles.noData}>
                  {t('account_medical_test.noData')}
                </Text>
              </CustomView>
            </RenderIf>
            <RenderIf condition={isHasMedicalData}>
              <CustomView style={styles.testInfoContainer}>
                <TestItem
                  title={t('account_medical_test.date')}
                  value={medicalData.test_tanggal}
                  isMergeTop
                />
                <TestItem
                  title={t('account_medical_test.location')}
                  value={medicalData.test_lokasi}
                  isMergeBottom
                  bottomBorder
                />
                <TestItem
                  title={t('account_medical_test.gulaDarah')}
                  value={medicalData.test_gula_darah_hasil}
                  unit={'mg/dL'}
                  bottomBorder
                />
                <TestItem
                  title={t('account_medical_test.kolesterol')}
                  value={medicalData.test_kolesterol_hasil}
                  unit={'mg/dL'}
                  bottomBorder
                />
                <TestItem
                  title={t('account_medical_test.asamUrat')}
                  value={medicalData.test_asam_urat_hasil}
                  unit={'mg/dL'}
                  bottomBorder
                />
                <TestItem
                  title={t('account_medical_test.tekananDarah')}
                  value={medicalData.test_tekanan_darah_hasil}
                  unit={'mmHg'}
                />
              </CustomView>
            </RenderIf>
          </RenderIf>
        </CustomView>
      </ScrollView>
      <StoreModal {...modalProps} />
    </>
  );
};

export default MedicalTestScreen;
