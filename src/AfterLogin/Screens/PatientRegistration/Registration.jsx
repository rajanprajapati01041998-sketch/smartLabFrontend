// Registration.jsx
import { View, Text, TextInput, TouchableOpacity, Modal, Alert, TouchableWithoutFeedback } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import styles from "../../../../Custom.styles";
import tw from 'twrnc';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SelectList } from 'react-native-dropdown-select-list'
import AddDoctor from '../../../../src/AddDoctor';
import AddNewReferLab from '../../../../src/AddNewReferLab';
import { ScrollView } from 'react-native-gesture-handler';
import AddTestDetails from './AddTestDetails'; // This imports the component
import { useTheme } from '../../../../Authorization/ThemeContext';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Entypo from 'react-native-vector-icons/Entypo';


import SearchPatient from '../PatientRegistration/SearchPatient'



const Registration = () => {
  const { saveButtonBackground, pageBackground } = useTheme();
  const [selected, setSelected] = useState("");
  const [selectedReferLab, setSelectedReferLab] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [doctorModal, setDoctorModal] = useState(false);
  const [raferLabModal, setReferLabModal] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState('Mr.');
  const [selectedGender, setSelectedGender] = useState('Male');
  const [dob, setDob] = useState(null);
  const [contactNo, setContactNo] = useState('');
  const [pincode, setPincode] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [filedBoy, setFiledBoy] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [showHomeCollectionField, setShowHomeCollectionField] = useState(false);
  const [age, setAge] = useState('');
  const [dateTime, setDateTime] = useState(null);
  const [showPicker2, setShowPicker2] = useState(false);
  const [mode, setMode] = useState('date');
  const [searchPatientModal, setSearchPatientModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [panelRateType, setPanelRateType] = useState('CASH');
  const [patientName, setPatientName] = useState('');
  const [uhid, setUhid] = useState('');
  const [visitType, setVisitType] = useState('');
  const [centerInfo, setCenterInfo] = useState({
    centerName: 'GRAVITY WEB TECHNOLOGIES',
    centerId: '01'
  });

  // State for test details
  const [testDetails, setTestDetails] = useState({
    searchText: '',
    selectedDoctor: '',
    selctedDoctor: '',
    grossBillAmount: '0',
    billDisc: '0',
    roundOff: '0',
    netAmount: '0',
    discountApprovedBy: '',
    discountReason: '',
    balanceAmount: '0',
    remark: '',
    paymentMode: 'Cash',
    amount: '0',
    bank: '',
    refNo: '',
    debitCard: '',
    cheque: '',
    neftRtgs: '',
    paytm: '0',
    phonePay: '0',
    testItems: []
  });

  // Validation errors state
  const [errors, setErrors] = useState({
    title: '',
    name: '',
    dob: '',
    gender: ''
  });

  const [touched, setTouched] = useState({
    title: false,
    name: false,
    dob: false,
    gender: false
  });

  const data = [
    { key: '1', value: 'DR. Amit' },
    { key: '2', value: 'Dr. KR' },
    { key: 'add_Doc', value: '+ Add Doctor' },
  ];

  const refrLab = [
    { key: '1', value: 'lal pathlab' },
    { key: '2', value: 'kumar lab' },
    { key: 'add_Lab', value: '+ Add Lab' },
  ];

  const vistType = [
    { key: '1', value: 'Center Visit' },
    { key: '2', value: 'Home Collection' },
  ];

  const panelRateTypeData = [
    { key: '1', value: 'CASH' },
    { key: '2', value: 'INSURANCE' },
    { key: '3', value: 'CREDIT' },
  ];


  const handleSelectedPatient = (patient) => {

        console.log("Selected Patient:", patient);

        setSelectedPatient(patient);
        setSearchPatientModal(false);
        setPatientName(patient.name)

    };

  // Validation functions
  const validateTitle = (title) => {
    if (!title || title.trim() === '') {
      return 'Title is required';
    }
    return '';
  };

  const validateName = (name) => {
    if (!name || name.trim() === '') {
      return 'Patient name is required';
    }
    return '';
  };

  const validateDOB = (date) => {
    if (!date) {
      return 'Date of birth is required';
    }
    return '';
  };

  const validateGender = (gender) => {
    if (!gender || gender.trim() === '') {
      return 'Gender is required';
    }
    return '';
  };

  // Validate all required fields
  const validateRequiredFields = () => {
    const titleError = validateTitle(selectedTitle);
    const nameError = validateName(patientName);
    const dobError = validateDOB(dob);
    const genderError = validateGender(selectedGender);

    setErrors({
      title: titleError,
      name: nameError,
      dob: dobError,
      gender: genderError
    });

    setTouched({
      title: true,
      name: true,
      dob: true,
      gender: true
    });

    return !titleError && !nameError && !dobError && !genderError;
  };

  // Handle field blur
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    switch (field) {
      case 'title':
        setErrors(prev => ({ ...prev, title: validateTitle(selectedTitle) }));
        break;
      case 'name':
        setErrors(prev => ({ ...prev, name: validateName(patientName) }));
        break;
      case 'dob':
        setErrors(prev => ({ ...prev, dob: validateDOB(dob) }));
        break;
      case 'gender':
        setErrors(prev => ({ ...prev, gender: validateGender(selectedGender) }));
        break;
    }
  };

  // Toggle Title Modal
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  // Select Title
  const selectTitle = (title) => {
    setSelectedTitle(title);
    toggleModal();
    setModalVisible(false);
    setErrors(prev => ({ ...prev, title: validateTitle(title) }));
  };

  const selectGender = (gender) => {
    setSelectedGender(gender);
    setGenderModalVisible(false);
    setErrors(prev => ({ ...prev, gender: validateGender(gender) }));
  }

  // Format DOB as DD-MM-YYYY
  const formatDate = (date) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Calculate Age from DOB
  const calculateAgeFromDOB = (birthDate) => {
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      days += 30;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return `${years}Y/${months}M/${days}D`;
  };

  // Calculate DOB from Age input
  const calculateDOBFromAge = (ageInput) => {
    if (!ageInput) {
      setDob(null);
      return;
    }

    const parts = ageInput.split('/');
    const years = parseInt(parts[0]) || 0;
    const months = parseInt(parts[1]) || 0;
    const days = parseInt(parts[2]) || 0;

    const today = new Date();
    const dobDate = new Date(
      today.getFullYear() - years,
      today.getMonth() - months,
      today.getDate() - days
    );

    setDob(dobDate);
    setErrors(prev => ({ ...prev, dob: validateDOB(dobDate) }));
  };

  // Date Picker Change for DOB
  const onChangeDate = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setDob(selectedDate);
      setAge(calculateAgeFromDOB(selectedDate));
      setErrors(prev => ({ ...prev, dob: validateDOB(selectedDate) }));
    }
  };

  const formatDateTime = (date) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${day}/${month}/${year}, ${formattedHours}:${minutes} ${ampm}`;
  };

  const showDateTimePicker = () => {
    setMode('date');
    setShowPicker2(true);
  };

  const onChangeDateTime = (event, selectedDate) => {
    if (event.type === 'dismissed' || !selectedDate) {
      setShowPicker2(false);
      return;
    }

    if (mode === 'date') {
      const currentDate = selectedDate || new Date();
      setDateTime(currentDate);
      setMode('time');
      setTimeout(() => setShowPicker2(true), 100);
    } else {
      if (dateTime) {
        const finalDate = new Date(dateTime);
        finalDate.setHours(selectedDate.getHours());
        finalDate.setMinutes(selectedDate.getMinutes());
        setDateTime(finalDate);
      } else {
        setDateTime(selectedDate);
      }
      setShowPicker2(false);
      setMode('date');
    }
  };

  // Search patient by UHID
  const searchPatientByUHID = () => {
    if (uhid.length > 0) {
      Alert.alert('Search', `Searching for UHID: ${uhid}`);
    }
  };

  // Update test details
  const handleTestDetailsChange = (updatedTestDetails) => {
    setTestDetails(updatedTestDetails);
  };

  // Create Payload
  const createPayload = () => {
    const payload = {
      centerInfo: {
        centerId: centerInfo.centerId,
        centerName: centerInfo.centerName,
      },
      patientInfo: {
        title: selectedTitle,
        name: patientName,
        age: age,
        dob: dob ? formatDate(dob) : '',
        gender: selectedGender,
        contactNo: contactNo,
        email: email,
        address: address,
        pincode: pincode,
        medicalHistory: medicalHistory,
        uhid: uhid,
      },
      appointmentInfo: {
        referredDoctor: selected,
        referredLab: selectedReferLab,
        panelRateType: panelRateType,
        visitType: visitType,
        collectionDateTime: dateTime ? formatDateTime(dateTime) : '',
        fieldBoy: filedBoy,
      },
      testDetails: testDetails, // Include test details in payload
      metadata: {
        registrationDate: new Date().toISOString(),
        source: 'Mobile App',
      }
    };

    console.log('Registration Payload:', JSON.stringify(payload, null, 2));
    Alert.alert('Success', 'Payload created! Check console for details.');
    return payload;
  };

  // Validate and Submit
  const handleSubmit = () => {
    const isValid = validateRequiredFields();

    if (!isValid) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    const payload = createPayload();
  };

  return (
    <ScrollView style={tw`p-2 bg-[${pageBackground}] flex-1`}>
      <View style={tw`mt-4 mb-2`}>
        <Text style={tw`mb-1 text-gray-700 font-semibold`}>Search Patient by UHID</Text>
        <TouchableOpacity
          onPress={() => setSearchPatientModal(true)}
          style={tw`border border-gray-300 flex flex-row justify-between items-center rounded-md p-2.5`}>
          <Text style={tw`text-gray-600`}>Search by patient name, UHID, phone...</Text>
          <EvilIcons name="search" size={18} />
        </TouchableOpacity>
      </View>
      {/* Center Header */}
      <View style={tw`mb-4 p-3 mt-2 bg-blue-50 rounded-lg`}>
        <Text style={tw`text-lg font-bold text-blue-800`}>
          # Center {centerInfo.centerId}: {centerInfo.centerName}
        </Text>
      </View>

      {/* Panel / RateType */}
      <View style={tw`mb-4`}>
        <Text style={tw`mb-1 text-gray-700 font-semibold`}>Panel / RateType *</Text>
        <SelectList
          setSelected={setPanelRateType}
          data={panelRateTypeData}
          save="value"
          defaultOption={{ key: '1', value: panelRateType }}
          style={tw`w-full`}
        />
      </View>

      {/* Title and Name */}
      <View style={tw`mb-2 flex-row items-start w-full`}>
        <View style={tw`w-[15%]`}>
          <Text style={tw`mb-1 text-gray-700 font-semibold`}>Title *</Text>
          <TouchableOpacity
            style={tw`border ${touched.title && errors.title ? 'border-red-500' : 'border-gray-300'} bg-gray-100 rounded-md px-2 py-3`}
            onPress={toggleModal}
            onBlur={() => handleBlur('title')}
          >
            <Text>{selectedTitle}</Text>
          </TouchableOpacity>
          {touched.title && errors.title ? (
            <Text style={tw`text-red-500 text-xs mt-1`}>{errors.title}</Text>
          ) : null}
        </View>

        <View style={tw`w-[85%] pl-4`}>
          <Text style={tw`mb-1 text-gray-700 font-semibold`}>Name *</Text>
          <TextInput
            style={[styles.input, touched.name && errors.name ? tw`border-red-500` : null]}
            placeholder="Enter patient name"
            value={patientName}
            onChangeText={setPatientName}
            onBlur={() => handleBlur('name')}
          />
          {touched.name && errors.name ? (
            <Text style={tw`text-red-500 text-xs mt-1`}>{errors.name}</Text>
          ) : null}
        </View>
      </View>

      {/* Age and DOB */}
      <View style={tw`flex-row w-full mb-2 gap-2`}>
        {/* Age */}
        <View style={tw`flex-1`}>
          <Text style={tw`mb-1 text-gray-700 font-semibold`}>Age</Text>
          <TextInput
            style={tw`border border-gray-300 rounded-md py-3 px-1`}
            value={age}
            placeholder="Ex: 28"
            keyboardType="numeric"
            onChangeText={(text) => {
              setAge(text);
              calculateDOBFromAge(text);
            }}
          />
        </View>

        {/* DOB */}
        <View style={tw`flex-1`}>
          <Text style={tw`mb-1 text-gray-700 font-semibold`}>DOB *</Text>
          <TouchableOpacity onPress={() => setShowPicker(true)} onBlur={() => handleBlur('dob')}>
            <View style={tw`border ${touched.dob && errors.dob ? 'border-red-500' : 'border-gray-300'} rounded-md px-2 py-3`}>
              <Text style={tw`text-center`}>
                {dob ? formatDate(dob) : "DD-MM-YYYY"}
              </Text>
            </View>
          </TouchableOpacity>
          {touched.dob && errors.dob ? (
            <Text style={tw`text-red-500 text-xs mt-1`}>{errors.dob}</Text>
          ) : null}
        </View>

        {/* Gender */}
        <View style={tw`flex-1`}>
          <Text style={tw`mb-1 text-gray-700 font-semibold`}>Gender *</Text>
          <TouchableOpacity
            style={tw`border ${touched.gender && errors.gender ? 'border-red-500' : 'border-gray-300'} rounded-md px-2 py-3`}
            onPress={() => setGenderModalVisible(true)}
            onBlur={() => handleBlur('gender')}
          >
            <Text style={tw`text-center`}>{selectedGender}</Text>
          </TouchableOpacity>
          {touched.gender && errors.gender ? (
            <Text style={tw`text-red-500 text-xs mt-1`}>{errors.gender}</Text>
          ) : null}
        </View>
      </View>

      {/* UHID Search */}


      {/* Referred Doctor */}
      <View style={tw`mt-2`}>
        <Text style={tw`mb-1 text-gray-700 font-semibold`}>Referred Doctor</Text>
        <SelectList
          setSelected={(val) => {
            console.log('Selected Doctor:', val);
            if (val === '+ Add Doctor') {
              setDoctorModal(true);
              setSelected('');
            } else {
              setSelected(val);
            }
          }}
          data={data}
          save="value"
          style={tw`w-full`}
          placeholder="--Select--"
          defaultOption={selected ? { key: selected, value: selected } : null}
        />
      </View>

      {/* Referred Lab */}
      <View style={tw`mt-2`}>
        <Text style={tw`mb-1 text-gray-700 font-semibold`}>Referred Lab</Text>
        <SelectList
          setSelected={(val) => {
            console.log('Selected Lab:', val);
            if (val === '+ Add Lab') {
              setReferLabModal(true);
              setSelectedReferLab('');
            } else {
              setSelectedReferLab(val);
            }
          }}
          data={refrLab}
          save="value"
          style={tw`w-full`}
          placeholder="--Select--"
          defaultOption={selectedReferLab ? { key: selectedReferLab, value: selectedReferLab } : null}
        />
      </View>

      {/* Contact Number */}
      <View style={tw`mt-2`}>
        <Text style={tw`mb-1 text-gray-700 font-semibold`}>Contact No.(Self)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter contact number"
          keyboardType="numeric"
          maxLength={10}
          value={contactNo}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9]/g, '');
            setContactNo(numericText);
          }}
        />
      </View>

      {/* Email */}
      <View style={tw`mt-2`}>
        <Text style={tw`mb-1 text-gray-700 font-semibold`}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: demo@domain.com"
          keyboardType="email-address"
          value={email}
          maxLength={40}
          onChangeText={setEmail}
        />
      </View>

      {/* Address */}
      <View style={tw`mt-2`}>
        <Text style={tw`mb-1 text-gray-700 font-semibold`}>Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter address"
          value={address}
          maxLength={60}
          onChangeText={setAddress}
        />
      </View>

      {/* Pincode */}
      <View style={tw`mt-2`}>
        <Text style={tw`mb-1 text-gray-700 font-semibold`}>Pincode</Text>
        <TextInput
          style={styles.input}
          placeholder="221003"
          keyboardType="numeric"
          maxLength={6}
          value={pincode}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9]/g, '');
            setPincode(numericText);
          }}
        />
        {pincode.length === 6 && (
          <TouchableOpacity style={tw`mt-2 bg-sky-200 p-2 rounded-md`}>
            <Text style={tw`text-center text-black font-semibold`}>Update</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Medical History */}
      <View style={tw`mt-2`}>
        <Text style={tw`mb-1 text-gray-700 font-semibold`}>Medical History</Text>
        <TextInput
          style={[styles.input, tw`h-20`]}
          placeholder="Enter medical history..."
          multiline
          value={medicalHistory}
          maxLength={200}
          onChangeText={setMedicalHistory}
        />
      </View>

      {/* Visit Type */}
      <View style={tw`mt-2`}>
        <Text style={tw`mb-1 text-gray-700 font-semibold`}>Visit Type *</Text>
        <SelectList
          setSelected={(val) => {
            setVisitType(val);
            setShowHomeCollectionField(val === 'Home Collection');
          }}
          data={vistType}
          save="value"
          style={tw`w-full`}
          placeholder="--Select--"
        />
      </View>

      {/* Home Collection Fields */}
      {showHomeCollectionField && (
        <View style={tw`p-3 bg-gray-200 rounded-md mt-2`}>
          <View style={tw`mt-2`}>
            <Text style={tw`mb-1 text-gray-700 font-semibold`}>Field Boy</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter field boy name"
              value={filedBoy}
              maxLength={60}
              onChangeText={setFiledBoy}
            />
          </View>
          <View style={tw`mt-2`}>
            <Text style={tw`mb-1 text-gray-700 font-semibold`}>Collection Date Time</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={showDateTimePicker}
            >
              <Text>
                {dateTime ? formatDateTime(dateTime) : 'DD/MM/YYYY, HH:MM AM/PM'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Test Details Component */}
      <AddTestDetails
        data={testDetails}
        onDataChange={handleTestDetailsChange}
      />

      {/* Submit Button */}
      <TouchableOpacity
        style={tw`mt-6 mb-10 bg-[${saveButtonBackground}] py-3 rounded-lg`}
        onPress={handleSubmit}
      >
        <Text style={tw`text-center text-white font-bold text-lg`}>
          Register Patient
        </Text>
      </TouchableOpacity>

      {/* Date Pickers */}
      {showPicker && (
        <DateTimePicker
          value={dob || new Date()}
          mode="date"
          display="default"
          onChange={onChangeDate}
          maximumDate={new Date()}
        />
      )}

      {showPicker2 && (
        <DateTimePicker
          value={dateTime || new Date()}
          mode={mode}
          is24Hour={false}
          display="default"
          onChange={onChangeDateTime}
        />
      )}

      {/* Modals */}
      {/* Title Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleModal}
      >
        <View style={tw`flex-1 justify-center items-center bg-black/50`}>
          <View style={tw`bg-white rounded-xl w-3/4 p-4`}>
            <Text style={tw`text-lg font-semibold mb-3 text-center`}>Select Title</Text>
            <TouchableOpacity style={tw`py-3 border-b`} onPress={() => selectTitle('Mr.')}>
              <Text style={tw`text-center`}>Mr.</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tw`py-3 border-b`} onPress={() => selectTitle('Mrs.')}>
              <Text style={tw`text-center`}>Mrs.</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tw`py-3 border-b`} onPress={() => selectTitle('Miss')}>
              <Text style={tw`text-center`}>Miss</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tw`pt-3`} onPress={toggleModal}>
              <Text style={tw`text-center text-red-500`}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Gender Modal */}
      <Modal
        visible={genderModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setGenderModalVisible(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black/50`}>
          <View style={tw`bg-white rounded-xl w-3/4 p-4`}>
            <Text style={tw`text-lg font-semibold mb-3 text-center`}>Select Gender</Text>
            <TouchableOpacity style={tw`py-3 border-b`} onPress={() => selectGender('Male')}>
              <Text style={tw`text-center`}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tw`py-3 border-b`} onPress={() => selectGender('Female')}>
              <Text style={tw`text-center`}>Female</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tw`py-3 border-b`} onPress={() => selectGender('Other')}>
              <Text style={tw`text-center`}>Other</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tw`pt-3`} onPress={() => setGenderModalVisible(false)}>
              <Text style={tw`text-center text-red-500`}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Doctor Modal */}
      <Modal
        visible={doctorModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDoctorModal(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black/50`}>
          <View style={tw`bg-white rounded-xl w-[95%] p-4`}>
            <AddDoctor
              onClose={() => {
                setDoctorModal(false);
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Add Refer Lab Modal */}
      <Modal
        visible={raferLabModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setReferLabModal(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black/50`}>
          <View style={tw`bg-white rounded-xl w-[95%] p-4`}>
            <AddNewReferLab
              onClose={() => {
                setReferLabModal(false);
              }}
            />
          </View>
        </View>
      </Modal>

      {/* search patient Modal */}


      <Modal
        visible={searchPatientModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSearchPatientModal(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => setSearchPatientModal(false)}
        >
          <View style={tw`flex-1 justify-end bg-black/40`}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <View style={tw`bg-white rounded-t-2xl p-4 h-[90%]`}>
                <ScrollView>
                  <SearchPatient selectedPatientData={handleSelectedPatient} />
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>

          </View>
        </TouchableWithoutFeedback>

      </Modal>
    </ScrollView>
  );
};

export default Registration;