import { View, Text, FlatList, TouchableOpacity, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native'
import React, { useCallback, useState, useRef } from 'react'
import tw from 'twrnc'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useAuth } from '../../../../Authorization/AuthContext'
import api from '../../../../Authorization/api'
import Icon from 'react-native-vector-icons/MaterialIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import styles from '../../../utils/InputStyle'
import ButtonStyles from '../../../utils/ButtonStyle'
import FilterDate from '../FilterDate'

const DashboardPaymentHistoryDetails = ({ selectedBranches }) => {
    const { loginBranchId } = useAuth()
    const navigation = useNavigation()
    const [filetrModal, setFilterModal] = useState(false);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [filter, setFilter] = useState('all')
    const [paymentHistoryList, setPaymentHistoryList] = useState([])
    const [loading, setLoading] = useState(false)
    const [summaryData, setSummaryData] = useState([])
    const isMounted = useRef(false)
    const lastApiCallRef = useRef('')


    useFocusEffect(
        useCallback(() => {
            const today = new Date().toISOString().split("T")[0];

            if (!fromDate || !toDate) {
                setFromDate(today);
                setToDate(today);
            }

            isMounted.current = true;

            return () => {
                isMounted.current = false;
            };
        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            if (fromDate && toDate) {
                getAllDashboardPaymentHistory(filter);
            }
        }, [filter, selectedBranches, fromDate, toDate])
    );

    const getAllDashboardPaymentHistory = async (selectedFilter) => {
        if (loading) return

        try {
            setLoading(true)

            const branchIds = selectedBranches?.length
                ? selectedBranches.map(item => item.BranchId).join(',')
                : loginBranchId

            // ✅ Build URL
            let url = `Dashboard/bill-advance?clientIdList=${branchIds}&fromDate=${fromDate}&toDate=${toDate}`
            if (selectedFilter !== 'all') {
                url += `&filter=${selectedFilter}`
            }

            // ✅ Prevent duplicate API calls
            if (lastApiCallRef.current === url) return
            lastApiCallRef.current = url

            console.log("API URL:", url)

            const response = await api.get(url)
            console.log("resp", response)
            setSummaryData(response?.data?.summary)
            if (isMounted.current) {
                setPaymentHistoryList(response?.data?.transactions || [])
            }

        } catch (error) {
            console.log("history error", error?.response)

            if (isMounted.current) {
                setPaymentHistoryList([])
            }
        } finally {
            if (isMounted.current) {
                setLoading(false)
            }
        }
    }


    const handleSearchFilter = (data) => {
        const formattedFrom = formatDateToAPI(data.fromDate);
        const formattedTo = formatDateToAPI(data.toDate);

        setFromDate(formattedFrom);
        setToDate(formattedTo);

        setFilterModal(false);
    };

    const formatDateToAPI = (date) => {
        const [day, month, year] = date.split("-");
        return `${year}-${month}-${day}`;
    };

    const renderFilterButton = (label, value, icon) => {
        const isActive = filter === value

        return (
            <TouchableOpacity
                onPress={() => setFilter(value)}
                style={tw`mr-3 px-4 py-2 rounded-lg flex-row items-center ${isActive ? 'bg-blue-600' : 'bg-gray-100'}`}
            >
                <Icon
                    name={icon}
                    size={16}
                    color={isActive ? '#FFFFFF' : '#6B7280'}
                    style={tw`mr-1`}
                />
                <Text style={tw`${isActive ? 'text-white' : 'text-gray-700'} text-sm font-medium`}>
                    {label}
                </Text>
            </TouchableOpacity>
        )
    }

    const getStatusColor = (type) => {
        return type?.toLowerCase() === 'credit' ? '#10B981' : '#EF4444'
    }

    const getStatusBgColor = (type) => {
        return type?.toLowerCase() === 'credit' ? '#D1FAE5' : '#FEE2E2'
    }

    const PaymentCard = ({ item }) => {
        const isCredit = item.type?.toLowerCase() === 'credit'
        const statusColor = getStatusColor(item.type)
        const bgColor = getStatusBgColor(item.type)

        return (
            <TouchableOpacity
                style={[styles.cardShadow]}
                activeOpacity={0.7}
                onPress={() => console.log('Transaction details:', item)}
            >
                <View style={tw`flex-row justify-between items-center border-b border-gray-100`}>
                    <View style={tw`flex-row items-center flex-1`}>
                        <View style={[tw`w-8 h-8 rounded-full items-center justify-center mr-3`, { backgroundColor: bgColor }]}>
                            <FontAwesome
                                name={isCredit ? "arrow-down" : "arrow-up"}
                                size={14}
                                color={statusColor}
                            />
                        </View>

                        <View style={tw`flex-1`}>
                            <Text style={[tw`text-md font-bold`, { color: statusColor }]}>
                                {isCredit ? '+ ' : '- '}₹{Math.abs(parseFloat(item.amount || 0)).toLocaleString('en-IN')}
                            </Text>

                            <Text style={tw`text-xs text-gray-500 mt-0.5`}>
                                {item.createdOn || 'N/A'}
                            </Text>
                        </View>
                    </View>

                    <View style={[tw`px-3 py-1 rounded-full`, { backgroundColor: bgColor }]}>
                        <Text style={[tw`text-xs font-semibold`, { color: statusColor }]}>
                            {item.type?.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={tw`p-3`}>
                    {item.description && (
                        <>
                            <Text style={tw`text-xs text-gray-500 mb-1`}>Description</Text>
                            <Text style={tw`text-sm text-gray-700`}>
                                {item.description}
                            </Text>
                        </>
                    )}
                </View>

                {item.balance && (
                    <View style={tw`bg-gray-50 px-3 py-2 border-t border-gray-100 flex-row justify-between`}>
                        <Text style={tw`text-xs text-gray-500`}>Available Balance</Text>
                        <Text style={tw`text-sm font-semibold text-gray-800`}>
                            ₹{parseFloat(item.balance).toLocaleString('en-IN')}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        )
    }

    const recentTransactions = paymentHistoryList.slice(0, 5)

    if (loading && paymentHistoryList.length === 0) {
        return (
            <View style={[styles.cardShadow, tw`p-3 bg-white rounded-lg m-2 items-center justify-center h-40`]}>
                <MaterialCommunityIcons name="loading" size={32} color="#3B82F6" />
                <Text style={tw`text-gray-500 mt-2`}>Loading transactions...</Text>
            </View>
        )
    }

    return (
        <ScrollView style={tw`flex-1 p-2`}>
            <View style={tw`flex`}>

                {/* Filters */}
                <View style={tw`flex-row justify-between mb-3`}>
                    {renderFilterButton('All', 'all', 'apps')}
                    {renderFilterButton('Credits', 'credit', 'arrow-downward')}
                    {renderFilterButton('Debits', 'debit', 'arrow-upward')}

                    <View style={tw`flex-row gap-2`}>
                        <TouchableOpacity
                            onPress={() => setFilterModal(true)}
                            style={[
                                tw`flex-row items-center px-3 py-2 rounded-lg`,
                                ButtonStyles.button,
                            ]}
                        >
                            <Icon name="calendar-month" size={18} color="#374151" />
                            <Text style={tw`ml-2 text-sm text-gray-700`}>Filter</Text>
                        </TouchableOpacity>

                    </View>
                </View>

                {/* List */}
                <FlatList
                    data={recentTransactions}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    scrollEnabled={false}
                    ListEmptyComponent={() => (
                        <View style={tw`items-center py-8`}>
                            <MaterialCommunityIcons name="credit-card-off" size={48} color="#D1D5DB" />
                            <Text style={tw`text-gray-400 mt-2 font-semibold`}>
                                No transactions found
                            </Text>
                        </View>
                    )}
                    renderItem={({ item }) => <PaymentCard item={item} />}
                />
            </View>
            <Modal visible={filetrModal} transparent animationType="slide">
                <TouchableWithoutFeedback onPress={() => setFilterModal(false)}>
                    <View style={tw`flex-1 justify-center items-center bg-black/60`}>
                        <TouchableWithoutFeedback>
                            <View style={tw`bg-white rounded-2xl w-[95%] overflow-hidden`}>
                                <FilterDate
                                    onClose={() => setFilterModal(false)}
                                    onSave={handleSearchFilter}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </ScrollView>
    )
}

export default DashboardPaymentHistoryDetails