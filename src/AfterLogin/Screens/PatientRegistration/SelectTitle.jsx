import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import tw from 'twrnc'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const SelectTitle = ({ onSelectTitle,onClose }) => {
  const [selected, setSelected] = useState("");

  const titles = [
    { label: "Mr.", icon: "male" },
    { label: "Mrs.", icon: "female" },
    { label: "Miss.", icon: "female" },
    { label: "Ms.", icon: "female" },
    { label: "Dr.", icon: "user-md" },
    { label: "Other", icon: "user" }
  ];

  const handleSelect = (title) => {
    setSelected(title);
    onSelectTitle(title);
    onClose()
  };

  return (
    <View style={tw`mb-4`}>
      <Text style={tw`mb-2 text-base font-semibold text-gray-700`}>
        Select Title
      </Text>

      <View style={tw`flex-col`}>
        {titles.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleSelect(item.label)}
            style={[
              tw`flex-row items-center px-4 py-3 rounded-xl border mb-2`,
              selected === item.label
                ? tw`bg-blue-600 border-blue-600`
                : tw`bg-white border-gray-300`
            ]}
          >
            {/* ✅ Icon */}
            <FontAwesome5
              name={item.icon}
              size={16}
              color={selected === item.label ? "white" : "#374151"}
              style={tw`mr-3`}
            />

            {/* ✅ Text */}
            <Text
              style={[
                tw`text-base`,
                selected === item.label ? tw`text-white` : tw`text-gray-700`
              ]}
            >
              {item.label}
            </Text>

            {/* ✅ Selected Tick */}
            {selected === item.label && (
              <MaterialIcons
                name="check-circle"
                size={18}
                color="white"
                style={tw`ml-auto`}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default SelectTitle;