import { View, Text, FlatList, TouchableOpacity, ScrollView, Modal, TouchableWithoutFeedback, Animated } from 'react-native'
import React, { useCallback, useState, useRef, useEffect } from 'react'
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
    const [filterModal, setFilterModal] = useState(false);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [filter, setFilter] = useState('all')
    const [paymentHistoryList, setPaymentHistoryList] = useState([])
    const [loading, setLoading] = useState(false)
    const [summaryData, setSummaryData] = useState([])
    const [expandedId, setExpandedId] = useState(null)
    const isMounted = useRef(false)
    const lastApiCallRef = useRef('')
    const scrollY = useRef(new Animated.Value(0)).current
    const [isFilterSticky, setIsFilterSticky] = useState(false)

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

            let url = `Dashboard/bill-advance?clientIdList=${branchIds}&fromDate=${fromDate}&toDate=${toDate}`
            if (selectedFilter !== 'all') {
                url += `&filter=${selectedFilter}`
            }

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

    const toggleDescription = (id) => {
        setExpandedId(expandedId === id ? null : id)
    }

    const renderFilterButton = (label, value, icon) => {
        const isActive = filter === value

        return (
            <TouchableOpacity
                onPress={() => setFilter(value)}
                style={tw` px-4 py-2.5 rounded-xl flex-row items-center ${isActive ? 'bg-blue-600 shadow-sm' : 'bg-gray-50 border border-gray-200'}`}
                activeOpacity={0.7}
            >
                <Icon
                    name={icon}
                    size={18}
                    color={isActive ? '#FFFFFF' : '#6B7280'}
                    style={tw`mr-1.5`}
                />
                <Text style={tw`${isActive ? 'text-white font-semibold' : 'text-gray-700 font-medium'} text-sm`}>
                    {label}
                </Text>
                {isActive && (
                    <View style={tw`ml-2 bg-white/20 rounded-full px-1.5`}>
                        <Text style={tw`text-white text-xs font-bold`}>
                            {value === 'all' ? paymentHistoryList.length :
                                paymentHistoryList.filter(item => item.type?.toLowerCase() === value).length}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        )
    }

    const getStatusColor = (type) => {
        return type?.toLowerCase() === 'credit' ? '#10B981' : '#EF4444'
    }

    const getStatusBgColor = (type) => {
        return type?.toLowerCase() === 'credit' ? '#D1FAE5' : '#FEE2E2'
    }

    const getStatusIcon = (type) => {
        return type?.toLowerCase() === 'credit' ? 'arrow-downward' : 'arrow-upward'
    }

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.abs(parseFloat(amount || 0)))
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const PaymentCard = ({ item, index }) => {
        const isCredit = item.type?.toLowerCase() === 'credit'
        const statusColor = getStatusColor(item.type)
        const bgColor = getStatusBgColor(item.type)
        const isExpanded = expandedId === item.id || expandedId === index
        const hasDescription = item.description && item.description.trim().length > 0

        return (
            <View style={tw``}>
                <TouchableOpacity
                    style={[
                        styles.cardShadow,
                        tw`bg-white rounded-2xl overflow-hidden border border-gray-100`,
                        isExpanded && tw`border-blue-200 shadow-lg`
                    ]}
                    activeOpacity={0.7}
                // onPress={() => console.log('Transaction details:', item)}
                >
                    {/* Main Transaction Row */}
                    <View style={tw`py-1`}>
                        <View style={tw`flex-row justify-between items-start`}>
                            <View style={tw`flex-row flex-1 items-start`}>
                                <View style={[tw`w-7 h-7 rounded-full items-center justify-center mr-3`, { backgroundColor: bgColor }]}>
                                    <Icon
                                        name={getStatusIcon(item.type)}
                                        size={14}
                                        color={statusColor}
                                    />
                                </View>

                                <View style={tw`flex-1`}>
                                    <View style={tw`flex-row items-baseline justify-between`}>
                                        <Text style={[tw`text-md font-bold`, { color: statusColor }]}>
                                            {isCredit ? '+ ' : '- '}{formatAmount(item.amount)}
                                        </Text>
                                        <View style={[tw`px-2.5 py-1 rounded-full`, { backgroundColor: bgColor }]}>
                                            <Text style={[tw`text-xs font-semibold`, { color: statusColor }]}>
                                                {item.type?.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={tw`text-xs text-gray-400 `}>
                                        {item.createdOn}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Description with Accordion */}
                        {hasDescription && (
                            <View style={tw`mt-1 pt-1 border-t border-gray-100`}>
                                <TouchableOpacity
                                    onPress={() => toggleDescription(item.id || index)}
                                    style={tw`flex-row justify-between items-center`}
                                    activeOpacity={0.7}
                                >
                                    <View style={tw`flex-row items-center`}>
                                        <Icon name="description" size={14} color="#6B7280" />
                                        <Text style={tw`text-xs font-medium text-gray-600 ml-1.5`}>
                                            Description
                                        </Text>
                                    </View>
                                    <Icon
                                        name={isExpanded ? "expand-less" : "expand-more"}
                                        size={20}
                                        color="#6B7280"
                                    />
                                </TouchableOpacity>

                                {isExpanded && (
                                    <Animated.View style={tw`mt-2`}>
                                        <Text style={tw`text-sm text-gray-700 leading-5`}>
                                            {item.description}
                                        </Text>
                                    </Animated.View>
                                )}
                            </View>
                        )}

                        {/* Balance */}
                        {item.balance && (
                            <View style={tw`mt-3 pt-3 border-t border-gray-100 flex-row justify-between items-center`}>
                                <Text style={tw`text-xs text-gray-500`}>Available Balance</Text>
                                <Text style={tw`text-base font-bold text-gray-800`}>
                                    {formatAmount(item.balance)}
                                </Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    // Filter Header Component with Sticky Effect
    const FilterHeader = () => (
        <Animated.View style={[
            tw`bg-white`,
            isFilterSticky && tw`shadow-md border-b border-gray-100`,
            { paddingTop: isFilterSticky ? 8 : 0, paddingBottom: isFilterSticky ? 8 : 0 }
        ]}>
            {/* Summary Cards */}
            {summaryData && summaryData.length > 0 && (
                <View style={tw`flex-row mb-4 gap-1`}>
                    <View style={tw`flex-1 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-3`}>
                        <Text style={tw`text-xs text-blue-600 font-medium mb-1`}>Total Credits</Text>
                        <Text style={tw`text-lg font-bold text-blue-700`}>
                            {formatAmount(summaryData.find(s => s.type === 'credit')?.total || 0)}
                        </Text>
                    </View>
                    <View style={tw`flex-1 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-3`}>
                        <Text style={tw`text-xs text-red-600 font-medium mb-1`}>Total Debits</Text>
                        <Text style={tw`text-lg font-bold text-red-700`}>
                            {formatAmount(summaryData.find(s => s.type === 'debit')?.total || 0)}
                        </Text>
                    </View>
                </View>
            )}

            {/* Filter Buttons */}
            <View style={tw`mb-3`}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={tw`gap-0.5`}
                >
                    {renderFilterButton('All', 'all', 'apps')}
                    {renderFilterButton('Credits', 'credit', 'arrow-downward')}
                    {renderFilterButton('Debits', 'debit', 'arrow-upward')}

                    <TouchableOpacity
                        onPress={() => setFilterModal(true)}
                        style={[
                            tw`flex-row items-center gap-2  py-2 rounded-md border border-gray-200 bg-gray-50`,
                            ButtonStyles.button,
                        ]}
                    >
                        <Icon name="calendar-month" size={18} color="#374151" />
                        <Text style={tw`ml-2 text-sm font-medium text-gray-700`}>
                            filter
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
            <Text>
                {fromDate && toDate
                    ? `${formatDateShort(fromDate)} - ${formatDateShort(toDate)}`
                    : ''}
            </Text>
        </Animated.View>
    )

    const formatDateShort = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    }

    const recentTransactions = paymentHistoryList

    // Handle scroll to detect sticky
    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
            useNativeDriver: false,
            listener: (event) => {
                const offsetY = event.nativeEvent.contentOffset.y
                setIsFilterSticky(offsetY > 100)
            }
        }
    )

    if (loading && paymentHistoryList.length === 0) {
        return (
            <View style={[styles.cardShadow, tw`p-8 bg-white rounded-2xl m-3 items-center justify-center`]}>
                <MaterialCommunityIcons name="loading" size={40} color="#3B82F6" animate />
                <Text style={tw`text-gray-500 mt-3 font-medium`}>Loading transactions...</Text>
            </View>
        )
    }

    return (
        <View style={tw`flex-1 bg-gray-50`}>
            <Animated.FlatList
                data={recentTransactions}
                keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={tw`p-3 pt-0`}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                ListHeaderComponent={() => (
                    <View style={tw`pt-3`}>
                        <FilterHeader />
                    </View>
                )}
                stickyHeaderIndices={[0]}
                ListEmptyComponent={() => (
                    <View style={tw`items-center py-16 bg-white rounded-2xl mt-3`}>
                        <MaterialCommunityIcons name="credit-card-off" size={64} color="#E5E7EB" />
                        <Text style={tw`text-gray-400 mt-3 font-semibold text-base`}>
                            No transactions found
                        </Text>
                        <Text style={tw`text-gray-300 text-sm mt-1`}>
                            Try changing filters or date range
                        </Text>
                    </View>
                )}
                renderItem={({ item, index }) => <PaymentCard item={item} index={index} />}
            />

            {/* Filter Modal */}
            <Modal visible={filterModal} transparent animationType="slide">
                <TouchableWithoutFeedback onPress={() => setFilterModal(false)}>
                    <View style={tw`flex-1 justify-end bg-black/60`}>
                        <TouchableWithoutFeedback>
                            <View style={tw`bg-white rounded-t-3xl overflow-hidden max-h-[90%]`}>
                                <View style={tw`p-4 border-b border-gray-100 flex-row justify-between items-center`}>
                                    <Text style={tw`text-lg font-bold text-gray-800`}>Select Date Range</Text>
                                    <TouchableOpacity
                                        onPress={() => setFilterModal(false)}
                                        style={tw`w-8 h-8 rounded-full bg-gray-100 items-center justify-center`}
                                    >
                                        <Icon name="close" size={20} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>
                                <FilterDate
                                    onClose={() => setFilterModal(false)}
                                    onSave={handleSearchFilter}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    )
}

export default DashboardPaymentHistoryDetails