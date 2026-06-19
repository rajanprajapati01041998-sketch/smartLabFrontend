import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Modal,
  TouchableWithoutFeedback,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getBillReceiptReprint } from '../../../utils/BillReceiptsReprint';
import { useAuth } from '../../../../Authorization/AuthContext';
import { useTheme } from '../../../../Authorization/ThemeContext';
import { getThemeStyles } from '../../../utils/themeStyles';
import tw from 'twrnc';
import FilterDate from '../FilterDate';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useToast } from '../../../../Authorization/ToastContext';

const getCurrentDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();

  return `${day}-${month}-${year}`;
};

const ReceiptReprintHome = () => {
  const { loginBranchId, allBranchInfo } = useAuth();
  const { theme } = useTheme();
  const themed = getThemeStyles(theme);
  const navigation = useNavigation();
  const { showToast } = useToast();

  const [receiptData, setReceiptData] = useState([]);
  const [filetrModal, setFilterModal] = useState(false);
  const [branchModal, setBranchModal] = useState(false);
  const [nodata, setNodata] = useState(false);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [searchData, setSearchData] = useState({
    uhid: '',
    name: '',
    billNo: '',
    receiptNo: '',
    fromDate: getCurrentDate(),
    toDate: getCurrentDate(),
  });

  // console.log("branch info:", allBranchInfo);

  // Initialize with current branch
  React.useEffect(() => {
    if (allBranchInfo && allBranchInfo.length > 0) {
      const currentBranch = allBranchInfo.find(
        branch => branch.BranchId === loginBranchId
      );
      if (currentBranch) {
        setSelectedBranches([currentBranch]);
      }
    }
  }, [allBranchInfo, loginBranchId]);

  const handleInputChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedBranches([]);
      setSelectAll(false);
    } else {
      setSelectedBranches([...allBranchInfo]);
      setSelectAll(true);
    }
  };

  const handleBranchSelect = (branch) => {
    if (selectAll) {
      // If select all is active, deselect all first
      setSelectAll(false);
      setSelectedBranches([branch]);
    } else {
      const isSelected = selectedBranches.some(b => b.BranchId === branch.BranchId);
      if (isSelected) {
        setSelectedBranches(selectedBranches.filter(b => b.BranchId !== branch.BranchId));
      } else {
        setSelectedBranches([...selectedBranches, branch]);
      }
    }
  };

  const fetchPatientData = async () => {
    if (selectedBranches.length === 0) {
      showToast && showToast('Please select at least one branch', 'error');
      return;
    }

    try {
      // If multiple branches selected, fetch data for all branches
      const allPromises = selectedBranches.map(branch =>
        getBillReceiptReprint(
          branch.BranchId.toString(),
          searchData.uhid,
          searchData.name,
          0,
          searchData.billNo,
          searchData.receiptNo,
          searchData.fromDate,
          searchData.toDate
        )
      );

      const responses = await Promise.all(allPromises);

      // Combine data from all branches
      let combinedData = [];
      responses.forEach((response, index) => {
        const data = response?.data?.Data || response?.data || [];
        // Add branch information to each receipt
        const dataWithBranch = data.map(item => ({
          ...item,
          BranchId: selectedBranches[index].BranchId,
          BranchName: selectedBranches[index].BranchName,
          BranchCode: selectedBranches[index].BranchCode,
        }));
        combinedData = [...combinedData, ...dataWithBranch];
      });

      setReceiptData(combinedData);

      if (combinedData.length > 0) {
        setNodata(false);
        navigation.navigate('ReceiptReprintList', {
          data: combinedData,
          selectedBranches: selectedBranches,
        });
      } else {
        setNodata(true);
        showToast && showToast('No data found for selected branches', 'info');
      }
    } catch (error) {
      console.log('Error:', error);
      showToast && showToast('Error fetching data', 'error');
    }
  };

  const handleSearchFilter = (data) => {
    setSearchData(prev => ({
      ...prev,
      fromDate: data.fromDate,
      toDate: data.toDate,
    }));
    setFilterModal(false);
  };

  const renderBranchItem = ({ item }) => {
    const isSelected = selectedBranches.some(b => b.BranchId === item.BranchId);

    return (
      <TouchableOpacity
        style={[
          tw`flex-row items-center justify-between p-3 mb-2 rounded-lg`,
          isSelected ? themed.selectedBranchItem : themed.branchItem,
          { backgroundColor: isSelected ? '#3b82f6' : themed.cardBackground }
        ]}
        onPress={() => handleBranchSelect(item)}
       >
        <View style={tw`flex-1`}>
          <Text style={[
            themed.inputText,
            tw`font-semibold`,
            isSelected && tw`text-white`
          ]}>
            {item.BranchName} - ({item.BranchId})
          </Text>

        </View>
        {isSelected && (
          <MaterialIcons name="check-circle" size={24} color="white" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[themed.childScreen2, tw`flex-1 p-2`]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Branch Selection */}
        <View
          style={[
            themed.border_b,
            tw`flex-col justify-between items-start pb-2 mb-3`,
          ]}
         >
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
                        ? selectedBranches[0].BranchName
                        : `${selectedBranches.length} Branches Selected`}
                  </Text>
                </View>
                <MaterialIcons name="arrow-drop-down" size={24} color={themed.filterButtonIcon} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[themed.filterButton, tw`ml-2`]}
              onPress={() => setFilterModal(true)}
            >
              <MaterialIcons name="calendar-month" size={18} color={themed.filterButtonIcon} />
              <Text style={themed.filterButtonText}>Date</Text>
            </TouchableOpacity>

          </View>
          <View style={tw`flex-row mt-1 justify-start items-center`}>
            <Icon name="calendar" size={14} color="#9ca3af" />
            <Text style={themed.dateText}>
              {searchData.fromDate} → {searchData.toDate}
            </Text>
          </View>
        </View>


        {/* Selected Branches Summary */}
        {selectedBranches.length > 0 && (
          <View style={tw`mb-3`}>
            <Text style={[themed.inputLabel, tw`mb-1`]}>Selected Branches:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={tw`flex-row flex-wrap`}>
                {selectedBranches.map(branch => (
                  <View
                    key={branch.BranchId}
                    style={tw`mr-2 mb-2 px-3 py-1 rounded-full flex-row items-center bg-red-300/30 border border-[#ea0c0c]`}
                  >
                    <Text style={tw`text-xs font-medium text-red-400`}>
                      {branch.BranchName}
                    </Text>

                    <TouchableOpacity
                      onPress={() => handleBranchSelect(branch)}
                      style={tw`ml-2`}
                    >
                      <MaterialIcons
                        name="close"
                        size={14}
                        color="#ea0c0c"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Search Fields */}
        <View style={tw`flex-row flex-wrap justify-between mt-3`}>
          <View style={tw`w-[48%] mb-3`}>
            <Text style={themed.inputLabel}>UHID</Text>
            <TextInput
              value={searchData.uhid}
              onChangeText={(text) => handleInputChange('uhid', text)}
              style={[themed.inputBox, themed.inputText]}
              placeholder="Enter UHID"
              placeholderTextColor={themed.inputPlaceholder}
            />
          </View>

          <View style={tw`w-[48%] mb-3`}>
            <Text style={themed.inputLabel}>Patient Name</Text>
            <TextInput
              value={searchData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              style={[themed.inputBox, themed.inputText]}
              placeholder="Enter Patient Name"
              placeholderTextColor={themed.inputPlaceholder}
            />
          </View>

          <View style={tw`w-[48%] mb-3`}>
            <Text style={themed.inputLabel}>Bill No</Text>
            <TextInput
              value={searchData.billNo}
              onChangeText={(text) => handleInputChange('billNo', text)}
              style={[themed.inputBox, themed.inputText]}
              placeholder="Enter Bill No"
              placeholderTextColor={themed.inputPlaceholder}
            />
          </View>

          <View style={tw`w-[48%] mb-3`}>
            <Text style={themed.inputLabel}>Receipt No</Text>
            <TextInput
              value={searchData.receiptNo}
              onChangeText={(text) => handleInputChange('receiptNo', text)}
              style={[themed.inputBox, themed.inputText]}
              placeholder="Enter Receipt No"
              placeholderTextColor={themed.inputPlaceholder}
            />
          </View>
        </View>

        {/* Search Button */}
        <TouchableOpacity
          style={[
            themed.searchButton,
            tw`mt-2 self-end px-5 py-3 rounded-lg`,
          ]}
          onPress={fetchPatientData}
        >
          <Text style={themed.searchButtonText}>Search</Text>
        </TouchableOpacity>

        {nodata && (
          <View style={tw`mt-20 items-center justify-center`}>
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/128/13983/13983163.png',
              }}
              style={tw`w-24 h-24`}
              resizeMode="contain"
            />
            <Text style={tw`mt-3 text-gray-500 text-base`}>No data found</Text>
          </View>
        )}
      </ScrollView>

      {/* Branch Selection Modal */}
      <Modal visible={branchModal} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setBranchModal(false)}>
          <View style={tw`flex-1 justify-center items-center bg-black/60`}>
            <TouchableWithoutFeedback>
              <View style={[
                themed.modalContainer,
                tw`w-[95%] max-h-[80%] rounded-xl overflow-hidden`
              ]}>
                <View style={[themed.modalHeader, tw`p-4 border-b`, themed.border_b]}>
                  <Text style={[themed.modalHeaderTitle, tw`text-lg font-semibold`]}>
                    Select Branches
                  </Text>
                  <TouchableOpacity onPress={() => setBranchModal(false)}>
                    <MaterialIcons name="close" size={24} color={themed.iconColor} />
                  </TouchableOpacity>
                </View>

                <View style={tw`p-4 border-b`}>
                  <TouchableOpacity
                    style={[
                      tw`flex-row items-center justify-between p-3 rounded-lg`,
                      selectAll ? themed.selectedBranchItem : themed.branchItem
                    ]}
                    onPress={handleSelectAll}
                  >
                    <View style={tw`flex-row items-center`}>
                      <MaterialIcons
                        name={selectAll ? "check-box" : "check-box-outline-blank"}
                        size={24}
                        color={selectAll ? "#3b82f6" : themed.textColor}
                      />
                      <Text style={[themed.inputText, tw`ml-3 font-semibold`]}>
                        Select All Branches
                      </Text>
                    </View>
                    {selectAll && (
                      <MaterialIcons name="check-circle" size={24} color="#3b82f6" />
                    )}
                  </TouchableOpacity>
                </View>

                <FlatList 
                  data={allBranchInfo}
                  renderItem={renderBranchItem}
                  keyExtractor={(item) => item.BranchId.toString()}
                  contentContainerStyle={tw`p-4`}
                  showsVerticalScrollIndicator={false}
                />

                <View style={[tw`p-4 flex-row justify-between`, themed.modalFooter]}>
                  <TouchableOpacity
                    style={[tw`flex-1 mr-2 py-3 rounded-lg`, themed.closeButton]}
                    onPress={() => setBranchModal(false)}
                  >
                    <Text style={[themed.closeButtonText, tw`py-1`]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[tw`flex-1 ml-2 py-3 rounded-lg`, themed.saveButton]}
                    onPress={() => setBranchModal(false)}
                  >
                    <Text style={[themed.saveButtonText, tw`py-1`]}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Date Filter Modal */}
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
    </SafeAreaView>
  );
};

export default ReceiptReprintHome;