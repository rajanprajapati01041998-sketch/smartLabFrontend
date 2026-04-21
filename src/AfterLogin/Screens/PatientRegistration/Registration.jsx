import { View, Text, TextInput, ScrollView, TouchableOpacity, Modal, TouchableWithoutFeedback, Alert, ActivityIndicator, Platform, FlatList } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import tw from 'twrnc';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  referLabList,
  searchInvestigation,
  SearchGetInvestigationListDetails,
  allBankList,
  referDoctorList
} from './services/doctorService';
import ReferDoctor from './ReferDoctor';
import DoctorList from './DoctorList';
import { useAuth } from '../../../../Authorization/AuthContext';
import ReferLab from './ReferLab';
import SearchSelectService from './SearchSelectService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RadioButton, Checkbox } from 'react-native-paper';
import FieldBoy from './FieldBoy';
import api from '../../../../Authorization/api';
import SelectTitle from './SelectTitle';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../../../utils/InputStyle';
import Icon from 'react-native-vector-icons/Feather';
import CenterInfo from './CenterInfo';
import { useToast } from '../../../../Authorization/ToastContext';
import BottomModal from '../../../utils/BottomModal';
import CenterModal from '../../../utils/CenterModal';
import { useTheme } from '../../../../Authorization/ThemeContext';
import SelectBank from './SelectBank';
import PaymentInfo from './PaymentInfo';
import AddReferDoctor from './AddReferDoctor';
import { getThemeStyles } from '../../../utils/themeStyles';


