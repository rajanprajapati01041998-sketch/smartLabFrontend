import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import api from './api';

const DashContext = createContext();

export const DashProvider = ({ children }) => {
    const [walletData, setWalletData] = useState(null);
    const [walletLoading, setWalletLoading] = useState(false);

    const [paymentHistoryList, setPaymentHistoryList] = useState([]);
    const [summaryData, setSummaryData] = useState(null);
    const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(false);

    const dashboardWallet = useCallback(async (ids) => {
        try {
            setWalletLoading(true);

            const response = await api.get(`Dashboard/wallet?clientIds=${ids}`);
            setWalletData(response?.data || null);

            return response;
        } catch (error) {
            console.log('Wallet Error:', error?.response?.data || error.message);
            return error?.response;
        } finally {
            setWalletLoading(false);
        }
    }, []);

    const getAllDashboardPaymentHistory = useCallback(async ({
        selectedFilter = 'all',
        selectedBranches = [],
        loginBranchId,
        fromDate,
        toDate,
    }) => {
        try {
            setPaymentHistoryLoading(true);

            const branchIds = selectedBranches?.length
                ? selectedBranches.map((item) => item.BranchId).join(',')
                : loginBranchId;

            let url = `Dashboard/bill-advance?clientIdList=${branchIds}&fromDate=${fromDate}&toDate=${toDate}`;

            if (selectedFilter !== 'all') {
                url += `&filter=${selectedFilter}`;
            }

            console.log('API URL:', url);

            const response = await api.get(url);

            setSummaryData(response?.data?.summary || null);
            setPaymentHistoryList(response?.data?.transactions || []);

            return response;
        } catch (error) {
            console.log('history error', error?.response || error);
            setSummaryData(null);
            setPaymentHistoryList([]);
            return error?.response;
        } finally {
            setPaymentHistoryLoading(false);
        }
    }, []);

    const value = useMemo(() => {
        return {
            walletData,
            setWalletData,
            walletLoading,
            dashboardWallet,

            paymentHistoryList,
            setPaymentHistoryList,
            summaryData,
            setSummaryData,
            paymentHistoryLoading,
            getAllDashboardPaymentHistory,
        };
    }, [
        walletData,
        walletLoading,
        dashboardWallet,
        paymentHistoryList,
        summaryData,
        paymentHistoryLoading,
        getAllDashboardPaymentHistory,
    ]);

    return (
        <DashContext.Provider
            value={value}
        >
            {children}
        </DashContext.Provider>
    );
};

export const useDash = () => {
    const context = useContext(DashContext);

    if (!context) {
        throw new Error('useDash must be used within DashProvider');
    }

    return context;
};
