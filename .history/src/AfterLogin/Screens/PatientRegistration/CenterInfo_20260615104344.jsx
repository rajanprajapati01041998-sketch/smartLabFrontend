import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import tw from 'twrnc';
import styles from '../../../utils/InputStyle';
import Icon from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../../Authorization/api';
import { useAuth } from '../../../../Authorization/AuthContext';
import { useTheme } from '../../../../Authorization/ThemeContext';
import { getThemeStyles } from '../../../utils/themeStyles';
import Feather from 'react-native-vector-icons/Feather';
import { Accordion } from 'react-native-paper/lib/typescript/components/List/List';
import AnimatedBorder from '../../../../AnimatedBorder';


const CenterInfo = ({ condition }) => {
  const [allBranchInfo, setAllBranchInfo] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [ratePannel, setRatePannel] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [uhid, setUhid] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCenterInfo, setShowCenterInfo] = useState(false);
  const [branchDetails, setBranchDetails] = useState(null);
  const [branchSearch, setBranchSearch] = useState('');
  const [selectedId, setSelectedId] = useState('1');
  const [patientSearchModal, setPatientSearchModal] = useState(false);
  const [patientSearchList, setPatientSearchList] = useState([]);
  const [patientSearchLoading, setPatientSearchLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null)
  const [accordian, setAccordian] = useState(false)
  const [lastPress, setLastPress] = useState(0);

  const { theme } = useTheme();
  const themed = getThemeStyles(theme);

  const searchOptions = [
    { id: '1', label: 'UHID', value: 'UHID' },
    { id: '2', label: 'Mobile', value: 'ContactNo' },
    { id: '3', label: 'Patient Name', value: 'PatientName' },
  ];

  const selectedSearchType =
    searchOptions.find(x => x.id === selectedId) || searchOptions[0];

  const {
    setCorporateId,
    setPatientData,
    setCenterLoginBranchId,
    loginBranchId,
    centerLoginBranchId,
    setAddBarcode,
    userId
  } = useAuth();

  const currentBranchId = selectedItem?.BranchId || loginBranchId;

  useFocusEffect(
    useCallback(() => {
      getBranchInfo();
    }, []),
  );

  useEffect(() => {
    const BranchId =
      selectedItem?.BranchId || loginBranchId || centerLoginBranchId;

    if (BranchId) {
      getBranchDetails(BranchId);
      getrateListPanel(BranchId);
      setCenterLoginBranchId(BranchId);
    }
  }, [selectedItem, loginBranchId]);

  useEffect(() => {
    setUhid('');
    setErrorMessage('');
    setPatientSearchList([]);
    setPatientSearchModal(false);
  }, [selectedId]);

  const filteredBranchList = useMemo(() => {
    if (!branchSearch?.trim()) return allBranchInfo;

    const searchValue = branchSearch.trim().toLowerCase();

    return allBranchInfo.filter(item => {
      const branchName = item?.branchName?.toLowerCase() || '';
      const branchCode = String(item?.branchCode || '').toLowerCase();

      return (
        branchName.includes(searchValue) || branchCode.includes(searchValue)
      );
    });
  }, [allBranchInfo, branchSearch]);

  const getBranchInfo = async () => {
    try {
      // const response = await api.get(`Branch/branch-user-list?BranchId=${loginBranchId}&userId=${userId}`)
      conat res
      console.log("branch list=", response.data)
      const data = await AsyncStorage.getItem('AllBranch');
      setAllBranchInfo(response.data.data);
      const defaultBranch =
        response?.data?.data.find(item => item.BranchId === loginBranchId) ||
        response?.data?.data[0];
      setSelectedItem(defaultBranch);
    } catch (error) {
      console.log('Error reading branches', error);
    }
  };

  const getBranchDetails = async BranchId => {
    try {
      if (!loginBranchId) return;

      const response = await api.get(
        `Branch/branch-details?BranchId=${BranchId}`,
      );

      setAddBarcode(response.data?.data?.[0]?.isPrePrintedBarcode);

      const details =
        response?.data?.data && Array.isArray(response.data.data)
          ? response.data.data[0]
          : response?.data?.data || null;

      setBranchDetails(details);
    } catch (error) {
      console.log('branch details error', error);
      setBranchDetails(null);
    }
  };

  const getrateListPanel = async BranchId => {
    try {
      if (!loginBranchId) return;
      const response = await api.get(`Rate/rate-list/${BranchId}`);
      setCorporateId(response.data?.[0]?.CorporateId);
      setRatePannel(response.data);
    } catch (error) {
      console.log('getrateListPanel', error);
      setRatePannel(null);
    }
  };

  const getPatientByUhid = async selectedUhid => {
    try {
      if (!currentBranchId) {
        setErrorMessage('Branch not selected');
        return;
      }

      setLoading(true);

      const response = await api.get(
        `Patient/get-by-uhid?uhid=${encodeURIComponent(
          selectedUhid,
        )}&BranchId=${currentBranchId}`,
      );

      const patient = response?.data?.data;

      if (patient) {
        setPatientData(patient);
        setUhid(patient?.UHID || selectedUhid);
        setErrorMessage('');
      } else {
        setErrorMessage('Patient not found');
      }
    } catch (error) {
      console.log('get patient by uhid error', error);
      setErrorMessage(error?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const searchPatientMaster = async () => {
    try {
      if (!currentBranchId) {
        setErrorMessage('Branch not selected');
        return;
      }

      if (!uhid?.trim()) {
        setErrorMessage(`Please enter ${selectedSearchType.label}`);
        return;
      }

      setPatientSearchLoading(true);
      setErrorMessage('');
      setPatientSearchList([]);
      setPatientSearchModal(false);

      const response = await api.get(
        `Patient/search-patient-master?searchText=${encodeURIComponent(
          uhid.trim(),
        )}&BranchId=${currentBranchId}`,
      );

      const list = response?.data?.data || [];

      if (!Array.isArray(list) || list.length === 0) {
        setErrorMessage('No patient found');
        return;
      }

      if (list.length === 1) {
        const selectedUhid = list[0]?.UHID || '';

        if (!selectedUhid) {
          setErrorMessage('UHID not found');
          return;
        }

        setUhid(selectedUhid);
        await getPatientByUhid(selectedUhid);
        return;
      }

      setPatientSearchList(list);
      setPatientSearchModal(true);
    } catch (error) {
      console.log('search patient master error', error);
      setErrorMessage(error?.response?.data?.message || 'Something went wrong');
    } finally {
      setPatientSearchLoading(false);
    }
  };

  const handleSelectPatient = async patient => {
    setPatientSearchModal(false);
    setPatientSearchList([]);

    const selectedUhid = patient?.UHID || '';

    if (!selectedUhid) {
      setErrorMessage('UHID not found');
      return;
    }

    setUhid(selectedUhid);
    await getPatientByUhid(selectedUhid);
  };

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleSelectBranch = branch => {
    setSelectedItem(branch);
    setIsModalVisible(false);
    setBranchSearch('');
  };

  const handleAccordian = (index) => {
    setCurrentIndex(index)
    setAccordian(!accordian)
  }

  const handleCardPress = (item, index) => {
    const now = Date.now();

    if (now - lastPress < 300) {
      // Double click
      handleSelectPatient(item);
    } else {
      // Single click
      handleAccordian(index);
    }

    setLastPress(now);
  };
  const handleAccordiansClose = () => {
    setCurrentIndex(null)
    setAccordian(false)
  }

  const renderBranchItem = ({ item }) => {
    const isSelected = selectedItem?.BranchId === item?.BranchId;

    return (
      <TouchableOpacity
        onPress={() => handleSelectBranch(item)}
        activeOpacity={0.8}
        style={[
          themed.globalCard,
          themed.border,
          tw`border rounded-xl px-4 py-3 mb-3`,
          isSelected && { borderColor: '#3b82f6' },
        ]}>
        <View style={tw`flex-row justify-between items-center`}>
          <View style={tw`flex-1 pr-3`}>
            <Text style={[themed.inputText, tw`font-medium`]}>
              {item?.BranchName}
            </Text>
          </View>

          {isSelected ? (
            <MaterialIcons name="check-circle" size={22} color="#3b82f6" />
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  const renderPatientItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => handleSelectPatient(item)}
        style={[
          themed.globalCard,
          themed.border,
          tw`border rounded-2xl p-4 mb-3`,
        ]}>
        <TouchableOpacity
          onPress={() => handleCardPress(item, index)}
          style={tw`flex-row justify-between items-start `}>
          <View style={tw`flex-1 pr-3`}>
            <Text
              numberOfLines={1}
              style={[themed.inputText, tw`text-base font-bold`]}>
              {item?.PatientName || 'N/A'}
            </Text>

            <Text style={[themed.labelText, tw`text-xs mt-1`]}>
              {item?.UHID || 'N/A'}
            </Text>
          </View>

          <View style={tw`items-end`}>
            <View style={tw`px-3 py-1 rounded-full bg-blue-100`}>
              <Text style={tw`text-blue-700 text-[11px] font-bold`}>
                {item?.Gender || 'N/A'}
              </Text>
            </View>

            <Text style={[themed.inputText, tw`font-semibold mt-1 text-xs`]}>
              {item?.RegistrationDate || 'N/A'}
            </Text>
          </View>
        </TouchableOpacity>
        {accordian && currentIndex == index && <View>
          <View style={[themed.border, tw`border-t my-3`]} />
          <View style={tw`flex-row justify-between`}>
            <View style={tw`flex-1 items-center flex-row gap-2`}>
              <FontAwesome name='mobile' size={20} color={themed.iconColor} />
              <Text style={[themed.inputText, tw`font-semibold`]}>
                {item?.ContactNumber || ''}
              </Text>
            </View>

            <View style={tw`flex-1 items-center flex-row gap-2`}>
              <FontAwesome name='calendar' size={16} color={themed.iconColor} />
              <Text style={[themed.inputText, tw`font-semibold `]}>
                {item?.Age || 'N/A'}
              </Text>
            </View>
          </View>

          <View
            style={[
              tw`mt-3 p-3 rounded-xl`,
              {
                backgroundColor:
                  theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc',
              },
            ]}>
            <Text style={[themed.labelText, tw`text-[11px] uppercase`]}>
              Center
            </Text>
            <Text style={[themed.inputText, tw`font-medium mt-1`]}>
              {item?.BranchName || 'N/A'}
            </Text>
          </View>

          {!!item?.Address && (
            <View style={tw`mt-3`}>
              <Text style={[themed.labelText, tw`text-[11px] uppercase`]}>
                Address
              </Text>
              <Text style={[themed.inputText, tw`mt-1 text-sm`]}>
                {item?.Address}
              </Text>
            </View>
          )}
        </View>}
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[themed.card, themed.cardPadding, themed.childScreen, tw`mb-4`]}>
      <TouchableOpacity
        onPress={() => setShowCenterInfo(!showCenterInfo)}
        style={tw`flex-row justify-between items-center mb-3`}>
        <Text style={styles.patientInfoText}>Center Information</Text>

        <Entypo
          style={[tw`rounded-full p-1`, themed.modalCloseButton]}
          name={showCenterInfo ? 'chevron-down' : 'chevron-up'}
          size={20}
          color={themed.chevronColor}
        />
      </TouchableOpacity>

      {showCenterInfo && (
        <>
          <View style={tw`flex-row justify-between`}>
            <View style={tw`w-[48%]`}>
              <Text style={themed.inputLabel}>Center</Text>

              <TouchableOpacity
                onPress={() => setIsModalVisible(true)}
                style={[
                  themed.inputBox,
                  tw`flex-row justify-between items-center mt-1`,
                ]}>
                <Text style={themed.inputText} numberOfLines={1}>
                  {selectedItem?.BranchName || 'Select Center'}
                </Text>

                <Icon
                  name="chevron-down"
                  size={18}
                  color={themed.chevronColor}
                />
              </TouchableOpacity>
            </View>

            <View style={tw`w-[48%]`}>
              <Text style={themed.inputLabel}>Panel</Text>

              <View style={[themed.inputBox, tw`mt-1`]}>
                <Text style={themed.inputText} numberOfLines={1}>
                  {ratePannel?.[0]?.CorporateName || 'Select Panel'}
                </Text>
              </View>
            </View>
          </View>

          <View style={tw`my-3`}>
            <Text style={[themed.labelText, tw`mb-2 font-bold`]}>
              Search By
            </Text>

            <View style={tw`flex-row gap-2`}>
              {searchOptions.map(item => {
                const active = selectedId === item.id;

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    onPress={() => setSelectedId(item.id)}
                    style={[
                      tw`flex-row items-center px-3 py-2 rounded-full border`,
                      {
                        borderColor: active
                          ? '#3376ea'
                          : theme === 'dark'
                            ? '#475569'
                            : '#d1d5db',
                        backgroundColor: active
                          ? theme === 'dark'
                            ? 'rgba(51,118,234,0.18)'
                            : '#eff6ff'
                          : 'transparent',
                      },
                    ]}>
                    <View
                      style={[
                        tw`w-4 h-4 rounded-full border mr-2 items-center justify-center`,
                        {
                          borderColor: active
                            ? '#3376ea'
                            : theme === 'dark'
                              ? '#cbd5e1'
                              : '#6b7280',
                        },
                      ]}>
                      {active && (
                        <View style={tw`w-2 h-2 rounded-full bg-blue-600`} />
                      )}
                    </View>

                    <Text
                      style={[
                        tw`text-xs font-bold`,
                        {
                          color: active
                            ? '#3376ea'
                            : theme === 'dark'
                              ? '#e5e7eb'
                              : '#111827',
                        },
                      ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {!condition && (
            <View style={tw`flex-row items-end gap-3 mt-1`}>
              <View style={tw`flex-1`}>
                <Text style={themed.inputLabel}>
                  Enter {selectedSearchType.label}
                </Text>

                <AnimatedBorder>
                  <View style={tw`relative`}>
                    <TextInput
                      value={uhid}
                      onChangeText={setUhid}
                      placeholder={`Search ${selectedSearchType.label}`}
                      placeholderTextColor={themed.inputPlaceholder}
                      keyboardType={
                        selectedSearchType.value === 'ContactNo'
                          ? 'number-pad'
                          : 'default'
                      }
                      style={[
                        themed.inputText,
                        tw`h-12 pr-12`,
                      ]}
                    />

                    {uhid?.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setUhid('')}
                        style={tw`absolute right-3 top-3`}>
                        <Feather
                          name="x-circle"
                          size={20}
                          color={themed.inputPlaceholder}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </AnimatedBorder>
              </View>

              <TouchableOpacity
                onPress={searchPatientMaster}
                disabled={patientSearchLoading}
                style={tw`h-14 w-22 rounded-xl bg-blue-500 justify-center items-center`}>

                {patientSearchLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={tw`text-white font-medium`}>
                    Search
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {errorMessage ? (
            <View style={tw`flex-row items-center mt-2`}>
              <MaterialIcons name="error-outline" size={16} color="#ef4444" />
              <Text style={tw`text-red-500 ml-1`}>{errorMessage}</Text>
            </View>
          ) : null}
        </>
      )}

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setIsModalVisible(false);
          setBranchSearch('');
        }}>
        <TouchableWithoutFeedback
          onPress={() => {
            setIsModalVisible(false);
            setBranchSearch('');
          }}>
          <View style={tw`flex-1 bg-black/50 justify-end`}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <View
                style={[
                  themed.childScreen,
                  themed.border,
                  tw`rounded-t-3xl p-4 max-h-[85%]`,
                ]}>
                <View style={tw`flex-row justify-between items-center mb-3`}>
                  <Text style={[themed.inputText, tw`text-lg font-semibold`]}>
                    Select Center
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      setIsModalVisible(false);
                      setBranchSearch('');
                    }}>
                    <MaterialIcons
                      name="close"
                      size={24}
                      color={themed.chevronColor}
                    />
                  </TouchableOpacity>
                </View>

                <View
                  style={[
                    themed.globalCard,
                    themed.border,
                    tw`flex-row items-center px-4 py-3 rounded-xl border mb-3`,
                  ]}>
                  <Icon name="search" size={18} color={themed.chevronColor} />

                  <TextInput
                    value={branchSearch}
                    onChangeText={setBranchSearch}
                    placeholder="Search center..."
                    placeholderTextColor={themed.inputPlaceholder}
                    style={[tw`flex-1 ml-3 py-1`, themed.inputText]}
                  />

                  {branchSearch ? (
                    <TouchableOpacity onPress={() => setBranchSearch('')}>
                      <MaterialIcons
                        name="close"
                        size={20}
                        color={themed.chevronColor}
                      />
                    </TouchableOpacity>
                  ) : null}
                </View>

                <FlatList
                  data={filteredBranchList}
                  keyExtractor={(item, index) => String(item?.BranchId || index)}
                  renderItem={renderBranchItem}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={tw`pb-6`}
                  style={tw`flex-1`}
                  ListEmptyComponent={
                    <Text style={[themed.labelText, tw`text-center mt-4`]}>
                      No center found
                    </Text>
                  }
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={patientSearchModal}
        transparent
        animationType="slide"
        onRequestClose={() => setPatientSearchModal(false)}>
        <TouchableWithoutFeedback onPress={() => setPatientSearchModal(false)}>
          <View style={tw`flex-1 bg-black/50 justify-end`}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <View
                style={[
                  themed.childScreen,
                  themed.border,
                  tw`rounded-t-3xl p-4 max-h-[80%]`,
                ]}>
                <View style={tw`flex-row justify-between items-center mb-3`}>
                  <Text style={[themed.inputText, tw`text-lg font-semibold`]}>
                    Select Patient
                  </Text>

                  <TouchableOpacity onPress={() => setPatientSearchModal(false)}>
                    <MaterialIcons
                      name="close"
                      size={24}
                      color={themed.chevronColor}
                    />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={patientSearchList}
                  keyExtractor={(item, index) =>
                    String(item?.PatientId || item?.UHID || index)
                  }
                  renderItem={renderPatientItem}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={tw`pb-6`}
                  ListEmptyComponent={
                    <Text style={[themed.labelText, tw`text-center mt-4`]}>
                      No patient found
                    </Text>
                  }
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default CenterInfo;