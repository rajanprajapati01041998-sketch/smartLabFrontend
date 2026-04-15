import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import tw from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import api from '../../../../Authorization/api';
import { useToast } from '../../../../Authorization/ToastContext';

const ViewTestRangeDetails = ({ onClose, serviceItemId, serviceItemName }) => {
    const { showToast } = useToast();

    const [rangeDetails, setRangeDetails] = useState([]);
    const [loading, setLoading] = useState(false);

    const getRangeDetailaByServiceItemId = async (id) => {
        if (!id) return;

        try {
            setLoading(true);

            const response = await api.get(
                `ServiceAllDetailsForOPDBilling/get-investigation-range?investigationId=${id}`
            );

            console.log('Range details:', response?.data);

            if (response?.data?.status) {
                setRangeDetails(response?.data?.data || []);
            } else {
                setRangeDetails([]);
                showToast(response?.data?.message || 'No range details found', 'error');
            }
        } catch (error) {
            console.log('Error fetching range details:', error);
            setRangeDetails([]);
            showToast('Failed to fetch range details', 'error');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            getRangeDetailaByServiceItemId(serviceItemId);

            return () => {
                console.log('Unfocused from ViewTestRangeDetails');
            };
        }, [serviceItemId])
    );

    const renderItem = ({ item, index }) => (
        <View
            style={tw`px-4 py-2 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
        >
            <Text style={tw`text-sm font-bold text-gray-800`}>
                {item?.observationName || '-'}
            </Text>

            <View style={tw`flex-row flex-wrap mt-3`}>
                <View style={tw`mr-6 min-w-[55px]`}>
                    <Text style={tw`text-[10px] text-gray-500`}>Min</Text>
                    <Text style={tw`text-xs text-gray-800`}>
                        {item?.minValue || '-'}
                    </Text>
                </View>

                <View style={tw`mr-6 mb-2 min-w-[55px]`}>
                    <Text style={tw`text-[10px] text-gray-500`}>Max</Text>
                    <Text style={tw`text-xs text-gray-800`}>
                        {item?.maxValue || '-'}
                    </Text>
                </View>

                <View style={tw`mr-6 mb-2 min-w-[80px]`}>
                    <Text style={tw`text-[10px] text-gray-500`}>Range</Text>
                    <Text style={tw`text-xs text-gray-800`}>
                        {item?.displayRange || '-'}
                    </Text>
                </View>

                <View style={tw`mb-2 min-w-[55px]`}>
                    <Text style={tw`text-[10px] text-gray-500`}>Unit</Text>
                    <Text style={tw`text-xs text-gray-800`}>
                        {item?.unit || '-'}
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderSeparator = () => <View style={tw`h-[1px] bg-gray-200`} />;

    const renderEmpty = () => {
        if (loading) return null;

        return (
            <View style={tw`flex-1 justify-center items-center px-4 py-10`}>
                <Text style={tw`text-sm text-gray-500 text-center`}>
                    No range details found
                </Text>
            </View>
        );
    };

    const renderHeader = () => (
        <View style={tw`px-4 pt-5 pb-3 bg-white border-b border-gray-200`}>
            <View style={tw`flex-row justify-between items-start`}>
                {/* Title with Badge */}
                <View style={tw`flex-1 relative`}>
                    <Text style={tw`text-md font-bold text-gray-900 pr-6 `}>
                        {serviceItemName || 'Test Range Details'}
                    </Text>
                    {/* 🔥 Floating Cart Badge */}
                    <View style={tw`absolute -top-5 -left-3 bg-red-500 w-6 h-6 rounded-full items-center justify-center`}>
                        <Text style={tw`text-white text-[11px] font-bold`}>
                            {rangeDetails.length}
                        </Text>
                    </View>
                </View>
                {/* Close Button */}
                <TouchableOpacity
                    onPress={onClose}
                    style={tw`ml-2 w-8 h-8 rounded-full bg-gray-200 items-center justify-center`}
                >
                    <MaterialIcons name="close" size={16} color="red" />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={tw`flex-1 bg-white rounded-t-3xl `}>
                {renderHeader()}
                <View style={tw`flex-1 justify-center items-center`}>
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text style={tw`mt-2 text-sm text-gray-600`}>
                        Loading range details...
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={tw`flex-1 bg-white rounded-t-3xl min-h-0`}>
            {renderHeader()}

            <FlatList
                style={tw`flex-1`}
                data={rangeDetails}
                keyExtractor={(item, index) =>
                    `${item?.observationId || index}-${index}`
                }
                renderItem={renderItem}
                ItemSeparatorComponent={renderSeparator}
                ListEmptyComponent={renderEmpty}
                // ListHeaderComponent={renderHeader}
                contentContainerStyle={[
                    { paddingBottom: 30, flexGrow: 1 },
                    rangeDetails.length === 0 ? tw`justify-center` : null,
                ]}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
                removeClippedSubviews={false}
            />
        </View>
    );
};

export default ViewTestRangeDetails;