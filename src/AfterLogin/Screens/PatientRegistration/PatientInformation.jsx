import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  Modal,
  Animated,
} from 'react-native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import tw from 'twrnc';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../../Authorization/AuthContext';
import { useTheme } from '../../../../Authorization/ThemeContext';
import { getThemeStyles } from '../../../utils/themeStyles';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../../../Authorization/api';
import styles from '../../../utils/InputStyle';
import Icon from 'react-native-vector-icons/Feather';
import AllClientList from './AllClientList';
import CenterInfo from './CenterInfo';
import BottomModal from '../../../utils/BottomModal';
import SearchServiceUpdate from './SearchServiceUpdate';

const PatientInformation = () => {
  const navigation = useNavigation();
  const { loginBranchId, userId, allBranchInfo } = useAuth();
  const { theme } = useTheme();
  const themed = getThemeStyles(theme);

  const [allBranchInfos, setAllBranchInfos] = useState([]);
  const [selectedClient, setSelectedClient] = useState([]);
  const [hasInitializedBranches, setHasInitializedBranches] = useState(false);

  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [clientModal, setClientModal] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [selectedTests, setSelectedTests] = useState([]);

  const modalSlideAnim = useRef(new Animated.Value(0)).current;
  const allBranchInfoRef = useRef(allBranchInfo);
  const hasInitializedBranchesRef = useRef(hasInitializedBranches);
  const hasNewTests = useMemo(
    () => (Array.isArray(selectedTests) ? selectedTests : []).some((t) => Boolean(t?.isNew)),
    [selectedTests]
  );

  const currentDate = useMemo(() => new Date(), []);

  const defaultFromDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate());
    return d;
  }, []);

  const [form, setForm] = useState({
    uhid: '',
    labNo: '',
    barCode: '',
    fromDate: defaultFromDate.toISOString().split('T')[0],
    toDate: currentDate.toISOString().split('T')[0],
    patientName: '',
  });

  const normalizeBranchList = useCallback((list) => {
    if (!Array.isArray(list)) return [];

    return list.filter(Boolean).map((item) => ({
      ...item,
      BranchId: item?.BranchId ?? item?.branchId,
      BranchCode: item?.BranchCode ?? item?.branchCode,
      BranchName: item?.BranchName ?? item?.branchName,
    }));
  }, []);

  const formatDateForApi = useCallback((dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-GB', { month: 'short' });
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }, []);

  const openModal = () => {
    setClientModal(true);

    Animated.spring(modalSlideAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 12,
      bounciness: 4,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalSlideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setClientModal(false);
    });
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

    if (selectedDate && selectedDate <= currentDate) {
      const formatted = selectedDate.toISOString().split('T')[0];

      setForm((prev) => ({
        ...prev,
        [type === 'from' ? 'fromDate' : 'toDate']: formatted,
      }));
    }
  };

  useEffect(() => {
    if (hasInitializedBranches) return;

    const mergedBranchList = normalizeBranchList(
      allBranchInfos.length > 0 ? allBranchInfos : allBranchInfo
    );

    if (mergedBranchList.length > 0) {
      setSelectedClient(mergedBranchList);
      setHasInitializedBranches(true);
    }
  }, [allBranchInfos, allBranchInfo, hasInitializedBranches, normalizeBranchList]);

  useEffect(() => {
    allBranchInfoRef.current = allBranchInfo;
  }, [allBranchInfo]);

  useEffect(() => {
    hasInitializedBranchesRef.current = hasInitializedBranches;
  }, [hasInitializedBranches]);

  const branchDataToUse = normalizeBranchList(
    allBranchInfos.length > 0 ? allBranchInfos : allBranchInfo
  );

  const getAllActiveBranch = useCallback(async (branchId, currentUserId) => {
    if (!branchId || !currentUserId) return;

    try {
      const response = await api.get(
        `Branch/branch-user-list?branchId=${branchId}&userId=${currentUserId}`
      );

      // console.log('API response', response?.data);

      const apiBranchList = normalizeBranchList(response?.data);
      const fallbackBranchList = normalizeBranchList(allBranchInfoRef.current);

      const finalBranchList =
        apiBranchList.length > 0 ? apiBranchList : fallbackBranchList;

      setAllBranchInfos(finalBranchList);

      if (!hasInitializedBranchesRef.current) {
        setSelectedClient(finalBranchList);
        setHasInitializedBranches(true);
        hasInitializedBranchesRef.current = true;
      }
    } catch (error) {
      console.log('API error', error?.response?.data || error?.message);

      const fallbackBranchList = normalizeBranchList(allBranchInfoRef.current);
      setAllBranchInfos(fallbackBranchList);

      if (!hasInitializedBranchesRef.current) {
        setSelectedClient(fallbackBranchList);
        setHasInitializedBranches(true);
        hasInitializedBranchesRef.current = true;
      }
    }
  }, [normalizeBranchList]);

  useFocusEffect(
    useCallback(() => {
      getAllActiveBranch(loginBranchId, userId);
    }, [getAllActiveBranch, loginBranchId, userId])
  );

  const handleSearch = () => {
    Keyboard.dismiss();
    const selectedBranchIds =
      selectedClient?.length > 0
        ? selectedClient.map((item) => item.BranchId).join(',')
        : String(loginBranchId || 1);

    const payload = {
      branchId: String(loginBranchId || 1),
      typeId: '0',

      uhid: form.uhid?.trim() || '',
      patientName: form.patientName?.trim() || '',
      labNo: form.labNo?.trim() || '',
      barCode: form.barCode?.trim() || '',

      fromDate: formatDateForApi(form.fromDate),
      toDate: formatDateForApi(form.toDate),

      branchIdList: selectedBranchIds,
      roleId: '0',

      ipdNo: '',
      subCategoryId: '',
      corporateId: '',
      subSubCategoryId: '',
      investigationName: '',
      filter: '',
    };

    // console.log('patient search payload', payload);

    navigation.navigate('PatientInformationList', {
      payload,
    });
  };

  const handleSaveTests = (payload) => {
    const incoming = Array.isArray(payload?.services) ? payload.services : [];

    setSelectedTests((prev) => {
      const prevById = new Map(
        (Array.isArray(prev) ? prev : []).map((x) => [Number(x?.serviceItemId), x])
      );

      return incoming.map((svc) => {
        const id = Number(svc?.serviceItemId);
        const existing = prevById.get(id);
        return {
          ...existing,
          ...svc,
          isNew: existing ? Boolean(existing.isNew) : true,
        };
      });
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[themed.childScreen, tw`flex-1`]}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={tw`p-4`}
      >
        <CenterInfo condition={'false'} />
        <View style={[themed.border, themed.cardPadding,themed.sectionCard]}>
          <Text style={themed.inputLabel}>UHID</Text>
          <TextInput
            value={form.uhid}
            onChangeText={(v) => handleChange('uhid', v)}
            placeholder="Enter UHID"
            style={[themed.inputBox, themed.inputText, tw`px-2`]}
            placeholderTextColor={themed.inputPlaceholder}
          />

          <View style={tw`mt-2`}>
            <Text style={themed.inputLabel}>Patient Name</Text>
            <TextInput
              maxLength={20}
              value={form.patientName}
              onChangeText={(v) => handleChange('patientName', v)}
              placeholder="Enter Patient Name"
              style={[themed.inputBox, themed.inputText, tw`px-2`]}
              placeholderTextColor={themed.inputPlaceholder}
            />
          </View>

          <View style={tw`flex-row mt-2`}>
            <View style={tw`flex-1 mr-2`}>
              <Text style={themed.inputLabel}>Lab No</Text>
              <TextInput
                value={form.labNo}
                maxLength={10}
                onChangeText={(v) => handleChange('labNo', v)}
                placeholder="Enter Lab No"
                style={[themed.inputBox, themed.inputText, tw`px-2`]}
                placeholderTextColor={themed.inputPlaceholder}
              />
            </View>

            <View style={tw`flex-1 ml-2`}>
              <Text style={themed.inputLabel}>Barcode</Text>
              <TextInput
                maxLength={10}
                value={form.barCode}
                onChangeText={(v) => handleChange('barCode', v)}
                placeholder="Enter Barcode"
                style={[themed.inputBox, themed.inputText, tw`px-2`]}
                placeholderTextColor={themed.inputPlaceholder}
              />
            </View>
          </View>

          <View style={tw`flex-row gap-3 mb-3 mt-2`}>
            <View style={themed.inputContainer}>
              <Text style={themed.inputLabel}>From Date</Text>
              <TouchableOpacity
                onPress={() => setShowFromDatePicker(true)}
                style={[
                  themed.inputBox,
                  tw`flex-row justify-between items-center px-2`,
                ]}
              >
                <Text style={themed.inputText}>{form.fromDate}</Text>
                <MaterialIcons
                  name="calendar-today"
                  size={20}
                  color={themed.chevronColor}
                />
              </TouchableOpacity>
            </View>

            <View style={themed.inputContainer}>
              <Text style={themed.inputLabel}>To Date</Text>
              <TouchableOpacity
                onPress={() => setShowToDatePicker(true)}
                style={[
                  themed.inputBox,
                  tw`flex-row justify-between items-center px-2`,
                ]}
              >
                <Text style={themed.inputText}>{form.toDate}</Text>
                <MaterialIcons
                  name="calendar-today"
                  size={20}
                  color={themed.chevronColor}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={themed.inputContainer}>
            <View style={tw`flex-row items-center`}>
              <Text style={themed.inputLabel}>Client/Panel</Text>
              <Text style={tw`text-red-500 text-base ml-1`}>*</Text>
              <Text style={[themed.transactionLabel, tw`ml-1`]}>
                ({selectedClient?.length || 0} selected)
              </Text>
            </View>

            <TouchableOpacity
              onPress={openModal}
              style={[
                styles.dropDownButton,
                themed.inputBox,
                tw`flex-row justify-between items-center`,
              ]}
            >
              <Text numberOfLines={1} style={[themed.inputText, tw`flex-1`]}>
                {selectedClient?.length > 0
                  ? `${selectedClient[0].BranchName}${selectedClient.length > 1
                    ? ` +${selectedClient.length - 1}`
                    : ''
                  }`
                  : 'Select Client'}
              </Text>
              <Icon name="chevron-down" size={18} color={themed.chevronColor} />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleSearch}
          style={[themed.searchButton, tw`mt-3`]}
          activeOpacity={0.8}
         >
          <Feather name="search" size={16} color="#fff" />
          <Text style={[themed.searchButtonText, tw`ml-2`]}>Search</Text>
        </TouchableOpacity>

        {selectedTests?.length ? (
          <View style={tw`mt-5`}>
            <View style={tw`flex-row items-center justify-between mb-2`}>
              <Text style={[themed.inputText, tw`font-bold`]}>
                Selected Tests ({selectedTests.length})
              </Text>
              {hasNewTests ? (
                <View style={tw`bg-blue-600 px-2 py-0.5 rounded-full`}>
                  <Text style={tw`text-white text-[10px] font-bold`}>NEW</Text>
                </View>
              ) : null}
            </View>

            {selectedTests.map((test) => (
              <View
                key={String(test?.serviceItemId)}
                style={[
                  themed.globalCard,
                  themed.border,
                  tw`p-3 rounded-xl mb-2`,
                ]}
              >
                <View style={tw`flex-row items-center justify-between`}>
                  <Text
                    style={[themed.inputText, tw`flex-1 pr-2 font-semibold`]}
                    numberOfLines={1}
                  >
                    {test?.serviceName || '-'}
                  </Text>

                  {test?.isNew ? (
                    <View style={tw`bg-green-600 px-2 py-0.5 rounded-full`}>
                      <Text style={tw`text-white text-[10px] font-bold`}>NEW</Text>
                    </View>
                  ) : null}
                </View>

                <View style={tw`flex-row justify-between mt-2`}>
                  <Text style={[themed.transactionLabel, tw`text-xs`]}>
                    Rate: ₹{Number(test?.amount) || 0}
                  </Text>
                  <Text style={[themed.transactionLabel, tw`text-xs`]}>
                    Qty: {Number(test?.qty) || 1}
                  </Text>
                  {Number(test?.isUrgent) === 1 ? (
                    <Text style={tw`text-red-500 text-xs font-semibold`}>
                      Urgent
                    </Text>
                  ) : (
                    <Text style={[themed.transactionLabel, tw`text-xs`]}>
                      Regular
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>



      {showFromDatePicker && (
        <DateTimePicker
          value={new Date(form.fromDate)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, d) => handleDateChange(e, d, 'from')}
          maximumDate={currentDate}
        />
      )}

      {showToDatePicker && (
        <DateTimePicker
          value={new Date(form.toDate)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, d) => handleDateChange(e, d, 'to')}
          maximumDate={currentDate}
        />
      )}

      <Modal
        visible={clientModal}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={tw`flex-1 bg-black/50`}>
          <TouchableOpacity
            style={tw`flex-1`}
            activeOpacity={1}
            onPress={closeModal}
          />

          <Animated.View
            style={[
              themed.modalCard,
              tw`rounded-t-2xl p-3 h-[70%]`,
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

            <AllClientList
              BranchData={branchDataToUse}
              selectedItems={selectedClient}
              onClose={closeModal}
              onSelect={(items) => setSelectedClient(items)}
            />
          </Animated.View>
        </View>
      </Modal>

      <BottomModal
        visible={testModalVisible}
        onClose={() => setTestModalVisible(false)}
      >
        <View style={{ height: 520 }}>
          <SearchServiceUpdate
            initialSelectedTests={selectedTests}
            onSaveTests={handleSaveTests}
            onClose={() => setTestModalVisible(false)}
          />
        </View>
      </BottomModal>
    </KeyboardAvoidingView>
  );
};

export default PatientInformation;
