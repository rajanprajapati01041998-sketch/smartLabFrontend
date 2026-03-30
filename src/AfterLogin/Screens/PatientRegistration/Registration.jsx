import { View, Text, TextInput, ScrollView, TouchableOpacity, Modal, TouchableWithoutFeedback, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import tw from 'twrnc';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  referLabList,
  searchInvestigation,
  SearchGetInvestigationListDetails
} from './services/doctorService';
import ReferDoctor from './ReferDoctor';
import DoctorList from './DoctorList';
import { useAuth } from '../../../../Authorization/AuthContext';
import ReferLab from './ReferLab';
import SearchSelectService from './SearchSelectService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RadioButton } from 'react-native-paper';
import FieldBoy from './FieldBoy';
import api from '../../../../Authorization/api';
import SelectTitle from './SelectTitle';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import styles from '../../../utils/InputStyle';
import Icon from 'react-native-vector-icons/Feather';
import CenterInfo from './CenterInfo';
import { useToast } from '../../../../Authorization/ToastContext';
import BottomModal from '../../../utils/BottomModal';
import CenterModal from '../../../utils/CenterModal';
import { useTheme } from '../../../../Authorization/ThemeContext';




const Registration = () => {
  const [loading, setLoading] = useState(false)
  const { ipAddress, setServiceItem, serviceItem, selectedDoctor, corporateId, patientData, userData, loginBranchId } = useAuth();
  const { showToast } = useToast()
  const { colors } = useTheme()
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
  const [grossAmount, setGrossAmount] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [balanceAmount, setBalanceAmount] = useState(patientData?.TotalBalanceOfAdvanceAmount || null);
  const [netAmount, setNetAmount] = useState(null);
  const [cash, setCash] = useState(null);
  const [debitCardAmt, setDebitCardAmt] = useState(null);
  const [creditCardAmt, setCreditCardAmt] = useState(null);
  const [chequeAmt, setChequeAmt] = useState(null);
  const [neftrtgsAmt, setNeftRtgsAmt] = useState(null);
  const [payTmAmt, setPayTm] = useState(null);
  const [phonePayAmt, setPhonePayAmt] = useState(null);
  const [discountReason, setDiscountReason] = useState(" ");
  const [remark, setRemark] = useState(" ");
  const [refrDoctrorModal, setReferDoctorModal] = useState(false);
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

  useEffect(() => {
    resetForm()
  }, [responseSuccess])

  const resetForm = () => {
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
    setNetAmount(null);
    setBalanceAmount(null);

    // Payments
    setCash(null);
    setDebitCardAmt(null);
    setCreditCardAmt(null);
    setChequeAmt(null);
    setPhonePayAmt(null);
    setPayTm(null);

    // Others
    setDiscountReason('');
    setRemark('');

    // Services reset
    setServiceItem({ Services: [] });
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




  const handleSavePatient = async () => {
    console.log(loginBranchId)
    if (!firstName) {
      showToast('Enter full name', 'error');
      return;
    }

    if (!ageYears && !ageMonths && !ageDays && !dob) {
      showToast('Enter age or DOB', 'error');
      return;
    }
    if (!gender) {
      showToast('Select Gender', 'error');
      return;
    }
    // if (!selectedDoctor) {
    //   showToast('Select Doctor', 'error');
    //   return;
    // }
    if (!contactNumber) {
      showToast('Enter Contact number', 'error');
      return;
    }

    setLoading(true)
    const payload = {
      HospId: 1,
      BranchId: loginBranchId,
      LoginBranchId: loginBranchId,

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

      UserId: 1,
      IpAddress: currentIpAddress,

      GrossAmount: Number(grossAmount || 0),
      DiscountAmount: Number(discountAmount || 0),
      NetAmount: Number(netAmount || 0),

      // ✅ Services from context
      Services: serviceItem?.Services?.map(item => ({
        ServiceItemId: item.ServiceItemId,
        SubSubCategoryId: item.SubSubCategoryId,
        ServiceName: item.ServiceName,
        Amount: item.Amount,
        qty: item.qty || 1,
        IsUrgent: item.IsUrgent || 0
      })) || [],

      // ✅ Payments
      payments: [
        cash > 0 && { paymentModeId: 1, amount: Number(cash) },
        debitCardAmt > 0 && { paymentModeId: 2, amount: Number(debitCardAmt) },
        creditCardAmt > 0 && { paymentModeId: 3, amount: Number(creditCardAmt) },
        chequeAmt > 0 && { paymentModeId: 4, amount: Number(chequeAmt) },
        neftrtgsAmt > 0 && { paymentModeId: 5, amount: Number(neftrtgsAmt) },
        phonePayAmt > 0 && { paymentModeId: 6, amount: Number(phonePayAmt) },
        payTmAmt > 0 && { paymentModeId: 7, amount: Number(payTmAmt) },
      ].filter(Boolean),

      // ✅ Investigations (sample static or modify as needed)
      Investigations: [
        {
          ReportingBranchId: loginBranchId,
          Barcode: "gasfg",
          TestRemark: ""
        }
      ]
    };



    console.log("Payload 👉", JSON.stringify(payload, null, 2));
    try {
      // console.log(payload)
      const response = await api.post(`Patient/save`, payload)
      console.log("booking suceess", response)
      showToast("Patinet Saved Sucessfully", 'success');
      setResponseSuccess(true)

    } catch (error) {
      console.log("erroer", error.response)
      showToast(error?.response?.data?.message, 'warning');
    }
    finally {
      setLoading(false)
    }

  };

  useEffect(() => {
    if (serviceItem?.Services) {
      const sum = serviceItem.Services.reduce((acc, item) => {
        return acc + (item.Amount);
      }, 0);
      console.log("total Amount", sum);
      setGrossAmount(sum);
      setNetAmount(sum);
      setBalanceAmount(sum);
      setCash(sum);
    }
  }, [serviceItem]);

  useEffect(() => {
    const gross = Number(grossAmount || 0);
    const discPer = Number(discountPercent || 0);
    const discAmt = (gross * discPer) / 100;
    const net = gross - discAmt;
    const roundedNet = Math.round(net);
    setDiscountAmount(discAmt.toFixed(2));
    setNetAmount(roundedNet);
  }, [discountPercent, grossAmount]);

  useEffect(() => {
    const totalPaid =
      Number(cash || 0) +
      Number(debitCardAmt || 0) +
      Number(creditCardAmt || 0) +
      Number(chequeAmt || 0) +
      Number(neftrtgsAmt || 0) +
      Number(phonePayAmt || 0) +
      Number(payTmAmt || 0);

    const net = Number(netAmount || 0);
    let balance = net - totalPaid;
    if (balance < 0) balance = 0;

    setBalanceAmount(balance);
  }, [
    cash,
    debitCardAmt,
    creditCardAmt,
    chequeAmt,
    neftrtgsAmt,
    phonePayAmt,
    payTmAmt,
    netAmount
  ]);

  useEffect(() => {
    if (serviceItem?.Services) {
      const sum = serviceItem.Services.reduce((acc, item) => {
        return acc + item.Amount;
      }, 0);

      setGrossAmount(sum);
      setNetAmount(sum);
      setBalanceAmount(sum);
    }
  }, [serviceItem]);

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
    setShowDatePicker(false);

    if (selectedDate) {
      // If we don't have a collectionDateTime yet, create a new date with time set to now
      if (!collectionDateTime) {
        const newDate = new Date(selectedDate);
        const now = new Date();
        newDate.setHours(now.getHours(), now.getMinutes());
        setCollectionDateTime(newDate);
      } else {
        // Preserve the existing time and update only the date
        const updated = new Date(collectionDateTime);
        updated.setFullYear(selectedDate.getFullYear());
        updated.setMonth(selectedDate.getMonth());
        updated.setDate(selectedDate.getDate());
        setCollectionDateTime(updated);
      }
      setShowTimePicker(true); // Open time picker after date selection
    }
  };

  const onChangeTime = (event, selectedTime) => {
    setShowTimePicker(false);

    if (selectedTime && collectionDateTime) {
      const updated = new Date(collectionDateTime);
      updated.setHours(selectedTime.getHours());
      updated.setMinutes(selectedTime.getMinutes());
      setCollectionDateTime(updated);
    } else if (selectedTime && !collectionDateTime) {
      // If for some reason we have time but no date, create a new date with today's date
      const newDate = new Date();
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setCollectionDateTime(newDate);
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

  // const GetSearchTestDetail = async () => {
  //   try {
  //     const response = await SearchGetInvestigationListDetails({
  //       corporateId: 1,
  //       doctorId: 2,
  //       serviceItemId: 1,
  //       categoryId: 3,
  //       subCategoryId: 1,
  //       subSubCategoryId: 29261,
  //       bedTypeId: 0,
  //     });
  //     console.log('Investigation List Details:', response);
  //   } catch (error) {
  //     console.error('Error fetching investigation list details:', error);
  //   }
  // };

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
    <SafeAreaView style={tw``}>
      <ScrollView style={tw`p-2 mb-15`}>
        <CenterInfo />
        {/* patient information */}
        <View style={styles.cardShadow}>
          <Text style={styles.patientInfoText}>Patient Info:</Text>
          <View style={tw`flex flex-row justify-between items-center gap-1 mb-3`}>
            <View style={tw`flex flex-col gap-1 w-[25%]`}>
              <View style={tw`flex flex-row items-center`}>
                <Text style={styles.labelText}>Title</Text>
                <Text style={tw`text-red-500  -mt-2`}>*</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectTitleModal(true)}
                style={tw`border border-gray-300 rounded-xl px-2 py-3 bg-white`}
              >
                <Text style={tw`text-md text-gray-700`}>
                  {selectedTitle || "Mr"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={tw`flex flex-col py-0.5 gap-1 w-[74%]`}>
              <View style={tw`flex flex-row items-center`}>
                <Text style={styles.labelText}>Name</Text>
                <Text style={tw`text-red-500  -mt-2`}>*</Text>
              </View>
              <TextInput
                value={firstName}
                onChangeText={(text) => setFirstName(text)}
                style={styles.inputBox}
                placeholder='Name'
                placeholderTextColor={colors.placeholder}

              />
              {/* {error&&<Text style={tw`text-red-500`}>Enter Name</Text>} */}
            </View>
          </View>

          <View style={tw`flex flex-row justify-between items-center gap-1`}>
            <View style={tw`flex flex-col py-0.5  w-[20%]`}>
              <Text style={styles.labelText}>Age Y</Text>
              <TextInput
                value={ageYears}
                onChangeText={(text) => setAgeYears(text)}
                style={styles.inputBox}
                placeholder='29'
                placeholderTextColor={colors.placeholder}

              />
            </View>
            <View style={tw`flex flex-col py-0.5  w-[20%]`}>
              <Text style={styles.labelText}>Age M</Text>
              <TextInput
                value={ageMonths}
                onChangeText={(text) => setAgeMonths(text)}
                style={styles.inputBox}
                placeholder='04'
                placeholderTextColor={colors.placeholder}

              />
            </View>
            <View style={tw`flex flex-col py-0.5  w-[20%]`}>
              <Text style={styles.labelText}>Age D</Text>
              <TextInput
                value={ageDays}
                onChangeText={(text) => setAgeDays(text)}
                style={styles.inputBox}
                placeholder='12'
                placeholderTextColor={colors.placeholder}

              />
            </View>
            <View style={tw`flex flex-col py-0.5  w-[30%]`}>
              <View style={tw`flex flex-row items-center`}>
                <Text style={styles.labelText}>DOB</Text>
                <Text style={tw`text-red-500  -mt-2`}>*</Text>
              </View>
              <TouchableOpacity onPress={() => setShowPicker(true)}>
                <TextInput
                  value={dob ? dob.toLocaleDateString() : ''}
                  editable={false}
                  pointerEvents="none"
                  placeholder="1/4/1998"
                  placeholderTextColor={colors.placeholder}
                  style={styles.inputBox}
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
                <Text style={styles.labelText}>Gender</Text>
                <Text style={tw`text-red-500  -mt-2`}>*</Text>
              </View>
              <View style={tw`flex-row items-center`}>
                <View style={tw`flex-row items-center mr-4`}>
                  <RadioButton value="MALE" />
                  <Text style={tw`ml-1`}>Male</Text>
                </View>
                <View style={tw`flex-row items-center mr-4`}>
                  <RadioButton value="FEMALE" />
                  <Text style={tw`ml-1`}>Female</Text>
                </View>
                <View style={tw`flex-row items-center`}>
                  <RadioButton value="OTHER" />
                  <Text style={tw`ml-1`}>Other</Text>
                </View>
              </View>
            </RadioButton.Group>
          </View>

          <View style={tw`mt-2 flex flex-col justify-center items-center gap-2`}>
            <View style={tw`flex flex-col w-full`}>
              <Text style={styles.labelText}>Referred Doctor</Text>
              <TouchableOpacity
                onPress={() => setReferDoctorModal(true)}
                style={[styles.dropDownButton, tw` mb-3 mt-1 flex-row justify-between items-center`]}
              >
                <Text style={styles.insideDropDownText} >
                  {selectedReferDoctor ? selectedReferDoctor.name : '- Select Doctor-'}
                </Text>

                <Icon name="chevron-down" size={18} color="gray" />
              </TouchableOpacity>
            </View>
            <View style={tw`flex flex-col w-full`}>
              <Text style={styles.labelText}>Referred Lab</Text>

              <TouchableOpacity
                onPress={() => setReferLabListModal(true)}
                style={[styles.dropDownButton, tw` mb-3 mt-1 flex-row justify-between items-center`]}
              >
                <Text style={styles.insideDropDownText}  >
                  {selectedReferLab
                    ? selectedReferLab.outSourceLab
                    : 'Select Refer Lab'}
                </Text>

                <Icon name="chevron-down" size={18} color="gray" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={tw`mt-1 flex flex-row justify-center items-center gap-2`}>
            <View style={tw`flex flex-col py-0.5 gap-1 w-[48%]`}>
              <View style={tw`flex flex-row items-center`}>
                <Text style={styles.labelText}>Contact No (Self)</Text>
                <Text style={tw`text-red-500  -mt-2`}>*</Text>
              </View>
              <TextInput
                keyboardType='numeric'
                maxLength={10}
                value={contactNumber}
                onChangeText={(text) => setContactNumber(text)}
                style={styles.inputBox}
                placeholder='8991212131'
                placeholderTextColor={colors.placeholder}

              />
            </View>
            <View style={tw`flex flex-col py-0.5 gap-1 w-[48%]`}>
              <Text style={styles.labelText}>Email</Text>
              <TextInput
                placeholder='test@gmail.com'
                value={email}
                onChangeText={(text) => setEmail(text)}
                style={styles.inputBox}
                placeholderTextColor={colors.placeholder}

              />
            </View>
          </View>

          <View style={tw`mt-2`}>
            <Text style={styles.labelText}>Address</Text>
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
          </View>

          <View style={tw`mt-2`}>
            <Text style={styles.labelText}>Medical history</Text>
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
          </View>

          <View style={tw`my-3`}>
            <RadioButton.Group
              onValueChange={value => setVisitype(value)}
              value={vistType}
            >
              <Text style={styles.labelText}>Visit type</Text>
              <View style={tw`flex-row items-center justify-start`}>
                <View style={tw`flex-row items-center`}>
                  <RadioButton value="Clinic Visit" />
                  <Text style={styles.labelText}>Clinic Visit</Text>
                </View>

                <View style={tw`flex-row items-center`}>
                  <RadioButton value="Home Collection" />
                  <Text style={styles.labelText}>Home Collection</Text>
                </View>
              </View>
            </RadioButton.Group>

            {vistType === "Home Collection" && (
              <View style={tw`flex flex-row justify-center items-center gap-2 mt-1`}>
                <View style={tw`flex flex-col w-[48%]`}>
                  <Text style={styles.labelText}>Field Boy</Text>
                  <TouchableOpacity onPress={() => setFieldBoyModal(true)} style={tw`border border-gray-300 p-3 rounded mb-3 mt-1`}>
                    <Text>{selectedFieldBoy ? selectedFieldBoy.fieldBoyName : 'Select Field Boy'}</Text>
                  </TouchableOpacity>
                </View>

                <View style={tw`flex flex-col w-[48%]`}>
                  <Text style={styles.labelText}>Collection Date Time</Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={tw`border border-gray-300 p-3 rounded mb-3 mt-1`}
                  >
                    <Text>{formatDateTime(collectionDateTime)}</Text>
                  </TouchableOpacity>

                  {/* Date Picker */}
                  {showDatePicker && (
                    <DateTimePicker
                      value={collectionDateTime || new Date()}
                      mode="date"
                      display="default"
                      onChange={onChangeDate}
                    />
                  )}

                  {/* Time Picker */}
                  {showTimePicker && (
                    <DateTimePicker
                      value={collectionDateTime || new Date()}
                      mode="time"
                      display="default"
                      onChange={onChangeTime}
                    />
                  )}
                </View>
              </View>
            )}
          </View>
        </View>


        <View style={styles.cardShadow}>
          <Text style={styles.patientInfoText}>Invstigation Details:</Text>


          {/* Name Field */}
          {/* <View style={tw`flex-1`}>
              <View style={tw`flex flex-row items-center`}>
                <Text style={styles.labelText}>Select Doctor</Text>
                <Text style={tw`text-red-500 -mt-2`}>*</Text>
              </View>

              <TouchableOpacity
                onPress={() => setDoctorListModal(true)}
                style={[styles.dropDownButton, tw`p-3  mb-3 flex-row items-center justify-center`]}              >
                <Text numberOfLines={1} style={styles.insideDropDownText}>
                  {selectedDoctorList ? selectedDoctorList.name : 'Select Doctor'}
                </Text>
                <Icon name="chevron-down" size={18} color="gray" />
              </TouchableOpacity>
            </View> */}

          {/* Search Service */}
          <View style={tw`flex-1`}>
            <View style={tw`flex flex-row items-center`}>
              {/* {console.log("item",serviceItem)} */}
              <Text style={styles.labelText}>Search Service</Text>
              <Text style={tw`text-red-500 -mt-2`}>* </Text>
            </View>

            <TouchableOpacity
              onPress={() => setSearchSelectModal(true)}
              style={[styles.dropDownButton, tw`p-3  mb-3 flex-row items-center justify-start`]}              >
              <FontAwesome5 name="search" size={16} color="gray" style={tw`mr-2`} />
              <Text style={styles.insideDropDownText}>
                Search Service
              </Text>
            </TouchableOpacity>
          </View>


          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={tw`flex-row items-center`}
          >
            {serviceItem?.Services?.map((s, index) => (
              <View
                key={index}
                style={tw`flex-row items-center bg-blue-100 px-3 py-1 rounded-full mr-2`}
              >
                {/* Service Name */}
                <Text style={tw`text-blue-700 text-xs mr-1`}>
                  {s.ServiceName.slice(0, 10)}
                </Text>

                {/* Close Button */}
                <TouchableOpacity
                  onPress={() => handleRemoveService(index)}
                  style={tw`ml-1 p-1`}
                >
                  <FontAwesome5 name="times" size={12} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

        </View>

        <View style={styles.cardShadow}>
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
                  <Text style={styles.labelText}>Gross Amount</Text>
                  <TextInput
                    editable={false}
                    value={grossAmount ? String(grossAmount) : ""}
                    style={[styles.inputBox]}
                    placeholder=''
                  />
                </View>

                {/* Discount % */}
                <View style={tw`w-[30%] mx-1`}>
                  <Text style={styles.labelText}>Disc (%)</Text>
                  <TextInput
                    value={discountPercent ? String(discountPercent) : ""}
                    keyboardType="numeric"
                    onChangeText={setDiscountPercent}
                    style={[styles.inputBox]}
                    placeholder='1%'
                    placeholderTextColor={colors.placeholder}

                  />
                </View>

                {/* Discount Amount */}
                <View style={tw`w-[30%] ml-1`}>
                  <Text style={styles.labelText}>Disc Amt</Text>
                  <TextInput
                    value={discountAmount ? String(discountAmount) : ""}
                    editable={false}
                    style={[styles.inputBox]}
                  />
                </View>
              </View>

              <View style={tw`flex-row items-center gap-2.5 mt-2`}>
                {/* Round off Amount */}
                <View style={tw`w-[30%] mr-1`}>
                  <Text style={styles.labelText}>Round off</Text>
                  <TextInput
                    readOnly
                    value={grossAmount ? String(grossAmount) : ""}
                    keyboardType="numeric"
                    style={[styles.inputBox]}
                    placeholder='1.4'
                    placeholderTextColor={colors.placeholder}

                  />
                </View>

                {/* Net Amount */}
                <View style={tw`w-[30%] mx-1`}>
                  <Text style={styles.labelText}>Net Amount</Text>
                  <TextInput
                    value={netAmount ? String(netAmount) : ""}
                    editable={false}
                    style={[styles.inputBox]}
                    placeholder='120'
                    placeholderTextColor={colors.placeholder}

                  />
                </View>

                {/* Balance Amount */}
                <View style={tw`w-[30%] ml-1`}>
                  <Text style={styles.labelText}>Balance Amt</Text>
                  <TextInput
                    value={balanceAmount ? String(balanceAmount) : 0}
                    editable={false}
                    style={[styles.inputBox]}
                    placeholder='Avl Bal'
                    placeholderTextColor={colors.placeholder}

                  />
                </View>
              </View>

              {/* discount reason section */}
              <View style={tw`flex-row items-center gap-2.5 mt-2`}>
                {/* Discount approved by */}
                <View style={tw`w-[30%] mr-1`}>
                  <Text numberOfLines={1} style={styles.labelText}>Dis Approved by</Text>
                  <TouchableOpacity style={tw`border border-gray-300 px-2 py-3 bg-white rounded-xl`}>
                    <Text style={styles.labelText}>Select</Text>
                  </TouchableOpacity>
                </View>

                {/* Discount reason */}
                <View style={tw`w-[30%] mx-1`}>
                  <Text style={styles.labelText}>Disc Reason</Text>
                  <TextInput
                    value={discountReason}
                    onChangeText={setDiscountReason}
                    style={[styles.inputBox]}
                    placeholder='test'
                    placeholderTextColor={colors.placeholder}

                  />
                </View>

                {/* Remark */}
                <View style={tw`w-[30%] mx-1`}>
                  <Text style={styles.labelText}>Remark</Text>
                  <TextInput
                    value={remark}
                    onChangeText={setRemark}
                    style={[styles.inputBox]}
                    placeholder='Rem'
                    placeholderTextColor={colors.placeholder}

                  />
                </View>
              </View>
            </>
          )}
        </View>

        {/* Payment Fields */}

        <View style={styles.cardShadow}>
          <Text style={styles.patientInfoText}>Payment Info:</Text>
          <View style={tw`mb-2`}>
            <Text style={styles.labelText}>Cash</Text>
            <TextInput
              value={cash ? String(cash) : ""}
              keyboardType="numeric"
              onChangeText={setCash}
              style={[styles.inputBox]}
              placeholder='100'
              placeholderTextColor={colors.placeholder}

            />
          </View>

          {/* Row 1 */}
          <View style={tw`flex-row justify-between mb-2`}>
            <View style={tw`w-[48%]`}>
              <Text style={styles.labelText}>Debit Card</Text>
              <TextInput
                value={debitCardAmt ? String(debitCardAmt) : ""}
                keyboardType="numeric"
                onChangeText={setDebitCardAmt}
                style={[styles.inputBox]}
                placeholder='10'
                placeholderTextColor={colors.placeholder}

              />
            </View>
            <View style={tw`w-[48%]`}>
              <Text style={styles.labelText}>Credit Card</Text>
              <TextInput
                value={creditCardAmt ? String(creditCardAmt) : ""}
                keyboardType="numeric"
                onChangeText={setCreditCardAmt}
                style={[styles.inputBox]}
                placeholder='19'
                placeholderTextColor={colors.placeholder}

              />
            </View>
          </View>

          {/* Row 2 */}
          <View style={tw`flex-row justify-between mb-2`}>
            <View style={tw`w-[48%]`}>
              <Text style={styles.labelText}>Cheque</Text>
              <TextInput
                value={chequeAmt ? String(chequeAmt) : ""}
                keyboardType="numeric"
                onChangeText={setChequeAmt}
                style={[styles.inputBox]}
                placeholder='22'
                placeholderTextColor={colors.placeholder}

              />
            </View>
            <View style={tw`w-[48%]`}>
              <Text style={styles.labelText}>NEFT/RTGS</Text>
              <TextInput
                value={neftrtgsAmt ? String(neftrtgsAmt) : ""}
                keyboardType="numeric"
                onChangeText={setNeftRtgsAmt}
                style={[styles.inputBox]}
                placeholder='25'
                placeholderTextColor={colors.placeholder}

              />
            </View>
          </View>

          {/* Row 3 */}
          <View style={tw`flex-row justify-between mb-2`}>
            <View style={tw`w-[48%]`}>
              <Text style={styles.labelText}>PhonePe</Text>
              <TextInput
                value={phonePayAmt ? String(phonePayAmt) : ""}
                keyboardType="numeric"
                onChangeText={setPhonePayAmt}
                style={[styles.inputBox]}
                placeholder='123'
                placeholderTextColor={colors.placeholder}

              />
            </View>
            <View style={tw`w-[48%]`}>
              <Text style={styles.labelText}>PayTM</Text>
              <TextInput
                value={payTmAmt ? String(payTmAmt) : ""}
                keyboardType="numeric"
                onChangeText={setPayTm}
                style={[styles.inputBox]}
                placeholder='333'
                placeholderTextColor={colors.placeholder}

              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSavePatient}
          style={[styles.saveButton, tw`flex-row justify-center items-center `]}
          disabled={loading}
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


        {/* refer doctor modal */}
        <Modal
          visible={refrDoctrorModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setReferDoctorModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setReferDoctorModal(false)}>
            <View style={tw`flex-1 justify-end bg-black/50`}>
              <TouchableWithoutFeedback onPress={() => { }}>
                <View style={tw`bg-white rounded-t-2xl w-full h-[70%] p-4`}>
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

        {/* doctor list modal */}
        <Modal
          visible={doctorlistModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setDoctorListModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setDoctorListModal(false)}>
            {/* Overlay */}
            <View style={tw`flex-1 justify-end bg-black/50`}>
              <TouchableWithoutFeedback onPress={() => { }}>
                {/* Bottom Sheet */}
                <View style={tw`bg-white w-full h-[70%] rounded-t-2xl p-4`}>
                  <DoctorList
                    onSelectDoctor={(doctor) => {
                      setSelectedDoctorList(doctor);
                      setDoctorListModal(false); // optional: auto close
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
                    {/* Drag Indicator */}
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
          {/* BACKDROP */}
          <TouchableWithoutFeedback onPress={() => setSearchSelectModal(false)}>
            <View style={tw`flex-1 justify-end bg-black/40`}>
              <TouchableWithoutFeedback onPress={() => { }}>
                <View style={tw`bg-white w-full h-[70%] rounded-t-3xl pt-3 pb-4 px-4`}>
                  <View style={tw`w-12 h-1 bg-gray-300 self-center mb-3 rounded-full`} />
                  {/* CONTENT */}
                  <View style={tw`flex-1`}>
                    <SearchSelectService
                      onClose={() => setSearchSelectModal(false)}
                    />
                  </View>

                  {/* CLOSE BUTTON */}
                  <TouchableOpacity
                    onPress={() => setSearchSelectModal(false)}
                    style={tw`bg-purple-500 py-4 rounded-full mt-3`}
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
                  {/* CONTENT */}
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default Registration;