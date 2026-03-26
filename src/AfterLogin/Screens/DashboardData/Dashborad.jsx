import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  FlatList
} from 'react-native';
import tw from 'twrnc';
import CustomStyles from '../../../../Custom.styles';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import FilterDate from '../FilterDate';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../../Authorization/AuthContext';
import DashboardCollection from './DashboardCollection';
import { Checkbox } from 'react-native-paper';
import ButtonStyles from '../../../utils/ButtonStyle';

const LabDashboard = () => {
  const { userData, allBranchInfo, deviceData } = useAuth();
  const navigation = useNavigation();

  const [filetrModal, setFilterModal] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [branchModal, setBranchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectAll, setSelectAll] = useState(false);

  // ✅ MULTI SELECT STATE
  const [selectedBranches, setSelectedBranches] = useState([]);

  // ✅ Set today's date
  useEffect(() => {
    console.log("device data", deviceData)
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    setFromDate(formattedDate);
    setToDate(formattedDate);
  }, []);

  // ✅ Convert dd-MM-yyyy → yyyy-MM-dd
  const formatDateToAPI = (date) => {
    const [day, month, year] = date.split("-");
    return `${year}-${month}-${day}`;
  };

  // ✅ Handle filter
  const handleSearchFilter = (data) => {
    const formattedFrom = formatDateToAPI(data.fromDate);
    const formattedTo = formatDateToAPI(data.toDate);

    setFromDate(formattedFrom);
    setToDate(formattedTo);

    setFilterModal(false);
  };

  // ✅ MULTI SELECT LOGIC
  const toggleBranch = (branch) => {
    const exists = selectedBranches.find(
      (b) => b.branchId === branch.branchId
    );

    if (exists) {
      setSelectedBranches((prev) =>
        prev.filter((b) => b.branchId !== branch.branchId)
      );
    } else {
      setSelectedBranches((prev) => [...prev, branch]);
    }
  };

  // ✅ Filter branches based on search
  const filteredBranches = allBranchInfo?.filter(branch =>
    branch.branchName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // ✅ Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all - remove all filtered branches
      filteredBranches.forEach(branch => {
        if (selectedBranches.some(b => b.branchId === branch.branchId)) {
          toggleBranch(branch);
        }
      });
    } else {
      // Select all - add all filtered branches
      filteredBranches.forEach(branch => {
        if (!selectedBranches.some(b => b.branchId === branch.branchId)) {
          toggleBranch(branch);
        }
      });
    }
    setSelectAll(!selectAll);
  };

  // ✅ Update select all state when selection changes
  useEffect(() => {
    const allFilteredSelected = filteredBranches.length > 0 &&
      filteredBranches.every(branch =>
        selectedBranches.some(b => b.branchId === branch.branchId)
      );
    setSelectAll(allFilteredSelected);
  }, [selectedBranches, filteredBranches]);

  // ✅ Convert to string for API
  const selectedBranchIds =
    selectedBranches.length > 0
      ? selectedBranches.map((b) => b.branchId).join(",")
      : allBranchInfo?.map((b) => b.branchId).join(",");

  // ✅ Clear all branches selection
  const clearAllBranches = () => {
    setSelectedBranches([]);
  };

  return (
    <ScrollView
      style={tw`flex-1 bg-gray-50`}
      showsVerticalScrollIndicator={false}
    >


      {/* HEADER */}
      <View style={tw`px-4 pt-4 pb-4 bg-white border-b border-gray-200`}>
        <View style={tw`flex-row justify-between items-start`}>
          <View style={tw`flex-1 `}>
            <Text style={tw`text-xs text-gray-500 mb-1`}>Welcome back,</Text>
            {/* Branch Dropdown */}
            <TouchableOpacity
              onPress={() => setBranchModal(true)}
              style={tw`flex-row items-center mb-1`}
              activeOpacity={0.7}
            >
              <Text style={tw`text-md font-bold text-gray-800`}>
                {userData?.user?.name || userData?.name}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="#6b7280" />
            </TouchableOpacity>

            {/* Selected Branch Display */}


            {/* Date */}
            <View style={tw`flex-row items-center mt-2`}>
              <Icon name="calendar" size={12} color="#9ca3af" />
              <Text style={tw`text-xs text-gray-500 ml-1`}>
                {fromDate} → {toDate}
              </Text>
            </View>
          </View>

          {/* Right Buttons */}
          <View style={tw`flex-row gap-2`}>
            <TouchableOpacity
              onPress={() => setFilterModal(true)}
              style={[
                tw`flex-row items-center px-3 py-2 rounded-lg`,
                ButtonStyles.button,
              ]}
            >
              <MaterialIcons name="calendar-month" size={18} color="#374151" />
              <Text style={tw`ml-2 text-sm text-gray-700`}>Filter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("Profile")}
              style={[
                ButtonStyles.button,

              ]}
            >
              <MaterialIcons name="supervised-user-circle" size={18} color="#374151" />
              <Text style={tw`ml-2 text-sm text-gray-700`}>Profile</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
      {selectedBranches.length > 0 && <View style={tw`px-2 mb-2 mt-1`}>
        <View style={tw`bg-white rounded-xl  shadow-sm overflow-hidden`}>
          {/* Header Label */}
          <View style={tw`px-3 pt-2 pb-1 border-b border-gray-100 bg-gray-50`}>
            <Text style={tw`text-xs font-semibold text-gray-600 uppercase tracking-wide`}>
              Selected Branches
            </Text>
          </View>

          {/* Content */}
          <View style={tw`flex-row items-center px-3 py-2`}>
            <Icon name="store-marker" size={18} color="#3b82f6" style={tw`mr-2`} />

            {selectedBranches.length > 0 ? (
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

                {/* Clear All Button */}
                {selectedBranches.length > 1 && (
                  <TouchableOpacity
                    onPress={clearAllBranches}
                    style={tw`flex-row items-center bg-gray-100 rounded-full px-3 py-1.5`}
                    activeOpacity={0.7}
                  >
                    <Icon name="delete-outline" size={14} color="#ef4444" />
                    <Text style={tw`text-xs text-red-600 font-medium ml-1`}>
                      Clear All
                    </Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            ) : (
              <View style={tw`flex-1 flex-row items-center`}>
                <Text style={tw`text-xs text-gray-500 italic`}>No branches selected</Text>
                <Text style={tw`text-xs text-gray-400 ml-1`}>(showing all)</Text>
              </View>
            )}

            {/* Branch Count Badge */}
            {selectedBranches.length > 0 && (
              <View style={tw`ml-2 bg-blue-500 rounded-full min-w-[24px] h-6 items-center justify-center px-1.5`}>
                <Text style={tw`text-white text-xs font-bold`}>
                  {selectedBranches.length}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>}


      {/* MAIN */}
      <View style={tw`px-4 py-4`}>

        {/* Dashboard */}
        <DashboardCollection
          fromDate={fromDate}
          toDate={toDate}
          branchId={selectedBranchIds}
        />

        {/* Support Ticket Section */}
        <TouchableOpacity
          style={tw`bg-white border border-gray-200 p-4 mt-4 rounded-xl shadow-sm`}
          activeOpacity={0.8}
        >
          <View style={tw`flex-row items-center`}>
            <View style={tw`bg-blue-50 p-2 rounded-lg mr-3`}>
              <MaterialIcons name="support-agent" size={24} color="#3b82f6" />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-base font-semibold text-gray-800`}>Raise Support Ticket</Text>
              <Text style={tw`text-xs text-gray-500 mt-1`}>Get help with your queries</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
          </View>
        </TouchableOpacity>

      </View>

      {/* DATE FILTER MODAL */}
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

      {/* BRANCH MODAL - PROFESSIONAL UI */}
      <Modal
        visible={branchModal}
        transparent
        animationType="slide"
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={() => setBranchModal(false)}>
          <View style={tw`flex-1 justify-center items-center bg-black/60`}>
            <TouchableWithoutFeedback>
              <View style={tw`bg-white rounded-2xl w-[90%] max-h-[85%] overflow-hidden shadow-xl`}>

                {/* Header */}
                <View style={tw`flex-row justify-between items-center p-5 border-b border-gray-100 bg-white`}>
                  <View>
                    <Text style={tw`text-lg font-bold text-gray-800`}>Select Branches</Text>
                    <Text style={tw`text-xxs text-gray-500 mt-1`}>
                      Choose branches to view data
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setBranchModal(false)}
                    style={tw`p-2 rounded-full bg-gray-100`}
                  >
                    <Icon name="close" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={tw`px-4 border-b border-gray-100 bg-gray-50`}>
                  <View style={tw`flex-row items-center bg-white rounded-xl px-3  border border-gray-200`}>
                    <Feather name="search" size={16} color="#9ca3af" />
                    <TextInput
                      style={tw`flex-1 ml-2 text-base text-gray-700`}
                      placeholder="Search branches..."
                      placeholderTextColor="#9ca3af"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Icon name="close-circle" size={18} color="#9ca3af" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Select All Option */}
                {filteredBranches.length > 0 && (
                  <TouchableOpacity
                    onPress={handleSelectAll}
                    style={tw`flex-row justify-between items-center p-4 border-b border-gray-100 bg-gray-50`}
                  >
                    <View style={tw`flex-row items-center`}>
                      <View style={tw`p-2 rounded-lg bg-white mr-3`}>
                        <Icon name="select-all" size={18} color="#3b82f6" />
                      </View>
                      <View>
                        <Text style={tw`font-semibold text-gray-700`}>
                          {selectAll ? 'Deselect All' : 'Select All'}
                        </Text>
                        <Text style={tw`text-xs text-gray-500`}>
                          {filteredBranches.length} branches available
                        </Text>
                      </View>
                    </View>
                    <View style={tw`w-5 h-5 rounded border-2 ${selectAll ? 'bg-blue-500 border-blue-500' : 'border-gray-300'} items-center justify-center`}>
                      {selectAll && <AntDesign name="check" size={12} color="white" />}
                    </View>
                  </TouchableOpacity>
                )}

                {/* Branch List */}
                <FlatList
                  data={filteredBranches}
                  keyExtractor={(item, index) => `${item.branchId}-${index}`}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={tw`py-2`}
                  ListEmptyComponent={
                    <View style={tw`items-center justify-center py-12`}>
                      <Icon name="store-off" size={48} color="#d1d5db" />
                      <Text style={tw`text-gray-400 text-base mt-3 font-medium`}>
                        No branches found
                      </Text>
                      <Text style={tw`text-gray-400 text-sm mt-1`}>
                        Try searching with different keywords
                      </Text>
                    </View>
                  }
                  renderItem={({ item, index }) => {
                    const isSelected = selectedBranches.some(
                      (b) => b.branchId === item.branchId
                    );
                    return (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => toggleBranch(item)}
                        style={tw`flex-row items-center justify-between px-4 py-3 mx-2 my-1 rounded-xl ${isSelected ? 'bg-blue-50 border border-blue-200' : 'bg-white border border-gray-100'}`}
                      >
                        <View style={tw`flex-row items-center flex-1`}>
                          <View style={tw`p-2 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-100'} mr-3`}>
                            <Icon
                              name={isSelected ? "store-check" : "store"}
                              size={20}
                              color={isSelected ? "#3b82f6" : "#6b7280"}
                            />
                          </View>
                          <View style={tw`flex-1`}>
                            <Text style={tw`font-medium text-gray-800 text-base`}>
                              {item.branchName}
                            </Text>

                          </View>
                        </View>
                        <View style={tw`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                          {isSelected && <AntDesign name="check" size={12} color="white" />}
                        </View>
                      </TouchableOpacity>
                    )
                  }}
                />

                {/* Footer Actions */}
                <View style={tw`p-4 border-t border-gray-100 bg-white`}>
                  <View style={tw`flex-row gap-3`}>
                    <TouchableOpacity
                      onPress={() => setBranchModal(false)}
                      style={tw`flex-1 py-3 rounded-xl border border-gray-300 bg-white`}
                    >
                      <Text style={tw`text-center text-gray-700 font-medium`}>
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