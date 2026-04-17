import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ActivityIndicator
} from 'react-native';
import tw from 'twrnc';
import styles from '../../../utils/InputStyle';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../../Authorization/api';
import { useAuth } from '../../../../Authorization/AuthContext';
import BottomModal from '../../../utils/BottomModal';
import { useTheme } from '../../../../Authorization/ThemeContext';
import { getThemeStyles } from '../../../utils/themeStyles';

const CenterInfo = () => {
    const [allBranchInfo, setAllBranchInfo] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [ratePannel, setRatePannel] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [uhid, setUhid] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCenterInfo, setShowCenterInfo] = useState(false);
    const [branchDetails, setBranchDetails] = useState(null);

    const { colors,theme } = useTheme();
    const themed = getThemeStyles(theme);

    const {
        setCorporateId,
        setPatientData,
        setCenterLoginBranchId,
        loginBranchId,
        centerLoginBranchId,setAddBarcode
    } = useAuth();

    const currentBranchId = selectedItem?.branchId || loginBranchId;

    useFocusEffect(
        useCallback(() => {
            getBranchInfo();
        }, [])
    );

    useEffect(() => {
        const branchId = selectedItem?.branchId || loginBranchId || centerLoginBranchId;
        if (branchId) {
            getBranchDetails(branchId);
            getrateListPanel(branchId);
            setCenterLoginBranchId(branchId);
        }
    }, [selectedItem, loginBranchId]);

    const getBranchInfo = async () => {
        try {
            const data = await AsyncStorage.getItem('AllBranch');
            if (data) {
                const parsedData = JSON.parse(data);
                setAllBranchInfo(parsedData);

                if (parsedData.length > 0) {
                    const defaultBranch =
                        parsedData.find(item => item.branchId === loginBranchId) ||
                        parsedData[0];

                    setSelectedItem(defaultBranch);
                }
            }
        } catch (error) {
            console.log('Error reading branches', error);
        }
    };

    const getBranchDetails = async (branchId) => {
        try {
            if (!branchId) return;
            const response = await api.get(`Branch/branch-details?branchId=${branchId}`);
            // console.log('branch details', response?.data.data);
            setAddBarcode(response.data?.data[0].isPrePrintedBarcode)
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

    const getrateListPanel = async (branchId) => {
        try {
            if (!branchId) return;

            const response = await api.get(`Rate/rate-list/${branchId}`);
            console.log('rate list response', response.data);

            setCorporateId(response.data?.CorporateId);
            setRatePannel(response.data);
        } catch (error) {
            console.log('getrateListPanel', error);
            setRatePannel(null);
        }
    };

    const searchGetPatientByUhid = async () => {
        try {
            if (!currentBranchId) {
                setErrorMessage('Branch not selected');
                return;
            }

            setLoading(true);

            const response = await api.get(
                `Patient/get-by-uhid?uhid=${uhid}&branchId=${currentBranchId}`
            );

            const patient = response?.data?.data;

            if (patient) {
                setPatientData(patient);
                setUhid(patient.UHID || uhid);
                setErrorMessage('');
            } else {
                setErrorMessage('Patient not found');
            }
        } catch (error) {
            setErrorMessage(
                error?.response?.data?.message || 'Something went wrong'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => setErrorMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    return (
        <View style={[themed.card, themed.cardPadding, themed.childScreen, tw`mb-4`]}>
            <TouchableOpacity
                onPress={() => setShowCenterInfo(!showCenterInfo)}
                style={[tw`flex-row justify-between items-center mb-3`]}
            >
                <Text style={styles.patientInfoText}>Center Information</Text>

                <MaterialIcons
                    style={tw`bg-gray-200 rounded-full p-2`}
                    name={showCenterInfo ? 'expand-less' : 'expand-more'}
                    size={20}
                    color="#313235"
                />
            </TouchableOpacity>

            {showCenterInfo && (
                <>
                    <View style={tw`flex-row justify-between`}>
                        <View style={tw`w-[48%]`}>
                            <Text style={themed.inputLabel}>Center</Text>

                            <TouchableOpacity
                                onPress={() => setIsModalVisible(true)}
                                style={[themed.inputBox, tw`flex-row justify-between items-center mt-1`]}
                            >
                                <Text style={themed.inputText} numberOfLines={1}>
                                    {selectedItem?.branchName || 'Select Center'}
                                </Text>
                                <Icon name="chevron-down" size={18} color={themed.iconMuted} />
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

                    <View style={tw`flex-row items-end gap-3 mt-3`}>
                        <View style={tw`flex-1`}>
                            <Text style={themed.inputLabel}>Enter UHID</Text>
                            <TextInput
                                value={uhid}
                                onChangeText={setUhid}
                                placeholder="Search UHID"
                                placeholderTextColor={themed.inputPlaceholder}
                                style={[themed.inputBox,themed.inputText, tw`h-12`]}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={searchGetPatientByUhid}
                            disabled={loading || uhid.length === 0}
                            style={tw`
                                h-12 px-5 rounded-xl justify-center items-center
                                ${loading || uhid.length === 0 ? 'bg-blue-400' : 'bg-blue-500'}
                            `}
                         >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={tw`text-white font-medium`}>Search</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {errorMessage ? (
                        <View style={tw`flex-row items-center mt-2`}>
                            <MaterialIcons name="error-outline" size={16} color="#ef4444" />
                            <Text style={tw`text-red-500 ml-1`}>
                                {errorMessage}
                            </Text>
                        </View>
                    ) : null}

                    
                </>
            )}

            <BottomModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
            >
                <View style={tw`p-4`}>
                    {allBranchInfo.map((b, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                setSelectedItem(b);
                                setIsModalVisible(false);
                            }}
                            style={tw`border-b p-3`}
                        >
                            <Text style={tw`text-center`}>
                                {b.branchName}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </BottomModal>
        </View>
    );
};

export default CenterInfo;