import React, {useEffect, useState} from 'react';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {GET_STORE_CREDIT_TRANSACTIONS} from '@app/_modules/account_storecredit/services/schema';

import Views from '@app/_modules/account_storecredit/_view';
import {modules} from '@root/swift.config';
import {useTranslation} from 'react-i18next';

const StoreCredit = () => {
  if (!modules.account_storecredit.enable) {
    return null;
  }

  const [storeCreditTransactions, setStoreCreditTransactions] = useState([]);
  const [currentBalance, setCurrentBalance] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [noMoreData, setNoMoreData] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [queryVariables, setQueryVariables] = useState({
    pageSize: 6,
    currentPage: 1,
  });
  const {data: storeCreditTransactionsData, loading} = useCustomQuery({
    schema: GET_STORE_CREDIT_TRANSACTIONS,
    useInitData: true,
    variables: queryVariables,
    opts: {fetchPolicy: 'no-cache', context: {method: 'POST'}},
  });
  const {t} = useTranslation();

  useEffect(() => {
    if (storeCreditTransactionsData && storeCreditTransactionsData?.data) {
      const {currency, value} =
        storeCreditTransactionsData?.data.customer.store_credit.current_balance;
      setCurrentBalance({
        currency,
        value,
      });

      const {items, total_count} =
        storeCreditTransactionsData?.data.customer.store_credit
          .transaction_history;
      const currentData = storeCreditTransactions;
      const newData = [...currentData, ...items];
      setStoreCreditTransactions(newData);
      setTotalCount(total_count);
    }
  }, [storeCreditTransactionsData]);

  const onLoadMore = () => {
    if (!loading) {
      if (storeCreditTransactions.length !== totalCount) {
        const newPage = currentPage + 1;
        setCurrentPage(newPage);

        const queryVariablesTmp = {
          ...queryVariables,
          currentPage: newPage,
        };
        setQueryVariables(queryVariablesTmp);
      } else {
        setNoMoreData(true);
      }
    }
  };

  const onRefresh = async () => {
    await setRefreshing(true);
    await setStoreCreditTransactions([]);
    const queryVariablesTmp = {
      ...queryVariables,
      currentPage: 1,
    };
    await setCurrentPage(1);
    await setNoMoreData(false);
    await setQueryVariables(queryVariablesTmp);
    await setRefreshing(false);
  };

  return (
    <Views
      t={t}
      storeCreditTransactions={storeCreditTransactions}
      currentBalance={currentBalance}
      onLoadMore={onLoadMore}
      loading={loading}
      noMoreData={noMoreData}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

export default StoreCredit;
