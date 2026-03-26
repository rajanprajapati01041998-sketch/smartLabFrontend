import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { fetchFieldBoy } from './services/doctorService';
import tw from 'twrnc';

const FieldBoy = ({ onSelectFieldBoy, onClose }) => {
  const [fieldBoys, setFieldBoys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const getAllFieldBoy = async () => {
    try {
      setLoading(true);
      const response = await fetchFieldBoy();
      setFieldBoys(response.data);
    } catch (error) {
      console.log("field boy error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllFieldBoy();
  }, []);

  const handleSelect = (item) => {
    setSelectedId(item.fieldBoyId);

    // send data to parent
    onSelectFieldBoy?.(item);

    // smooth close
    setTimeout(() => {
      onClose?.();
    }, 200);
  };

  return (
    <View style={tw``}>
      <View style={tw`self-start border-b border-gray-800`}>
        <Text style={tw`text-md font-bold mb-1 text-gray-800`}>
          Select Field Boy
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <View style={tw`max-h-[400px] w-full`}>
          <FlatList
            data={fieldBoys}
            keyExtractor={(item) => item.fieldBoyId.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pb-4`}
            ListEmptyComponent={
              <Text style={tw`text-center text-gray-500 mt-5`}>
                No Data Found
              </Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                style={tw`p-3 border-b rounded mb-2 ${selectedId === item.fieldBoyId
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300'
                  }`}
              >
                <Text style={tw`text-md text-gray-600 font-semibold text-center capitalize `}>
                  {item.fieldBoyName}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

    </View>
  );
};

export default FieldBoy;