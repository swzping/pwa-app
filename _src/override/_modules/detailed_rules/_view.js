import React from 'react';
import {ScrollView, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import NavBar from '@app/components/NavBar';
import Text from '@app/components/Text';
import styles from './styles';
import RenderHTML from '@app/components/RenderHTML';

const DetailedRulesScreen = ({route}) => {
  const params = route?.params || {};
  const detail = params.detail || {};
  const from = detail?.event_time?.from_date || params.eventTimeFrom || '';
  const to = detail?.event_time?.to_date || params.eventTimeTo || '';
  const descriptionHTML = typeof detail?.description === 'string' ? detail.description : params.rulesText || '';
  const eventTimeText = from ? `${from}${to ? ' - ' + to : ''}` : '';

  return (
    <SafeAreaView style={styles.mainContainer}>
      <NavBar useBack useWhite useShadow={false} title="Detailed Rules" />
      <View style={styles.divider} />
      <ScrollView>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Event Time:</Text>
          <Text style={styles.dateText}>{eventTimeText || '-'}</Text>
          <Text style={styles.title}>Rules Details:</Text>
          <RenderHTML
            htmlBlock={descriptionHTML}
            tagsStyles={{
              ol: {paddingLeft: 18, marginTop: 6},
              li: {fontSize: 14, lineHeight: 20, color: '#1B1A19', marginBottom: 10,fontWeight: 500},
              p: {fontSize: 14, lineHeight: 20, color: '#1B1A19',fontWeight: 500},
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailedRulesScreen;
