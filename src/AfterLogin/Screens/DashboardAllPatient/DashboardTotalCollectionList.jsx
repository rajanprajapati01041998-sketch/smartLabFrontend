import { View, Text, TouchableOpacity, Modal, FlatList, TouchableWithoutFeedback, ScrollView } from 'react-native'
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

const DashboardTotalCollectionList = ({ route }) => {
    const { loginBranchId, allBranchInfo, userId } = useAuth()
    const { theme } = useTheme()
    const themed = getThemeStyles(theme)
    const [branchModal, setBranchModal] = useState(false)
    const [filterModal, setFilterModal] = useState(false)
    const [selectedBranches, setSelectedBranches] = useState([])
    const [patientData, setPatientData] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchData, setSearchData] = useState({
        fromDate: new Date().toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0]
    })
    const [expandedIndex, setExpandedIndex] = useState(null);

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

    // Fetch patient data from API
    const fetchPatientData = async () => {
        const branchIds = getBranchIdString()
        if (!branchIds) {
            console.log('No branches selected')
            return
        }

        setLoading(true)
        try {
            const response = await api.get(`Patient/dashboard-collection-view`, {
                params: {
                    StatusId: route?.params.statusId,
                    ClientIdList: branchIds,
                    TypeId: 1,
                    UserId: userId,
                    FromDate: searchData.fromDate,
                    ToDate: searchData.toDate
                }
            })
            console.log("list", response)

            // Extract data from nested response structure
            if (response.data && response.data.success) {
                setPatientData(response.data.data || [])
            } else {
                setPatientData([])
            }
        } catch (error) {
            console.error('Error fetching patient data:', error)
            setPatientData([])
        } finally {
            setLoading(false)
        }
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
        setFilterModal(false)
    }

    // Fetch data when selected branches or dates change
    useEffect(() => {
        if (selectedBranches.length > 0) {
            fetchPatientData()
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

    const handleAccordian = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    // Render patient item based on actual API response structure
    const renderPatientItem = ({ item, index }) => (
        <View style={[themed.border_b, tw`p-4 mb-2 rounded-lg`, themed.card]}>
            {/* Header Section with Patient Info and Expand/Collapse Button */}
            <View style={tw`flex-row justify-between items-start mb-2`}>
                <View style={tw`flex-1`}>
                    <Text style={[themed.inputText, tw`font-semibold text-lg`]}>{item.PatientName || 'N/A'}</Text>
                </View>
                <TouchableOpacity
                    onPress={() => handleAccordian(index)}
                    style={[
                        tw`w-9 h-9 rounded-full items-center justify-center border`,
                        {
                            backgroundColor: theme === 'dark' ? '#374151' : '#FFFFFF',
                            borderColor: '#D1D5DB',
                            elevation: 3,
                        },
                    ]}
                >
                    <FontAwesome
                        name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={themed.iconColor}
                    />
                </TouchableOpacity>
            </View>

            {/* UHID and Registration Info */}
            <View style={tw`flex-row justify-between mb-2`}>
                <Text style={[themed.labelTextXs, themed.border, tw`  px-2 py-1 `]}>
                    UHID: {item.uhid || 'N/A'}
                </Text>
                <Text style={[themed.labelTextXs, themed.border, tw`  px-2 py-1 `]}>
                    Reg: {item.CreatedOn || 'N/A'}
                </Text>
            </View>

            {/* Branch/Center */}
            <View style={tw`flex-row items-center mb-2`}>
                <Icon name="store" size={14} color={themed.iconColor} />
                <Text style={[themed.labelText, tw`text-sm ml-1`]}>{item.clientName || 'N/A'}</Text>
            </View>

            {/* Service Name - Always Visible */}
            <View style={tw`mb-2`}>
                <Text style={[themed.clientNamexs]}> Service:{item.ServiceName || ''} </Text>
            </View>



            {/* Expandable Content */}
            {expandedIndex === index && (
                <View
                    style={[
                        tw`p-3 rounded-lg border`,
                        {
                            backgroundColor: 'rgba(4, 154, 59, 0.11)', // green glass
                            borderColor: 'rgba(5, 86, 28, 0.9)',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                        },
                    ]}
                >
                    {/* Divider */}
                    {/* Bill and Receipt Info */}
                    <View style={tw`flex-row justify-between mb-3`}>
                        <View>
                            <Text style={[themed.labelTextXs, tw` mb-1`]}>Bill Number</Text>
                            <Text style={[themed.labelTextXs, tw`font-medium text-sm`]}>{item.BillNo || 'N/A'}</Text>
                        </View>
                        <View>
                            <Text style={[themed.labelTextXs, tw` text-xs mb-1`]}>Receipt Number</Text>
                            <Text style={[themed.labelTextXs, tw`font-medium text-sm`]}>{item.ReceiptNo || 'N/A'}</Text>
                        </View>
                    </View>




                    {/* Amount Section */}
                    <View style={[tw`mt-2 pt-2 border-t border-gray-100`, tw`flex-row justify-between mb-2`]}>
                        <View style={tw`items-center flex-1`}>
                            <Text style={[themed.inputLabel, tw` text-xs mb-1`]}>Total Amount</Text>
                            <Text style={[themed.inputText, tw`font-semibold text-sm`]}>{formatCurrency(item.TotalBillAmount || 0)}</Text>
                        </View>
                        <View style={tw`items-center flex-1`}>
                            <Text style={[themed.inputLabel, tw` text-xs mb-1`]}>Paid Amount</Text>
                            <Text style={[tw`text-green-600`, tw`font-semibold text-sm`]}>{formatCurrency(item.TotalPaidAmount || 0)}</Text>
                        </View>
                        <View style={tw`items-center flex-1`}>
                            <Text style={[themed.inputLabel, tw` text-xs mb-1`]}>Payable Amount</Text>
                            <Text style={[tw`text-orange-600`, tw`font-semibold text-sm`]}>{formatCurrency(item.TotalPatientPayableAmount || 0)}</Text>
                        </View>
                    </View>

                    {/* Created Info */}
                    <View style={tw`mt-2 pt-2 border-t border-gray-100`}>
                        <Text style={tw`text-gray-400 text-xs`}>
                            Created by: {item.CreatedBy || 'N/A'}
                        </Text>
                        {item.DiscountReason && (
                            <Text style={tw`text-red-400 text-xs mt-1`}>
                                Discount: {item.DiscountReason}
                            </Text>
                        )}
                    </View>
                </View>
            )}
        </View>
    )

    // Render branch selection modal
    const renderBranchModal = () => (
        <Modal visible={branchModal} transparent animationType="slide">
            <TouchableWithoutFeedback onPress={() => setBranchModal(false)}>
                <View style={tw`flex-1 justify-end items-center bg-black/60`}>
                    <TouchableWithoutFeedback>
                        <View style={[themed.modalContainer, tw`w-full h-[60%] rounded-lg overflow-hidden`]}>
                            <View style={[themed.border_b, tw`p-4 flex-row justify-between items-center`]}>
                                <Text style={[themed.modalHeaderSubTitle, tw`text-lg font-semibold`]}>Select Branches</Text>
                                <TouchableOpacity onPress={() => setBranchModal(false)}>
                                    <MaterialIcons name="close" size={24} color={themed.iconColor} />
                                </TouchableOpacity>
                            </View>

                            <View style={tw`p-4 `}>
                                <TouchableOpacity
                                    onPress={() =>
                                        setSelectedBranches(
                                            selectedBranches.length === allBranchInfo.length
                                                ? []
                                                : [...allBranchInfo]
                                        )
                                    }
                                    style={tw`flex-row items-center`}
                                 >
                                    <MaterialIcons
                                        name={
                                            selectedBranches.length === allBranchInfo.length
                                                ? 'check-box'
                                                : 'check-box-outline-blank'
                                        }
                                        size={24}
                                        color="#2563EB"
                                    />

                                    <Text style={[themed.labelText,tw`ml-2`]}>
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
                                            <Text style={tw`text-gray-500 text-xs`}>Code: {branch.branchCode} | ID: {branch.branchId}</Text>
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
            {loading && (
                <View style={tw`flex-1 justify-center items-center`}>
                    <Text style={themed.text}>Loading...</Text>
                </View>
            )}

            {/* Patient List */}
            {!loading && (
                <FlatList
                    data={patientData}
                    keyExtractor={(item, index) => item.BillNo || index.toString()}
                    renderItem={renderPatientItem}
                    ListEmptyComponent={
                        <View style={tw`flex-1 justify-center items-center py-10`}>
                            <Text style={tw`text-gray-500`}>No patient data found</Text>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Modals */}
            {renderBranchModal()}
            {renderFilterModal()}
        </View>
    )
}

export default DashboardTotalCollectionList