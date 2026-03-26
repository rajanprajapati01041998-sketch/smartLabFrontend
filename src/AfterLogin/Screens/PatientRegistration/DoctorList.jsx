import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getDoctorList } from './services/doctorService';
import tw from 'twrnc';
import { useAuth } from '../../../../Authorization/AuthContext';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const DoctorList = ({ onSelectDoctor, onClose }) => {
    const { setSelectedDoctor } = useAuth();

    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const response = await getDoctorList(1);
            if (response?.success) {
                setDoctors(response.data);
            }
        } catch (error) {
            console.error('Error fetching doctor list:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchDoctors();
        }, [])
    );

    const handleSelect = (item) => {
        setSelectedId(item.doctorId);
        setSelectedDoctor(item.doctorId);
        onSelectDoctor(item);
        onClose();
    };

    const renderItem = ({ item }) => {
        const isSelected = selectedId === item.doctorId;

        return (
            <TouchableOpacity
                onPress={() => handleSelect(item)}
                style={[
                    tw`w-full mb-2 p-2 rounded-xl flex-row items-center border`,
                    isSelected
                        ? tw`bg-blue-600 border-blue-600`
                        : tw`bg-white border-gray-300`
                ]} >
                <View
                    style={[tw`p-2 rounded-full mr-3`,isSelected ? tw`bg-white` : tw`bg-blue-100` ]} >
                    <FontAwesome5 name="user-md" size={14} color="#2563eb" />
                </View>
                <Text numberOfLines={1}  style={[  tw`flex-1 text-sm`, isSelected ? tw`text-white` : tw`text-gray-700` ]} >
                    {item.name}
                </Text>
                <FontAwesome5 name="chevron-right"size={14} color={isSelected ? "white" : "gray"} />
            </TouchableOpacity>
        );
    };

    return (
        <View style={tw`flex-1 p-3`}>
            {loading ? (
                <ActivityIndicator size="large" />
            ) : (
                <FlatList
                    data={doctors}
                    keyExtractor={(item) => item.doctorId.toString()}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={tw`h-1`} />}
                    ListEmptyComponent={
                        <Text style={tw`text-center mt-10 text-gray-500`}>
                            No Doctors Found
                        </Text>
                    }
                />
            )}
        </View>
    );
};

export default DoctorList;