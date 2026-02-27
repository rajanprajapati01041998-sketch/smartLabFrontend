import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import { useState } from 'react'
import tw from 'twrnc';
const AddNewReferLab = ({ onClose, handleSave }) => {
  const [refrelabName, setRefrelabName] = useState('');



  return (
    <View>
      <Text>Refer lab Name</Text>
      <TextInput
        placeholder="Enter Contact No."
        value={refrelabName}
        maxLength={30}
        onChangeText={setRefrelabName}
        keyboardType="default"
        returnKeyType="done"
        style={tw`border border-gray-300 rounded-md px-3 py-3 mb-4`}
      />
      <View style={tw`flex-row justify-end gap-3`}>

        <TouchableOpacity
          onPress={onClose}
          style={tw`px-5 py-3 bg-gray-300 rounded-md`}
        >
          <Text style={tw`font-semibold`}>
            Close
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSave}
          style={tw`px-5 py-3 bg-cyan-500 rounded-md`}
        >
          <Text style={tw`text-white font-semibold`}>
            Save
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  )
}

export default AddNewReferLab