const Registration = () => {
  const [loading, setLoading] = useState(false)
  const { ipAddress, setServiceItem, serviceItem, selectedDoctor, corporateId, patientData, userData, loginBranchId, centerLoginBranchId, userId, addBarcode } = useAuth();
  const { showToast } = useToast()
  const { theme, colors } = useTheme();
  const themed = getThemeStyles(theme);
  const [error, setError] = useState(false)
  const [title, setTitle] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [ageYears, setAgeYears] = useState('');
  const [ageMonths, setAgeMonths] = useState('');
  const [ageDays, setAgeDays] = useState('');
  const [dob, setDob] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [gender, setGender] = useState("MALE");
  const [maritalStatus, setMaritalStatus] = useState('');
  const [relation, setRelation] = useState('');
  const [relativeName, setRelativeName] = useState('');
  const [contactNumber, setContactNumber] = useState(null);
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [currentIpAddress, setCurrentIpAddress] = useState(ipAddress);
  const [medicalHistory, setMedicalHistory] = useState('');
  const [vistType, setVisitype] = useState("Clinic Visit");
  const [collectionDateTime, setCollectionDateTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date()); // For iOS modal
  const [tempTime, setTempTime] = useState(new Date()); // For iOS modal
  const [grossAmount, setGrossAmount] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentData, setPaymentData] = useState({})

  const [discountLastEdited, setDiscountLastEdited] = useState('percent');
  const [balanceAmount, setBalanceAmount] = useState(patientData?.TotalBalanceOfAdvanceAmount || null);
  const [isOverPaid, setIsOverPaid] = useState(false);
  const [netAmount, setNetAmount] = useState(null);
  const [cash, setCash] = useState(null);
  const [isCashAuto, setIsCashAuto] = useState(true);
  const [debitCardAmt, setDebitCardAmt] = useState(null);
  const [creditCardAmt, setCreditCardAmt] = useState(null);
  const [chequeAmt, setChequeAmt] = useState(null);
  const [neftrtgsAmt, setNeftRtgsAmt] = useState(null);
  const [payTmAmt, setPayTm] = useState(null);
  const [phonePayAmt, setPhonePayAmt] = useState(null);
  const [discountReason, setDiscountReason] = useState(" ");
  const [remark, setRemark] = useState(" ");
  const [refrDoctrorModal, setReferDoctorModal] = useState(false);
  const [addreferDoctorModal, setAddReferDoctorModal] = useState(false)
  const [selectedReferDoctor, setSelectedReferDoctor] = useState(null);
  const [doctorlistModal, setDoctorListModal] = useState(false);
  const [selectedDoctorList, setSelectedDoctorList] = useState(null);
  const [referLabListModal, setReferLabListModal] = useState(false);
  const [selectedReferLab, setSelectedReferLab] = useState(null);
  const [searchSelectModal, setSearchSelectModal] = useState(false);
  const [fieldBoyModal, setFieldBoyModal] = useState(false);
  const [selectedFieldBoy, setSelectedFieldBoy] = useState(null);
  const [selectTitleModal, setSelectTitleModal] = useState(false)
  const [selectedTitle, setSelectedTitle] = useState(null)
  const [showBillingInfo, setShowBillingInfo] = useState(false)
  const [responseSuccess, setResponseSuccess] = useState(false)
  const [selectedBank, setSelectedBank] = useState(null)
  const [bankModal, setBankModal] = useState(false)
  const [chequeRefrence, setChequeRefrence] = useState('')
  const [neftRefrence, setNeftReference] = useState('')
  const [debitCardReference, setDebitCardReference] = useState('')
  const [paytmRefrence, setPaytmRefrence] = useState('')
  const [phonePayReference, setPhonePayReference] = useState("")
  const [credicardReference, setCrediCardReference] = useState('')
  const [barcodeModalVisible, setBarcodeModalVisible] = useState(false);
  const [barcodeDraft, setBarcodeDraft] = useState({});
  const [remarkExpanded, setRemarkExpanded] = useState({});

  // console.log(patientData)
  useEffect(() => {
    setTitle(patientData?.Title || "MR")
    setFirstName(patientData?.FirstName || "")
    setGender(patientData?.Gender || "MALE")
    setAgeDays(patientData?.AgeDays || "")
    setAgeMonths(patientData?.AgeMonths || "")
    setAgeYears(patientData?.AgeYears || "")
    setGender(patientData?.Gender || "")
    setBalanceAmount(patientData?.TotalBalanceOfAdvanceAmount || 0)
    setContactNumber(patientData?.ContactNumber)
    setDob(patientData?.DOB ? new Date(patientData.DOB) : null);
  }, [patientData])

  useEffect(() => {
    setGender("MALE")
  }, [])


  useFocusEffect(
    useCallback(() => {
      GetReferedLabList();
      getInvestigationList('cbc');
      return () => {
        console.log('Registration Screen Unfocused');
      };
    }, [])
  );

  const resetForm = useCallback(() => {
    // Close any open modals
    setBarcodeModalVisible(false);
    setSearchSelectModal(false);
    setReferDoctorModal(false);
    setAddReferDoctorModal(false);
    setDoctorListModal(false);
    setReferLabListModal(false);
    setFieldBoyModal(false);
    setSelectTitleModal(false);
    setBankModal(false);

    // Basic Info
    setTitle('');
    setFirstName('');
    setMiddleName('');
    setLastName('');

    // Age / DOB
    setAgeYears('');
    setAgeMonths('');
    setAgeDays('');
    setDob(null);

    // Personal
    setGender('MALE');
    setMaritalStatus('');
    setRelation('');
    setRelativeName('');

    // Contact
    setContactNumber('');
    setEmail('');
    setAddress('');

    // Location
    setCountry('');
    setState('');
    setDistrict('');
    setCity('');

    // Medical
    setMedicalHistory('');

    // Visit
    setVisitype('Clinic Visit');
    setCollectionDateTime(null);

    // Selection
    setSelectedReferDoctor(null);
    setSelectedReferLab(null);
    setSelectedFieldBoy(null);
    setSelectedTitle(null);

    // Billing
    setGrossAmount(null);
    setDiscountAmount(null);
    setDiscountPercent(0);
    setDiscountLastEdited('percent');
    setNetAmount(null);
    setBalanceAmount(null);
    setIsCashAuto(true);
    setIsOverPaid(false);
    setShowBillingInfo(false);

    // Payments
    setCash(null);
    setDebitCardAmt(null);
    setCreditCardAmt(null);
    setChequeAmt(null);
    setPhonePayAmt(null);
    setPayTm(null);
    setPaymentData({});

    // Others
    setDiscountReason('');
    setRemark('');
    setBarcodeDraft({});
    setRemarkExpanded({});
    setSelectedBank(null);

    // Services reset
    setServiceItem({ Services: [] });
  }, [setServiceItem]);

  useEffect(() => {
    resetForm()
  }, [responseSuccess, resetForm])

  const parseMoney = (txt) => {
    const cleaned = String(txt ?? '').replace(/[^0-9.]/g, '');
    if (cleaned === '') return null;
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
  };

  const handleRemoveService = (indexToRemove) => {
    if (!serviceItem?.Services) return;

    const updatedServices = serviceItem.Services.filter(
      (_, index) => index !== indexToRemove
    );

    setServiceItem({
      ...serviceItem,
      Services: updatedServices,
    });
  };


  const payments = Object.entries(paymentData)
    .filter(([_, val]) => Number(val?.amount) > 0)
    .map(([id, val]) => ({
      paymentModeId: Number(id),
      amount: Number(val?.amount || 0),
      bankId: val?.bank?.bankId ? Number(val.bank.bankId) : 0,
      referenceNo: val?.reference ? String(val.reference) : ""
    }));

  const validateBeforeSave = () => {
    if (isOverPaid) {
      showToast('Your Cash Amount is Greater from Net Amount', 'error');
      return false;
    }

    if (!firstName) {
      showToast('Enter full name', 'error');
      return false;
    }

    if (!ageYears && !ageMonths && !ageDays && !dob) {
      showToast('Enter age or DOB', 'error');
      return false;
    }
    if (!gender) {
      showToast('Select Gender', 'error');
      return false;
    }
    return true;
  };

  const initBarcodeDraftFromServices = (services) => {
    const next = {};
    const nextExpanded = {};
    (services || []).forEach((s) => {
      const id = s?.ServiceItemId;
      if (!id) return;
      const existingRemark = s?.TestRemark ?? s?.testRemark ?? '';
      next[id] = {
        barcode: s?.Barcode ?? s?.barcode ?? '',
        testRemark: existingRemark,
      };
      nextExpanded[id] = false;
    });
    setBarcodeDraft(next);
    setRemarkExpanded(nextExpanded);
  };

  const openBarcodeModal = () => {
    const services = Array.isArray(serviceItem?.Services) ? serviceItem.Services : [];
    initBarcodeDraftFromServices(services);
    setBarcodeModalVisible(true);
  };

  const savePatientApi = async (servicesOverride) => {
    const services = Array.isArray(servicesOverride)
      ? servicesOverride
      : Array.isArray(serviceItem?.Services)
        ? serviceItem.Services
        : [];
    // if (!selectedDoctor) {
    //   showToast('Select Doctor', 'error');
    //   return;
    // }
    // if (!contactNumber) {
    //   showToast('Enter Contact number', 'error');
    //   return;
    // }

    const finalLoginBranchId = centerLoginBranchId || loginBranchId;
    setLoading(true)
    const payload = {
      HospId: 1,
      BranchId: finalLoginBranchId,
      LoginBranchId: finalLoginBranchId,
      CorporateId: corporateId,

      Title: title,
      FirstName: firstName,
      MiddleName: middleName,
      LastName: lastName,

      AgeYears: Number(ageYears || 0),
      AgeMonths: Number(ageMonths || 0),
      AgeDays: Number(ageDays || 0),

      DOB: dob
        ? new Date(dob).toISOString().split("T")[0]
        : null,

      Gender: gender,
      MaritalStatus: maritalStatus,
      Relation: relation,
      RelativeName: relativeName,

      ContactNumber: contactNumber,
      Address: address,

      DoctorId: selectedDoctor || 0,
      ReferDoctorId: selectedReferDoctor?.referDoctorId || 0,
      ReferLabId: selectedReferLab?.outSourceLabId || 0,
      FieldBoyId: selectedFieldBoy?.fieldBoyId || 0,

      MedicalHistory: medicalHistory,

      CollectionDateTime: collectionDateTime
        ? new Date(collectionDateTime).toISOString()
        : null,

      CountryId: 1,
      Country: country || "India",
      StateId: 1,
      State: state,
      DistrictId: 1,
      District: district,
      CityId: 1,
      City: city,

      UserId: userId,
      IpAddress: currentIpAddress,

      GrossAmount: Number(grossAmount || 0),
      DiscountAmount: Number(discountAmount || 0),
      NetAmount: Number(netAmount || 0),

      // ✅ Services from context
      Services: services.map(item => ({
        ServiceItemId: item.ServiceItemId,
        SubSubCategoryId: item.SubSubCategoryId,
        ServiceName: item.ServiceName,
        Amount: Number(item.Amount || 0),
        qty: Number(item.qty || 1),
        IsUrgent: Number(item.IsUrgent ?? item.isUrgent ?? 0),
        Barcode: item.Barcode ?? item.barcode ?? "",
        TestRemark: item.TestRemark ?? item.testRemark ?? ""
      })) || [],

      // ✅ Payments
      payments: payments,

      // ✅ Investigations (sample static or modify as needed)
      Investigations: [
        {
          ReportingBranchId: finalLoginBranchId,
          Barcode: "",
          TestRemark: ""
        }
      ]
    };
    // console.log("paymentData 👉", paymentData);
    // console.log("Payload 👉", JSON.stringify(payload, null, 2));
    try {
      // console.log(payload)
      const response = await api.post(`Patient/save`, payload)
      console.log("booking suceess", response)
      showToast("Patinet Saved Sucessfully", 'success');
      setResponseSuccess((prev) => !prev);
      resetForm();

    } catch (error) {
      console.log("erroer", error.response)
      showToast(error?.response?.data?.message, 'warning');
    }
    finally {
      setLoading(false)
    }

  };

  const handleBarcodeModalSave = () => {
    const currentServices = Array.isArray(serviceItem?.Services) ? serviceItem.Services : [];
    const updatedServices = currentServices.map((s) => {
      const draft = barcodeDraft?.[s.ServiceItemId];
      return {
        ...s,
        Barcode: draft?.barcode ?? s?.Barcode ?? '',
        TestRemark: draft?.testRemark ?? s?.TestRemark ?? '',
      };
    });

    setServiceItem((prev) => ({
      ...(prev || {}),
      Services: updatedServices,
    }));

    setBarcodeModalVisible(false);
    savePatientApi(updatedServices);
  };

  const handleSavePatient = () => {
    if (!validateBeforeSave()) return;

    if (addBarcode) {
      openBarcodeModal();
      return;
    }

    savePatientApi();
  };

  useEffect(() => {
    if (serviceItem?.Services) {
      const sum = serviceItem.Services.reduce((acc, item) => acc + (item.Amount || 0), 0);
      setGrossAmount(sum);

      // Auto-fill cash only when user hasn't manually edited payments.
      if (isCashAuto) {
        setCash(sum);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceItem]);

  useEffect(() => {
    const gross = Number(grossAmount || 0);

    const discPer = Number(discountPercent || 0);
    const discAmt = Number(discountAmount || 0);

    // If gross is 0, reset discount + net to avoid NaN.
    if (!gross) {
      setDiscountAmount(0);
      setDiscountPercent(0);
      setNetAmount(0);
      return;
    }

    let nextDiscPer = discPer;
    let nextDiscAmt = discAmt;

    if (discountLastEdited === 'percent') {
      nextDiscAmt = (gross * discPer) / 100;
      nextDiscPer = discPer;
    } else {
      // User edited discount amount => recalc percent.
      nextDiscAmt = discAmt;
      nextDiscPer = (nextDiscAmt / gross) * 100;
    }

    // Keep stable rounding to avoid endless re-renders due to float precision.
    const roundedDiscAmt = Number(nextDiscAmt.toFixed(2));
    const roundedDiscPer = Number(nextDiscPer.toFixed(2));

    const net = gross - roundedDiscAmt;
    const roundedNet = Math.round(net);

    setDiscountAmount(roundedDiscAmt);
    setDiscountPercent(roundedDiscPer);
    setNetAmount(roundedNet);
  }, [discountLastEdited, discountPercent, discountAmount, grossAmount]);

  // Keep cash synced with net amount when cash is still in "auto" mode and
  // user hasn't entered other payment modes. This prevents cases like:
  // gross=7200, discount=200 => net=7000 but cash remains 7200 (balance becomes 0).
  useEffect(() => {
    const totalPaid = Object.values(paymentData || {}).reduce((sum, p) => sum + Number(p.amount || 0), 0);
    setIsOverPaid(totalPaid > (netAmount || 0));
  }, [paymentData, netAmount]);

  const onChangeDate1 = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setDob(selectedDate);
      calculateAge(selectedDate);
    }
  };

  const calculateDOB = (years = 0, months = 0, days = 0) => {
    const today = new Date();
    const dobDate = new Date(
      today.getFullYear() - Number(years || 0),
      today.getMonth() - Number(months || 0),
      today.getDate() - Number(days || 0)
    );

    setDob(dobDate);
  };

  useEffect(() => {
    if (ageYears || ageMonths || ageDays) {
      calculateDOB(ageYears, ageMonths, ageDays);
    }
  }, [ageYears, ageMonths, ageDays]);

  const calculateAge = (dobDate) => {
    const today = new Date();

    let years = today.getFullYear() - dobDate.getFullYear();
    let months = today.getMonth() - dobDate.getMonth();
    let days = today.getDate() - dobDate.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    setAgeYears(String(years));
    setAgeMonths(String(months));
    setAgeDays(String(days));
  };

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (selectedDate) {
        if (!collectionDateTime) {
          const newDate = new Date(selectedDate);
          const now = new Date();
          newDate.setHours(now.getHours(), now.getMinutes());
          setCollectionDateTime(newDate);
        } else {
          const updated = new Date(collectionDateTime);
          updated.setFullYear(selectedDate.getFullYear());
          updated.setMonth(selectedDate.getMonth());
          updated.setDate(selectedDate.getDate());
          setCollectionDateTime(updated);
        }
        setShowTimePicker(true);
      }
    } else {
      // For iOS, update temp date
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const onIOSDateConfirm = () => {
    if (tempDate) {
      if (!collectionDateTime) {
        const newDate = new Date(tempDate);
        const now = new Date();
        newDate.setHours(now.getHours(), now.getMinutes());
        setCollectionDateTime(newDate);
      } else {
        const updated = new Date(collectionDateTime);
        updated.setFullYear(tempDate.getFullYear());
        updated.setMonth(tempDate.getMonth());
        updated.setDate(tempDate.getDate());
        setCollectionDateTime(updated);
      }
      setShowDatePicker(false);
      setShowTimePicker(true);
    }
  };

  const onChangeTime = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (selectedTime && collectionDateTime) {
        const now = new Date();
        const selectedDateTime = new Date(selectedTime);

        if (
          collectionDateTime &&
          collectionDateTime.toDateString() === now.toDateString()
        ) {
          if (
            selectedDateTime.getHours() < now.getHours() ||
            (selectedDateTime.getHours() === now.getHours() &&
              selectedDateTime.getMinutes() < now.getMinutes())
          ) {
            Alert.alert("Invalid Time", "Cannot select past time for today");
            return;
          }
        }

        const updated = new Date(collectionDateTime);
        updated.setHours(selectedTime.getHours());
        updated.setMinutes(selectedTime.getMinutes());
        setCollectionDateTime(updated);
      } else if (selectedTime && !collectionDateTime) {
        const newDate = new Date();
        newDate.setHours(selectedTime.getHours());
        newDate.setMinutes(selectedTime.getMinutes());
        setCollectionDateTime(newDate);
      }
    } else {
      // For iOS, update temp time
      if (selectedTime) {
        setTempTime(selectedTime);
      }
    }
  };

  const onIOSTimeConfirm = () => {
    if (tempTime && collectionDateTime) {
      const now = new Date();
      const selectedDateTime = new Date(tempTime);

      if (
        collectionDateTime &&
        collectionDateTime.toDateString() === now.toDateString()
      ) {
        if (
          selectedDateTime.getHours() < now.getHours() ||
          (selectedDateTime.getHours() === now.getHours() &&
            selectedDateTime.getMinutes() < now.getMinutes())
        ) {
          Alert.alert("Invalid Time", "Cannot select past time for today");
          setShowTimePicker(false);
          return;
        }
      }

      const updated = new Date(collectionDateTime);
      updated.setHours(tempTime.getHours());
      updated.setMinutes(tempTime.getMinutes());
      setCollectionDateTime(updated);
      setShowTimePicker(false);
    } else if (tempTime && !collectionDateTime) {
      const newDate = new Date();
      newDate.setHours(tempTime.getHours());
      newDate.setMinutes(tempTime.getMinutes());
      setCollectionDateTime(newDate);
      setShowTimePicker(false);
    }
  };

  const GetReferedLabList = async () => {
    try {
      const response = await referLabList();
      console.log('Refer Lab List:', response);
    } catch (error) {
      console.error('Error fetching refer lab list:', error);
    }
  };

  const getInvestigationList = async (query) => {
    console.log('Fetching investigation list for query:', query);
    try {
      const response = await searchInvestigation(query);
      console.log('Investigation List:', response);
    } catch (error) {
      console.error('Error fetching investigation list:', error);
    }
  };



  const formatDateTime = (dateTime) => {
    if (!dateTime || !(dateTime instanceof Date)) return '- Collection Date Time -';

    return dateTime.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <SafeAreaView style={themed.screen}>
      <ScrollView style={tw`p-2 mb-15`}>
        <CenterInfo />
        {/* patient information */}
        <View style={[themed.card, themed.childScreen, themed.cardPadding]}>
          <Text style={styles.patientInfoText}>Patient Info:</Text>
          <View style={tw`flex flex-row justify-between items-center gap-1 mb-3`}>
            <View style={tw`flex flex-col gap-1 w-[25%]`}>
              <View style={tw`flex flex-row items-center`}>
                <Text style={themed.inputLabel}>Title</Text>
                <Text style={tw`text-red-500  -mt-2`}>*</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectTitleModal(true)}
                style={[themed.inputBox, themed.inputText]}
              >
                <Text style={themed.inputText}>
                  {selectedTitle || "Mr"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={tw`flex flex-col py-0.5 gap-1 w-[74%]`}>
              <View style={tw`flex flex-row items-center`}>
                <Text style={themed.inputLabel}>Name</Text>
                <Text style={tw`text-red-500  -mt-2`}>*</Text>
              </View>
              <TextInput
                value={firstName}
                onChangeText={(text) => {
                  // Allow only letters + space, max 50 chars
                  const filtered = text.replace(/[^a-zA-Z ]/g, '').slice(0, 50)
                  setFirstName(filtered)
                }}
                style={[themed.inputBox, themed.inputText]}
                autoCapitalize="words"
                placeholder='Name'
                placeholderTextColor={themed.inputPlaceholder}
                keyboardType='default'
              />
              {/* {error&&<Text style={tw`text-red-500`}>Enter Name</Text>} */}
            </View>
          </View>

          <View style={tw`flex flex-row justify-between items-center gap-1`}>
            <View style={tw`flex flex-col py-0.5  w-[20%]`}>
              <Text style={themed.inputLabel}>Age Y</Text>
              <TextInput
                value={ageYears}
                onChangeText={(text) => {
                  let numeric = text.replace(/[^0-9]/g, '')
                  let num = Number(numeric)
                  if (numeric === '') {
                    setAgeYears('')
                  } else if (num < 200) {
                    setAgeYears(String(num))
                  }
                }}
                style={[themed.inputBox, themed.inputText]}
                placeholder='29'
                placeholderTextColor={colors.placeholder}
                keyboardType='numeric'
              />
            </View>
            <View style={tw`flex flex-col py-0.5  w-[20%]`}>
              <Text style={themed.inputLabel}>Age M</Text>
              <TextInput
                value={ageMonths}
                onChangeText={(text) => {
                  let numeric = text.replace(/[^0-9]/g, '')
                  let num = Number(numeric)
                  if (numeric === '') {
                    setAgeMonths('')
                  } else if (num <= 12) {
                    setAgeMonths(String(num))
                  }
                }}
                style={[themed.inputBox, themed.inputText]}
                placeholder='04'
                placeholderTextColor={colors.placeholder}
                keyboardType='numeric'
                maxLength={2}
              />
            </View>
            <View style={tw`flex flex-col py-0.5  w-[20%]`}>
              <Text style={themed.inputLabel}>Age D</Text>
              <TextInput
                value={ageDays}
                onChangeText={(text) => {
                  let numeric = text.replace(/[^0-9]/g, '')
                  let num = Number(numeric)
                  if (numeric === '') {
                    setAgeDays('')
                  } else if (num <= 31) {
                    setAgeDays(String(num))
                  }
                }}
                style={[themed.inputBox, themed.inputText]}
                placeholder='12'
                placeholderTextColor={colors.placeholder}
                keyboardType='numeric'
                maxLength={2}
              />
            </View>
            <View style={tw`flex flex-col py-0.5  w-[30%]`}>
              <View style={tw`flex flex-row items-center`}>
                <Text style={themed.inputLabel}>DOB</Text>
                <Text style={tw`text-red-500  -mt-2`}>*</Text>
              </View>
              <TouchableOpacity onPress={() => setShowPicker(true)}>
                <TextInput
                  value={dob ? dob.toLocaleDateString() : ''}
                  editable={false}
                  pointerEvents="none"
                  placeholder="1/4/1998"
                  placeholderTextColor={themed.inputPlaceholder}
                  style={[themed.inputBox, themed.inputText]}
                />
              </TouchableOpacity>

              {showPicker && (
                <DateTimePicker
                  value={dob || new Date()}
                  mode="date"
                  display="default"
                  onChange={onChangeDate1}
                />
              )}
            </View>
          </View>

          <View style={tw`my-3`}>
            <RadioButton.Group
              onValueChange={value => setGender(value)}
              value={gender}
            >
              <View style={tw`flex flex-row items-center`}>
                <Text style={themed.inputLabel}>Gender</Text>
                <Text style={tw`text-red-500  -mt-2`}>*</Text>
              </View>
              <View style={tw`flex-row items-center`}>
                <TouchableOpacity
                  style={[tw`flex-row items-center mr-4`]}
                  onPress={() => setGender('MALE')}
                  activeOpacity={0.8}
                >
                  <RadioButton.Android value="MALE" />
                  <Text style={[themed.inputText, tw`ml-1`]}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`flex-row items-center mr-4`}
                  onPress={() => setGender('FEMALE')}
                  activeOpacity={0.8}
                >
                  <RadioButton.Android value="FEMALE" />
                  <Text style={[themed.inputText, tw`ml-1`]}>Female</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`flex-row items-center`}
                  onPress={() => setGender('OTHER')}
                  activeOpacity={0.8}
                >
                  <RadioButton.Android value="OTHER" />
                  <Text style={[themed.inputText, tw`ml-1`]}>Other</Text>
                </TouchableOpacity>
              </View>
            </RadioButton.Group>
          </View>

          <View style={tw`mt-2`}>
            <View style={tw`flex-row items-end `}>
              <View style={tw`flex-1 mr-2`}>
                <Text style={themed.inputLabel}>Referred Doctor</Text>

                <TouchableOpacity
                  onPress={() => setReferDoctorModal(true)}
                  style={[
                    themed.inputBox,
                    tw`mt-1 mb-3 flex-row justify-between items-center `
                  ]}
                >
                  <Text
                    style={[themed.inputText, tw`flex-1 mr-2`]}
                    numberOfLines={1}
                  >
                    {selectedReferDoctor ? selectedReferDoctor.name : '- Select Doctor -'}
                  </Text>

                  <Icon name="chevron-down" size={18} color="gray" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => setAddReferDoctorModal(true)}
                style={[
                  themed.addButton,
                  tw`mb-3  items-center justify-center `
                ]}
              >
                <Text style={styles.buttonTextAdd}>+</Text>
              </TouchableOpacity>
            </View>

            {/* <View style={tw`w-full`}>
              <Text style={themed.inputLabel}>Referred Lab</Text>

              <TouchableOpacity
                onPress={() => setReferLabListModal(true)}
                style={[
                  styles.dropDownButton,
                  tw`mt-1 mb-3 flex-row justify-between items-center`
                ]}
              >
                <Text
                  style={[styles.insideDropDownText, tw`flex-1 mr-2`]}
                  numberOfLines={1}
                >
                  {selectedReferLab ? selectedReferLab.outSourceLab : 'Select Refer Lab'}
                </Text>

                <Icon name="chevron-down" size={18} color="gray" />
              </TouchableOpacity>
            </View> */}
          </View>

          <View style={tw`mt-1 flex flex-row justify-center items-center gap-2`}>
            {/* <View style={tw`flex flex-col py-0.5 gap-1 w-[48%]`}>
              <View style={tw`flex flex-row items-center`}>
                <Text style={themed.inputLabel}>Contact No (Self)</Text>
                <Text style={tw`text-red-500  -mt-2`}>*</Text>
              </View>
              <TextInput
                value={contactNumber}
                onChangeText={(text) => {
                  const numeric = text.replace(/[^0-9]/g, '').slice(0, 10)
                  setContactNumber(numeric)
                }}
                style={styles.inputBox}
                placeholder='8991212131'
                placeholderTextColor={colors.placeholder}
                keyboardType='numeric'
                maxLength={10}
              />
            </View> */}
            {/* <View style={tw`flex flex-col py-0.5 gap-1 w-[48%]`}>
              <Text style={themed.inputLabel}>Email</Text>
              <TextInput
                placeholder='test@gmail.com'
                value={email}
                onChangeText={(text) => setEmail(text)}
                style={styles.inputBox}
                placeholderTextColor={colors.placeholder}

              />
            </View> */}
          </View>

          {/* <View style={tw`mt-2`}>
            <Text style={themed.inputLabel}>Address</Text>
            <TextInput
              placeholder="Enter address"
              value={address}
              onChangeText={(text) => setAddress(text)}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              style={[styles.inputBox, tw`h-[80px]`]}
              placeholderTextColor={colors.placeholder}

            />
          </View> */}

          {/* <View style={tw`mt-2`}>
            <Text style={themed.inputLabel}>Medical history</Text>
            <TextInput
              placeholder="history"
              value={medicalHistory}
              onChangeText={(text) => setMedicalHistory(text)}
              multiline={true}
              numberOfLines={2}
              textAlignVertical="top"
              style={[styles.inputBox, tw`h-[60px]`]}
              placeholderTextColor={colors.placeholder}

            />
          </View> */}

          <View style={tw`my-3`}>
            {/* <View>
              <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
                Visit type
              </Text>

              <RadioButton.Group
                onValueChange={value => setVisitype(value)}
                value={vistType}
              >

                <View style={tw`flex-row items-center`}>

                  <TouchableOpacity
                    style={tw`flex-row items-center mr-5`}
                    onPress={() => setVisitype('Clinic Visit')}
                  >
                    <RadioButton.Android value="Clinic Visit" />
                    <Text>Clinic Visit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={tw`flex-row items-center`}
                    onPress={() => setVisitype('Home Collection')}
                  >
                    <RadioButton.Android value="Home Collection" />
                    <Text>Home Collection</Text>
                  </TouchableOpacity>

                </View>

              </RadioButton.Group>
            </View> */}

            {vistType === "Home Collection" && (
              <View style={tw`flex flex-col justify-center items-center gap-2 mt-1`}>
                <View style={tw`flex-1  w-full`}>
                  <Text style={themed.inputLabel}>Field Boy</Text>
                  <TouchableOpacity onPress={() => setFieldBoyModal(true)} style={tw`border border-gray-300 p-3 rounded mb-3 mt-1`}>
                    <Text>{selectedFieldBoy ? selectedFieldBoy.fieldBoyName : 'Select Field Boy'}</Text>
                  </TouchableOpacity>
                </View>

                <View style={tw`flex-1 w-full`}>
                  <Text style={themed.inputLabel}>Collection Date Time</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setTempDate(collectionDateTime || new Date());
                      setShowDatePicker(true);
                    }}
                    style={tw`border border-gray-300 p-3 rounded mb-3 mt-1`}
                  >
                    <Text>{formatDateTime(collectionDateTime)}</Text>
                  </TouchableOpacity>

                  {/* ================= DATE PICKER ================= */}
                  {showDatePicker && Platform.OS === 'android' && (
                    <DateTimePicker
                      value={collectionDateTime || new Date()}
                      mode="date"
                      display="default"
                      onChange={onChangeDate}
                      minimumDate={new Date()}
                    />
                  )}

                  {/* iOS DATE MODAL */}
                  {showDatePicker && Platform.OS === 'ios' && (
                    <Modal transparent animationType="slide">
                      <View style={tw`flex-1 justify-end bg-black/40`}>
                        <View style={tw`bg-white p-4 rounded-t-3xl`}>
                          <View style={tw`flex-row justify-between items-center mb-4`}>
                            <Text style={tw`font-bold text-base`}>Select Date</Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                              <Text style={{ color: 'red', fontSize: 16 }}>Cancel</Text>
                            </TouchableOpacity>
                          </View>

                          <DateTimePicker
                            value={tempDate || new Date()}
                            mode="date"
                            display="spinner"
                            onChange={(event, selectedDate) => {
                              if (selectedDate) {
                                setTempDate(selectedDate);
                              }
                            }}
                            minimumDate={new Date()}
                            style={{ height: 150 }}
                          />

                          <TouchableOpacity
                            onPress={onIOSDateConfirm}
                            style={tw`bg-blue-500 p-3 rounded-xl mt-3`}
                          >
                            <Text style={tw`text-white text-center font-bold`}>
                              Confirm Date
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Modal>
                  )}

                  {/* ================= TIME PICKER ================= */}
                  {showTimePicker && Platform.OS === 'android' && (
                    <DateTimePicker
                      value={collectionDateTime || new Date()}
                      mode="time"
                      display="default"
                      onChange={(event, selectedTime) => {
                        if (!selectedTime) {
                          setShowTimePicker(false);
                          return;
                        }
                        const now = new Date();
                        const selectedDateTime = new Date(selectedTime);
                        if (
                          collectionDateTime &&
                          collectionDateTime.toDateString() === now.toDateString()
                        ) {
                          if (
                            selectedDateTime.getHours() < now.getHours() ||
                            (selectedDateTime.getHours() === now.getHours() &&
                              selectedDateTime.getMinutes() < now.getMinutes())
                          ) {
                            Alert.alert("Invalid Time", "Cannot select past time for today");
                            setShowTimePicker(false);
                            return;
                          }
                        }
                        onChangeTime(event, selectedTime);
                      }}
                    />
                  )}

                  {/* iOS TIME MODAL */}
                  {showTimePicker && Platform.OS === 'ios' && (
                    <Modal transparent animationType="slide">
                      <View style={tw`flex-1 justify-end bg-black/40`}>
                        <View style={tw`bg-white p-4 rounded-t-3xl`}>
                          <View style={tw`flex-row justify-between items-center mb-4`}>
                            <Text style={tw`font-bold text-base`}>Select Time</Text>
                            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                              <Text style={{ color: 'red', fontSize: 16 }}>Cancel</Text>
                            </TouchableOpacity>
                          </View>

                          <DateTimePicker
                            value={tempTime || collectionDateTime || new Date()}
                            mode="time"
                            display="spinner"
                            onChange={(event, selectedTime) => {
                              if (selectedTime) {
                                setTempTime(selectedTime);
                              }
                            }}
                            style={{ height: 150 }}
                          />

                          <TouchableOpacity
                            onPress={onIOSTimeConfirm}
                            style={tw`bg-green-500 p-3 rounded-xl mt-3`}
                          >
                            <Text style={tw`text-white text-center font-bold`}>
                              Confirm Time
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Modal>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={[themed.card, themed.childScreen, themed.cardPadding, tw`mt-3`]}>
          <Text style={styles.patientInfoText}>Investigation Details:</Text>

          {/* Search Service */}
          <View style={tw`flex-1`}>
            <View style={tw`flex flex-row items-center`}>
              <Text style={themed.inputLabel}>Search Test</Text>
              <Text style={tw`text-red-500 -mt-2`}>* </Text>
            </View>

            <TouchableOpacity
              onPress={() => setSearchSelectModal(true)}
              style={[themed.inputBox, tw`p-3  mb-3 flex-row items-center justify-start`]}
            >
              <MaterialCommunityIcons name="magnify" size={20} color="gray" style={tw`mr-2`} />
              <Text style={themed.inputText}>
                Search Tests
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={tw`flex-row items-center`}
          >
            {serviceItem?.Services?.map((s, index) => (
              <View key={index} style={tw`mr-2 mb-2 pt-2`}>
                <View style={tw`relative bg-blue-100 px-3 py-2 rounded-full flex-row items-center`}>
                  <Text
                    numberOfLines={1}
                    style={tw`text-blue-700 text-xs font-medium mr-2`}
                  >
                    {s.ServiceName.replace('\n', ' ').slice(0, 15)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveService(index)}
                    style={tw`ml-1`}
                  >
                    <MaterialCommunityIcons name="close-circle" size={16} color="#ef4444" />
                  </TouchableOpacity>
                  {s.isUrgent === 1 && (
                    <View style={tw`absolute -top-2 -right-2 bg-red-500 rounded-full min-w-[16px] h-[16px] items-center justify-center px-[3px]`}>
                      <Text style={tw`text-white text-[9px] font-bold`}>U</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={tw`flex-row items-center mt-1`}>
            <Checkbox
              status={addBarcode ? 'checked' : 'unchecked'}
              disabled={true}
              color={themed.checkboxColor}
              uncheckedColor={themed.checkboxUncheckedColor}
              style={themed.checkbox}
            />
            <Text style={themed.mutedText}>
              Add Barcode & Test Remark on save
            </Text>
          </View>
        </View>

        <View style={[themed.card, themed.childScreen, themed.cardPadding, tw`mt-3`]}>
          {/* Toggle Header for Billing Info */}
          <TouchableOpacity
            onPress={() => setShowBillingInfo(!showBillingInfo)}
            activeOpacity={0.7}
            style={tw`flex-row justify-between items-center mb-3`}
          >
            <Text style={styles.patientInfoText}>Billing Info:</Text>
            <View style={tw`bg-gray-100 p-1 rounded-full`}>
              <MaterialIcons
                name={showBillingInfo ? "expand-less" : "expand-more"}
                size={20}
                color="#6B7280"
              />
            </View>
          </TouchableOpacity>

          {showBillingInfo && (
            <>
              <View style={tw`flex-row items-center gap-2.5`}>
                {/* Gross Amount */}
                <View style={tw`w-[30%] mr-1`}>
                  <Text style={themed.inputLabel}>Gross Amount</Text>
                  <TextInput
                    editable={false}
                    value={grossAmount ? String(grossAmount) : ""}
                    style={[themed.inputBox, themed.inputText]}
                    placeholder=''
                  />
                </View>

                {/* Discount % */}
                <View style={tw`w-[30%] mx-1`}>
                  <Text style={themed.inputLabel}>Disc (%)</Text>
                  <TextInput
                    value={discountPercent ? String(discountPercent) : ""}
                    keyboardType="numeric"
                    onChangeText={(txt) => {
                      setDiscountLastEdited('percent');
                      const cleaned = txt.replace(/[^0-9.]/g, '');
                      const num = cleaned === '' ? 0 : Number(cleaned);
                      setDiscountPercent(num);
                    }}
                    style={[themed.inputBox, themed.inputText]}
                    placeholder='1%'
                    placeholderTextColor={themed.inputPlaceholder}

                  />
                </View>

                {/* Discount Amount */}
                <View style={tw`w-[30%] ml-1`}>
                  <Text style={themed.inputLabel}>Disc Amt</Text>
                  <TextInput
                    value={discountAmount ? String(discountAmount) : ""}
                    keyboardType="numeric"
                    onChangeText={(txt) => {
                      setDiscountLastEdited('amount');
                      const cleaned = txt.replace(/[^0-9.]/g, '');
                      const num = cleaned === '' ? 0 : Number(cleaned);
                      setDiscountAmount(num);
                    }}
                    style={[themed.inputBox, themed.inputText]}
                  />
                </View>
              </View>

              <View style={tw`flex-row items-center gap-2.5 mt-2`}>
                {/* Round off Amount */}
                <View style={tw`w-[30%] mr-1`}>
                  <Text style={themed.inputLabel}>Round off</Text>
                  <TextInput
                    readOnly
                    value={grossAmount ? String(grossAmount) : ""}
                    keyboardType="numeric"
                    style={[themed.inputBox, themed.inputText]}
                    placeholder='1.4'
                    placeholderTextColor={themed.inputPlaceholder}

                  />
                </View>

                {/* Net Amount */}
                <View style={tw`w-[30%] mx-1`}>
                  <Text style={themed.inputLabel}>Net Amount</Text>
                  <TextInput
                    value={netAmount ? String(netAmount) : ""}
                    editable={false}
                    style={[themed.inputBox, themed.inputText]}
                    placeholder='120'
                    placeholderTextColor={themed.inputBox}

                  />
                </View>

                {/* Balance Amount */}
                <View style={tw`w-[30%] ml-1`}>
                  <Text style={themed.inputLabel}>Balance Amt</Text>
                  <TextInput
                    value={balanceAmount ? String(balanceAmount) : 0}
                    editable={false}
                    style={[themed.inputBox, themed.inputText]}
                    placeholder='Avl Bal'
                    placeholderTextColor={themed.inputPlaceholder}

                  />
                </View>
              </View>

              {/* discount reason section */}
              <View style={tw`flex-row items-center gap-2.5 mt-2`}>
                {/* Discount approved by */}
                <View style={tw`w-[30%] mr-1`}>
                  <Text numberOfLines={1} style={themed.inputLabel}>Dis Approved by</Text>
                  <TouchableOpacity style={[themed.inputBox]}>
                    <Text style={themed.inputLabel}>Select</Text>
                  </TouchableOpacity>
                </View>

                {/* Discount reason */}
                <View style={tw`w-[30%] mx-1`}>
                  <Text style={themed.inputLabel}>Disc Reason</Text>
                  <TextInput
                    value={discountReason}
                    onChangeText={setDiscountReason}
                    style={[themed.inputBox, themed.inputText]}
                    placeholder='test'
                    placeholderTextColor={themed.inputPlaceholder}

                  />
                </View>

                {/* Remark */}
                <View style={tw`w-[30%] mx-1`}>
                  <Text style={themed.inputLabel}>Remark</Text>
                  <TextInput
                    value={remark}
                    onChangeText={setRemark}
                    style={[themed.inputBox, themed.inputText]}
                    placeholder='Remark'
                    placeholderTextColor={themed.inputPlaceholder}

                  />
                </View>
              </View>
            </>
          )}
        </View>

        {/* Payment Fields */}
        {/* <PaymentInfo
          netAmount={netAmount}  
          cash={cash}
          setCash={setCash}
          debitCardAmt={debitCardAmt}
          setDebitCardAmt={setDebitCardAmt}
          chequeAmt={chequeAmt}
          setChequeAmt={setChequeAmt}
          neftrtgsAmt={neftrtgsAmt}
          setNeftRtgsAmt={setNeftRtgsAmt}
          payTmAmt={payTmAmt}
          setPayTm={setPayTm}
          phonePayAmt={phonePayAmt}
          setPhonePayAmt={setPhonePayAmt}

          selectedBank={selectedBank}
          openBankModal={() => setBankModal(true)}
          setSelectedBank={setSelectedBank}

          chequeRefrence={chequeRefrence}
          setChequeRefrence={setChequeRefrence}
          neftRefrence={neftRefrence}
          setNeftReference={setNeftReference}
          paytmRefrence={paytmRefrence}
          setPaytmRefrence={setPaytmRefrence}
          phonePayReference={phonePayReference}
          setPhonePayReference={setPhonePayReference}
          debitCardReference={debitCardReference}
          setDebitCardReference={setDebitCardReference}

          parseMoney={parseMoney}
          onPaymentChange={setPaymentData}
          onBalanceChange={setBalanceAmount}

        /> */}


        <TouchableOpacity
          onPress={handleSavePatient}
          style={[
            styles.saveButton,
            tw`flex-row justify-center items-center `,
            (!serviceItem?.Services?.length) && tw`bg-gray-400 opacity-50`
          ]}
          disabled={loading || !serviceItem?.Services?.length}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Icon name="save" size={18} color="#fff" style={tw`mr-2`} />
              <Text style={styles.saveButtonText}>Save Patient</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Barcode + remark modal (shown only when addBarcode is enabled) */}
        <Modal
          visible={barcodeModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setBarcodeModalVisible(false)}
        >
          <View style={[themed.modalOverlay]}>
            <TouchableWithoutFeedback onPress={() => setBarcodeModalVisible(false)}>
              <View style={tw`absolute inset-0`} />
            </TouchableWithoutFeedback>

            <View style={[themed.modalContainer, tw` w-full h-[85%] rounded-t-3xl overflow-hidden`]}>
              {/* Fixed Header */}
              <View style={tw`px-4 pt-4 pb-3 border-b border-gray-100 `}>
                <View style={tw`flex-row justify-between items-center`}>
                  <View style={tw`flex-1 pr-3`}>
                    <Text style={[themed.modalHeaderTitle, tw``]}>
                      Barcodes & Remarks
                    </Text>
                    <Text style={themed.mutedText}>
                      Enter details for selected tests
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => setBarcodeModalVisible(false)}
                    style={tw`w-9 h-9 rounded-full bg-gray-100 items-center justify-center`}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="close" size={18} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Proper Scrollable List */}
              <FlatList
                data={Array.isArray(serviceItem?.Services) ? serviceItem.Services : []}
                keyExtractor={(item, index) =>
                  String(item?.ServiceItemId ?? index)
                }
                style={tw`flex-1`}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 }}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
                removeClippedSubviews={false}
                initialNumToRender={8}
                maxToRenderPerBatch={8}
                windowSize={10}
                renderItem={({ item: s, index: idx }) => {
                  const id = s?.ServiceItemId;
                  const draft = id ? barcodeDraft?.[id] : null;
                  const isRemarkOpen = Boolean(id && remarkExpanded?.[id]);

                  return (
                    <View
                      style={[
                        themed.childScreen, themed.border,
                        tw`p-4 mb-4 rounded-xl `
                      ]}
                    >
                      <Text style={[themed.inputText]}>
                        {s?.ServiceName || ''}
                      </Text>

                      {/* Barcode Input */}
                      <View style={tw`mb-4`}>
                        <Text style={tw`text-xs font-medium text-gray-600 mb-1.5 ml-1`}>
                          Barcode Number
                        </Text>
                        <TextInput
                          value={draft?.barcode ?? ''}
                          onChangeText={(txt) => {
                            if (!id) return;
                            setBarcodeDraft((prev) => ({
                              ...(prev || {}),
                              [id]: { ...(prev?.[id] || {}), barcode: txt },
                            }));
                          }}
                          placeholder="Enter barcode"
                          placeholderTextColor="#9CA3AF"
                          style={[themed.inputBox, themed.inputText]}
                        />
                      </View>

                      {/* Remark Input */}
                      <View>
                        <View style={tw`flex-row items-center justify-between`}>
                          <Text style={[themed.inputLabel, tw`mb-0`]}>
                            Test Remark
                          </Text>

                          <TouchableOpacity
                            onPress={() => {
                              if (!id) return;
                              setRemarkExpanded((prev) => ({
                                ...(prev || {}),
                                [id]: !prev?.[id],
                              }));
                            }}
                            style={[themed.inputBox, themed.inputText]}
                            activeOpacity={0.7}
                          >
                            {String(draft?.testRemark ?? '').trim() ? (
                              <View style={tw`bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full mr-2`}>
                                <Text style={tw`text-blue-600 text-[10px] font-medium`}>
                                  Added
                                </Text>
                              </View>
                            ) : null}

                            <MaterialCommunityIcons
                              name={isRemarkOpen ? 'message-text' : 'message-text-outline'}
                              size={20}
                              color="#6B7280"
                            />
                          </TouchableOpacity>
                        </View>

                        {isRemarkOpen && (
                          <TextInput
                            value={draft?.testRemark ?? ''}
                            onChangeText={(txt) => {
                              if (!id) return;
                              setBarcodeDraft((prev) => ({
                                ...(prev || {}),
                                [id]: { ...(prev?.[id] || {}), testRemark: txt },
                              }));
                            }}
                            placeholder="Enter test remark (optional)"
                            placeholderTextColor="#9CA3AF"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            style={[themed.inputBox, themed.inputText]}
                          />
                        )}
                      </View>
                    </View>
                  );
                }}
                ListEmptyComponent={
                  <View style={tw`flex-1 justify-center items-center py-10`}>
                    <Text style={tw`text-gray-500`}>No tests found</Text>
                  </View>
                }
              />

              {/* Fixed Footer */}
              <View style={tw`px-4 pt-3 pb-5  `}>
                <View style={tw`flex-row gap-3`}>
                  <TouchableOpacity
                    onPress={() => setBarcodeModalVisible(false)}
                    style={[themed.cancelButton]}
                    activeOpacity={0.7}
                  >
                    <Text style={tw`text-gray-700 text-center font-semibold text-base`}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleBarcodeModalSave}
                    style={tw`flex-1 bg-blue-600 py-3.5 rounded-xl shadow-sm`}
                    activeOpacity={0.7}
                  >
                    <Text style={tw`text-white text-center font-semibold text-base`}>
                      Save & Continue
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* refer doctor modal */}
        <Modal
          visible={refrDoctrorModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setReferDoctorModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setReferDoctorModal(false)}>
            <View style={[themed.modalOverlay]}>
              <TouchableWithoutFeedback onPress={() => { }}>
                <View style={[themed.modalContainer2, tw` rounded-t-2xl w-full h-[70%] p-4`]}>
                  <ReferDoctor
                    onSelectDoctor={(doctor) => {
                      setSelectedReferDoctor(doctor);
                    }}
                    onClose={() => setReferDoctorModal(false)}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Add refer doctor modal */}
        <Modal
          visible={addreferDoctorModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setAddReferDoctorModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setAddReferDoctorModal(false)}>
            <View style={[themed.modalOverlay]}>
              <TouchableWithoutFeedback onPress={() => { }}>
                <View style={[themed.modalContainer, tw` rounded-t-2xl w-full   p-4`]}>
                  <AddReferDoctor
                    onClose={() => { setAddReferDoctorModal(false), referDoctorList() }}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* doctor list modal */}
        <Modal
          visible={doctorlistModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setDoctorListModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setDoctorListModal(false)}>
            <View style={tw`flex-1 justify-end bg-black/50`}>
              <TouchableWithoutFeedback onPress={() => { }}>
                <View style={tw`bg-white w-full h-[70%] rounded-t-2xl p-4`}>
                  <DoctorList
                    onSelectDoctor={(doctor) => {
                      setSelectedDoctorList(doctor);
                      setDoctorListModal(false);
                    }}
                    onClose={() => setDoctorListModal(false)}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* refer lab Modal */}
        <Modal
          visible={referLabListModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setReferLabListModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setReferLabListModal(false)}>
            <View style={tw`flex-1 justify-end bg-black/50`}>
              <TouchableWithoutFeedback onPress={() => { }}>
                <View style={tw`bg-white px-4 rounded-t-3xl w-full h-[70%]`}>
                  <View style={tw`flex-1`}>
                    <View style={tw`items-center pt-2 pb-1`}>
                      <View style={tw`w-12 h-1 bg-gray-300 rounded-full`} />
                    </View>
                    <ReferLab
                      onSelectDoctor={(doctor) => {
                        setSelectedReferLab(doctor);
                      }}
                      onClose={() => setReferLabListModal(false)}
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* search select modal */}
        <Modal
          visible={searchSelectModal}
          transparent
          animationType="slide"
          onRequestClose={() => setSearchSelectModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setSearchSelectModal(false)}>
            <View style={tw`flex-1 justify-end bg-black/40`}>
              <TouchableWithoutFeedback onPress={() => { }}>
                <View style={tw`bg-white w-full h-[70%] rounded-t-3xl overflow-hidden`}>
                  <SearchSelectService onClose={() => setSearchSelectModal(false)} />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Field boy modal */}
        <Modal
          visible={fieldBoyModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setFieldBoyModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setFieldBoyModal(false)}>
            <View style={tw`flex-1 justify-end bg-black/50`}>
              <TouchableWithoutFeedback onPress={() => { }}>
                <View style={tw`bg-white rounded-t-3xl w-full h-[60%] p-4`}>
                  <View style={tw`w-12 h-1 bg-gray-300 self-center mb-3 rounded-full`} />
                  <View style={tw`flex-1`}>
                    <FieldBoy
                      onSelectFieldBoy={setSelectedFieldBoy}
                      onClose={() => setFieldBoyModal(false)}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => setFieldBoyModal(false)}
                    style={tw`bg-purple-500 py-4 rounded-xl mt-2`}
                  >
                    <Text style={tw`text-white text-center font-semibold`}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* title modal */}
        <BottomModal
          visible={selectTitleModal}
          onClose={() => setSelectTitleModal(false)}
        >
          <SelectTitle
            onClose={() => setSelectTitleModal(false)}
            onSelectTitle={setSelectedTitle}
          />
        </BottomModal>

        {/* bank Modal */}
        <Modal
          visible={bankModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setBankModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setBankModal(false)}>
            <View style={tw`flex-1 justify-end bg-black/50`}>
              <TouchableWithoutFeedback onPress={() => { }}>
                <View style={tw`bg-white rounded-t-3xl w-full h-[60%] p-4`}>
                  <View style={tw`w-12 h-1 bg-gray-300 self-center mb-3 rounded-full`} />
                  <View style={tw`flex-1`}>
                    <SelectBank
                      onSelectBankItem={setSelectedBank}
                      onClose={() => setBankModal(false)}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => setBankModal(false)}
                    style={tw`bg-purple-500 py-4 rounded-xl mt-2`}
                  >
                    <Text style={tw`text-white text-center font-semibold`}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Registration;
