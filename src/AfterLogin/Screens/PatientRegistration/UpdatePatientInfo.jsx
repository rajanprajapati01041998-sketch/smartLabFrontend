import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import tw from 'twrnc';
import Feather from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../../../Authorization/ThemeContext';
import { getThemeStyles } from '../../../utils/themeStyles';
import SelectTitle from './SelectTitle';
import BottomModal from '../../../utils/BottomModal';
import api from '../../../../Authorization/api';
import { useAuth } from '../../../../Authorization/AuthContext';

const formatDateDDMMYYYY = (date) => {
    if (!date || isNaN(date.getTime())) return '';
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
};

const parseDDMMYYYY = (value) => {
    if (!value || typeof value !== 'string') return null;

    const normalized = value.includes('T') ? value.split('T')[0] : value;

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
        const d = new Date(normalized);
        return isNaN(d.getTime()) ? null : d;
    }

    const parts = normalized.split('-');
    if (parts.length !== 3) return null;

    const [dd, mm, yyyy] = parts.map(Number);
    if (!dd || !mm || !yyyy) return null;

    const date = new Date(yyyy, mm - 1, dd);
    return isNaN(date.getTime()) ? null : date;
};

const calculateAgeFromDOB = (dobDate) => {
    if (!dobDate || isNaN(dobDate.getTime())) {
        return { years: '', months: '', days: '' };
    }

    const today = new Date();
    let years = today.getFullYear() - dobDate.getFullYear();
    let months = today.getMonth() - dobDate.getMonth();
    let days = today.getDate() - dobDate.getDate();

    if (days < 0) {
        const previousMonthLastDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            0
        ).getDate();
        days += previousMonthLastDate;
        months -= 1;
    }

    if (months < 0) {
        months += 12;
        years -= 1;
    }

    if (years < 0) {
        return { years: '0', months: '0', days: '0' };
    }

    return {
        years: String(years),
        months: String(months),
        days: String(days),
    };
};

const calculateDOBFromAge = (years, months, days) => {
    const y = Number(years || 0);
    const m = Number(months || 0);
    const d = Number(days || 0);

    const today = new Date();
    const dob = new Date(today);

    dob.setFullYear(today.getFullYear() - y);
    dob.setMonth(dob.getMonth() - m);
    dob.setDate(dob.getDate() - d);

    return dob;
};

const getGenderFromTitle = (title, currentGender) => {
    const normalized = String(title || '').trim().toLowerCase();

    if (['mr.', 'mr', 'master', 'dr.', 'dr'].includes(normalized)) {
        return 'Male';
    }

    if (['mrs.', 'mrs', 'miss', 'smt.', 'smt'].includes(normalized)) {
        return 'Female';
    }

    return currentGender || 'Male';
};

const mapPatientToForm = (patient) => {
    if (!patient) {
        return {
            title: 'Mr.',
            name: '',
            ageYears: '0',
            ageMonths: '0',
            ageDays: '0',
            dob: '',
            gender: 'Male',
            contactNumber: '',
            email: '',
            pincode: '',
            address: '',
        };
    }

    const parsedDob = parseDDMMYYYY(patient?.DOB);
    const dobString = parsedDob ? formatDateDDMMYYYY(parsedDob) : (patient?.DOB || '');

    return {
        title: patient?.Title || 'Mr.',
        name: patient?.FirstName || patient?.PatientName || '',  // Changed to prioritize FirstName
        ageYears: String(patient?.AgeYears ?? 0),
        ageMonths: String(patient?.AgeMonths ?? 0),
        ageDays: String(patient?.AgeDays ?? 0),
        dob: dobString,
        gender: patient?.Gender
            ? patient.Gender.charAt(0).toUpperCase() + patient.Gender.slice(1).toLowerCase()
            : getGenderFromTitle(patient?.Title, 'Male'),
        contactNumber: patient?.ContactNumber || patient?.SelfContactNumber || '',
        email: patient?.Email || '',
        pincode: patient?.Pincode || '',
        address: patient?.Address || '',
    };
};

