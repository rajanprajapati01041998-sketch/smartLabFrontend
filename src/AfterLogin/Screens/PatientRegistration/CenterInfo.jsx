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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../../Authorization/api';
import { useAuth } from '../../../../Authorization/AuthContext';
import BottomModal from '../../../utils/BottomModal';
import { useTheme } from '../../../../Authorization/ThemeContext';
import { getThemeStyles } from '../../../utils/themeStyles';

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

    const { colors, theme } = useTheme();
    const themed = getThemeStyles(theme);

    const {
        setCorporateId,
        setPatientData,
        setCenterLoginBranchId,
        loginBranchId,
        centerLoginBranchId,
        setAddBarcode,
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

    const filteredBranchList = useMemo(() => {
        if (!branchSearch?.trim()) return allBranchInfo;

        const searchValue = branchSearch.trim().toLowerCase();

        return allBranchInfo.filter((item) => {
            const branchName = item?.branchName?.toLowerCase() || '';
            const branchCode = String(item?.branchCode || '').toLowerCase();
            return (
                branchName.includes(searchValue) ||
                branchCode.includes(searchValue)
            );
        });
    }, [allBranchInfo, branchSearch]);

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
            setAddBarcode(response.data?.data[0].isPrePrintedBarcode);

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
            // console.log('rate list response', response.data);

            setCorporateId(response.data[0]?.CorporateId);
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

    const handleSelectBranch = (branch) => {
        setSelectedItem(branch);
        setIsModalVisible(false);
        setBranchSearch('');
    };

    const renderBranchItem = ({ item }) => {
        const isSelected = selectedItem?.branchId === item?.branchId;

        return (
            <TouchableOpacity
                onPress={() => handleSelectBranch(item)}
                activeOpacity={0.8}
                style={[
                    themed.globalCard,
                    themed.border,
                    tw`border rounded-xl px-4 py-3 mb-3`,
                    isSelected && { borderColor: '#3b82f6' },
                ]}
            >
                <View style={tw`flex-row justify-between items-center`}>
                    <View style={tw`flex-1 pr-3`}>
                        <Text style={[themed.inputText, tw`font-medium`]}>
                            {item?.branchName}
                        </Text>

                    </View>

                    {isSelected ? (
                        <MaterialIcons name="check-circle" size={22} color="#3b82f6" />
                    ) : null}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[themed.card, themed.cardPadding, themed.childScreen, tw`mb-4`]}>
            <TouchableOpacity
                onPress={() => setShowCenterInfo(!showCenterInfo)}
                style={[tw`flex-row justify-between items-center mb-3`]}
            >
                <Text style={styles.patientInfoText}>Center Information</Text>

                <Entypo
                    style={[
                        tw`rounded-full p-1`,
                        themed.modalCloseButton,
                    ]}
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
                                style={[themed.inputBox, tw`flex-row justify-between items-center mt-1`]}
                            >
                                <Text style={themed.inputText} numberOfLines={1}>
                                    {selectedItem?.branchName || 'Select Center'}
                                </Text>
                                <Icon name="chevron-down" size={18} color={themed.chevronColor} />
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

                    {!condition && (
                        <View style={tw`flex-row items-end gap-3 mt-3`}>
                            <View style={tw`flex-1`}>
                                <Text style={themed.inputLabel}>Enter UHID</Text>
                                <TextInput
                                    value={uhid}
                                    onChangeText={setUhid}
                                    placeholder="Search UHID"
                                    placeholderTextColor={themed.inputPlaceholder}
                                    style={[themed.inputBox, themed.inputText, tw`h-12`]}
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
                    )}

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

            <Modal
                visible={isModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => {
                    setIsModalVisible(false);
                    setBranchSearch('');
                }}
             >
                <TouchableWithoutFeedback
                    onPress={() => {
                        setIsModalVisible(false);
                        setBranchSearch('');
                    }}
                >
                    <View style={tw`flex-1 bg-black/50 justify-end`}>

                        {/* Prevent close when clicking inside */}
                        <TouchableWithoutFeedback onPress={() => { }}>
                            <View
                                style={[
                                    themed.childScreen ,themed.border,
                                    tw`rounded-t-3xl p-4 max-h-[85%]`,
                                ]}
                            >
                                {/* Header */}
                                <View style={tw`flex-row justify-between items-center mb-3`}>
                                    <Text style={[themed.inputText, tw`text-lg font-semibold`]}>
                                        Select Center
                                    </Text>

                                    <TouchableOpacity
                                        onPress={() => {
                                            setIsModalVisible(false);
                                            setBranchSearch('');
                                        }}
                                    >
                                        <MaterialIcons
                                            name="close"
                                            size={24}
                                            color={themed.chevronColor}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Search Box */}
                                <View
                                    style={[
                                        themed.globalCard,
                                        themed.border,
                                        tw`flex-row items-center px-4 py-3 rounded-xl border mb-3`,
                                    ]}
                                >
                                    <Icon
                                        name="search"
                                        size={18}
                                        color={themed.chevronColor}
                                    />
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

                                {/* List */}
                                <FlatList
                                    data={filteredBranchList}
                                    keyExtractor={(item, index) =>
                                        String(item?.branchId || index)
                                    }
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
        </View>
    );
};

export default CenterInfo;