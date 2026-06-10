import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import React, { useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../../Authorization/ThemeContext';
import { getThemeStyles } from '../../../utils/themeStyles';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Clipboard from '@react-native-clipboard/clipboard';

const ReceiptReprintList = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { theme } = useTheme();
    const themed = getThemeStyles(theme);
    const { data, selectedBranches } = route?.params || { data: [], selectedBranches: [] };

    const [expandedItems, setExpandedItems] = useState({});
    const isDark = theme === 'dark';

    const toggleExpand = (index) => {
        setExpandedItems(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const copyUHID = (uhid) => {
        Clipboard.setString(uhid);
    };

    const renderReceiptItem = ({ item, index }) => {
        const isExpanded = expandedItems[index];

        return (
            <View style={[themed.card, tw`mb-3 overflow-hidden`]}>
                {/* Header with Branch Info */}
                <TouchableOpacity
                    onPress={() => toggleExpand(index)}
                    style={[tw`p-4 flex-row justify-between items-center`, themed.border_b]}
                >
                    <View style={tw`flex-1`}>
                        <View style={tw`flex-row items-center mb-1  `}>
                            <Icon name="receipt" size={18} color="#3b82f6" />
                            <Text numberOfLines={1} style={[themed.modalHeaderTitle, tw`ml-2`]}>
                                {item?.UHID}
                            </Text>
                            <TouchableOpacity style={tw`ml-2`} onPress={() => copyUHID(item?.UHID)}>
                                <Icon name="content-copy" size={18} color="#3b82f6" />
                            </TouchableOpacity>
                        </View>
                        <Text style={[themed.normalText, tw`text-sm mb-1`]}>
                            {item.PatientName} {"/"} {item?.Age}
                        </Text>
                        <Text style={[themed.globalCardText, tw`text-xs`]}>
                            Bill date: {item?.BillDate}
                        </Text>
                    </View>
                    <View style={tw`items-end`}>
                        <Text style={[themed.globalCardValue, tw`text-lg`]}>
                            {formatCurrency(item.NetAmount)}
                        </Text>

                    </View>
                    <MaterialIcons
                        name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                        size={24}
                        color={themed.iconColor}
                    />
                </TouchableOpacity>

                {/* Expanded Details */}
                {isExpanded && (
                    <View style={[tw`p-4`, isDark ? tw`bg-gray-900` : tw`bg-gray-50`]}>
                        <View style={tw`flex-row flex-wrap justify-between mb-3`}>
                            <View style={tw`w-1/2 mb-2`}>
                                <Text style={[themed.globalCardText, tw`text-xs mb-1`]}>Bill Number</Text>
                                <Text style={[themed.normalText, tw`text-sm font-medium`]}>{item.BillNo}</Text>
                            </View>
                            <View style={tw`w-1/2 mb-2`}>
                                <Text style={[themed.globalCardText, tw`text-xs mb-1`]}>Receipt Number</Text>
                                <Text style={[themed.normalText, tw`text-sm font-medium`]}>{item.ReceiptNo}</Text>
                            </View>


                            <View style={tw` mb-2`}>
                                <Text style={[themed.globalCardText, tw`text-xs mb-1`]}>Client Name</Text>
                                <Text style={[themed.normalText, tw`text-sm font-medium`]}>{item.ClientName}</Text>
                            </View>

                        </View>
                        <View style={tw`flex flex-row justify-between items-centre`}>
                            <TouchableOpacity
                                style={[themed.searchButton, tw`w-[48%]`]}
                                onPress={() => {
                                    navigation.navigate('TRF_Print', { item })
                                }}
                            >
                                <Text style={themed.searchButtonText}>View TRF</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[themed.searchButton, tw`w-[48%]`]}
                                onPress={() => {
                                    navigation.navigate('ViewTestRefundReceipt', { item })
                                }}
                            >
                                <Text style={themed.searchButtonText}>View Receipt</Text>
                            </TouchableOpacity>
                        </View>


                    </View>
                )}
            </View>
        );
    };

    if (!data || data.length === 0) {
        return (
            <SafeAreaView style={[themed.childScreen2, tw`flex-1 justify-center items-center p-4`]}>
                <Image
                    source={{
                        uri: 'https://cdn-icons-png.flaticon.com/128/13983/13983163.png',
                    }}
                    style={tw`w-32 h-32`}
                    resizeMode="contain"
                />
                <Text style={[themed.modalTitle, tw`text-lg mt-4 text-center`]}>
                    No Receipts Found
                </Text>
                <Text style={[themed.globalCardText, tw`text-center mt-2`]}>
                    Try adjusting your search criteria
                </Text>
                <TouchableOpacity
                    style={[themed.searchButton, tw`mt-6 px-6`]}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={themed.searchButtonText}>Go Back to Search</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[themed.childScreen2, tw`flex-1`]}>



            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={tw`p-4`}
            >
                {/* Summary Cards */}
                <View style={[themed.card, tw`p-4 mb-4 rounded-lg flex-row justify-between`]}>
                    <View style={tw`items-center`}>
                        <Text style={[themed.globalCardText, tw`text-xs`]}>Total Receipts</Text>
                        <Text style={[themed.globalCardValue, tw`text-xl`]}>{data.length}</Text>
                    </View>

                    <View style={tw`items-center`}>
                        <Text style={[themed.globalCardText, tw`text-xs`]}>Total Amount</Text>
                        <Text style={[themed.globalCardValue, tw`text-xl`]}>
                            {formatCurrency(data.reduce((sum, item) => sum + (item.NetAmount || 0), 0))}
                        </Text>
                    </View>
                </View>

                {/* Receipt List */}
                <FlatList
                    data={data}
                    renderItem={renderReceiptItem}
                    keyExtractor={(item, index) => `${item.ReceiptNo}_${index}`}
                    scrollEnabled={false}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

export default ReceiptReprintList;