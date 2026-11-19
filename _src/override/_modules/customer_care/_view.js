import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@app/styles';
import { TYPE_SHIMMER_CUSTOMER_CARE } from '@app/helpers/Constants';
import NavBar from '@app/components/NavBar';
import RenderIf from '@app/components/RenderIf';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import Forms from '@app/components/_Forms';
import ShimmerSkeleton from '@app/components/_ShimmerSkeleton';
import { formSchema } from '@app/_modules/customer_care/forms';
import ContactCmsContent from '@app/_modules/customer_care/ContactCmsContent';

const CustomerCareScreen = ({
  t,
  loading,
  loadingSubmit,
  showMessage,
  cmsPage,
  onSubmit,
}) => {
  return (
    <View style={{ flex: 1 }}>
      <NavBar
        center
        useWhite
        useClose
        titleBold
        title={t('customer_care.customerCare')}
        childrenRight={<CustomView width={'12%'} />}
      />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <RenderIf condition={loading}>
          <ShimmerSkeleton type={TYPE_SHIMMER_CUSTOMER_CARE} />
        </RenderIf>
        <RenderIf condition={!loading}>
          <ContactCmsContent htmlBlock={cmsPage} />
          {/* <CustomView marginVertical={20}>
            <CustomView marginHorizontal={20} marginBottom={10}>
              <Text bold center style={{ fontSize: 20, marginBottom: 5 }}>
                {t('customer_care.title')}
              </Text>
              <Text center large style={{ marginBottom: 10 }}>
                {t('customer_care.subtitle')}
              </Text>
            </CustomView>
            <Forms
              fields={formSchema}
              resetAfterSubmit={true}
              onSubmit={onSubmit}
              loading={loadingSubmit}
              buttonTitle={t('customer_care.button')}
              buttonLabelColor={Colors.WHITE}
              buttonStyle={{ backgroundColor: Colors.PRIMARY }}
              formContainerStyle={{ marginBottom: 0 }}
            />
            <RenderIf condition={showMessage}>
              <Text center color={Colors.GRAY_DARK}>
                {t('customer_care.success_message')}
              </Text>
            </RenderIf>
          </CustomView> */}
        </RenderIf>
      </ScrollView>
    </View>
  );
};

export default CustomerCareScreen;
