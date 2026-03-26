import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { referLabList } from './services/doctorService';
import tw from 'twrnc';

const ReferLab = ({ onSelectDoctor, onClose }) => {
    const [referLabs, setReferLabs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const getFetchReferLab = async () => {
        try {
            setLoading(true);
            const response = await referLabList();

            console.log('Refer Lab List:', response);

            setReferLabs(response.data);

        } catch (error) {
            console.error('Error fetching refer lab list:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            getFetchReferLab();
        }, [])
    );

    const handleSelect = (item) => {
        setSelectedId(item.outSourceLabId);
        onSelectDoctor(item);
        onClose();
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={tw`bg-white p-4 mb-3 rounded-xl shadow border border-gray-200`}
            onPress={() => handleSelect(item)}
         >
            <Text style={tw`text-base font-semibold text-gray-800`}>
                {item.outSourceLab}
            </Text>

            {/* Optional selection indicator */}
            {selectedId === item.outSourceLabId && (
                <Text style={tw`text-green-500 mt-1`}>Selected</Text>
            )}
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={tw`flex-1 justify-center items-center`}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={tw`flex-1  `}>
            <Text style={tw`text-lg font-bold mb-4`}>
                Refer Lab List
            </Text>

            <FlatList
                data={referLabs}
                keyExtractor={(item) => item.outSourceLabId.toString()}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <Text style={tw`text-center text-gray-500`}>
                        No Labs Found
                    </Text>
                }
            />
        </View>
    );
};

export default ReferLab;