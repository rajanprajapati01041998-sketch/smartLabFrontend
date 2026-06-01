import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Alert,
} from 'react-native';
import React, {useCallback, useState, useRef, useEffect, useMemo} from 'react';
import tw from 'twrnc';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useAuth} from '../../../../Authorization/AuthContext';
import api from '../../../../Authorization/api';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../../../utils/InputStyle';
import FilterDate from '../FilterDate';
import {useTheme} from '../../../../Authorization/ThemeContext';
import {getThemeStyles} from '../../../utils/themeStyles';
import DashBoardPaymentDownload from './DashBoardPaymentDownload';

const DashboardPaymentHistoryDetails = ({route}) => {
  const {selectedBranches = []} = route.params || {};

  const {loginBranchId, allBranchInfo = []} = useAuth();
  const navigation = useNavigation();

  const [filterModal, setFilterModal] = useState(false);
  const [branchModal, setBranchModal] = useState(false);

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [filter, setFilter] = useState('all');

  const [paymentHistoryList, setPaymentHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const isMounted = useRef(false);
  const lastApiCallRef = useRef('');
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isFilterSticky, setIsFilterSticky] = useState(false);

  const {theme} = useTheme();
  const themed = getThemeStyles(theme);

  const branchList = useMemo(() => {
    if (selectedBranches?.length > 0) return selectedBranches;
    if (allBranchInfo?.length > 0) return allBranchInfo;
    return [];
  }, [selectedBranches, allBranchInfo]);

  const [selectedBranchIds, setSelectedBranchIds] = useState([]);

  useEffect(() => {
    if (branchList?.length > 0) {
      const ids = branchList
        .map(x => x.BranchId || x.branchId)
        .filter(Boolean);

      setSelectedBranchIds(ids);
    } else if (loginBranchId) {
      setSelectedBranchIds([loginBranchId]);
    }
  }, [branchList, loginBranchId]);

  const selectedBranchObjects = branchList.filter(item =>
    selectedBranchIds.includes(item.BranchId || item.branchId),
  );

  const selectedBranchTitle =
    selectedBranchObjects.length === branchList.length
      ? `All Branches (${selectedBranchIds.length})`
      : `${selectedBranchIds.length} Branch Selected`;

  useFocusEffect(
    useCallback(() => {
      const today = new Date().toISOString().split('T')[0];

      if (!fromDate || !toDate) {
        setFromDate(today);
        setToDate(today);
      }

      isMounted.current = true;

      return () => {
        isMounted.current = false;
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (fromDate && toDate && selectedBranchIds.length > 0) {
        getAllDashboardPaymentHistory(filter, selectedBranchIds);
      }
    }, [filter, fromDate, toDate, selectedBranchIds.length]),
  );

  const getAllDashboardPaymentHistory = async (
    selectedFilter = filter,
    branchIdsArray = selectedBranchIds,
  ) => {
    if (loading) return;

    try {
      setLoading(true);

      const branchIds =
        branchIdsArray?.length > 0 ? branchIdsArray.join(',') : loginBranchId;

      let url = `Dashboard/bill-advance?clientIdList=${branchIds}&fromDate=${fromDate}&toDate=${toDate}`;

      if (selectedFilter !== 'all') {
        url += `&filter=${selectedFilter}`;
      }

      if (lastApiCallRef.current === url) {
        setLoading(false);
        return;
      }

      lastApiCallRef.current = url;

      const response = await api.get(url);

      setSummaryData(response?.data?.summary || []);

      if (isMounted.current) {
        setPaymentHistoryList(response?.data?.transactions || []);
      }
    } catch (error) {
      console.log('history error', error?.response || error);

      if (isMounted.current) {
        setPaymentHistoryList([]);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const applyBranchFilter = () => {
    if (selectedBranchIds.length === 0) {
      Alert.alert('Validation', 'Please select at least one branch');
      return;
    }

    lastApiCallRef.current = '';
    setBranchModal(false);
    getAllDashboardPaymentHistory(filter, selectedBranchIds);
  };

  const handleSearchFilter = data => {
    const formattedFrom = formatDateToAPI(data.fromDate);
    const formattedTo = formatDateToAPI(data.toDate);

    setFromDate(formattedFrom);
    setToDate(formattedTo);
    lastApiCallRef.current = '';
    setFilterModal(false);
  };

  const formatDateToAPI = date => {
    const [day, month, year] = date.split('-');
    return `${year}-${month}-${day}`;
  };

  const toggleDescription = id => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderFilterButton = (label, value, icon) => {
    const isActive = filter === value;

    return (
      <TouchableOpacity
        onPress={() => {
          lastApiCallRef.current = '';
          setFilter(value);
        }}
        style={tw`px-4 py-2.5 rounded-xl flex-row items-center ${
          isActive ? 'bg-blue-600 shadow-sm' : 'bg-gray-50 border border-gray-200'
        }`}
        activeOpacity={0.7}>
        <Icon
          name={icon}
          size={18}
          color={isActive ? '#FFFFFF' : '#6B7280'}
          style={tw`mr-1.5`}
        />

        <Text
          style={tw`${
            isActive ? 'text-white font-semibold' : 'text-gray-700 font-medium'
          } text-sm`}>
          {label}
        </Text>

        {isActive && (
          <View style={tw`ml-2 bg-white/20 rounded-full px-1.5`}>
            <Text style={tw`text-white text-xs font-bold`}>
              {value === 'all'
                ? paymentHistoryList.length
                : paymentHistoryList.filter(
                    item => item.type?.toLowerCase() === value,
                  ).length}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getStatusColor = type =>
    type?.toLowerCase() === 'credit' ? '#10B981' : '#EF4444';

  const getStatusBgColor = type =>
    type?.toLowerCase() === 'credit' ? '#D1FAE5' : '#FEE2E2';

  const getStatusIcon = type =>
    type?.toLowerCase() === 'credit' ? 'arrow-downward' : 'arrow-upward';

  const formatAmount = amount => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(parseFloat(amount || 0)));
  };

  const formatDateShort = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
  };

  const PaymentCard = ({item, index}) => {
    const isCredit = item.type?.toLowerCase() === 'credit';
    const statusColor = getStatusColor(item.type);
    const bgColor = getStatusBgColor(item.type);
    const isExpanded = expandedId === item.id || expandedId === index;
    const hasDescription =
      item.description && item.description.trim().length > 0;

    return (
      <View>
        <TouchableOpacity
          style={[themed.globalCard, isExpanded && themed.globaCardActive]}
          activeOpacity={0.7}>
          <View
            style={[
              themed.border,
              themed.cardPadding,
              tw`py-2 mx-2 rounded-lg mb-2`,
            ]}>
            <View style={tw`flex-row justify-between items-start`}>
              <View style={tw`flex-row flex-1 items-start`}>
                <View
                  style={[
                    tw`w-7 h-7 rounded-full items-center justify-center mr-3`,
                    {backgroundColor: bgColor},
                  ]}>
                  <Icon
                    name={getStatusIcon(item.type)}
                    size={14}
                    color={statusColor}
                  />
                </View>

                <View style={tw`flex-1`}>
                  <View style={tw`flex-row items-baseline justify-between`}>
                    <Text style={[tw`text-md font-bold`, {color: statusColor}]}>
                      {isCredit ? '+ ' : '- '}
                      {formatAmount(item.amount)}
                    </Text>

                    <View
                      style={[
                        tw`px-2.5 py-1 rounded-full`,
                        {backgroundColor: bgColor},
                      ]}>
                      <Text
                        style={[
                          tw`text-xs font-semibold`,
                          {color: statusColor},
                        ]}>
                        {item.type?.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={themed.globalCardText}>{item.createdOn}</Text>
                </View>
              </View>
            </View>

            {hasDescription && (
              <View style={[tw`mt-1 pt-1`, themed.globalDivider]}>
                <TouchableOpacity
                  onPress={() => toggleDescription(item.id || index)}
                  style={tw`flex-row justify-between items-center`}
                  activeOpacity={0.7}>
                  <View style={tw`flex-row items-center`}>
                    <Icon
                      name="description"
                      size={14}
                      color={themed.iconMuted}
                    />
                    <Text style={themed.globalDescLabel}>Description</Text>
                  </View>

                  <Icon
                    name={isExpanded ? 'expand-less' : 'expand-more'}
                    size={20}
                    color={themed.iconMuted}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <Animated.View style={tw`mt-2`}>
                    <Text style={themed.globalDescText}>
                      {item.description}
                    </Text>
                  </Animated.View>
                )}
              </View>
            )}

            {item.balance && (
              <View
                style={[
                  tw`mt-3 pt-3 flex-row justify-between items-center`,
                  themed.globalDivider,
                ]}>
                <Text style={themed.globalCardLabel}>Available Balance</Text>

                <Text style={themed.GlobalCradValue}>
                  {formatAmount(item.balance)}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const BranchSelector = () => (
    <TouchableOpacity
      onPress={() => setBranchModal(true)}
      activeOpacity={0.8}
      style={[
        themed.childScreen2,
        themed.border,
        tw`mx-2 mb-3 p-3 rounded-xl flex-row items-center justify-between`,
      ]}>
      <View style={tw`flex-1`}>
        <Text style={[themed.inputText, tw`font-bold`]}>
          {selectedBranchTitle}
        </Text>

        <Text
          style={[themed.transactionLabel || themed.headerSubText, tw`text-xs mt-1`]}
          numberOfLines={1}>
          {selectedBranchObjects.length > 0
            ? selectedBranchObjects
                .slice(0, 2)
                .map(x => x.branchName || x.BranchName)
                .join(', ') +
              (selectedBranchObjects.length > 2
                ? ` +${selectedBranchObjects.length - 2} more`
                : '')
            : 'No branch selected'}
        </Text>
      </View>

      <Icon name="keyboard-arrow-down" size={24} color={themed.iconMuted || '#6B7280'} />
    </TouchableOpacity>
  );

  const FilterHeader = () => (
    <Animated.View
      style={[themed.childScreen2,
        tw``,
        {paddingTop: isFilterSticky ? 1 : 0, paddingBottom: isFilterSticky ? 8 : 0},
      ]}>
      <BranchSelector />

      {summaryData && summaryData.length > 0 && (
        <View style={tw`flex-row mb-4 gap-1 mx-2`}>
          <View style={tw`flex-1 bg-blue-50 rounded-2xl p-3`}>
            <Text style={tw`text-xs text-blue-600 font-medium mb-1`}>
              Total Credits
            </Text>
            <Text style={tw`text-lg font-bold text-blue-700`}>
              {formatAmount(summaryData.find(s => s.type === 'credit')?.total || 0)}
            </Text>
          </View>

          <View style={tw`flex-1 bg-red-50 rounded-2xl p-3`}>
            <Text style={tw`text-xs text-red-600 font-medium mb-1`}>
              Total Debits
            </Text>
            <Text style={tw`text-lg font-bold text-red-700`}>
              {formatAmount(summaryData.find(s => s.type === 'debit')?.total || 0)}
            </Text>
          </View>
        </View>
      )}

      <View style={tw`mb-3 mx-1`}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`flex-row items-center gap-2`}>
          {renderFilterButton('All', 'all', 'apps')}
          {renderFilterButton('Credits', 'credit', 'arrow-downward')}
          {renderFilterButton('Debits', 'debit', 'arrow-upward')}

          <TouchableOpacity
            onPress={() => setFilterModal(true)}
            style={themed.filterButton}
            activeOpacity={0.7}>
            <Icon
              name="calendar-month"
              size={18}
              color={themed.filterButtonIcon}
            />
            <Text style={themed.filterButtonText}>Filter</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={tw`flex-row items-center justify-between mb-2 px-2`}>
        <Text style={[themed.headerSubText, tw`mx-2 mb-2`]}>
          {fromDate && toDate
            ? `${formatDateShort(fromDate)} - ${formatDateShort(toDate)}`
            : ''}
        </Text>

        <DashBoardPaymentDownload
          selectedBranches={selectedBranchObjects}
          fromDate={fromDate}
          toDate={toDate}
        />
      </View>
    </Animated.View>
  );

  const handleScroll = Animated.event(
    [{nativeEvent: {contentOffset: {y: scrollY}}}],
    {
      useNativeDriver: false,
      listener: event => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setIsFilterSticky(offsetY > 100);
      },
    },
  );

  if (loading && paymentHistoryList.length === 0) {
    return (
      <View
        style={[
          styles.cardShadow,
          tw`p-8 bg-white rounded-2xl m-3 items-center justify-center`,
        ]}>
        <MaterialCommunityIcons name="loading" size={40} color="#3B82F6" />
        <Text style={tw`text-gray-500 mt-3 font-medium`}>
          Loading transactions...
        </Text>
      </View>
    );
  }

  return (
    <View style={[themed.screen, tw`flex-1`]}>
      <Animated.FlatList
        data={paymentHistoryList}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pt-0`}
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
            <MaterialCommunityIcons
              name="credit-card-off"
              size={64}
              color="#E5E7EB"
            />
            <Text style={tw`text-gray-400 mt-3 font-semibold text-base`}>
              No transactions found
            </Text>
            <Text style={tw`text-gray-300 text-sm mt-1`}>
              Try changing filters or date range
            </Text>
          </View>
        )}
        renderItem={({item, index}) => <PaymentCard item={item} index={index} />}
      />

      <Modal visible={branchModal} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setBranchModal(false)}>
          <View style={tw`flex-1 justify-center bg-black/60 px-4`}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  themed.childScreen2,
                  tw`rounded-3xl p-4`,
                  {maxHeight: '75%'},
                ]}>
                <View style={tw`flex-row justify-between items-center mb-4`}>
                  <Text style={[themed.inputText, tw`text-lg font-bold`]}>
                    Select Branch
                  </Text>

                  <TouchableOpacity
                    onPress={() => setBranchModal(false)}
                    style={tw`w-9 h-9 rounded-full bg-gray-100 items-center justify-center`}>
                    <Icon name="close" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    const allIds = branchList
                      .map(x => x.BranchId || x.branchId)
                      .filter(Boolean);

                    if (selectedBranchIds.length === allIds.length) {
                      setSelectedBranchIds([]);
                    } else {
                      setSelectedBranchIds(allIds);
                    }
                  }}
                  style={[
                    themed.border,
                    tw`p-3 rounded-xl mb-3 flex-row justify-between items-center`,
                  ]}>
                  <Text style={[themed.inputText, tw`font-bold`]}>
                    Select All
                  </Text>

                  <Icon
                    name={
                      selectedBranchIds.length === branchList.length
                        ? 'check-box'
                        : 'check-box-outline-blank'
                    }
                    size={24}
                    color="#2563EB"
                  />
                </TouchableOpacity>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {branchList.map(item => {
                    const branchId = item.BranchId || item.branchId;
                    const branchName = item.BranchName || item.branchName;
                    const branchCode = item.BranchCode || item.branchCode;
                    const checked = selectedBranchIds.includes(branchId);

                    return (
                      <TouchableOpacity
                        key={branchId}
                        onPress={() => {
                          setSelectedBranchIds(prev =>
                            prev.includes(branchId)
                              ? prev.filter(id => id !== branchId)
                              : [...prev, branchId],
                          );
                        }}
                        style={[
                          themed.border,
                          tw`p-3 rounded-xl mb-2 flex-row justify-between items-center`,
                        ]}>
                        <View style={tw`flex-1`}>
                          <Text style={[themed.inputText, tw`font-semibold`]}>
                            {branchName}
                          </Text>
                          <Text
                            style={[
                              themed.transactionLabel || themed.headerSubText,
                              tw`text-xs mt-1`,
                            ]}>
                            Code: {branchCode || '-'} | ID: {branchId}
                          </Text>
                        </View>

                        <Icon
                          name={checked ? 'check-box' : 'check-box-outline-blank'}
                          size={24}
                          color={checked ? '#2563EB' : '#9CA3AF'}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <TouchableOpacity
                  onPress={applyBranchFilter}
                  style={[themed.searchButton, tw`mt-4`]}>
                  <Text style={themed.searchButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal visible={filterModal} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setFilterModal(false)}>
          <View style={tw`flex-1 justify-end bg-black/60`}>
            <TouchableWithoutFeedback>
              <View style={tw`bg-white rounded-t-3xl overflow-hidden max-h-[90%]`}>
                <View
                  style={tw`p-4 border-b border-gray-100 flex-row justify-between items-center`}>
                  <Text style={tw`text-lg font-bold text-gray-800`}>
                    Select Date Range
                  </Text>

                  <TouchableOpacity
                    onPress={() => setFilterModal(false)}
                    style={tw`w-8 h-8 rounded-full bg-gray-100 items-center justify-center`}>
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
  );
};

export default DashboardPaymentHistoryDetails;