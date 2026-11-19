import React from 'react';
import {Text} from 'react-native';
import {normalize} from '@app/styles/mixins';
import styles from '@app/_modules/cart/atoms/RewardPointsBlock/styles';

import CustomView from '@app/components/CustomView';
import Button from '@app/components/Button';
import Section from '@app/components/Section';
import RenderIf from '@app/components/RenderIf';
import {useTranslation} from 'react-i18next';

const RewardPointsBlock = ({
  customerRewardPoints,
  onButtonPress,
  rewardPointsLoading,
  aplliedRewardPoints,
}) => {
  const {t} = useTranslation();
  const editable = aplliedRewardPoints?.is_use_reward_points;
  if (!customerRewardPoints || customerRewardPoints?.balance <= 0) {
    return null;
  }
  return (
    <CustomView style={styles.rewardPointsWrapper}>
      <CustomView style={styles.rewardPointsTitle}>
        <Text style={styles.rewardPointsTitleText}>
          {t('cart.reward_points_block.view.rewardPoints')}
        </Text>
      </CustomView>
      <CustomView style={styles.rewardPointsContent}>
        <CustomView style={styles.rewardPointsBox}>
          <Section flex alignStart vmargin>
            <Text>{customerRewardPoints?.balance}</Text>
          </Section>
          <RenderIf condition={!editable}>
            <Button
              label={t('cart.reward_points_block.label.apply')}
              styleProp={{width: normalize(80)}}
              textStyleProp={{paddingVertical: normalize(3)}}
              onPress={() => onButtonPress(true)}
              loading={rewardPointsLoading}
            />
          </RenderIf>
          <RenderIf condition={editable}>
            <Button
              label={t('cart.reward_points_block.label.cancel')}
              styleProp={{width: normalize(80)}}
              textStyleProp={{paddingVertical: normalize(3)}}
              onPress={() => onButtonPress(false)}
              loading={rewardPointsLoading}
            />
          </RenderIf>
        </CustomView>
      </CustomView>
    </CustomView>
  );
};

export default React.memo(RewardPointsBlock);
