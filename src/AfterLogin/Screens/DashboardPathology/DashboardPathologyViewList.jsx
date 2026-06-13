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
    const { loginBranchId, allBranchInfo } = useAuth()
    const { theme } = useTheme()
    const themed = getThemeStyles(theme)
    const [branchModal, setBranchModal] = useState(false)
    const [filterModal, setFilterModal] = useState(false)
    const [selectedBranches, setSelectedBranches] = useState([])
    const [patientData, setPatientData] = useState([])
    const [branchSearch, setBranchSearch] = useState('')
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false) // Pull-to-refresh state
    const [loadingMore, setLoadingMore] = useState(false) // Bottom loading state
    const [hasMoreData, setHasMoreData] = useState(true) // Track if more data exists
    const [currentPage, setCurrentPage] = useState(1) // Track current page
    const [searchData, setSearchData] = useState({
        fromDate: new Date().toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0]
    })

    // Function to format date to YYYY-MM-DD
    const formatToYYYYMMDD = (date) => {
        if (!date) return ''

        // If already in YYYY-MM-DD format and valid, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date
        }

        // Handle DD-MM-YYYY format
        if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
            const [day, month, year] = date.split('-')
            return `${year}-${month}-${day}`
        }

        // Handle DD/MM/YYYY format
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
            const [day, month, year] = date.split('/')
            return `${year}-${month}-${day}`
        }

        // Handle Date object
        if (date instanceof Date) {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
        }

        // Try to parse as date string
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

        return date // Return original if all parsing fails
    }

    // Function to format display date (optional - if you want different display format)
    const formatDisplayDate = (date) => {
        if (!date) return 'N/A'
        // For display, you can use DD-MM-YYYY if needed
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            const [year, month, day] = date.split('-')
            return `${day}-${month}-${year}`
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

    // Select all branches
    const selectAllBranches = () => {
        setSelectedBranches([...allBranchInfo])
    }

    // Clear all selections
    const clearAllBranches = () => {
        setSelectedBranches([])
    }

    // Get branch IDs string for API
    const getBranchIdString = () => {
        if (selectedBranches.length === 0) return ''
        return selectedBranches.map(b => b.branchId).join(',')
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
            const response = await api.get(`Patient/dashboard-pathology-view`, {
                params: {
                    StatusId: route?.params.statusId,
                    ClientIdList: branchIds,
                    FromDate: searchData.fromDate,
                    ToDate: searchData.toDate,
                    PageNumber: page,
                    PageSize: 20 // Adjust page size as needed
                }
            })
            console.log("list", response)

            // Extract data from nested response structure
            if (response.data && response.data.success) {
                const newData = response.data.data || []
                const totalCount = response.data.totalCount || 0
                const currentDataCount = isLoadMore ? patientData.length + newData.length : newData.length

                // Check if there's more data to load
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

    // Handle date filter save - Ensures dates are in YYYY-MM-DD format
    const handleSearchFilter = (fromDateOrObject, toDate) => {
        let formattedFromDate = ''
        let formattedToDate = ''

        // Check if the first parameter is an object (with fromDate/toDate properties)
        if (fromDateOrObject && typeof fromDateOrObject === 'object') {
            formattedFromDate = formatToYYYYMMDD(fromDateOrObject.fromDate || searchData.fromDate)
            formattedToDate = formatToYYYYMMDD(fromDateOrObject.toDate || searchData.toDate)
        } else if (fromDateOrObject && toDate) {
            // Handle separate parameters
            formattedFromDate = formatToYYYYMMDD(fromDateOrObject)
            formattedToDate = formatToYYYYMMDD(toDate)
        } else if (fromDateOrObject && typeof fromDateOrObject === 'string') {
            // Handle single parameter (maybe both dates in one string)
            formattedFromDate = formatToYYYYMMDD(fromDateOrObject)
            formattedToDate = formatToYYYYMMDD(fromDateOrObject)
        }

        setSearchData({
            fromDate: formattedFromDate,
            toDate: formattedToDate
        })
        resetPagination() // Reset pagination when date changes
        setFilterModal(false)
    }

    // Fetch data when selected branches or dates change
    useEffect(() => {
        if (selectedBranches.length > 0) {
            resetPagination()
            fetchPatientData(1, false)
        }
    }, [selectedBranches, searchData.fromDate, searchData.toDate])

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
                                            {/* <Text style={tw`text-gray-500 text-xs`}>Code: {branch.branchCode} | ID: {branch.branchId}</Text> */}
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* <View style={tw`p-4 border-t border-gray-200`}>
                                <TouchableOpacity
                                    onPress={() => setBranchModal(false)}
                                    style={tw`bg-blue-500 py-3 rounded-lg`}
                                >
                                    <Text style={tw`text-white text-center font-semibold`}>Apply ({selectedBranches.length} Selected)</Text>
                                </TouchableOpacity>
                            </View> */}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )

    // Render date filter modal - Pass formatted initial dates
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
                <View style={tw`flex-row`}>
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
                </View>

                <View style={tw`flex-row mt-2 justify-start items-center`}>
                    <Icon name="calendar" size={14} color="#9ca3af" />
                    <Text style={[themed.dateText, tw`ml-1`]}>
                        {searchData.fromDate} → {searchData.toDate}
                    </Text>
                </View>
            </View>

            {/* Summary Section */}
            {/* {!loading && patientData.length > 0 && renderSummary()} */}

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
                            colors={['#2563EB']} // Android
                            tintColor={theme === 'dark' ? '#FFFFFF' : '#2563EB'} // iOS
                            title="Pull to refresh"
                            titleColor={theme === 'dark' ? '#FFFFFF' : '#2563EB'}
                        />
                    }
                    onEndReached={loadMoreData}
                    onEndReachedThreshold={0.3} // Trigger when 30% from bottom
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