
import {useState} from 'react';

import useCustomMutation from '@app/hooks/useCustomMutation';
import {REDEEM_OFFLINE_VOUCHER} from '@app/services/queries/couponWallet';

export const useOfflineVoucherStatus = () => {
    const {onRefetchData: redeemOfflineVoucher, loading: redeemLoading} = useCustomMutation({
        schema: REDEEM_OFFLINE_VOUCHER,
    });

    const [offlineVoucherConfirmModalVisible, setOfflineVoucherConfirmModalVisible] = useState(false);
    const closeOfflineVoucherConfirmModal = () => {
        setOfflineVoucherConfirmModalVisible(false);
    };

    const onConfirmOfflineVoucher = async (uid) => {
        if(uid) {
            await redeemOfflineVoucher({params: {uid}});
        }
    };
    return {
        offlineVoucherConfirmModalVisible,
        redeemLoading,
        setOfflineVoucherConfirmModalVisible,
        closeOfflineVoucherConfirmModal,
        onConfirmOfflineVoucher,
    };
};
