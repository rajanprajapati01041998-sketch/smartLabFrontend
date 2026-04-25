import { View, Text, ScrollView, Dimensions } from 'react-native';
import React, { useCallback, useState } from 'react';
import api from '../../../../Authorization/api';
import { useAuth } from '../../../../Authorization/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import tw from 'twrnc';
import { useTheme } from '../../../../Authorization/ThemeContext';
import { getThemeStyles } from '../../../utils/themeStyles';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import Barcode from '@kichiyaki/react-native-barcode-generator';

const ViewUpdateAllTestDetails = ({ visitId, labNo, puhid }) => {
    const { loginBranchId } = useAuth();
    const { theme } = useTheme();
    const themed = getThemeStyles();
    const { width } = Dimensions.get('window');

    const [patientInfo, setPatientInfo] = useState(null);
    const [testList, setTestList] = useState([]);

    useFocusEffect(
        useCallback(() => {
            if (visitId && labNo && puhid) {
                getAllTestDetails();
            }
        }, [visitId, labNo, puhid])
    );

    const getAllTestDetails = async () => {
        try {
            const response = await api.get(
                `Patient/get-patient-investigation-details?branchId=${loginBranchId}&uhid=${puhid}&labNo=${labNo}&visitId=${visitId}`
            );

            const data = response?.data?.data || [];

            setPatientInfo(data[0]);
            setTestList(data);
        } catch (error) {
            console.log("details error", error?.response);
        }
    };

    return (
        <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>

            {/* HEADER */}
            <View style={[themed.globalCard, themed.border, tw`mx-3 mt-3 p-4 rounded-lg`]}>

                <View style={tw`flex-row items-center`}>
                    <Feather name="hash" size={16} color={themed.chevronColor} />
                    <Text style={[themed.labelText, tw`ml-2 text-sm`]}>
                        {patientInfo?.uhid}
                    </Text>
                </View>

                <View style={tw`flex-row justify-between`}>
                    <View style={tw`flex-row items-center mb-2`}>
                        <MaterialIcons name="person" size={18} color={themed.chevronColor} />
                        <Text style={[themed.labelText, tw`ml-2 text-base font-semibold`]}>
                            {patientInfo?.patientName}
                        </Text>
                    </View>

                    <View style={tw`flex-row items-center mb-2`}>
                        <MaterialIcons name="date-range" size={16} color={themed.chevronColor} />
                        <Text style={[themed.labelText, tw`ml-2 text-sm`]}>
                            {patientInfo?.currentAge} • {patientInfo?.gender}
                        </Text>
                    </View>
                </View>

                <View style={tw`flex-row items-center`}>
                    <MaterialIcons name="date-range" size={16} color={themed.chevronColor} />
                    <Text style={[themed.labelText, tw`ml-2 text-sm`]}>
                        {patientInfo?.billDate}
                    </Text>
                </View>

            </View>

            {/* TEST LIST */}
            <View style={tw`mx-3 mt-4`}>
                <Text style={[themed.labelText, tw`text-base font-semibold mb-2`]}>
                    Tests ({testList.length})
                </Text>

                {testList.map((item, index) => (
                    <View
                        key={index}
                        style={[
                            themed.globalCard,
                            tw`p-4 mb-3 rounded-lg`,
                            item?.isUrgent === 1
                                ? tw`border border-red-400 bg-red-500/20` // 🔴 urgent border
                                : themed.border
                        ]}
                    >

                        {/* TEST NAME */}
                        <View style={tw`flex-row items-start justify-between`}>
                            <View style={tw`flex-1`}>
                                <Text style={[themed.labelText, tw`font-semibold text-sm`]}>
                                    {item?.name}
                                </Text>
                            </View>
                        </View>

                        {/* BARCODE */}
                        <View style={tw`mt-3 items-start`}>
                            {item?.barCode ? (
                                <Barcode
                                    value={String(item.barCode).trim()}
                                    format="CODE128"
                                    width={1.2}
                                    maxWidth={Math.min(240, width - 160)}
                                    height={24}
                                    lineColor={theme === 'dark' ? '#b2b7bc' : '#848994'}
                                    background="transparent"
                                    text={String(item.barCode)}
                                    textStyle={themed.mutedText}
                                />
                            ) : (
                                null
                            )}
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

export default ViewUpdateAllTestDetails;