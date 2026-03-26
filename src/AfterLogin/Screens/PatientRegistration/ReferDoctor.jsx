import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { referDoctorList } from './services/doctorService';
import tw from 'twrnc';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const ReferDoctor = ({ onSelectDoctor, onClose }) => {
  const [referDoctors, setReferDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const getReferDoctorList = async () => {
    try {
      setLoading(true);
      const response = await referDoctorList();
      setReferDoctors(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getReferDoctorList();
    }, [])
  );

  const handleSelect = (item) => {
    setSelectedId(item.referDoctorId);
    onSelectDoctor(item);
    onClose();
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedId === item.referDoctorId;

    return (
      <TouchableOpacity
        onPress={() => handleSelect(item)}
        style={[
          tw`w-[30%] m-1 p-3 rounded-xl items-center border`,
          isSelected
            ? tw`bg-blue-600 border-blue-600`
            : tw`bg-white border-gray-300`
        ]}
      >
        {/* ✅ Icon Circle */}
        <View
          style={[
            tw`p-3 rounded-full mb-2`,
            isSelected ? tw`bg-white` : tw`bg-blue-100`
          ]}
        >
          <FontAwesome5
            name="user-md"
            size={20}
            color="#2563eb"
          />
        </View>

        {/* ✅ Doctor Name */}
        <Text
          numberOfLines={2}
          style={[
            tw`text-xs text-center`,
            isSelected ? tw`text-white` : tw`text-gray-700`
          ]}
        >
          {item.doctorName}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={tw`flex-1 p-2`}>
      
      {/* Header */}
      <View style={tw`flex-row justify-between items-center mb-3`}>
        <Text style={tw`text-lg font-bold`}>Select Refer Doctor</Text>
        <Text onPress={onClose} style={tw`text-red-500 text-lg`}>✕</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={referDoctors}
          keyExtractor={(item) => item.referDoctorId.toString()}
          renderItem={renderItem}
          numColumns={3}   // ✅ 3 cards per row
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={tw`text-center mt-10 text-gray-500`}>
              No Refer Doctors Found
            </Text>
          }
        />
      )}
    </View>
  );
};

export default ReferDoctor;