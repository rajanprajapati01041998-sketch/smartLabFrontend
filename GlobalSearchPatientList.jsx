import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Share, Platform } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import api from './Authorization/api';
import { useAuth } from './Authorization/AuthContext';
import tw from 'twrnc';
import SearchInput from './SearchInput';
import { useTheme } from './Authorization/ThemeContext';
import { getThemeStyles } from './src/utils/themeStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Clipboard from '@react-native-clipboard/clipboard';

const GlobalSearchPatientList = ({ onSearch, onClose }) => {
    const { allBranchInfo } = useAuth();
    const { theme } = useTheme();
    const themed = getThemeStyles(theme);

    const [patientList, setPatientList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [expandedPatientId, setExpandedPatientId] = useState(null);

    const clientIdList = allBranchInfo?.map(x => x?.branchId).join(',') || '1';

    const getPatientList = async (searchText = '') => {
        try {
            setLoading(true);
            setSearchPerformed(!!searchText);

            const response = await api.get('Patient/search-patient-topCount', {
                params: {
                    clientIdList,
                    searchText,
                    topCount: 100,
                },
            });
            setPatientList(response?.data?.data || []);
        } catch (error) {
            console.log('error', error);
            setPatientList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getPatientList('');
    }, []);

    const copyToClipboard = (text, label) => {
        Clipboard.setString(text);
    };

    const sharePatientDetails = async patient => {
        try {
            const message =
                `*Patient Details*\n\n` +
                `Name: ${patient.PatientName}\n` +
                `UHID: ${patient.UHID}\n` +
                `Age: ${patient.Age}\n` +
                `Gender: ${patient.Gender}\n` +
                `Contact: ${patient.ContactNumber || 'N/A'}\n` +
                `Registration Date: ${patient.RegistrationDate}`;

            const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(
                message,
            )}`;

            const supported = await Linking.canOpenURL(
                'whatsapp://send',
            );

            if (supported) {
                await Linking.openURL(whatsappUrl);
            } else {
                Alert.alert(
                    'WhatsApp Not Installed',
                    'Please install WhatsApp first.',
                );
            }
        } catch (error) {
            console.log('WhatsApp Share Error:', error);
        }
    };

    const toggleExpand = (patientId) => {
        setExpandedPatientId(expandedPatientId === patientId ? null : patientId);
    };

    const getGenderIcon = (gender) => {
        if (gender === 'MALE') return { name: 'male', color: '#3b82f6' };
        if (gender === 'FEMALE') return { name: 'female', color: '#ec489a' };
        return { name: 'transgender', color: '#8b5cf6' };
    };

    const PatientCard = ({ item }) => {
        const isExpanded = expandedPatientId === item.PatientId;
        const genderIcon = getGenderIcon(item.Gender);

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => toggleExpand(item.PatientId)}
                style={[
                    themed.childScreen2,
                    themed.border,
                    tw`mb-3 rounded-xl overflow-hidden`,

                ]}
            >
                {/* Card Header */}
                <View style={[tw`p-4 flex-row items-start justify-between`]}>
                    <View style={tw`flex-row items-center flex-1`}>
                        <View style={[
                            tw`w-12 h-12 rounded-full  items-center justify-center mr-3`,
                            { backgroundColor: `${genderIcon.color}15` }
                        ]}>
                            <FontAwesome5 name={genderIcon.name} size={22} color={genderIcon.color} />
                        </View>
                        <View style={tw`flex-1`}>
                            <Text style={[themed.inputText, tw`text-base font-bold`]} numberOfLines={1}>
                                {item.PatientName || 'N/A'}
                            </Text>
                            <View style={tw`flex-row items-center mt-1`}>
                                <MaterialIcons name="fingerprint" size={14} color="#9ca3af" />
                                <Text style={[themed.transactionLabel, tw`text-xs ml-1`]}>
                                    {item.UHID || 'N/A'}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => copyToClipboard(item.UHID, 'UHID')}
                                    style={tw`ml-2 p-1`}
                                >
                                    <Ionicons name="copy-outline" size={14} color="#3b82f6" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={tw`flex-row items-center gap-2`}>
                        <View style={tw`bg-gray-100 px-2 py-1 rounded-full`}>
                            <Text style={tw`text-xs text-gray-600`}>
                                {item.Age || `${item.AgeYears}Y`}
                            </Text>
                        </View>
                        <Ionicons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color={themed.chevronColor}
                        />
                    </View>
                </View>

                {/* Expanded Details */}
                {isExpanded && (
                    <View style={[tw`p-4 pt-0 border-t`, themed.borderTop]}>
                        {/* Contact Info */}
                        <View style={tw`flex-row flex-wrap mb-3`}>
                            {item.ContactNumber && (
                                <View style={tw`w-1/2 mb-2 mt-1`}>
                                    <View style={tw`flex-row items-center gap-1`}>
                                        <Ionicons name="call-outline" size={14} color="#9ca3af" />
                                        <Text style={[themed.transactionLabel]}>Mobile</Text>
                                    </View>
                                    <Text style={[themed.inputText, tw`text-sm font-semibold mt-0.5`]}>
                                        {item.ContactNumber}
                                    </Text>
                                </View>
                            )}
                            {item.Email && (
                                <View style={tw`w-1/2 mb-2`}>
                                    <View style={tw`flex-row items-center gap-1`}>
                                        <Ionicons name="mail-outline" size={14} color="#9ca3af" />
                                        <Text style={[themed.transactionLabel]}>Email</Text>
                                    </View>
                                    <Text style={[themed.inputText, tw`text-sm mt-0.5`]} numberOfLines={1}>
                                        {item.Email}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Personal Info */}
                        <View style={tw`flex-row flex-wrap mb-3`}>
                            <View style={tw`w-1/2 mb-2`}>
                                <View style={tw`flex-row items-center gap-1`}>
                                    <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
                                    <Text style={[themed.transactionLabel]}>DOB</Text>
                                </View>
                                <Text style={[themed.inputText, tw`text-sm mt-0.5`]}>
                                    {item.DOB?.split(' ')[0] || 'N/A'}
                                </Text>
                            </View>
                            <View style={tw`w-1/2 mb-2`}>
                                <View style={tw`flex-row items-center gap-1`}>
                                    <Ionicons name="person-outline" size={14} color="#9ca3af" />
                                    <Text style={[themed.transactionLabel]}>Gender</Text>
                                </View>
                                <Text style={[themed.inputText, tw`text-sm mt-0.5`]}>
                                    {item.Gender || 'N/A'}
                                </Text>
                            </View>
                        </View>

                        {/* Address */}
                        {item.Address && (
                            <View style={tw`mb-3`}>
                                <View style={tw`flex-row items-center gap-1`}>
                                    <Ionicons name="location-outline" size={14} color="#9ca3af" />
                                    <Text style={[themed.transactionLabel]}>Address</Text>
                                </View>
                                <Text style={[themed.inputText, tw`text-sm mt-0.5`]}>
                                    {item.Address}
                                </Text>
                            </View>
                        )}

                        {/* Registration Info */}
                        <View style={[tw`flex-row justify-between items-center pt-2 border-t `, themed.borderTop]}>
                            <View>
                                <Text style={[themed.transactionLabel]}>Registered On</Text>
                                <Text style={[themed.inputText, tw`text-xs mt-0.5`]}>
                                    {item.RegistrationDate || 'N/A'}
                                </Text>
                            </View>
                            <View style={[tw`flex-row gap-2 `]}>
                                <TouchableOpacity
                                    onPress={() => copyToClipboard(item.UHID, 'UHID')}
                                    style={tw`bg-blue-50 p-2 rounded-lg flex-row items-center gap-1`}
                                >
                                    <Ionicons name="copy-outline" size={14} color="#3b82f6" />
                                    <Text style={tw`text-blue-600 text-xs font-semibold`}>Copy UHID</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => sharePatientDetails(item)}
                                    style={tw`bg-green-50 p-2 rounded-lg flex-row items-center gap-1`}
                                >
                                    <Ionicons name="share-outline" size={14} color="#10b981" />
                                    <Text style={tw`text-green-600 text-xs font-semibold`}>Share</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const EmptyState = () => (
        <View style={tw`items-center justify-center py-16 px-6`}>
            <View style={tw`bg-gray-100 p-6 rounded-full mb-4`}>
                <Ionicons name="people-outline" size={64} color="#9ca3af" />
            </View>
            <Text style={[themed.inputText, tw`text-lg font-bold text-center`]}>
                {searchPerformed ? 'No Patients Found' : 'Start Searching'}
            </Text>
            <Text style={[themed.transactionLabel, tw`text-sm text-center mt-2`]}>
                {searchPerformed
                    ? 'No matching patients found. Try a different search term.'
                    : 'Use the search bar above to find patients by name, UHID, or mobile number.'}
            </Text>
        </View>
    );

    const LoadingState = () => (
        <View style={tw`items-center justify-center py-16`}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={[themed.transactionLabel, tw`text-sm mt-3`]}>Searching patients...</Text>
        </View>
    );

    return (
        <View style={[themed.childScreen2, tw`flex-1`]}>
            {/* Header */}
            <View style={[tw` px-4 py-3  border-gray-100`, themed.borderBottom]}>
                <View style={tw`flex-row items-center justify-between`}>
                    <View>
                        <Text style={[themed.inputText, tw`text-xl font-bold`]}>
                            Patient Directory
                        </Text>
                        <Text style={[themed.labelTextXs, tw`text-xs mt-0.5`]}>
                            {!loading && patientList.length > 0 && `${patientList.length} patients found`}
                        </Text>
                    </View>
                    <View>
                        <TouchableOpacity
                            onPress={onClose}
                            activeOpacity={0.8}
                            style={[
                                tw`h-10 w-10 rounded-full items-center justify-center`,
                                {
                                    backgroundColor:
                                        theme === 'dark'
                                            ? '#374151'
                                            : '#F3F4F6',
                                },
                            ]}>
                            <Ionicons
                                name="close"
                                size={20}
                                color={theme === 'dark' ? '#FFFFFF' : '#6B7280'}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Search Input */}
            <View style={tw`px-4 pt-3`}>
                <SearchInput onSearch={getPatientList} />
            </View>

            {/* Results Count */}
            {!loading && patientList.length > 0 && (
                <View style={[themed.childScreen2, tw`px-4 py-2`]}>
                    <View style={tw`bg-blue-50 self-start px-3 py-1 rounded-full`}>
                        <Text style={tw`text-blue-600 text-xs font-semibold`}>
                            {patientList.length} Record{patientList.length !== 1 ? 's' : ''} Found
                        </Text>
                    </View>
                </View>
            )}

            {/* Patient List */}
            <ScrollView
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                contentContainerStyle={tw`p-4 pb-8`}
            >
                {loading ? (
                    <LoadingState />
                ) : patientList.length > 0 ? (
                    patientList.map((item) => (
                        <PatientCard key={item.PatientId} item={item} />
                    ))
                ) : (
                    <EmptyState />
                )}
            </ScrollView>
        </View>
    );
};

export default GlobalSearchPatientList;