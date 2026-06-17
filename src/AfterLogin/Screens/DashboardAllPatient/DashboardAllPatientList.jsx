import { View, Text, TouchableOpacity, Modal, FlatList, TouchableWithoutFeedback, ScrollView, ActivityIndicator, TextInput, RefreshControl } from 'react-native'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { useAuth } from '../../../../Authorization/AuthContext'
import { useTheme } from '../../../../Authorization/ThemeContext'
import { getThemeStyles } from '../../../utils/themeStyles'
import FilterDate from '../FilterDate'
import tw from 'twrnc'
import api from '../../../../Authorization/api'

const DashboardAllPatientList = ({ route }) => {
  const { loginBranchId, allBranchInfo, fromDateAuth, toDateAuth } = useAuth()
  const { theme } = useTheme()
  const themed = getThemeStyles(theme)
  const [branchModal, setBranchModal] = useState(false)
  const [filterModal, setFilterModal] = useState(false)
  const [selectedBranches, setSelectedBranches] = useState([])
  const [patientData, setPatientData] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [branchSearch, setBranchSearch] = useState('')

  // State for date filtering - initialize with auth dates
  const [searchData, setSearchData] = useState({
    fromDate: fromDateAuth || new Date().toISOString().split('T')[0],
    toDate: toDateAuth || new Date().toISOString().split('T')[0]
  })

  // Track if get dates are being used
  const [isCustomDate, setIsCustomDate] = useState(false)
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Select All / Unselect All
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedBranches([]);
    } else {
      setSelectedBranches([...allBranchInfo]);
    }
  };

  console.log("auth datae", fromDateAuth, toDateAuth)

  // Single Branch Select/Unselect
  const toggleBranchSelection = (branch) => {
    setSelectedBranches(prev => {
      const isSelected = prev.some(
        item => item.branchId === branch.branchId
      );

      if (isSelected) {
        return prev.filter(
          item => item.branchId !== branch.branchId
        );
      }

      return [...prev, branch];
    });
  };

  // Filter branches based on search
  const filteredBranches = useMemo(() => {
    if (!branchSearch.trim()) return allBranchInfo || [];

    const searchTerm = branchSearch.toLowerCase();
    return (allBranchInfo || []).filter(branch =>
      branch.branchName?.toLowerCase().includes(searchTerm) ||
      branch.branchCode?.toLowerCase().includes(searchTerm) ||
      branch.branchId?.toString().includes(searchTerm)
    );
  }, [allBranchInfo, branchSearch]);

  // Check if all branches are selected
  const isAllSelected = (allBranchInfo || []).length > 0 && selectedBranches.length === (allBranchInfo || []).length;

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

  // Get branch IDs string for API
  const getBranchIdString = () => {
    if (selectedBranches.length === 0) return ''
    return selectedBranches.map(b => b.branchId).join(',')
  }

  // Get the actual dates to use for API call
  const getApiDates = () => {
    // If custom dates are set, use them; otherwise use auth dates
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

  // Fetch patient data from API
  const fetchPatientData = async (isRefresh = false) => {
    const branchIds = getBranchIdString()
    if (!branchIds) {
      console.log('No branches selected')
      if (isRefresh) setRefreshing(false)
      return
    }

    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const { fromDate, toDate } = getApiDates()

      const response = await api.get(`Patient/dashboard-patient-view`, {
        params: {
          StatusId: route?.params?.statusId,
          ClientIdList: branchIds,
          FromDate: fromDate,
          ToDate: toDate
        }
      })
      console.log("list", response)

      if (response.data && response.data.success) {
        setPatientData(response.data.data || [])
      } else {
        setPatientData([])
      }
    } catch (error) {
      console.error('Error fetching patient data:', error)
      setPatientData([])
    } finally {
      if (isRefresh) {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  // Handle date filter save - this sets custom dates
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
    setFilterModal(false)
  }

  // Reset to auth dates
  const resetToAuthDates = () => {
    setSearchData({
      fromDate: fromDateAuth || new Date().toISOString().split('T')[0],
      toDate: toDateAuth || new Date().toISOString().split('T')[0]
    })
    setIsCustomDate(false)
  }

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    if (selectedBranches.length > 0) {
      fetchPatientData(true)
    } else {
      setRefreshing(false)
    }
  }, [selectedBranches, isCustomDate, searchData.fromDate, searchData.toDate])

  // Fetch data when selected branches or custom dates change
  useEffect(() => {
    if (selectedBranches.length > 0) {
      fetchPatientData()
    }
  }, [selectedBranches, isCustomDate, searchData.fromDate, searchData.toDate])

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
    if (amount === null || amount === undefined) return '₹ 0'
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

  const renderPatientItem = ({ item, index }) => (
    <View style={[themed.border_b, tw`p-4 mb-2 rounded-lg`, themed.card]}>
      <View style={tw`flex-row justify-between items-start mb-2`}>
        <View style={tw`flex-1`}>
          <Text style={[themed.inputText, tw`font-semibold text-md`]}>{item.PatientName || 'N/A'}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleAccordian(index)}
          style={[
            tw`w-7 h-7 rounded-full items-center justify-center border`,
            {
              backgroundColor: theme === 'dark' ? '#374151' : '#FFFFFF',
              borderColor: '#D1D5DB',
              elevation: 3,
            },
          ]}
        >
          <FontAwesome
            name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={themed.iconColor}
          />
        </TouchableOpacity>
      </View>

      <View style={tw`flex-row justify-between mb-2`}>
        <Text style={[themed.labelTextXs, themed.border, tw`px-2 py-1 rounded`]}>
          UHID: {item.uhid || 'N/A'}
        </Text>
        <Text style={[themed.labelTextXs, themed.border, tw`px-2 py-1 rounded`]}>
          Reg: {item.CreatedOn || 'N/A'}
        </Text>
      </View>

      <View style={tw`flex-row items-center mb-2`}>
        <Icon name="store" size={14} color={themed.iconColor} />
        <Text style={[themed.labelText, tw`text-sm ml-1`]}>{item.clientName || 'N/A'}</Text>
      </View>

      <View style={tw`mb-2`}>
        <Text style={[themed.clientNamexs]}> Service: {item.ServiceName || ''} </Text>
      </View>

      {expandedIndex === index && (
        <View
          style={[
            tw`p-3 rounded-lg mt-2`,
            {
              backgroundColor: 'rgba(4, 154, 59, 0.11)',
              borderColor: 'rgba(5, 86, 28, 0.9)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            },
          ]}
        >
          <View style={tw`flex-row justify-between mb-3`}>
            <View>
              <Text style={[themed.labelTextXs, tw`mb-1`]}>Bill Number</Text>
              <Text style={[themed.labelTextXs, tw`font-medium `]}>{item.BillNo || 'N/A'}</Text>
            </View>
            <View>
              <Text style={[themed.labelTextXs, tw`mb-1`]}>Receipt Number</Text>
              <Text style={[themed.labelTextXs, tw`font-medium `]}>{item.ReceiptNo || 'N/A'}</Text>
            </View>
          </View>

          <View style={[tw`flex-row justify-between mb-2`]}>
            <View style={tw`items-center flex-1`}>
              <Text style={[themed.inputLabel, tw`text-xs mb-1`]}>Gross</Text>
              <Text style={[themed.inputText, tw`font-semibold text-sm`]}>{formatCurrency(item?.TotalBillAmount)}</Text>
            </View>
            <View style={tw`items-center flex-1`}>
              <Text style={[themed.inputLabel, tw`text-xs mb-1`]}>Disc</Text>
              <Text style={[themed.inputText, tw`font-semibold text-sm`]}>{formatCurrency(item?.TotalDiscountAmountOnBill)}</Text>
            </View>
            <View style={tw`items-center flex-1`}>
              <Text style={[themed.inputLabel, tw`text-xs mb-1`]}>Net</Text>
              <Text style={[tw`text-green-600`, tw`font-semibold text-sm`]}>{formatCurrency(item?.TotalPaidAmount)}</Text>
            </View>
            <View style={tw`items-center flex-1`}>
              <Text style={[themed.inputLabel, tw`text-xs mb-1`]}>Collected</Text>
              <Text style={[tw`text-orange-600`, tw`font-semibold text-sm`]}>{formatCurrency(item?.TotalPatientPayableAmount)}</Text>
            </View>
          </View>

          <View style={tw`mt-2 pt-2 `}>
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

  const renderBranchModal = () => (
    <Modal
      visible={branchModal}
      transparent
      animationType="slide"
      onRequestClose={() => setBranchModal(false)}
    >
      <TouchableWithoutFeedback onPress={() => setBranchModal(false)}>
        <View style={tw`flex-1 justify-end bg-black/60`}>
          <TouchableWithoutFeedback>
            <View
              style={[
                themed.modalContainer,
                tw`w-full rounded-t-3xl h-[60%] overflow-hidden`,
              ]}
            >
              {/* Header */}
              <View
                style={[tw`p-4 flex-row justify-between items-center`,]}>
                <Text style={[themed.modalHeaderTitle, tw`text-xl font-bold`,]} >
                  Select Branches
                </Text>

                <TouchableOpacity
                  onPress={() => setBranchModal(false)}
                >
                  <MaterialIcons name="close" size={24} color={themed.iconColor} />
                </TouchableOpacity>
              </View>

              {/* Search */}
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

              {/* Select All Checkbox */}
              <TouchableOpacity
                onPress={handleSelectAll}
                style={tw`p-4 flex-row items-center`}
              >
                <View
                  style={[
                    tw`w-6 h-6 rounded border mr-3 justify-center items-center`,
                    {
                      backgroundColor: isAllSelected ? '#3B82F6' : '#FFF',
                      borderColor: isAllSelected ? '#3B82F6' : '#9CA3AF',
                    },
                  ]}
                >
                  {isAllSelected && (
                    <MaterialIcons name="check" size={16} color="white" />
                  )}
                </View>

                <Text style={[themed.labelText, tw`font-bold text-base`]}>
                  Select All
                </Text>
              </TouchableOpacity>

              {/* Branch List */}
              <ScrollView style={tw`flex-1 p-2`}>
                {filteredBranches?.map((branch, index) => {
                  const isSelected =
                    selectedBranches.some(
                      item =>
                        item.branchId === branch.branchId
                    );

                  return (
                    <TouchableOpacity
                      key={branch.branchId || index}
                      onPress={() =>
                        toggleBranchSelection(branch)
                      }
                      style={[themed.border,
                      tw`p-4 flex-row`,
                      isSelected && {
                        backgroundColor:
                          'rgba(59,130,246,0.08)',
                      },
                      ]}
                    >
                      {/* Checkbox */}
                      <View
                        style={[
                          tw`w-6 h-6 rounded border mr-3 justify-center items-center`,
                          {
                            backgroundColor: isSelected ? '#3B82F6' : '#FFF',
                            borderColor: isSelected ? '#3B82F6' : '#9CA3AF',
                          },
                        ]}
                      >
                        {isSelected && (
                          <MaterialIcons name="check" size={16} color="white" />
                        )}
                      </View>

                      {/* Branch Details */}
                      <View style={tw`flex-1`}>
                        <Text
                          style={[
                            themed.inputText,
                            tw`font-medium`,
                          ]}
                        >
                          {branch.branchName}
                        </Text>

                        <Text
                          style={tw`text-gray-500 text-xs mt-1`}
                        >
                          Code : {branch.branchCode}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderFilterModal = () => (
    <Modal visible={filterModal} transparent animationType="slide" onRequestClose={() => setFilterModal(false)}>
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

  // Helper to display current date range
  const getDisplayDateRange = () => {
    if (isCustomDate) {
      return `${searchData.fromDate} → ${searchData.toDate}`
    }
    return `${fromDateAuth || searchData.fromDate} → ${toDateAuth || searchData.toDate}`
  }

  return (
    <View style={[themed.childScreen2, tw`flex-1 p-4`]}>
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
          <View style={tw`ml-2 bg-green-600/40 px-2 py-0.5 rounded-full`}>
            <Text style={tw`text-green-400 text-xs`}>{patientData.length}</Text>
          </View>

        </View>
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={[themed.text, tw`mt-2`]}>Loading...</Text>
        </View>
      )}

      {/* Patient List with Pull-to-Refresh */}
      {!loading && (
        <FlatList
          data={patientData}
          keyExtractor={(item, index) => item.BillNo || index.toString()}
          renderItem={renderPatientItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3b82f6']}
              tintColor="#3b82f6"
              title="Pull to refresh"
              titleColor="#6b7280"
            />
          }
          ListEmptyComponent={
            <View style={tw`flex-1 justify-center items-center py-10`}>
              <MaterialIcons name="folder-open" size={48} color="#D1D5DB" />
              <Text style={tw`text-gray-500 mt-2`}>No patient data found</Text>
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

export default DashboardAllPatientList