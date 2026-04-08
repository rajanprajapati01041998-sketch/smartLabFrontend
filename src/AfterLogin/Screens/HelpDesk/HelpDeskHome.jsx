import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Platform, Animated, Easing, FlatList, LayoutAnimation, UIManager } from 'react-native'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import tw from 'twrnc'
import styles from '../../../utils/InputStyle'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import BottomModal from '../../../utils/BottomModal'
import AllDepartMent from './AllDepartMent'
import { useAuth } from '../../../../Authorization/AuthContext'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../../../Authorization/api'
import { SafeAreaView } from 'react-native-safe-area-context'

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HelpDeskHome = () => {
  const { loginBranchId, user, userId, allBranchInfo } = useAuth()
  const [departmentModal, setDepartmentModal] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState("--Department--");
  const [clientModal, setClientModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState([])
  const [finalPayload, setFinalPayload] = useState(null)
  const [allBranchInfos, setAllBranchInfos] = useState([]);   // ✅ API data
  const [showFilter, setShowFilter] = useState(false)
  // console.log("all branch infi",allBranchInfo)
  // Animation refs for filter toggle
  const filterHeightAnim = useRef(new Animated.Value(0)).current
  const filterRotateAnim = useRef(new Animated.Value(0)).current

  const navigation = useNavigation()

  // Animation values for initial load
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const buttonScale = useRef(new Animated.Value(1)).current

  // Date picker states
  const [showFromDatePicker, setShowFromDatePicker] = useState(false)
  const [showToDatePicker, setShowToDatePicker] = useState(false)

  // Get current date
  const currentDate = new Date()
  const defaultFromDate = new Date()
  defaultFromDate.setDate(defaultFromDate.getDate() - 30) // 30 days ago

  const [form, setForm] = useState({
    uhid: '',
    labNo: '',
    barCode: '',
    fromDate: defaultFromDate.toISOString().split('T')[0],
    toDate: currentDate.toISOString().split('T')[0],
    patientName: '',
    investigationName: ''
  });

  useFocusEffect(
    useCallback(() => {
      getAllActiveBranch(loginBranchId, userId)
    }, [])
  )

  const getAllActiveBranch = async (branchId, userId) => {
    // console.log("id only", branchId, userId)
    try {
      const response = await api.get(`Branch/branch-user-list?branchId=${branchId}&userId=${userId}`)
      console.log("API response", response.data)
      setAllBranchInfos(response.data)
      // ✅ Auto-select all branches when data loads
      if (response.data && response.data.length > 0) {
        setSelectedClient(response.data)
      }
    } catch (error) {
      console.log("API error", error)
    }
  }

  // Handle filter toggle with animation
  const toggleFilter = () => {
    // Configure layout animation for smooth transitions
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    // Animate chevron rotation
    Animated.timing(filterRotateAnim, {
      toValue: showFilter ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic)
    }).start();

    // Animate height
    Animated.timing(filterHeightAnim, {
      toValue: showFilter ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic)
    }).start();

    setShowFilter(!showFilter);
  }

  // Initial animation on component mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(0.5))
      })
    ]).start()
  }, [])

  // Animate button press
  const animateButtonPress = () => {
    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 50
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50
      })
    ]).start()
  }

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleDateChange = (event, selectedDate, type) => {
    if (Platform.OS === 'android') {
      if (type === 'from') {
        setShowFromDatePicker(false)
      } else {
        setShowToDatePicker(false)
      }
    }

    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0]

      if (type === 'from') {
        if (selectedDate <= currentDate) {
          setForm({ ...form, fromDate: formattedDate })
          // Animate date change
          Animated.sequence([
            Animated.timing(buttonScale, { toValue: 1.05, duration: 200, useNativeDriver: true }),
            Animated.timing(buttonScale, { toValue: 1, duration: 200, useNativeDriver: true })
          ]).start()
        }
      } else {
        if (selectedDate <= currentDate) {
          setForm({ ...form, toDate: formattedDate })
          Animated.sequence([
            Animated.timing(buttonScale, { toValue: 1.05, duration: 200, useNativeDriver: true }),
            Animated.timing(buttonScale, { toValue: 1, duration: 200, useNativeDriver: true })
          ]).start()
        }
      }
    }
  }

  const handleSearch = () => {
    // Animate button press
    animateButtonPress()

    console.log("selected client", user)
    const branchIdList = selectedClient
      .map(item => item.BranchId)
      .join(',');

    const payload = {
      branchId: loginBranchId ? String(loginBranchId) : "1",
      typeId: "0",
      uhid: form.uhid,
      ipdNo: "",
      labNo: form.labNo,
      fromDate: form.fromDate,
      toDate: form.toDate,
      barCode: form.barCode,
      subCategoryId: "1",
      subSubCategoryId: "0",
      investigationName: form.investigationName,
      patientName: form.patientName,
      branchIdList: branchIdList,
      corporateId: "",
      // roleId: user.roles.map(e => e).join(','),
      filter: null
    };
    setFinalPayload(payload)
    navigation.navigate('ListHelpDeskPatient', { payload })
  };

  // Animation for modal open/close
  const modalSlideAnim = useRef(new Animated.Value(0)).current

  const openModal = (modalType) => {
    Animated.spring(modalSlideAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 12,
      bounciness: 4
    }).start()
    if (modalType === 'department') {
      setDepartmentModal(true)
    } else {
      setClientModal(true)
    }
  }

  const closeModal = (modalType) => {
    Animated.timing(modalSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      if (modalType === 'department') {
        setDepartmentModal(false)
      } else {
        setClientModal(false)
      }
    })
  }

  // Animated form field component with individual animations
  const AnimatedFormField = ({ children, delay = 0, isVisible = true }) => {
    const fieldAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
      if (isVisible) {
        Animated.timing(fieldAnim, {
          toValue: 1,
          duration: 500,
          delay,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic)
        }).start()
      } else {
        fieldAnim.setValue(0)
      }
    }, [isVisible, delay])

    return (
      <Animated.View style={{
        opacity: fieldAnim,
        transform: [{
          translateX: fieldAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-20, 0]
          })
        }]
      }}>
        {children}
      </Animated.View>
    )
  }

  // Client Panel List Component (merged)
  const ClientPanelList = ({ onClose, onSelect, BranchData }) => {
    const [selectedList, setSelectedList] = useState(selectedClient);

    // Update local state when selectedClient changes
    useEffect(() => {
      setSelectedList(selectedClient);
    }, [selectedClient]);

    // Toggle Select
    const toggleSelect = (item) => {
      const exists = selectedList.find(i => i.BranchId === item.BranchId);
      let updatedList;

      if (exists) {
        updatedList = selectedList.filter(i => i.BranchId !== item.BranchId);
      } else {
        updatedList = [...selectedList, item];
      }

      setSelectedList(updatedList);
      setSelectedClient(updatedList);
      onSelect && onSelect(updatedList);
    };

    // Select All / Deselect All
    const handleSelectAll = () => {
      if (selectedList.length === BranchData.length) {
        setSelectedList([]);
        setSelectedClient([]);
        onSelect && onSelect([]);
      } else {
        setSelectedList(BranchData);
        setSelectedClient(BranchData);
        onSelect && onSelect(BranchData);
      }
    };

    const renderItem = ({ item }) => {
      const isSelected = selectedList.some(i => i.BranchId === item.BranchId);

      return (
        <TouchableOpacity
          onPress={() => toggleSelect(item)}
          style={tw`flex-row justify-between items-center py-3 px-2 border-b border-gray-200`}
        >
          <Text style={tw`text-base ${isSelected ? 'text-blue-500 font-medium' : 'text-gray-700'}`}>
            {item.BranchCode || item.branchCode} - {item.BranchName ||item.branchName}
          </Text>

          <MaterialIcons
            name={isSelected ? "check-box" : "check-box-outline-blank"}
            size={22}
            color={isSelected ? "#3b82f6" : "#999"}
          />
        </TouchableOpacity>
      );
    };

    return (
      <View style={tw``}>
        {/* Select All */}
        <TouchableOpacity
          onPress={handleSelectAll}
          style={tw`flex-row justify-between items-center py-3 px-2 border-b border-gray-300 mb-2`}
        >
          <Text style={tw`text-base font-bold text-gray-800`}>
            {selectedList.length === BranchData.length
              ? "Deselect All"
              : "Select All"}
          </Text>

          <MaterialIcons
            name={
              selectedList.length === BranchData.length
                ? "check-box"
                : "check-box-outline-blank"
            }
            size={22}
            color="#3b82f6"
          />
        </TouchableOpacity>

        {/* List */}
        <FlatList
          data={BranchData}
          keyExtractor={(item, index) => {
            const id = item?.branchId ?? item?.BranchId;
            return id ? id.toString() : index.toString();
          }} renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />

        {/* Done Button */}
        <TouchableOpacity
          onPress={() => onClose && onClose()}
          style={tw`bg-blue-500 p-3 rounded-lg mt-3 mb-4`}
        >
          <Text style={tw`text-white text-center font-bold text-base`}>
            Done ({selectedList.length})
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Get chevron rotation interpolated value
  const chevronRotation = filterRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <Animated.View style={[tw`flex-1`, { opacity: fadeAnim }]}>
        <ScrollView
          style={tw`flex-1`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`p-4 pb-24`}
        >
          {/* Filter Toggle Button with Animation */}
          <TouchableOpacity
            onPress={toggleFilter}
            style={[
              styles.cardShadow,
              tw`flex flex-row justify-between items-center bg-white p-3 rounded-lg mb-3`
            ]}
            activeOpacity={0.7}
          >
            <Text style={[styles.labelText, tw`font-medium`]}>Filter</Text>
            <Animated.View style={[tw`bg-gray-100 rounded-full p-1.5`, { transform: [{ rotate: chevronRotation }] }]}>
              <Entypo name='chevron-down' size={18} color="#4b5563" />
            </Animated.View>
          </TouchableOpacity>

          {/* Filter Content with Height Animation */}
          <Animated.View
            style={[
              {
                overflow: 'hidden',
                opacity: filterHeightAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1]
                }),
                transform: [{
                  translateY: filterHeightAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0]
                  })
                }]
              }
            ]}
          >
            {showFilter && (
              <View style={[styles.cardShadow, tw`bg-white rounded-lg p-4 mb-3`]}>
                {/* UHID and Barcode Row */}
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

                {/* Patient Name and Lab No Row */}
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

          {/* Main Content with Slide Animation */}
          <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
            <View style={[styles.cardShadow, tw`bg-white rounded-lg p-4`]}>
              {/* From Date and To Date Row */}
              <View style={tw`flex-row gap-3 mb-3`}>
                <View style={tw`flex-1`}>
                  <Text style={styles.labelText}>From Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowFromDatePicker(true)}
                    style={[styles.inputBox, tw`bg-white border border-gray-200 rounded-lg flex-row justify-between items-center p-3`]}
                  >
                    <Text style={tw`text-gray-700`}>{form.fromDate}</Text>
                    <MaterialIcons name="calendar-today" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                <View style={tw`flex-1`}>
                  <Text style={styles.labelText}>To Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowToDatePicker(true)}
                    style={[styles.inputBox, tw`bg-white border border-gray-200 rounded-lg flex-row justify-between items-center p-3`]}
                  >
                    <Text style={tw`text-gray-700`}>{form.toDate}</Text>
                    <MaterialIcons name="calendar-today" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Investigation Name Row */}
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

              {/* Department and Client Row */}
              <View style={tw`flex-col gap-3 mb-3`}>
                <View style={tw`flex-1`}>
                  <Text style={styles.labelText}>Select Department</Text>
                  <TouchableOpacity
                    onPress={() => openModal('department')}
                    style={[styles.dropDownButton, tw`bg-white flex-row justify-between items-center p-3 rounded-lg border border-gray-200`]}
                  >
                    <Text style={tw`text-gray-700 flex-1`}>
                      {selectedDepartment !== "--Department--" ? selectedDepartment : 'Select Department'}
                    </Text>
                    <Icon name="chevron-down" size={18} color="gray" />
                  </TouchableOpacity>
                </View>
                <View style={tw`flex-1`}>
                  <View style={tw`flex-row items-center`}>
                    <Text style={styles.labelText}>
                      Client/Panel
                    </Text>
                    <Text style={tw`text-red-500 text-base ml-1`}>*</Text>
                    <Text style={tw`text-gray-500 text-xs ml-1`}>
                      ({selectedClient?.length || 0} selected)
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => openModal('client')}
                    style={[styles.dropDownButton, tw`bg-white flex-row justify-between items-center p-3 rounded-lg border border-gray-200`]}
                  >
                    <Text
                      numberOfLines={1}
                      style={tw`text-gray-700 flex-1`}
                    >
                      {selectedClient?.length > 0
                        ? `${selectedClient[0].BranchName||selectedClient[0].branchName}${selectedClient.length > 1
                          ? ` +${selectedClient.length - 1}`
                          : ''
                        }`
                        : 'Select Client'}
                    </Text>
                    <Icon name="chevron-down" size={18} color="gray" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Search Button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              disabled={!selectedClient.length > 0}
              onPress={handleSearch}
              style={[
                tw`py-3.5 rounded-md shadow-md mt-5`,
                !selectedClient.length > 0
                  ? tw`bg-gray-400`
                  : tw`bg-blue-500`
              ]}
              activeOpacity={0.8}
            >
              <Text style={tw`text-white text-center font-bold text-base`}>
                Search Patients
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        {/* From Date Picker */}
        {showFromDatePicker && (
          <DateTimePicker
            value={new Date(form.fromDate)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => handleDateChange(event, date, 'from')}
            maximumDate={currentDate}
          />
        )}

        {/* To Date Picker */}
        {showToDatePicker && (
          <DateTimePicker
            value={new Date(form.toDate)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => handleDateChange(event, date, 'to')}
            maximumDate={currentDate}
          />
        )}

        {/* Department Modal with Animation */}
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
                  transform: [{
                    translateY: modalSlideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0]
                    })
                  }]
                }
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

        {/* Client Panel Modal with Animation */}
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
                  transform: [{
                    translateY: modalSlideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0]
                    })
                  }]
                }
              ]}
            >
              <View style={tw`items-center mb-2`}>
                <View style={tw`w-10 h-1 bg-gray-300 rounded-full`} />
              </View>
              <ClientPanelList
                BranchData={allBranchInfos.length > 0 ? allBranchInfos : allBranchInfo}
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
