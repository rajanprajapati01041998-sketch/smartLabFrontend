import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  Animated,
  Easing,
  FlatList,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import tw from 'twrnc';
import styles from '../../../utils/InputStyle';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import AllDepartMent from './AllDepartMent';
import { useAuth } from '../../../../Authorization/AuthContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../../../Authorization/api';
import { SafeAreaView } from 'react-native-safe-area-context';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HelpDeskHome = () => {
  const { loginBranchId, userId, allBranchInfo } = useAuth();

  const [departmentModal, setDepartmentModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('--Department--');
  const [clientModal, setClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState([]);
  const [allBranchInfos, setAllBranchInfos] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [hasInitializedBranches, setHasInitializedBranches] = useState(false);

  const filterHeightAnim = useRef(new Animated.Value(0)).current;
  const filterRotateAnim = useRef(new Animated.Value(0)).current;

  const navigation = useNavigation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  const currentDate = new Date();
  const defaultFromDate = new Date();
  defaultFromDate.setDate(defaultFromDate.getDate());

  const [form, setForm] = useState({
    uhid: '',
    labNo: '',
    barCode: '',
    fromDate: defaultFromDate.toISOString().split('T')[0],
    toDate: currentDate.toISOString().split('T')[0],
    patientName: '',
    investigationName: '',
  });

  const normalizeBranchList = (list) => {
    if (!Array.isArray(list)) return [];
    return list.filter(Boolean).map((item) => ({
      ...item,
      BranchId: item?.BranchId ?? item?.branchId,
      BranchCode: item?.BranchCode ?? item?.branchCode,
      BranchName: item?.BranchName ?? item?.branchName,
    }));
  };

  const getAllActiveBranch = async (branchId, userId) => {
    if (!branchId || !userId) return;

    try {
      const response = await api.get(
        `Branch/branch-user-list?branchId=${branchId}&userId=${userId}`
      );

      console.log('API response', response?.data);

      const apiBranchList = normalizeBranchList(response?.data);
      const fallbackBranchList = normalizeBranchList(allBranchInfo);
      const finalBranchList =
        apiBranchList.length > 0 ? apiBranchList : fallbackBranchList;

      setAllBranchInfos(finalBranchList);

      // ✅ auto-select all branches only first time
      if (!hasInitializedBranches) {
        setSelectedClient(finalBranchList);
        setHasInitializedBranches(true);
      }
    } catch (error) {
      console.log('API error', error);

      const fallbackBranchList = normalizeBranchList(allBranchInfo);
      setAllBranchInfos(fallbackBranchList);

      if (!hasInitializedBranches) {
        setSelectedClient(fallbackBranchList);
        setHasInitializedBranches(true);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      getAllActiveBranch(loginBranchId, userId);
    }, [loginBranchId, userId, allBranchInfo, hasInitializedBranches])
  );

  // ✅ extra safety: if API comes late or auth branch list changes, initialize once
  useEffect(() => {
    if (hasInitializedBranches) return;

    const mergedBranchList = normalizeBranchList(
      allBranchInfos.length > 0 ? allBranchInfos : allBranchInfo
    );

    if (mergedBranchList.length > 0) {
      setSelectedClient(mergedBranchList);
      setHasInitializedBranches(true);
    }
  }, [allBranchInfos, allBranchInfo, hasInitializedBranches]);

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    Animated.timing(filterRotateAnim, {
      toValue: showFilter ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();

    Animated.timing(filterHeightAnim, {
      toValue: showFilter ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
    }).start();

    setShowFilter(!showFilter);
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(0.5)),
      }),
    ]).start();
  }, []);

  const animateButtonPress = () => {
    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 50,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
      }),
    ]).start();
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (event, selectedDate, type) => {
    if (Platform.OS === 'android') {
      if (type === 'from') {
        setShowFromDatePicker(false);
      } else {
        setShowToDatePicker(false);
      }
    }

    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];

      if (selectedDate <= currentDate) {
        setForm((prev) => ({
          ...prev,
          [type === 'from' ? 'fromDate' : 'toDate']: formattedDate,
        }));

        Animated.sequence([
          Animated.timing(buttonScale, {
            toValue: 1.05,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(buttonScale, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  };

  const handleSearch = () => {
    animateButtonPress();

    const branchIdList = selectedClient
      .map((item) => item.BranchId)
      .filter(Boolean)
      .join(',');

    const payload = {
      branchId: loginBranchId ? String(loginBranchId) : '1',
      typeId: '0',
      uhid: form.uhid,
      ipdNo: '',
      labNo: form.labNo,
      fromDate: form.fromDate,
      toDate: form.toDate,
      barCode: form.barCode,
    
      investigationName: form.investigationName,
      patientName: form.patientName,
      branchIdList,
      corporateId: '',
      filter: null,
    };

    navigation.navigate('ListHelpDeskPatient', { payload });
  };

  const modalSlideAnim = useRef(new Animated.Value(0)).current;

  const openModal = (modalType) => {
    Animated.spring(modalSlideAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 12,
      bounciness: 4,
    }).start();

    if (modalType === 'department') {
      setDepartmentModal(true);
    } else {
      setClientModal(true);
    }
  };

  const closeModal = (modalType) => {
    Animated.timing(modalSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (modalType === 'department') {
        setDepartmentModal(false);
      } else {
        setClientModal(false);
      }
    });
  };

  const ClientPanelList = ({ onClose, onSelect, BranchData }) => {
    const [selectedList, setSelectedList] = useState(selectedClient);

    useEffect(() => {
      setSelectedList(selectedClient);
    }, [selectedClient]);

    const toggleSelect = (item) => {
      const itemId = item.BranchId;
      const exists = selectedList.some((i) => i.BranchId === itemId);

      const updatedList = exists
        ? selectedList.filter((i) => i.BranchId !== itemId)
        : [...selectedList, item];

      setSelectedList(updatedList);
      setSelectedClient(updatedList);
      onSelect?.(updatedList);
    };

    const handleSelectAll = () => {
      if (selectedList.length === BranchData.length) {
        setSelectedList([]);
        setSelectedClient([]);
        onSelect?.([]);
      } else {
        setSelectedList(BranchData);
        setSelectedClient(BranchData);
        onSelect?.(BranchData);
      }
    };

    const renderItem = ({ item }) => {
      const isSelected = selectedList.some((i) => i.BranchId === item.BranchId);

      return (
        <TouchableOpacity
          onPress={() => toggleSelect(item)}
          style={tw`flex-row justify-between items-center py-3 px-2 border-b border-gray-200`}
        >
          <Text style={tw`text-base ${isSelected ? 'text-blue-500 font-medium' : 'text-gray-700'}`}>
            {item.BranchCode} - {item.BranchName}
          </Text>

          <MaterialIcons
            name={isSelected ? 'check-box' : 'check-box-outline-blank'}
            size={22}
            color={isSelected ? '#3b82f6' : '#999'}
          />
        </TouchableOpacity>
      );
    };

    return (
      <View style={tw`flex-1`}>
        <TouchableOpacity
          onPress={handleSelectAll}
          style={tw`flex-row justify-between items-center py-3 px-2 border-b border-gray-300 mb-2`}
        >
          <Text style={tw`text-base font-bold text-gray-800`}>
            {selectedList.length === BranchData.length ? 'Deselect All' : 'Select All'}
          </Text>

          <MaterialIcons
            name={selectedList.length === BranchData.length ? 'check-box' : 'check-box-outline-blank'}
            size={22}
            color="#3b82f6"
          />
        </TouchableOpacity>

        <FlatList
          data={BranchData}
          keyExtractor={(item, index) =>
            item?.BranchId ? item.BranchId.toString() : index.toString()
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity
          onPress={onClose}
          style={tw`bg-blue-500 p-3 rounded-lg mt-3 mb-4`}
        >
          <Text style={tw`text-white text-center font-bold text-base`}>
            Done ({selectedList.length})
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const chevronRotation = filterRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const branchDataToUse = normalizeBranchList(
    allBranchInfos.length > 0 ? allBranchInfos : allBranchInfo
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <Animated.View style={[tw`flex-1`, { opacity: fadeAnim }]}>
        <ScrollView
          style={tw`flex-1`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`p-4 pb-24`}
        >
          <TouchableOpacity
            onPress={toggleFilter}
            style={[
              styles.cardShadow,
              tw`flex flex-row justify-between items-center bg-white p-3 rounded-lg mb-3`,
            ]}
            activeOpacity={0.7}
          >
            <Text style={[styles.labelText, tw`font-medium`]}>Filter</Text>
            <Animated.View
              style={[
                tw`bg-gray-100 rounded-full p-1.5`,
                { transform: [{ rotate: chevronRotation }] },
              ]}
            >
              <Entypo name="chevron-down" size={18} color="#4b5563" />
            </Animated.View>
          </TouchableOpacity>

          <Animated.View
            style={[
              {
                overflow: 'hidden',
                opacity: filterHeightAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
                transform: [
                  {
                    translateY: filterHeightAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {showFilter && (
              <View style={[styles.cardShadow, tw`bg-white rounded-lg p-4 mb-3`]}>
                <View style={tw`flex-row gap-3 mb-3`}>
                  <View style={tw`flex-1`}>
                    <Text style={styles.labelText}>UHID</Text>
                    <TextInput
                      value={form.uhid}
                      onChangeText={(t) => handleChange('uhid', t)}
                      placeholder="Enter UHID"
                      style={[styles.inputBox, tw`bg-white border border-gray-200 rounded-lg p-3`]}
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={styles.labelText}>Barcode</Text>
                    <TextInput
                      value={form.barCode}
                      onChangeText={(t) => handleChange('barCode', t)}
                      placeholder="Enter barcode"
                      style={[styles.inputBox, tw`bg-white border border-gray-200 rounded-lg p-3`]}
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>

                <View style={tw`flex-row gap-3 mb-3`}>
                  <View style={tw`flex-1`}>
                    <Text style={styles.labelText}>Patient Name</Text>
                    <TextInput
                      value={form.patientName}
                      onChangeText={(t) => handleChange('patientName', t)}
                      placeholder="Enter patient name"
                      style={[styles.inputBox, tw`bg-white border border-gray-200 rounded-lg p-3`]}
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={styles.labelText}>Lab No.</Text>
                    <TextInput
                      value={form.labNo}
                      onChangeText={(t) => handleChange('labNo', t)}
                      placeholder="Enter Lab No"
                      style={[styles.inputBox, tw`bg-white border border-gray-200 rounded-lg p-3`]}
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>
              </View>
            )}
          </Animated.View>

          <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
            <View style={[styles.cardShadow, tw`bg-white rounded-lg p-4`]}>
              <View style={tw`flex-row gap-3 mb-3`}>
                <View style={tw`flex-1`}>
                  <Text style={styles.labelText}>From Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowFromDatePicker(true)}
                    style={[
                      styles.inputBox,
                      tw`bg-white border border-gray-200 rounded-lg flex-row justify-between items-center p-3`,
                    ]}
                  >
                    <Text style={tw`text-gray-700`}>{form.fromDate}</Text>
                    <MaterialIcons name="calendar-today" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                <View style={tw`flex-1`}>
                  <Text style={styles.labelText}>To Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowToDatePicker(true)}
                    style={[
                      styles.inputBox,
                      tw`bg-white border border-gray-200 rounded-lg flex-row justify-between items-center p-3`,
                    ]}
                  >
                    <Text style={tw`text-gray-700`}>{form.toDate}</Text>
                    <MaterialIcons name="calendar-today" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={tw`mb-3`}>
                <Text style={styles.labelText}>Investigation Name</Text>
                <TextInput
                  value={form.investigationName}
                  onChangeText={(t) => handleChange('investigationName', t)}
                  placeholder="Enter investigation name"
                  style={[styles.inputBox, tw`bg-white border border-gray-200 rounded-lg p-3`]}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={tw`flex-col gap-3 mb-3`}>
                <View style={tw`flex-1`}>
                  <Text style={styles.labelText}>Select Department</Text>
                  <TouchableOpacity
                    onPress={() => openModal('department')}
                    style={[
                      styles.dropDownButton,
                      tw`bg-white flex-row justify-between items-center p-3 rounded-lg border border-gray-200`,
                    ]}
                  >
                    <Text style={tw`text-gray-700 flex-1`}>
                      {selectedDepartment !== '--Department--'
                        ? selectedDepartment
                        : 'Select Department'}
                    </Text>
                    <Icon name="chevron-down" size={18} color="gray" />
                  </TouchableOpacity>
                </View>

                <View style={tw`flex-1`}>
                  <View style={tw`flex-row items-center`}>
                    <Text style={styles.labelText}>Client/Panel</Text>
                    <Text style={tw`text-red-500 text-base ml-1`}>*</Text>
                    <Text style={tw`text-gray-500 text-xs ml-1`}>
                      ({selectedClient?.length || 0} selected)
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => openModal('client')}
                    style={[
                      styles.dropDownButton,
                      tw`bg-white flex-row justify-between items-center p-3 rounded-lg border border-gray-200`,
                    ]}
                  >
                    <Text numberOfLines={1} style={tw`text-gray-700 flex-1`}>
                      {selectedClient?.length > 0
                        ? `${selectedClient[0].BranchName}${
                            selectedClient.length > 1 ? ` +${selectedClient.length - 1}` : ''
                          }`
                        : 'Select Client'}
                    </Text>
                    <Icon name="chevron-down" size={18} color="gray" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              disabled={selectedClient.length === 0}
              onPress={handleSearch}
              style={[
                tw`py-3.5 rounded-md shadow-md mt-5`,
                selectedClient.length === 0 ? tw`bg-gray-400` : tw`bg-blue-500`,
              ]}
              activeOpacity={0.8}
            >
              <Text style={tw`text-white text-center font-bold text-base`}>
                Search Patients
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        {showFromDatePicker && (
          <DateTimePicker
            value={new Date(form.fromDate)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => handleDateChange(event, date, 'from')}
            maximumDate={currentDate}
          />
        )}

        {showToDatePicker && (
          <DateTimePicker
            value={new Date(form.toDate)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => handleDateChange(event, date, 'to')}
            maximumDate={currentDate}
          />
        )}

        <Modal
          visible={departmentModal}
          transparent
          animationType="none"
          onRequestClose={() => closeModal('department')}
        >
          <View style={tw`flex-1 bg-black/50`}>
            <TouchableOpacity
              style={tw`flex-1`}
              activeOpacity={1}
              onPress={() => closeModal('department')}
            />
            <Animated.View
              style={[
                tw`bg-gray-50 rounded-t-2xl p-3 h-[70%]`,
                {
                  transform: [
                    {
                      translateY: modalSlideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [600, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={tw`items-center mb-2`}>
                <View style={tw`w-10 h-1 bg-gray-300 rounded-full`} />
              </View>
              <AllDepartMent
                onClose={() => closeModal('department')}
                onSelect={(item) => setSelectedDepartment(item)}
              />
            </Animated.View>
          </View>
        </Modal>

        <Modal
          visible={clientModal}
          transparent
          animationType="none"
          onRequestClose={() => closeModal('client')}
        >
          <View style={tw`flex-1 bg-black/50`}>
            <TouchableOpacity
              style={tw`flex-1`}
              activeOpacity={1}
              onPress={() => closeModal('client')}
            />
            <Animated.View
              style={[
                tw`bg-gray-50 rounded-t-2xl p-3 h-[70%]`,
                {
                  transform: [
                    {
                      translateY: modalSlideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [600, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={tw`items-center mb-2`}>
                <View style={tw`w-10 h-1 bg-gray-300 rounded-full`} />
              </View>
              <ClientPanelList
                BranchData={branchDataToUse}
                onClose={() => closeModal('client')}
                onSelect={(item) => setSelectedClient(item)}
              />
            </Animated.View>
          </View>
        </Modal>
      </Animated.View>
    </SafeAreaView>
  );
};

export default HelpDeskHome;