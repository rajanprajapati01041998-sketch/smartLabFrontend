import { Dimensions, View, Text, TouchableOpacity, Modal, FlatList, TouchableWithoutFeedback, ScrollView, TextInput, Image, RefreshControl, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { useAuth } from '../../../../Authorization/AuthContext'
import { useTheme } from '../../../../Authorization/ThemeContext'
import { getThemeStyles } from '../../../utils/themeStyles'
import FilterDate from '../FilterDate'
import tw from 'twrnc'
import api from '../../../../Authorization/api'
import Barcode from '@kichiyaki/react-native-barcode-generator';
const { width } = Dimensions.get('window');


const DashboardPathologyViewList = ({ route }) => {
    const { loginBranchId, allBranchInfo, fromDateAuth, toDateAuth } = useAuth()
    const { theme } = useTheme()
    const themed = getThemeStyles(theme)
    const [branchModal, setBranchModal] = useState(false)
    const [filterModal, setFilterModal] = useState(false)
    const [selectedBranches, setSelectedBranches] = useState([])
    const [patientData, setPatientData] = useState([])
    const [branchSearch, setBranchSearch] = useState('')
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMoreData, setHasMoreData] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)

    // State for date filtering - initialize with auth dates
    const [searchData, setSearchData] = useState({
        fromDate: fromDateAuth || new Date().toISOString().split('T')[0],
        toDate: toDateAuth || new Date().toISOString().split('T')[0]
    })

    // Track if custom dates are being used
    const [isCustomDate, setIsCustomDate] = useState(false)

    // Function to format date to YYYY-MM-DD
    const formatToYYYYMMDD = (date) => {
        if (!date) return ''

        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date
        }

        if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
            const [day, month, year] = date.split('-')
            return `${year}-${month}-${day}`
        }

        if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
            const [day, month, year] = date.split('/')
            return `${year}-${month}-${day}`
        }

        if (date instanceof Date) {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
        }

        try {
            const parsedDate = new Date(date)
            if (!isNaN(parsedDate.getTime())) {
                const year = parsedDate.getFullYear()
                const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
                const day = String(parsedDate.getDate()).padStart(2, '0')
                return `${year}-${month}-${day}`
            }
        } catch (e) {
            console.error('Date parsing error:', e)
        }

        return date
    }

    // Select/Deselect branch
    const toggleBranchSelection = (branch) => {
        setSelectedBranches(prev => {
            const isSelected = prev.some(b => b.branchId === branch.branchId)
            if (isSelected) {
                return prev.filter(b => b.branchId !== branch.branchId)
            } else {
                return [...prev, branch]
            }
        })
    }

    // Get branch IDs string for API
    const getBranchIdString = () => {
        if (selectedBranches.length === 0) return ''
        return selectedBranches.map(b => b.branchId).join(',')
    }

    // Get the actual dates to use for API call
    const getApiDates = () => {
        if (isCustomDate) {
            return {
                fromDate: searchData.fromDate,
                toDate: searchData.toDate
            }
        } else {
            return {
                fromDate: fromDateAuth || searchData.fromDate,
                toDate: toDateAuth || searchData.toDate
            }
        }
    }

    // Reset pagination when filters change
    const resetPagination = () => {
        setCurrentPage(1)
        setHasMoreData(true)
        setPatientData([])
    }

    // Fetch patient data from API with pagination
    const fetchPatientData = async (page = 1, isLoadMore = false) => {
        const branchIds = getBranchIdString()
        if (!branchIds) {
            console.log('No branches selected')
            return
        }

        if (isLoadMore) {
            setLoadingMore(true)
        } else {
            setLoading(true)
        }

        try {
            const { fromDate, toDate } = getApiDates()

            const response = await api.get(`Patient/dashboard-pathology-view`, {
                params: {
                    StatusId: route?.params.statusId,
                    ClientIdList: branchIds,
                    FromDate: fromDate,
                    ToDate: toDate,
                    PageNumber: page,
                    PageSize: 20
                }
            })
            console.log("list", response)

            if (response.data && response.data.success) {
                const newData = response.data.data || []
                const totalCount = response.data.totalCount || 0
                const currentDataCount = isLoadMore ? patientData.length + newData.length : newData.length

                setHasMoreData(currentDataCount < totalCount)

                if (isLoadMore) {
                    setPatientData(prevData => [...prevData, ...newData])
                } else {
                    setPatientData(newData)
                }
            } else {
                if (!isLoadMore) setPatientData([])
                setHasMoreData(false)
            }
        } catch (error) {
            console.error('Error fetching patient data:', error)
            if (!isLoadMore) setPatientData([])
            setHasMoreData(false)
        } finally {
            if (isLoadMore) {
                setLoadingMore(false)
            } else {
                setLoading(false)
            }
        }
    }

    // Load more data when reaching bottom
    const loadMoreData = () => {
        if (!loadingMore && hasMoreData && !loading && !refreshing) {
            const nextPage = currentPage + 1
            setCurrentPage(nextPage)
            fetchPatientData(nextPage, true)
        }
    }

    // Pull-to-refresh handler
    const onRefresh = async () => {
        setRefreshing(true)
        resetPagination()
        setCurrentPage(1)
        await fetchPatientData(1, false)
        setRefreshing(false)
    }

    // Handle date filter save - sets custom dates
    const handleSearchFilter = (fromDateOrObject, toDate) => {
        let formattedFromDate = ''
        let formattedToDate = ''

        if (fromDateOrObject && typeof fromDateOrObject === 'object') {
            formattedFromDate = formatToYYYYMMDD(fromDateOrObject.fromDate || searchData.fromDate)
            formattedToDate = formatToYYYYMMDD(fromDateOrObject.toDate || searchData.toDate)
        } else if (fromDateOrObject && toDate) {
            formattedFromDate = formatToYYYYMMDD(fromDateOrObject)
            formattedToDate = formatToYYYYMMDD(toDate)
        } else if (fromDateOrObject && typeof fromDateOrObject === 'string') {
            formattedFromDate = formatToYYYYMMDD(fromDateOrObject)
            formattedToDate = formatToYYYYMMDD(fromDateOrObject)
        }

        // Set custom dates and mark as custom
        setSearchData({
            fromDate: formattedFromDate,
            toDate: formattedToDate
        })
        setIsCustomDate(true)
        resetPagination()
        setFilterModal(false)
    }

    // Reset to auth dates
    const resetToAuthDates = () => {
        setSearchData({
            fromDate: fromDateAuth || new Date().toISOString().split('T')[0],
            toDate: toDateAuth || new Date().toISOString().split('T')[0]
        })
        setIsCustomDate(false)
        resetPagination()
    }

    // Fetch data when selected branches or dates change
    useEffect(() => {
        if (selectedBranches.length > 0) {
            resetPagination()
            fetchPatientData(1, false)
        }
    }, [selectedBranches, searchData.fromDate, searchData.toDate, isCustomDate])

    // Effect to update local dates when auth dates change (only if not using custom dates)
    useEffect(() => {
        if (!isCustomDate && fromDateAuth && toDateAuth) {
            setSearchData({
                fromDate: fromDateAuth,
                toDate: toDateAuth
            })
        }
    }, [fromDateAuth, toDateAuth, isCustomDate])

    // Auto-select all branches on component mount
    useEffect(() => {
        if (allBranchInfo && allBranchInfo.length > 0) {
            setSelectedBranches(allBranchInfo)
        }
    }, [allBranchInfo])

    // Format currency amount
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    // Helper to display current date range
    const getDisplayDateRange = () => {
        if (isCustomDate) {
            return `${searchData.fromDate} → ${searchData.toDate}`
        }
        return `${fromDateAuth || searchData.fromDate} → ${toDateAuth || searchData.toDate}`
    }

    // Render footer for bottom loading indicator
    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={tw`py-4 justify-center items-center`}>
                <ActivityIndicator size="small" color={themed.iconColor} />
                <Text style={[themed.inputText, tw`text-xs mt-2`]}>Loading more...</Text>
            </View>
        );
    };

    // Render patient item based on actual API response structure
    const renderPatientItem = ({ item, index }) => (
        <View style={[themed.border_b, tw`p-4 mb-2 rounded-lg`, themed.card]}>
            {/* Header Section with Patient Info and Expand/Collapse Button */}
            <View style={tw`flex-row justify-between items-start mb-2`}>
                <View style={tw`flex-1`}>
                    <View style={tw`flex-row justify-start gap-2 items-center`}>
                        <Text style={[themed.inputText, tw`font-semibold text-md`]}>{item.PatientName || 'N/A'}</Text>
                        <Text style={[themed.labelText, tw`font-semibold `]}>({item?.AgeSex || ''})</Text>
                    </View>
                </View>

            </View>

            {/* UHID and Registration Info */}
            <View style={tw`flex-row justify-between mb-2`}>
                <Text style={[themed.labelTextXs, themed.border, tw`  px-2 py-1 `]}>
                    UHID: {item.UHID || 'N/A'}
                </Text>
                <Text style={[themed.labelTextXs, themed.border, tw`  px-2 py-1 `]}>
                    Bill: {item.BillDate || 'N/A'}
                </Text>
            </View>

            {/* Branch/Center */}
            <View style={tw`flex-row items-center mb-2 justify-start`}>
                <View style={tw`flex-row`}>
                    <Icon name="store" size={14} color={themed.iconColor} style={tw`mt-0.5`} />
                    <Text style={[themed.labelText, tw`text-sm ml-1`]}>{item.clientName || 'N/A'}</Text>
                </View>
                <View>
                    <Text style={[themed.labelText, tw`text-sm ml-1`]}>({item.LabNo || 'N/A'})</Text>
                </View>
            </View>

            {/* Service Name - Always Visible */}
            <View style={tw`mb-2`}>
                <Text style={[themed.clientNamexs]}> Service:{item?.Investigation || ''} </Text>
            </View>
            <View style={tw`flex-row justify-between items-center`}>
                {item.Barcode && (
                    <View style={tw`mt-1`}>
                        <Barcode
                            value={String(item.Barcode).trim()}
                            format="CODE128"
                            width={1.2}
                            maxWidth={Math.min(240, width - 160)}
                            height={24}
                            lineColor={theme === 'dark' ? '#e3e7eb' : '#848994'}
                            background="transparent"
                            text={String(item.Barcode).trim()}
                            textStyle={[themed.labelTextXs]}
                            style={{ alignSelf: 'flex-start' }}
                        />
                    </View>
                )}
                <View>

                    <Text style={tw`text-gray-400 text-xs`}>
                        Created by: {item.CreatedBy || 'N/A'}
                    </Text>
                    <Text style={tw`text-gray-400 text-md font-bold text-end`}>
                        {item.SubCategoryName || 'N/A'}
                    </Text>
                </View>

            </View>

            {/* Expandable Content */}

        </View>
    )

    // Render branch selection modal
    const renderBranchModal = () => (
        <Modal visible={branchModal} transparent animationType="slide">
            <TouchableWithoutFeedback onPress={() => setBranchModal(false)}>
                <View style={tw`flex-1 justify-end items-center bg-black/60`}>
                    <TouchableWithoutFeedback>
                        <View style={[themed.modalContainer, tw`w-full h-[60%] rounded-lg overflow-hidden`]}>
                            <View style={[tw`p-4 flex-row justify-between items-center`]}>
                                <Text style={[themed.modalHeaderTitle]}>Select Branches</Text>
                                <TouchableOpacity onPress={() => setBranchModal(false)}>
                                    <MaterialIcons name="close" size={24} color={themed.iconColor} />
                                </TouchableOpacity>
                            </View>
                            <View style={[themed.searchContainer, tw`mx-2`]}>
                                <View style={themed.searchBox}>
                                    <MaterialIcons name="search" size={20} color={themed.iconColor} />
                                    <TextInput
                                        value={branchSearch}
                                        onChangeText={setBranchSearch}
                                        placeholder="Search Branch"
                                        placeholderTextColor={themed.inputPlaceholder}
                                        style={themed.searchInput}
                                    />
                                </View>
                            </View>

                            <View style={tw`p-4`}>
                                <TouchableOpacity
                                    onPress={() =>
                                        setSelectedBranches(
                                            selectedBranches.length === allBranchInfo.length ? [] : [...allBranchInfo]
                                        )
                                    }
                                    style={tw`flex-row items-center`}
                                >
                                    <MaterialIcons
                                        name={selectedBranches.length === allBranchInfo.length ? 'check-box' : 'check-box-outline-blank'}
                                        size={24} color="#2563EB" />

                                    <Text style={[themed.inputText, tw`ml-2 font-medium`]}>
                                        Select All
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={tw`flex-1`}>
                                {allBranchInfo?.map((branch) => (
                                    <TouchableOpacity
                                        key={branch.branchId}
                                        onPress={() => toggleBranchSelection(branch)}
                                        style={[themed.border, tw`p-4 flex-row items-center m-2`]}
                                    >
                                        <View style={tw`w-6 h-6 rounded border border-gray-400 mr-3 justify-center items-center ${selectedBranches.some(b => b.branchId === branch.branchId) ? 'bg-blue-500' : 'bg-white'}`}>
                                            {selectedBranches.some(b => b.branchId === branch.branchId) && (
                                                <MaterialIcons name="check" size={16} color="white" />
                                            )}
                                        </View>
                                        <View style={tw`flex-1`}>
                                            <Text style={[themed.inputText, tw`font-medium`]}>{branch.branchName}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )

    // Render date filter modal
    const renderFilterModal = () => (
        <Modal visible={filterModal} transparent animationType="slide">
            <TouchableWithoutFeedback onPress={() => setFilterModal(false)}>
                <View style={tw`flex-1 justify-center items-center bg-black/60`}>
                    <TouchableWithoutFeedback>
                        <View style={[themed.modalContainer, tw`w-[95%] rounded-lg overflow-hidden`]}>
                            <FilterDate
                                onClose={() => setFilterModal(false)}
                                onSave={handleSearchFilter}
                                initialFromDate={searchData.fromDate}
                                initialToDate={searchData.toDate}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )

    return (
        <View style={[themed.childScreen2, tw`flex-1 p-4 `]}>
            {/* Filter Section */}
            <View style={[themed.border_b, tw`flex-col justify-between items-start pb-3 mb-3`]}>
                <View style={tw`flex-row w-full`}>
                    <View style={tw`flex-1`}>
                        <TouchableOpacity
                            style={[
                                themed.filterButton,
                                tw`flex-row items-center justify-between px-3 py-2 rounded-lg`
                            ]}
                            onPress={() => setBranchModal(true)}
                        >
                            <View style={tw`flex-row items-center flex-1`}>
                                <Icon name="store" size={18} color={themed.filterButtonIcon} />
                                <Text style={[themed.filterButtonText, tw`ml-2 flex-1`]} numberOfLines={1}>
                                    {selectedBranches.length === 0
                                        ? 'Select Branches'
                                        : selectedBranches.length === 1
                                            ? selectedBranches[0].branchName
                                            : `${selectedBranches.length} Branches Selected`}
                                </Text>
                            </View>
                            <MaterialIcons name="arrow-drop-down" size={24} color={themed.filterButtonIcon} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[themed.filterButton, tw`ml-2 px-3 py-2 rounded-lg flex-row items-center`]}
                        onPress={() => setFilterModal(true)}
                    >
                        <MaterialIcons name="calendar-month" size={18} color={themed.filterButtonIcon} />
                        <Text style={[themed.filterButtonText, tw`ml-1`]}>Date</Text>
                    </TouchableOpacity>

                    {/* Reset button - only show when using custom dates */}
                    {isCustomDate && (
                        <TouchableOpacity
                            style={[themed.filterButton, tw`ml-2 px-3 py-2 rounded-lg flex-row items-center`]}
                            onPress={resetToAuthDates}
                        >
                            <MaterialIcons name="refresh" size={18} color={themed.filterButtonIcon} />
                            <Text style={[themed.filterButtonText, tw`ml-1`]}>Reset</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={tw`flex-row mt-2 justify-start items-center`}>
                    <Icon name="calendar" size={14} color="#9ca3af" />
                    <Text style={[themed.dateText, tw`ml-1`]}>
                        {getDisplayDateRange()}
                    </Text>
                    {isCustomDate && (
                        <View style={tw`ml-2 bg-blue-600/40 px-2 py-0.5 rounded-full border border-blue-600`}>
                            <Text style={tw`text-blue-400 text-xs`}>Custom</Text>
                        </View>
                    )}
                    <View
                        style={tw`ml-2 bg-green-600/40 w-6 h-6 rounded-full items-center justify-center`}
                    >
                        <Text style={tw`text-green-400 text-xs font-bold`}>
                            {patientData.length}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Loading Indicator */}
            {loading && !refreshing && (
                <View style={tw`flex-1 justify-center items-center`}>
                    <ActivityIndicator size="large" color={themed.iconColor} />
                    <Text style={[themed.inputText, tw`mt-2`]}>Loading...</Text>
                </View>
            )}

            {/* Patient List with Pull-to-Refresh and Pull-to-Bottom Load */}
            {!loading || refreshing ? (
                <FlatList
                    data={patientData}
                    keyExtractor={(item, index) => `${item.BillNo || item.UHID || index}-${index}`}
                    renderItem={renderPatientItem}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#2563EB']}
                            tintColor={theme === 'dark' ? '#FFFFFF' : '#2563EB'}
                            title="Pull to refresh"
                            titleColor={theme === 'dark' ? '#FFFFFF' : '#2563EB'}
                        />
                    }
                    onEndReached={loadMoreData}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={
                        <View style={tw`flex-1 justify-center items-center py-10`}>
                            <Icon
                                name="database-search-outline"
                                size={70}
                                color={themed.iconColor}
                            />
                            <Text style={tw`text-gray-500 text-base`}>
                                No data found
                            </Text>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                />
            ) : null}

            {/* Modals */}
            {renderBranchModal()}
            {renderFilterModal()}
        </View>
    )
}

export default DashboardPathologyViewList