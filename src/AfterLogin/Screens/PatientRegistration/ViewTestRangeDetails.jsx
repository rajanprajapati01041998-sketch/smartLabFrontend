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
import { useTheme } from '../../../../Authorization/ThemeContext';
import { getThemeStyles } from '../../../utils/themeStyles';

const ViewTestRangeDetails = ({ onClose, serviceItemId, serviceItemName }) => {
    const { showToast } = useToast();
    const { theme } = useTheme();
    const themed = getThemeStyles(theme);
    const isDark = theme === 'dark';

    const [rangeDetails, setRangeDetails] = useState([]);
    const [loading, setLoading] = useState(false);

    const getRangeDetailaByServiceItemId = useCallback(async (id) => {
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
    }, [showToast]);

    useFocusEffect(
        useCallback(() => {
            getRangeDetailaByServiceItemId(serviceItemId);

            return () => {
                console.log('Unfocused from ViewTestRangeDetails');
            };
        }, [serviceItemId])
    );

    const renderItem = ({ item, index }) => {
        const rowStyle =
            index % 2 === 0
                ? isDark
                    ? tw`bg-gray-800`
                    : tw`bg-white`
                : isDark
                    ? tw`bg-gray-900`
                    : tw`bg-gray-50`;

        return (
            <View style={[tw`px-4 py-2`, rowStyle]}>
                <Text style={[themed.normalText, tw`text-sm font-bold`]}>
                    {item?.observationName || '-'}
                </Text>

                <View style={tw`flex-row flex-wrap mt-3`}>
                    <View style={tw`mr-6 min-w-[55px]`}>
                        <Text style={[themed.mutedText, tw`text-[10px]`]}>Min</Text>
                        <Text style={[themed.normalText, tw`text-xs`]}>
                            {item?.minValue || '-'}
                        </Text>
                    </View>

                    <View style={tw`mr-6 mb-2 min-w-[55px]`}>
                        <Text style={[themed.mutedText, tw`text-[10px]`]}>Max</Text>
                        <Text style={[themed.normalText, tw`text-xs`]}>
                            {item?.maxValue || '-'}
                        </Text>
                    </View>

                    <View style={tw`mr-6 mb-2 min-w-[80px]`}>
                        <Text style={[themed.mutedText, tw`text-[10px]`]}>Range</Text>
                        <Text style={[themed.normalText, tw`text-xs`]}>
                            {item?.displayRange || '-'}
                        </Text>
                    </View>

                    <View style={tw`mb-2 min-w-[55px]`}>
                        <Text style={[themed.mutedText, tw`text-[10px]`]}>Unit</Text>
                        <Text style={[themed.normalText, tw`text-xs`]}>
                            {item?.unit || '-'}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderSeparator = () => (
        <View style={[tw`h-[1px]`, isDark ? tw`bg-gray-700` : tw`bg-gray-200`]} />
    );

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
        <View style={[themed.modalHeader, tw`px-4 pt-5 pb-3`]}>
            <View style={tw`flex-row justify-between items-start`}>
                {/* Title with Badge */}
                <View style={tw`flex-1 relative`}>
                    <Text style={[themed.modalHeaderTitle, tw`pr-6`]}>
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
                    style={[
                        tw`ml-2 w-8 h-8 rounded-full items-center justify-center`,
                        isDark ? tw`bg-gray-700` : tw`bg-gray-200`,
                    ]}
                >
                    <MaterialIcons name="close" size={16} color="red" />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={[themed.childScreen, tw`flex-1 min-h-0`]}>
                {renderHeader()}
                <View style={tw`flex-1 justify-center items-center`}>
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text style={[themed.mutedText, tw`mt-2 text-sm`]}>
                        Loading range details...
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[themed.childScreen, tw`flex-1 min-h-0`]}>
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
