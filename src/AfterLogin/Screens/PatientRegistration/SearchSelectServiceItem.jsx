import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    TextInput
} from 'react-native';
import tw from 'twrnc';
import { Checkbox } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../../../Authorization/AuthContext';
import { SearchGetInvestigationListDetails } from './services/doctorService';

const SearchSelectServiceItem = ({ data, onDelete, isDirty, onDirtyChange, onSaved }) => {
    const [loading, setLoading] = useState(false);
    const [detailsList, setDetailsList] = useState([]);

    const { setServiceItem, selectedDoctor, corporateId } = useAuth();

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (!data || data.length === 0) return;

            setLoading(true);
            try {
                const responses = await Promise.all(
                    data.map(item =>
                        SearchGetInvestigationListDetails({
                            corporateId: corporateId ?? 1,
                            doctorId: selectedDoctor ?? 1,
                            serviceItemId: item.itemId,
                            categoryId: item.categoryId,
                            subCategoryId: item.subCategoryId,
                            subSubCategoryId: item.subSubCategoryId,
                            bedTypeId: 0,
                        })
                    )
                );

                if (cancelled) return;

                const formatted = responses
                    .filter(res => res?.success)
                    .map(res => ({
                        ...res.data,
                        urgent: false,
                        qty: 1
                    }));

                setDetailsList(formatted);
            } catch (error) {
                if (!cancelled) console.error('Error:', error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        if (data?.length > 0) {
            run();
        } else {
            setDetailsList([]);
        }

        return () => {
            cancelled = true;
        };
    }, [data, corporateId, selectedDoctor]);

    // 🔹 Toggle urgent
    const toggleUrgent = (index) => {
        const updated = [...detailsList];
        updated[index].urgent = !updated[index].urgent;
        setDetailsList(updated);

        // Urgent change is not saved into registration until user taps Add Tests.
        onDirtyChange?.(true);
    };

    const updateRate = (index, txt) => {
        const cleaned = String(txt).replace(/[^0-9.]/g, '');
        const next = cleaned === '' ? '' : Number(cleaned);

        setDetailsList((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                rate: next === '' ? '' : next,
            };
            return updated;
        });

        // Rate change is not saved into registration until user taps Add Tests.
        onDirtyChange?.(true);
    };

    // 🔹 Delete
    const handleDeleteLocal = (item) => {
        setDetailsList(prev =>
            prev.filter(i => i.serviceItemId !== item.serviceItemId)
        );

        onDelete?.(item);

        // Deleting changes selection until user taps Add Tests again.
        onDirtyChange?.(true);
    };

    // 🔹 Create payload
    const createPayload = () => {
        const newServices = detailsList.map(item => ({
            ServiceItemId: item.serviceItemId,
            SubSubCategoryId: item.subSubCategoryId,
            ServiceName: item.serviceName,
            Amount: item.rate,
            qty: item.qty,
            isUrgent: item.urgent ? 1 : 0
        }));

        setServiceItem((prev) => {
            const existingServices = Array.isArray(prev?.Services) ? prev.Services : [];

            // Keep old selected tests and update/append new ones by ServiceItemId.
            const mergedMap = new Map(
                existingServices.map((service) => [service.ServiceItemId, service])
            );

            newServices.forEach((service) => {
                mergedMap.set(service.ServiceItemId, service);
            });

            const payload = {
                ...(prev || {}),
                Services: Array.from(mergedMap.values()),
                Investigations: prev?.Investigations || {
                    isUrgent: 0,
                    ReportingBranchId: 1,
                    Barcode: "BAR123",
                    TestRemark: "Fasting"
                }
            };

            console.log('FINAL PAYLOAD:', payload);
            return payload;
        });

        // Now the modal is synced with registration (Next can be shown).
        onDirtyChange?.(false);
        onSaved?.();
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
                                        {item.isRateEditable === false ? (
                                            <View style={tw`flex-row items-center`}>
                                                <Text style={tw`text-green-600 font-bold mr-1`}>₹</Text>
                                                <TextInput
                                                    value={item.rate === '' || item.rate === null || item.rate === undefined ? '' : String(item.rate)}
                                                    onChangeText={(txt) => updateRate(index, txt)}
                                                    keyboardType="numeric"
                                                    style={tw`min-w-[70px] px-2 py-1 border border-green-200 rounded-lg text-green-700 font-bold`}
                                                    placeholder="0"
                                                />
                                            </View>
                                        ) : (
                                            <Text style={tw`text-sm font-bold text-green-600`}>
                                                ₹ {item.rate}
                                            </Text>
                                        )}
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => toggleUrgent(index)}
                                        style={tw`flex-row items-center`}
                                    >
                                        <Checkbox
                                        status={item.urgent ? 'checked' : 'unchecked'} />
                                        
                                        <Text style={tw`text-[10px]`}>Urgent</Text>
                                    </TouchableOpacity>

                                </View>

                            </View>
                        ))}
                    </ScrollView>

                    {/* ✅ FIXED FOOTER */}
                    {isDirty && detailsList.length > 0 && (
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
                    )}
                </>
            )}

        </View>
    );
};

export default SearchSelectServiceItem;
