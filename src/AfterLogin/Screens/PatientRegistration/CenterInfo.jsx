import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, TextInput } from 'react-native';
import React, { useCallback, useState } from 'react';
import tw from 'twrnc';
import styles from '../../../utils/InputStyle';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../../Authorization/api';
import { useAuth } from '../../../../Authorization/AuthContext';
import BottomModal from '../../../utils/BottomModal';

const CenterInfo = () => {
    const [allBranchInfo, setAllBranchInfo] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [ratePannel, setRatePannel] = useState(null);
    const [uhid, setUhid] = useState('')
    const [showCenterInfo, setShowCenterInfo] = useState(false); // Toggle state
    const { corporateId, setCorporateId, patientData, setPatientData, userData } = useAuth()

    useFocusEffect(
        useCallback(() => {
            getBranchInfo();
        }, [])
    );

    // ✅ Get Branches + Set Default + Call API
    const getBranchInfo = async () => {
        try {
            const data = await AsyncStorage.getItem('AllBranch');

            if (data) {
                const parsedData = JSON.parse(data);
                setAllBranchInfo(parsedData);

                // ✅ default select first branch
                if (parsedData.length > 0) {
                    const defaultBranch = parsedData[0];

                    setSelectedItem(defaultBranch);

                    // ✅ call API
                    getrateListPanel(defaultBranch.branchId);
                }
            }
        } catch (error) {
            console.log("Error reading branches", error);
        }
    };

    // ✅ API Call
    const getrateListPanel = async (id) => {
        console.log("pas id", id)
        try {
            const response = await api.get(`Rate/rate-list/${id}`);
            console.log("getrateListPanel", response.data);
            setCorporateId(response.data?.CorporateId)
            setRatePannel(response.data); // ✅ correct
        } catch (error) {
            console.log("getrateListPanel", error);
        }
    };

    const searchGetPatientByUhid = async () => {
        try {
            const response = await api.get(`Patient/get-by-uhid?uhid=${uhid}&branchId=1`)
            console.log("success", response.data.data)
            setPatientData(response.data?.data)
            setUhid(response.data?.data.UHID)
        } catch (error) {
            console.log("error", error)
        }
    }

    return (
        <View style={styles.cardShadow}>
            {/* Toggle Header */}
            <TouchableOpacity
                onPress={() => setShowCenterInfo(!showCenterInfo)}
                activeOpacity={0.7}
                style={tw`flex-row justify-between items-center mb-3`}
            >
                <Text style={styles.patientInfoText}>Center Information</Text>
                <View style={tw`bg-gray-100 p-1 rounded-full`}>
                    <MaterialIcons 
                        name={showCenterInfo ? "expand-less" : "expand-more"} 
                        size={20} 
                        color="#6B7280" 
                    />
                </View>
            </TouchableOpacity>

            {/* Content - Toggle based on state */}
            {showCenterInfo && (
                <>
                    {/* TOP ROW */}
                    <View style={tw`flex flex-row justify-between`}>
                        {/* CENTER DROPDOWN */}
                        <View style={tw`flex flex-col w-[48%]`}>
                            <Text style={styles.labelText}>Center</Text>
                            <TouchableOpacity
                                onPress={() => setIsModalVisible(true)}
                                style={[styles.dropDownButton, tw`mb-3 mt-1 flex-row justify-between items-center`]}
                            >
                                <Text style={styles.insideDropDownText} numberOfLines={1}>
                                    {selectedItem ? selectedItem.branchName : 'Select Center'}
                                </Text>

                                <Icon name="chevron-down" size={18} color="gray" />
                            </TouchableOpacity>
                        </View>

                        {/* PANEL / RATE TYPE */}
                        <View style={tw`flex flex-col w-[48%]`}>
                            <Text style={styles.labelText}>Panel/Rate Type</Text>

                            <TouchableOpacity
                                style={[styles.dropDownButton, tw`mb-3 mt-1 flex-row justify-between items-center`]}
                            >
                                <Text style={styles.insideDropDownText}>
                                    {ratePannel?.[0]?.CorporateName || 'Select Panel'}
                                </Text>

                                <Icon name="chevron-down" size={18} color="gray" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* SEARCH INPUT */}
                    <View style={tw`flex flex-row justify-center items-center gap-3`}>
                        <View style={tw`w-[75%]`}>
                            <Text style={styles.labelText}>Enter Uhid</Text>
                            <View style={tw`relative`}>
                                <TextInput
                                    value={uhid}
                                    onChangeText={(text) => setUhid(text)}
                                    style={[styles.searchInput, tw`pl-10 pr-2`]} 
                                    placeholder="Search By UHID" 
                                />
                                <Icon name="search" size={16} color="gray" style={tw`absolute left-3 top-3`} />
                            </View>
                        </View>
                        <TouchableOpacity
                            style={tw`bg-blue-500 px-4 py-3 mt-6 rounded-xl`}
                            onPress={() => searchGetPatientByUhid()}
                        >
                            <Text style={tw`text-white`}>Search</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            {/* MODAL */}
            <BottomModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
            >
                <View style={tw`bg-white rounded-md w-[95%] p-4`}>
                    {allBranchInfo.map((b, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                setSelectedItem(b);
                                setIsModalVisible(false);

                                // ✅ call API on change
                                getrateListPanel(b.branchId);
                            }}
                            style={tw`border-b mb-4 p-2 border-gray-300 rounded`}
                        >
                            <Text style={tw`text-gray-600 text-center`}>
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