import React from 'react';
import { FlatList, View } from 'react-native';
import NavBar from '@app/components/NavBar';
import CustomView from '@app/components/CustomView/index';
import Text from '@app/components/Text/index';
import styles from '@app/_modules/account_deletion/styles';
import { Colors } from '@app/styles';
import { Button } from 'react-native-paper';

const RenderItem = ({ index, item }) => {
  return (
    <View style={styles.itemContainer}>
      <Text bold style={{ width: '8%' }}>{`${index + 1}. `}</Text>
      <Text style={{ width: '92%' }}>{item.label}</Text>
    </View>
  );
};

function Views({ t, onDelete, loading }) {
  const accDeletionTerms = [
    { label: t('account_deletion.itemLabel1') },
    { label: t('account_deletion.itemLabel2') },
    { label: t('account_deletion.itemLabel3') },
    { label: t('account_deletion.itemLabel4') },
    { label: t('account_deletion.itemLabel5') },
  ];

  return (
    <View style={styles.container}>
      <NavBar
        useWhite
        useBack
        center
        titleBold
        childrenRight={<CustomView width={'12%'} />}
        title={t('account_deletion.title')}
      />
      <CustomView flex>
        <CustomView flexNumber={0.85}>
          <FlatList
            ListHeaderComponent={
              <Text bold xlarge center style={styles.title}>
                {t('account_deletion.label')}
              </Text>
            }
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={styles.flatList}
            data={accDeletionTerms}
            renderItem={RenderItem}
          />
        </CustomView>
        <CustomView flexNumber={0.15} horizontalCenter>
          <Button
            color={Colors.WHITE}
            onPress={onDelete}
            loading={loading}
            disabled={loading}
            style={[styles.centerButton]}
            labelStyle={{ fontSize: 12, fontWeight: 'bold' }}>
            {t('deleteAccount.title')}
          </Button>
        </CustomView>
      </CustomView>
    </View>
  );
}
export default Views;
