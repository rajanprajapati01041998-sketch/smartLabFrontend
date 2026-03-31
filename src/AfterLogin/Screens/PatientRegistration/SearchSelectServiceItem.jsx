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
                    urgent: false,
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

    // 🔹 Toggle urgent
    const toggleUrgent = (index) => {
        const updated = [...detailsList];
        updated[index].urgent = !updated[index].urgent;
        setDetailsList(updated);
    };

    // 🔹 Delete
    const handleDeleteLocal = (item) => {
        setDetailsList(prev =>
            prev.filter(i => i.serviceItemId !== item.serviceItemId)
        );

        onDelete?.(item);
    };

    // 🔹 Create payload
    const createPayload = () => {
        const payload = {
            Services: detailsList.map(item => ({
                ServiceItemId: item.serviceItemId,
                SubSubCategoryId: item.subSubCategoryId,
                ServiceName: item.serviceName,
                Amount: item.rate,
                qty: item.qty,
                isUrgent: item.urgent ? 1 : 0
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
                <View style={tw`flex-1 justify-center items-center`}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
                <>
                    {/* ✅ SCROLL AREA */}
                    <ScrollView
                        style={tw`flex-1`}
                        contentContainerStyle={tw`pb-24`}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}   // 🔥 IMPORTANT (for Modal)
                    >
                        {detailsList.map((item, index) => (
                            <View
                                key={item.serviceItemId}
                                style={tw`bg-white border border-gray-200 rounded-xl p-3 mb-2`}
                            >

                                {/* Header */}
                                <View style={tw`flex-row justify-between items-center`}>
                                    <Text style={tw`text-sm font-semibold flex-1`}>
                                        {item.serviceName}
                                    </Text>

                                    <TouchableOpacity onPress={() => handleDeleteLocal(item)}>
                                        <MaterialIcons name="delete" size={22} color="red" />
                                    </TouchableOpacity>
                                </View>

                                <View style={tw`h-[1px] bg-gray-200 my-2`} />

                                {/* Price + Urgent */}
                                <View style={tw`flex-row justify-between items-center`}>

                                    <View>
                                        <Text style={tw`text-[10px] text-gray-400`}>MRP</Text>
                                        <Text style={tw`text-xs`}>₹ {item.mrp}</Text>
                                    </View>

                                    <View>
                                        <Text style={tw`text-[10px] text-gray-400`}>Rate</Text>
                                        <Text style={tw`text-sm font-bold text-green-600`}>
                                            ₹ {item.rate}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => toggleUrgent(index)}
                                        style={tw`flex-row items-center`}
                                    >
                                        <Checkbox status={item.urgent ? 'checked' : 'unchecked'} />
                                        <Text style={tw`text-[10px]`}>Urgent</Text>
                                    </TouchableOpacity>

                                </View>

                            </View>
                        ))}
                    </ScrollView>

                    {/* ✅ FIXED FOOTER */}
                    <View style={tw`absolute bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-200`}>
                        <TouchableOpacity
                            onPress={createPayload}
                            style={tw`bg-blue-500 p-3 rounded-lg`}
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