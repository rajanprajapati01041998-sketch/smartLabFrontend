import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  FlatList,
  Platform,
  Alert
} from 'react-native';
import tw from 'twrnc';
import CustomStyles from '../../../../Custom.styles';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import FilterDate from '../FilterDate';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../../Authorization/AuthContext';
import DashboardCollection from './DashboardCollection';
import { Checkbox } from 'react-native-paper';
import ButtonStyles from '../../../utils/ButtonStyle';
import api from '../../../../Authorization/api';
import { dashboardWallet } from '../../../utils/dashboardService/dashboard';
import { useDash } from '../../../../Authorization/DashContext';
import { useTheme } from '../../../../Authorization/ThemeContext';
import { getThemeStyles } from '../../../utils/themeStyles';

const LabDashboard = () => {
  const { userData, allBranchInfo, deviceData, loginBranchId, updateFlag } = useAuth();
  const { dashboardWallet, walletData } = useDash();
  const { theme } = useTheme();
  const themed = getThemeStyles(theme);
  const navigation = useNavigation();
  const dashboardRef = React.useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const [walletBal, setWalletBal] = useState(0);
  const [filetrModal, setFilterModal] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [branchModal, setBranchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectAll, setSelectAll] = useState(false);

  const [selectedBranches, setSelectedBranches] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      setFromDate(formattedDate);
      setToDate(formattedDate);
      dashboardWallet(loginBranchId);
    }, [])
  );

  const formatDateToAPI = (date) => {
    const [day, month, year] = date.split('-');
    return `${year}-${month}-${day}`;
  };

  const handleSearchFilter = (data) => {
    const formattedFrom = formatDateToAPI(data.fromDate);
    const formattedTo = formatDateToAPI(data.toDate);

    setFromDate(formattedFrom);
    setToDate(formattedTo);

    setFilterModal(false);
  };

  const toggleBranch = (branch) => {
    const exists = selectedBranches.find((b) => b.branchId === branch.branchId);

    if (exists) {
      setSelectedBranches((prev) =>
        prev.filter((b) => b.branchId !== branch.branchId)
      );
    } else {
      setSelectedBranches((prev) => [...prev, branch]);
    }
  };

  const filteredBranches = useMemo(() => {
    return (
      allBranchInfo?.filter((branch) =>
        branch.branchName?.toLowerCase().includes(searchQuery.toLowerCase())
      ) || []
    );
  }, [allBranchInfo, searchQuery]);

  const handleSelectAll = () => {
    if (selectAll) {
      filteredBranches.forEach((branch) => {
        if (selectedBranches.some((b) => b.branchId === branch.branchId)) {
          toggleBranch(branch);
        }
      });
    } else {
      filteredBranches.forEach((branch) => {
        if (!selectedBranches.some((b) => b.branchId === branch.branchId)) {
          toggleBranch(branch);
        }
      });
    }
    setSelectAll(!selectAll);
  };

  useEffect(() => {
    const allFilteredSelected =
      filteredBranches.length > 0 &&
      filteredBranches.every((branch) =>
        selectedBranches.some((b) => b.branchId === branch.branchId)
      );
    setSelectAll(allFilteredSelected);
  }, [selectedBranches, filteredBranches]);

  const selectedBranchIds =
    selectedBranches.length > 0
      ? selectedBranches.map((b) => b.branchId).join(',')
      : allBranchInfo?.map((b) => b.branchId).join(',');

  const clearAllBranches = () => {
    setSelectedBranches([]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dashboardRef.current?.refresh?.();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      style={themed.screen}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#10b981"
          colors={['#10b981']}
          progressBackgroundColor={themed.progressBgColor}
        />
      }
    >
      {/* HEADER */}
      <View style={themed.header}>
        <View style={tw`flex-row justify-between items-start`}>
          <View style={tw`flex-1`}>
            <Text style={themed.headerSubText}>
              Welcome back,
            </Text>

            <TouchableOpacity
              onPress={() => setBranchModal(true)}
              style={tw`flex-row items-center mb-1`}
              activeOpacity={0.7}
            >
              <Text style={themed.headerTitle}>
                {userData?.user?.name || userData?.name}
              </Text>
              <MaterialIcons
                name="arrow-drop-down"
                size={24}
                color={themed.iconMuted}
              />
            </TouchableOpacity>

            <View style={tw`flex-row items-center`}>
              <Icon name="calendar" size={12} color="#9ca3af" />
              <Text style={themed.dateText}>
                {fromDate} → {toDate}
              </Text>
            </View>
          </View>

          <View style={tw`flex-row gap-2`}>
            <TouchableOpacity
              onPress={() => setFilterModal(true)}
              style={themed.filterButton}
            >
              <MaterialIcons
                name="calendar-month"
                size={18}
                color={themed.filterButtonIcon}
              />
              <Text style={themed.filterButtonText}>
                Filter
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {selectedBranches.length > 0 && (
        <View style={tw`px-2 mb-2 mt-1`}>
          <View style={themed.sectionCard}>
            <View style={themed.sectionHeader}>
              <Text style={themed.sectionHeaderText}>
                Selected Branches
              </Text>
            </View>

            <View style={tw`flex-row items-center px-3 py-2`}>
              <Icon name="store-marker" size={18} color="#3b82f6" style={tw`mr-2`} />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={tw`flex-1`}
                contentContainerStyle={tw`flex-row items-center py-1`}
              >
                {selectedBranches.map((branch) => (
                  <TouchableOpacity
                    key={branch.branchId}
                    onPress={() => toggleBranch(branch)}
                    style={tw`flex-row items-center bg-blue-50 rounded-full px-3 py-1.5 mr-2 border border-blue-200`}
                    activeOpacity={0.7}
                  >
                    <Icon name="store" size={12} color="#3b82f6" style={tw`mr-1`} />
                    <Text style={tw`text-xs text-blue-700 font-medium`}>
                      {branch.branchName}
                    </Text>
                    <Icon
                      name="close-circle"
                      size={14}
                      color="#3b82f6"
                      style={tw`ml-1`}
                    />
                  </TouchableOpacity>
                ))}

                {selectedBranches.length > 1 && (
                  <TouchableOpacity
                    onPress={clearAllBranches}
                    style={themed.selectedBranchesClearBtn}
                    activeOpacity={0.7}
                  >
                    <Icon name="delete-outline" size={14} color="#ef4444" />
                    <Text style={tw`text-xs text-red-600 font-medium ml-1`}>
                      Clear All
                    </Text>
                  </TouchableOpacity>
                )}
              </ScrollView>

              <View style={tw`ml-2 bg-blue-500 rounded-full min-w-[24px] h-6 items-center justify-center px-1.5`}>
                <Text style={tw`text-white text-xs font-bold`}>
                  {selectedBranches.length}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* MAIN */}
      <View style={[themed.card, tw`px-4 py-4 mb-4 mt-1`]}>
        <View style={tw`flex-row justify-between items-center`}>
          <View style={tw`flex-row items-center gap-3`}>
            <View style={tw`w-10 h-10 rounded-full bg-blue-100 items-center justify-center`}>
              <Icon name="wallet" size={22} color="#3B82F6" />
            </View>
            <View>
              <Text style={themed.mutedText}>
                Wallet Balance
              </Text>
              <Text style={tw`${walletData?.balanceMain > 0 ? 'text-green-800' : 'text-red-500'} text-xl font-bold`}>
                ₹ {walletData?.balanceMain}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('DashboardPayment')}
            style={tw`bg-blue-500 px-4 py-2 rounded-lg flex-row items-center gap-2`}
            activeOpacity={0.8}
          >
            <Icon name="plus" size={18} color="#fff" />
            <Text style={tw`text-white font-semibold text-sm`}>Add Money</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={tw`px-4 py-4`}>
        <DashboardCollection
          ref={dashboardRef}
          fromDate={fromDate}
          toDate={toDate}
          branchId={selectedBranchIds}
        />
      </View>

      {/* DATE FILTER MODAL */}
      <Modal visible={filetrModal} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setFilterModal(false)}>
          <View style={tw`flex-1 justify-center items-center bg-black/60`}>
            <TouchableWithoutFeedback>
              <View style={[themed.modalContainer, tw`w-[95%]`]}>
                <FilterDate
                  onClose={() => setFilterModal(false)}
                  onSave={handleSearchFilter}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* BRANCH MODAL */}
      <Modal
        visible={branchModal}
        transparent
        animationType="slide"
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={() => setBranchModal(false)}>
          <View style={tw`flex-1 justify-center items-center bg-black/60`}>
            <TouchableWithoutFeedback>
              <View style={[themed.modalCard, tw`w-[90%] max-h-[85%] shadow-xl`]}>
                <View style={themed.modalHeader}>
                  <View>
                    <Text style={themed.modalTitle}>
                      Select Branches
                    </Text>
                    <Text style={themed.modalSubTitle}>
                      Choose branches to view data
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setBranchModal(false)}
                    style={themed.modalCloseButton}
                  >
                    <Icon name="close" size={20} color={themed.closeIconColor} />
                  </TouchableOpacity>
                </View>

                <View style={themed.searchWrapper}>
                  <View style={themed.searchBox}>
                    <Feather name="search" size={18} color="#9ca3af" />
                    <TextInput
                      style={themed.searchInput}
                      placeholder="Search branches..."
                      placeholderTextColor="#9ca3af"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      returnKeyType="search"
                      clearButtonMode="never"
                      underlineColorAndroid="transparent"
                    />

                    {searchQuery?.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setSearchQuery('')}
                        activeOpacity={0.7}
                        style={tw`p-1`}
                      >
                        <Feather name="x-circle" size={18} color="#9ca3af" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {filteredBranches.length > 0 && (
                  <TouchableOpacity
                    onPress={handleSelectAll}
                    style={themed.selectAllRow}
                  >
                    <View style={tw`flex-row items-center`}>
                      <View style={themed.selectAllIconWrap}>
                        <Icon name="select-all" size={18} color="#3b82f6" />
                      </View>
                      <View>
                        <Text style={themed.selectAllTitle}>
                          {selectAll ? 'Deselect All' : 'Select All'}
                        </Text>
                        <Text style={themed.selectAllSubTitle}>
                          {filteredBranches.length} branches available
                        </Text>
                      </View>
                    </View>
                    <View style={tw`w-5 h-5 rounded border-2 items-center justify-center ${selectAll ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                      {selectAll && <AntDesign name="check" size={12} color="white" />}
                    </View>
                  </TouchableOpacity>
                )}

                <FlatList
                  data={filteredBranches}
                  keyExtractor={(item, index) => `${item.branchId}-${index}`}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={tw`py-2`}
                  ListEmptyComponent={
                    <View style={tw`items-center justify-center py-12`}>
                      <Icon name="store-off" size={48} color="#d1d5db" />
                      <Text style={themed.emptyTitle}>
                        No branches found
                      </Text>
                      <Text style={themed.emptySubTitle}>
                        Try searching with different keywords
                      </Text>
                    </View>
                  }
                  renderItem={({ item }) => {
                    const isSelected = selectedBranches.some(
                      (b) => b.branchId === item.branchId
                    );

                    return (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => toggleBranch(item)}
                        style={themed.listItem(isSelected)}
                      >
                        <View style={tw`flex-row items-center flex-1`}>
                          <View style={themed.listItemIconWrap(isSelected)}>
                            <Icon
                              name={isSelected ? 'store-check' : 'store'}
                              size={20}
                              color={isSelected ? '#3b82f6' : theme === 'dark' ? '#D1D5DB' : '#6b7280'}
                            />
                          </View>
                          <View style={tw`flex-1`}>
                            <Text style={themed.listItemText}>
                              {item.branchName}
                            </Text>
                          </View>
                        </View>

                        <View style={tw`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                          {isSelected && <AntDesign name="check" size={12} color="white" />}
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />

                <View style={themed.footer}>
                  <View style={tw`flex-row gap-3`}>
                    <TouchableOpacity
                      onPress={() => setBranchModal(false)}
                      style={themed.cancelButton}
                    >
                      <Text style={themed.cancelButtonText}>
                        Cancel
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setBranchModal(false)}
                      style={tw`flex-1 py-3 rounded-xl bg-blue-500 shadow-sm`}
                    >
                      <Text style={tw`text-white text-center font-semibold`}>
                        Apply ({selectedBranches.length})
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
};

export default LabDashboard;