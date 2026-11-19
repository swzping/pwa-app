import React, {useMemo, useState, useCallback} from 'react';
import {Alert} from 'react-native';
import {useReactiveVar, useApolloClient} from '@apollo/client';
import {useFocusEffect} from '@react-navigation/native';
import {modules} from '@root/swift.config';
import {useTranslation} from 'react-i18next';
import {rxUserToken, rxUserType} from '@app/services/cache';
import {USER_GUEST} from '@app/helpers/Constants';
import ViewLogin from '@app/_modules/auth_signin/_controller';
import Views from '@app/_modules/account_milestone/_view';
import {
  GET_GAMIFICATION_CAMPAIGN,
  CLAIM_GAMIFICATION_VOUCHER,
} from '@app/_modules/account_milestone/services/schema';

/** 对比数据是否相同，用于避免相同数据时重复渲染 */
const isCampaignDataEqual = (a, b) => {
  if (!a && !b) {return true;}
  if (!a || !b) {return false;}
  try {
    return (
      JSON.stringify({
        campaign_progress_status: a.campaign_progress_status,
        is_reward_claimed: a.is_reward_claimed,
        banner_url: a.banner_url,
        tasks: a.tasks,
      }) ===
      JSON.stringify({
        campaign_progress_status: b.campaign_progress_status,
        is_reward_claimed: b.is_reward_claimed,
        banner_url: b.banner_url,
        tasks: b.tasks,
      })
    );
  } catch {
    return false;
  }
};

/** API icon -> Ionicons name mapping */
const ICON_MAP = {
  icon1: 'people-outline',
  icon2: 'create-outline',
  icon3: 'cart-outline',
  icon4: 'ticket-outline',
  icon5: 'share-social-outline',
};

const getIconName = icon => ICON_MAP[icon] || 'ellipse-outline';

/** 模块级缓存：组件卸载后仍保留，便于再次进入时对比 */
let lastCampaignCache = null;

const AccountMilestone = () => {
  if (!modules.account_milestone?.enable) {
    return null;
  }

  const {t} = useTranslation();
  const userToken = useReactiveVar(rxUserToken);
  const userType = useReactiveVar(rxUserType);
  const client = useApolloClient();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const fetchCampaign = useCallback(async () => {
    const isRefetch = !!lastCampaignCache;
    try {
      if (!isRefetch) {setLoading(true);}
      // 每次必走网络，拿到服务端最新数据后再与 lastCampaignCache 对比
      const res = await client.query({
        query: GET_GAMIFICATION_CAMPAIGN,
        fetchPolicy: 'network-only',
      });
      const campaign = res?.data?.gamificationCampaign;
      const prevCampaign = lastCampaignCache;
      const isEqual =
        !!campaign && !!prevCampaign && isCampaignDataEqual(campaign, prevCampaign);
      console.log('[AccountMilestone] fetchCampaign compare:', {
        hasPrevData: !!prevCampaign,
        hasNewData: !!campaign,
        isEqual,
        newProgress: campaign?.campaign_progress_status,
        prevProgress: prevCampaign?.campaign_progress_status,
      });
      if (isEqual) {
        return;
      }
      lastCampaignCache = campaign;
      setData(res);
    } catch (err) {
      console.log('[err] GetGamificationCampaign', err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [client]);

  const handleClaimVoucher = useCallback(async () => {
    if (claiming) {return false;}
    try {
      setClaiming(true);
      const res = await client.mutate({
        mutation: CLAIM_GAMIFICATION_VOUCHER,
      });
      const claimResult = res?.data?.claimGamificationVoucher;
      if (claimResult?.success) {
        await fetchCampaign();
        return true;
      }
      Alert.alert('Claim Failed', claimResult?.message || 'Please try again.');
      return false;
    } catch (err) {
      console.log('[err] ClaimGamificationVoucher', err);
      Alert.alert('Claim Failed', 'Please try again.');
      return false;
    } finally {
      setClaiming(false);
    }
  }, [claiming, client, fetchCampaign]);

  // 每次进入页面（获得焦点）都请求一次；与 useEffect 二选一避免首屏双请求
  useFocusEffect(
    useCallback(() => {
      fetchCampaign();
    }, [fetchCampaign]),
  );

  const {progress, tasks, bannerUrl, goodsLogoList, isRewardClaimed} = useMemo(() => {
    const campaign = data?.data?.gamificationCampaign ?? lastCampaignCache;
    if (!campaign) {
      return {
        progress: 0,
        tasks: [],
        bannerUrl: '',
        goodsLogoList: [],
        isRewardClaimed: false,
      };
    }
    const progressVal = Number(campaign.campaign_progress_status) ?? 0;
    const tasksMapped = (campaign.tasks || []).map((task, index) => ({
      id: `task-${index + 1}`,
      title: task.label,
      status: task.status === 'completed' ? 'done' : 'todo',
      icon: task.icon,
      actionLink: task.action_link,
      taskType: task.task_type != null ? String(task.task_type).trim() : '',
    }));
    const bannerUrlVal =
      typeof campaign.banner_url === 'string' ? campaign.banner_url.trim() : '';
    const goodsLogoListVal = campaign.goods_logo_list || [];
    return {
      progress: progressVal,
      tasks: tasksMapped,
      bannerUrl: bannerUrlVal,
      goodsLogoList: goodsLogoListVal,
      isRewardClaimed: !!campaign.is_reward_claimed,
    };
  }, [data]);

  // 未登录时复用登录页
  if (!userToken || userType === USER_GUEST) {
    return <ViewLogin />;
  }

  return (
    <Views
      t={t}
      progress={progress}
      tasks={tasks}
      bannerUrl={bannerUrl}
      goodsLogoList={goodsLogoList}
      isRewardClaimed={isRewardClaimed}
      loading={loading}
      claiming={claiming}
      onRefetch={fetchCampaign}
      onClaimVoucher={handleClaimVoucher}
      getIconName={getIconName}
    />
  );
};

export default AccountMilestone;

