import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import api from '../../../../Authorization/api';
import tw from 'twrnc';
import { Checkbox } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../../../Authorization/AuthContext';

const SearchSelectServiceItem = ({ data, onDelete }) => {
    const [loading, setLoading] = useState(false);
    const [detailsList, setDetailsList] = useState([]);

    const { serviceItem, setServiceItem, selectedDoctor } = useAuth();

    // 🔹 Fetch details
    const getServiceitemDetails = async () => {
        if (!data || data.length === 0) return;

        try {
            setLoading(true);

            const responses = await Promise.all(
                data.map(item =>
                    api.get(
                        `ServiceAllDetailsForOPDBilling/GetServiceDetails?corporateId=1&${selectedDoctor}=1&serviceItemId=${item.itemId}&categoryId=${item.categoryId}&subCategoryId=${item.subCategoryId}&subSubCategoryId=${item.subSubCategoryId}&bedTypeId=0`
                    )
                )
            );

            const formatted = responses
                .filter(res => res.data?.success)
                .map(res => ({
                    ...res.data.data,
                    urgent: false, // ✅ per item state
                    qty: 1
                }));

            setDetailsList(formatted);

        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (data?.length > 0) {
            getServiceitemDetails();
        } else {
            setDetailsList([]);
        }
    }, [data]);

    // 🔹 Toggle urgent (per item)
    const toggleUrgent = (index) => {
        const updated = [...detailsList];
        updated[index].urgent = !updated[index].urgent;
        setDetailsList(updated);
    };

    // 🔹 Update quantity
    const updateQty = (index, type) => {
        const updated = [...detailsList];

        if (type === 'inc') {
            updated[index].qty += 1;
        } else {
            updated[index].qty = Math.max(1, updated[index].qty - 1);
        }

        setDetailsList(updated);
    };

    // 🔹 Delete
    const handleDeleteLocal = (item) => {
        setDetailsList(prev =>
            prev.filter(i => i.serviceItemId !== item.serviceItemId)
        );

        onDelete?.(item);
    };

    // 🔥 CREATE PAYLOAD
    const createPayload = () => {
        const payload = {
            Services: detailsList.map(item => ({
                ServiceItemId: item.serviceItemId,
                SubSubCategoryId: item.subSubCategoryId,
                ServiceName: item.serviceName,
                Amount: item.rate,
                qty: item.qty,
                isUrgent: item.urgent ? 1 : 0 // ✅ FIXED
            })),
            Investigations: {
                isUrgent: 0,
                ReportingBranchId: 1,
                Barcode: "BAR123",
                TestRemark: "Fasting"
            }
        };

        setServiceItem(payload);

        console.log('FINAL PAYLOAD:', payload);
    };

    return (
        <View style={tw`flex-1`}>

            {loading ? (
                <ActivityIndicator size="large" />
            ) : (
                <>
                    {/* 🔹 LIST */}
                    <ScrollView>

                        {detailsList.map((item, index) => (
                            <View
                                key={item.serviceItemId}
                                style={tw`bg-white border border-gray-200 rounded-xl p-3 mb-2`}
                            >

                                {/* 🔹 Header */}
                                <View style={tw`flex-row justify-between items-center`}>
                                    <Text style={tw`text-sm font-semibold flex-1`}>
                                        {item.serviceName}
                                    </Text>

                                    <TouchableOpacity onPress={() => handleDeleteLocal(item)}>
                                        <MaterialIcons name="delete" size={22} color="red" />
                                    </TouchableOpacity>
                                </View>

                                {/* Divider */}
                                <View style={tw`h-[1px] bg-gray-200 my-2`} />

                                {/* 🔹 Price + Controls */}
                                <View style={tw`flex-row justify-between items-center`}>

                                    {/* MRP */}
                                    <View>
                                        <Text style={tw`text-[10px] text-gray-400`}>MRP</Text>
                                        <Text style={tw`text-xs`}>₹ {item.mrp}</Text>
                                    </View>

                                    {/* Rate */}
                                    <View>
                                        <Text style={tw`text-[10px] text-gray-400`}>Rate</Text>
                                        <Text style={tw`text-sm font-bold text-green-600`}>
                                            ₹ {item.rate}
                                        </Text>
                                    </View>

                                    {/* Qty */}
                                    <View style={tw`flex-row items-center gap-2`}>
                                        <TouchableOpacity onPress={() => updateQty(index, 'dec')}>
                                            <Text style={tw`text-lg`}>-</Text>
                                        </TouchableOpacity>

                                        <Text>{item.qty}</Text>

                                        <TouchableOpacity onPress={() => updateQty(index, 'inc')}>
                                            <Text style={tw`text-lg`}>+</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* 🔹 Urgent Checkbox */}
                                    <TouchableOpacity
                                        onPress={() => toggleUrgent(index)}
                                        style={tw`flex-row items-center`}
                                    >
                                        <Checkbox
                                            status={item.urgent ? 'checked' : 'unchecked'}
                                        />
                                        <Text style={tw`text-[10px]`}>Urgent</Text>
                                    </TouchableOpacity>

                                </View>

                            </View>
                        ))}
                    </ScrollView>

                    {/* 🔹 BUTTON */}
                    <View style={tw`p-3 border-t border-gray-200`}>
                        <TouchableOpacity
                            onPress={createPayload}
                            style={tw`bg-blue-500 p-3 rounded`}
                        >
                            <Text style={tw`text-white text-center font-bold`}>
                                Add ({detailsList.length}) Tests
                            </Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}

        </View>
    );
};

export default SearchSelectServiceItem;