const UpdatePatientInfo = ({ data, onClose, onUpdateSuccess }) => {
    const navigation = useNavigation();
    const route = useRoute();
    const { theme } = useTheme();
    const themed = getThemeStyles(theme);
    const { loginBranchId, userId, hosId, ipAddress } = useAuth()
    const [patientDetails, setPatientDetails] = useState(null);
    const [selectTitleModal, setSelectTitleModal] = useState(false);
    const [showDobPicker, setShowDobPicker] = useState(false);
    
    // Initialize form state at component level
    const [form, setForm] = useState({
        title: 'Mr.',
        name: '',
        ageYears: '0',
        ageMonths: '0',
        ageDays: '0',
        dob: '',
        gender: 'Male',
        contactNumber: '',
        email: '',
        pincode: '',
        address: '',
    });

    const handleClose = () => {
        navigation.goBack();
    };

    useEffect(() => {
        if (data?.UHID) {
            getPatientData(data?.UHID);
        }
    }, [data?.UHID]);

    const getPatientData = async (uhid) => {
        try {
            const response = await api.get(`Patient/get-by-uhid?uhid=${uhid}`);
            console.log('patient data', response);
            const patient = response?.data?.data || {};
            setPatientDetails(patient);
            setForm(mapPatientToForm(patient));
        } catch (error) {
            console.log('patient data error', error?.response?.data || error?.message);
        }
    };

    const handleSimpleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleTitleSelect = (title) => {
        const autoGender = getGenderFromTitle(title, form.gender);
        setForm((prev) => ({
            ...prev,
            title,
            gender: autoGender,
        }));
        setSelectTitleModal(false);
    };

    const updateDobFromAge = (nextYears, nextMonths, nextDays) => {
        const dobDate = calculateDOBFromAge(nextYears, nextMonths, nextDays);
        setForm((prev) => ({
            ...prev,
            ageYears: String(nextYears),
            ageMonths: String(nextMonths),
            ageDays: String(nextDays),
            dob: formatDateDDMMYYYY(dobDate),
        }));
    };

    const handleAgeYearsChange = (value) => {
        const clean = value.replace(/[^0-9]/g, '');
        updateDobFromAge(clean, form.ageMonths, form.ageDays);
    };

    const handleAgeMonthsChange = (value) => {
        const clean = value.replace(/[^0-9]/g, '');
        updateDobFromAge(form.ageYears, clean, form.ageDays);
    };

    const handleAgeDaysChange = (value) => {
        const clean = value.replace(/[^0-9]/g, '');
        updateDobFromAge(form.ageYears, form.ageMonths, clean);
    };

    const handleDOBChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowDobPicker(false);
        }

        if (!selectedDate) return;

        const formattedDob = formatDateDDMMYYYY(selectedDate);
        const age = calculateAgeFromDOB(selectedDate);

        setForm((prev) => ({
            ...prev,
            dob: formattedDob,
            ageYears: age.years,
            ageMonths: age.months,
            ageDays: age.days,
        }));
    };

    const handleUpdate = async () => {
        const parsedDob = parseDDMMYYYY(form.dob);

        const payload = {
            Patient: {
                PatientId: patientDetails?.PatientId ?? 0,

                HospId: hosId,
                BranchId: loginBranchId,
                LoginBranchId: loginBranchId,
                UHID: patientDetails?.UHID ?? '',

                Title: form.title,
                FirstName: form.name,
                MiddleName: null,
                LastName: null,

                AgeYears: Number(form.ageYears || 0),
                AgeMonths: Number(form.ageMonths || 0),
                AgeDays: Number(form.ageDays || 0),
                DOB: parsedDob ? parsedDob.toISOString() : null,

                Gender: form.gender?.toUpperCase?.() || '',
                ContactNumber: form.contactNumber,
                Email: form.email,

                Address: form.address,
                UserId: userId,
                IpAddress: ipAddress,

                IsVaccination: patientDetails?.IsVaccination ?? 0,
                VIPPatient: patientDetails?.VIPPatient ?? 0
            }
        };

        console.log('Update Patient Payload:', payload);

        try {
            const response = await api.post(`Patient/update-patient`, payload);
            console.log("update success", response?.data);
            await onUpdateSuccess?.();  
            onClose?.();
        } catch (error) {
            console.log("update error", error?.response?.data || error.message);
        }
    };

    const genderOptions = ['Male', 'Female', 'Other'];

    const renderGenderSelector = (label, value, options, onSelect) => {
        return (
            <View style={tw`mb-3`}>
                <Text style={themed.inputLabel}>{label}</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={tw`pt-1`}
                >
                    {options.map((item) => {
                        const active = value === item;
                        return (
                            <TouchableOpacity
                                key={item}
                                onPress={() => onSelect(item)}
                                activeOpacity={0.8}
                                style={[
                                    tw`px-4 py-2 rounded-lg mr-2`,
                                    active
                                        ? { backgroundColor: '#06b6d4' }
                                        : [themed.globalCard, themed.border],
                                ]}
                            >
                                <Text
                                    style={[
                                        tw`text-sm font-semibold`,
                                        active ? tw`text-white` : themed.listItemText,
                                    ]}
                                >
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        );
    };

    return (
        <>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={[tw`flex-1`, themed.childScreen]}
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={tw`p-4 pb-8`}
                >
                    <View style={tw`flex flex-row justify-between items-center`}>
                        <View style={tw`mb-3 w-[20%]`}>
                            <Text style={themed.inputLabel}>Title *</Text>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => setSelectTitleModal(true)}
                                style={[
                                    themed.inputBox,
                                    tw`px-3 flex-row items-center justify-between`,
                                ]}
                            >
                                <Text
                                    style={[
                                        themed.inputText,
                                        !form.title && { color: themed.inputPlaceholder },
                                    ]}
                                >
                                    {form.title || 'Select Title'}
                                </Text>
                                <Feather name="chevron-down" size={18} color={themed.chevronColor} />
                            </TouchableOpacity>
                        </View>

                        <View style={tw`mb-3 w-[79%]`}>
                            <Text style={themed.inputLabel}>Name *</Text>
                            <TextInput
                                value={form.name}
                                onChangeText={(v) => handleSimpleChange('name', v)}
                                placeholder="Enter Name"
                                placeholderTextColor={themed.inputPlaceholder}
                                style={[themed.inputBox, themed.inputText, tw`px-3`]}
                            />
                        </View>
                    </View>

                    <View style={tw`mb-3`}>
                        <Text style={themed.inputLabel}>Age *</Text>
                        <View style={tw`flex-row`}>
                            <View style={tw`flex-1 mr-2`}>
                                <TextInput
                                    value={form.ageYears}
                                    onChangeText={handleAgeYearsChange}
                                    placeholder="Year"
                                    keyboardType="number-pad"
                                    placeholderTextColor={themed.inputPlaceholder}
                                    style={[themed.inputBox, themed.inputText, tw`px-3`]}
                                />
                            </View>

                            <View style={tw`flex-1 mx-1`}>
                                <TextInput
                                    value={form.ageMonths}
                                    onChangeText={handleAgeMonthsChange}
                                    placeholder="Month"
                                    keyboardType="number-pad"
                                    placeholderTextColor={themed.inputPlaceholder}
                                    style={[themed.inputBox, themed.inputText, tw`px-3`]}
                                />
                            </View>

                            <View style={tw`flex-1 ml-2`}>
                                <TextInput
                                    value={form.ageDays}
                                    onChangeText={handleAgeDaysChange}
                                    placeholder="Day"
                                    keyboardType="number-pad"
                                    placeholderTextColor={themed.inputPlaceholder}
                                    style={[themed.inputBox, themed.inputText, tw`px-3`]}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={tw`mb-3`}>
                        <Text style={themed.inputLabel}>DOB</Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setShowDobPicker(true)}
                            style={[
                                themed.inputBox,
                                tw`px-3 flex-row items-center justify-between`,
                            ]}
                        >
                            <Text
                                style={[
                                    themed.inputText,
                                    !form.dob && { color: themed.inputPlaceholder },
                                ]}
                            >
                                {form.dob || 'Select DOB'}
                            </Text>
                            <Feather name="calendar" size={18} color={themed.chevronColor} />
                        </TouchableOpacity>
                    </View>

                    {renderGenderSelector('Gender', form.gender, genderOptions, (val) =>
                        handleSimpleChange('gender', val)
                    )}

                    <View style={tw`mb-3`}>
                        <Text style={themed.inputLabel}>Contact No.(Self)</Text>
                        <TextInput
                            value={form.contactNumber}
                            onChangeText={(v) => {
                                const cleaned = v.replace(/[^0-9]/g, '').slice(0, 10);
                                handleSimpleChange('contactNumber', cleaned);
                            }}
                            placeholder="Enter Contact No."
                            keyboardType="number-pad"
                            maxLength={10}
                            placeholderTextColor={themed.inputPlaceholder}
                            style={[themed.inputBox, themed.inputText, tw`px-3`]}
                        />
                    </View>

                    <View style={tw`mb-3`}>
                        <Text style={themed.inputLabel}>Email</Text>
                        <TextInput
                            value={form.email}
                            onChangeText={(v) => handleSimpleChange('email', v)}
                            placeholder="Enter Email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor={themed.inputPlaceholder}
                            style={[themed.inputBox, themed.inputText, tw`px-3`]}
                        />
                    </View>

                    <View style={tw`mb-3`}>
                        <Text style={themed.inputLabel}>Pincode</Text>
                        <TextInput
                            value={form.pincode}
                            onChangeText={(v) =>
                                handleSimpleChange('pincode', v.replace(/[^0-9]/g, ''))
                            }
                            placeholder="Enter Pincode"
                            keyboardType="number-pad"
                            maxLength={6}
                            placeholderTextColor={themed.inputPlaceholder}
                            style={[themed.inputBox, themed.inputText, tw`px-3`]}
                        />
                    </View>

                    <View style={tw`mb-4`}>
                        <Text style={themed.inputLabel}>Address</Text>
                        <TextInput
                            value={form.address}
                            onChangeText={(v) => handleSimpleChange('address', v)}
                            placeholder="Enter Address"
                            multiline
                            numberOfLines={2}
                            textAlignVertical="top"
                            placeholderTextColor={themed.inputPlaceholder}
                            style={[themed.inputBox, themed.inputText]}
                        />
                    </View>

                    <View style={tw`flex-row justify-between gap-2 mt-2`}>
                        <TouchableOpacity
                            onPress={handleClose}
                            activeOpacity={0.8}
                            style={[
                                themed.closeButton,
                                themed.border,
                                tw`text-center`,
                            ]}
                        >
                            <Text style={[themed.listItemText, tw`font-semibold text-base`]}>
                                Close
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleUpdate}
                            activeOpacity={0.8}
                            style={[themed.saveButton, tw`flex-1`]}
                        >
                            <Text style={[themed.inputText, tw`text-center`]}>
                                Update
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <BottomModal
                visible={selectTitleModal}
                onClose={() => setSelectTitleModal(false)}
            >
                <SelectTitle
                    selectedTitle={form.title}
                    onClose={() => setSelectTitleModal(false)}
                    onSelectTitle={handleTitleSelect}
                />
            </BottomModal>

            {showDobPicker && (
                <DateTimePicker
                    value={parseDDMMYYYY(form.dob) || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    maximumDate={new Date()}
                    onChange={handleDOBChange}
                />
            )}
        </>
    );
};

export default UpdatePatientInfo;