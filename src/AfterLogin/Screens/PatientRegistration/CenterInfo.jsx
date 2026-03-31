import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
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

const CenterInfo = () => {
    const [allBranchInfo, setAllBranchInfo] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [ratePannel, setRatePannel] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [searching, setSearching] = useState(false)
    const [uhid, setUhid] = useState('');
    const [showCenterInfo, setShowCenterInfo] = useState(false);

    const { colors } = useTheme();
    const {
        corporateId,
        setCorporateId,
        patientData,
        setPatientData,
        userData
    } = useAuth();

    const loginBranchId = selectedItem?.branchId; // ✅ FIX

    useFocusEffect(
        useCallback(() => {
            getBranchInfo();
        }, [])
    );

    const getBranchInfo = async () => {
        try {
            const data = await AsyncStorage.getItem('AllBranch');

            if (data) {
                const parsedData = JSON.parse(data);
                setAllBranchInfo(parsedData);

                if (parsedData.length > 0) {
                    const defaultBranch = parsedData[0];
                    setSelectedItem(defaultBranch);
                    getrateListPanel(defaultBranch.branchId);
                }
            }
        } catch (error) {
            console.log("Error reading branches", error);
        }
    };

    const getrateListPanel = async (id) => {
        try {
            const response = await api.get(`Rate/rate-list/${id}`);
            setCorporateId(response.data?.CorporateId);
            setRatePannel(response.data);
        } catch (error) {
            console.log("getrateListPanel", error);
        }
    };

    const searchGetPatientByUhid = async () => {
        try {
            setSearching(true)
            const response = await api.get( `Patient/get-by-uhid?uhid=${uhid}&branchId=${loginBranchId}`);
            const patient = response?.data?.data;
            if (patient) {
                setPatientData(patient);
                setUhid(patient.UHID);
                setErrorMessage("");
            } else {
                setErrorMessage("Patient not found");
            }

        } catch (error) {
            setErrorMessage(
                error?.response?.data?.message || "Something went wrong"
            );
        }
        finally{
            setSearching(false)
        }
    };

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage("");
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    return (
        <View style={styles.cardShadow}>

            {/* HEADER */}
            <TouchableOpacity
                onPress={() => setShowCenterInfo(!showCenterInfo)}
                style={tw`flex-row justify-between items-center mb-3 `}
            >
                <Text style={styles.patientInfoText}>Center Information</Text>

                <MaterialIcons
                style={tw` rounded-full bg-gray-200 p-2`}
                    name={showCenterInfo ? "expand-less" : "expand-more"}
                    size={20}
                    color="#6B7280"
                />
            </TouchableOpacity>

            {showCenterInfo && (
                <>
                    {/* TOP ROW */}
                    <View style={tw`flex-row justify-between`}>
                        {/* CENTER */}
                        <View style={tw`w-[48%]`}>
                            <Text style={styles.labelText}>Center</Text>

                            <TouchableOpacity
                                onPress={() => setIsModalVisible(true)}
                                style={[styles.dropDownButton, tw`flex-row justify-between items-center mt-1`]}
                            >
                                <Text numberOfLines={1}>
                                    {selectedItem?.branchName || 'Select Center'}
                                </Text>
                                <Icon name="chevron-down" size={18} color="gray" />
                            </TouchableOpacity>
                        </View>

                        {/* PANEL */}
                        <View style={tw`w-[48%]`}>
                            <Text style={styles.labelText}>Panel</Text>

                            <View style={[styles.dropDownButton, tw`mt-1`]}>
                                <Text>
                                    {ratePannel?.[0]?.CorporateName || 'Select Panel'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* SEARCH */}
                    <View style={tw`flex-row items-end gap-3 mt-3`}>

                        {/* INPUT BLOCK */}
                        <View style={tw`flex-1`}>
                            <Text style={styles.labelText}>Enter UHID</Text>

                            <TextInput
                                value={uhid}
                                onChangeText={setUhid}
                                placeholder="Search UHID"
                                placeholderTextColor={colors.placeholder}
                                style={styles.searchInput}
                            />
                        </View>

                        {/* BUTTON */}
                        <TouchableOpacity
                            onPress={searchGetPatientByUhid}
                            style={tw`bg-blue-500 px-4 py-3 rounded-xl`}
                        >
                            {searching ?<ActivityIndicator size={14} color='#fff' />:<Text style={tw`text-white`}>Search</Text>}
                        </TouchableOpacity>

                    </View>

                    {/* ERROR */}
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

            {/* MODAL */}
            <BottomModal visible={isModalVisible} onClose={() => setIsModalVisible(false)}>
                <View style={tw`p-4`}>
                    {allBranchInfo.map((b, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                setSelectedItem(b);
                                setIsModalVisible(false);
                                getrateListPanel(b.branchId);
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