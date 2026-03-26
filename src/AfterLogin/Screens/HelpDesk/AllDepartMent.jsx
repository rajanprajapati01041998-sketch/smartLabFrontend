import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import tw from 'twrnc'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const departments = [
    "--All--",
    "HAEMATOLOGY",
    "HEMATOLOGY",
    "BIOCHEMISTRY",
    "SEROLOGY",
    "BODY FLUIDS",
    "MICROBIOLOGY",
    "CLINICAL PATHOLOGY",
    "CYTOLOGY",
    "HISTOPATHOLOGY",
    "IMMUNOLOGY",
    "Clinical",
    "Molecular Pathology",
    "ELISA",
    "MOLECULAR BIOLOGY",
    "ALLERGY",
    "COAGULATION",
    "CYTOGENETICS",
    "MULTIPLE DEPARTMENTS",
    "FLOW CYTOMETRY",
    "IMMUNOFLUOROMETRY",
    "IMMUNOHISTOCHEMISTRY"
];

const AllDepartMent = ({ onClose, onSelect }) => {

    const [selected, setSelected] = useState("--All--");

    const handleSelect = (item) => {
        setSelected(item);

        if (onSelect) {
            onSelect(item);   // ✅ send to parent
        }

        if (onClose) {
            onClose();        // ✅ close modal
        }
    };

    const renderItem = ({ item }) => {
        const isSelected = selected === item;

        return (
            <TouchableOpacity
                onPress={() => handleSelect(item)}   // ✅ use handler
                style={tw`flex-row items-center justify-between py-3 px-2`}
            >
                <Text style={tw`text-base ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                    {item}
                </Text>

                {isSelected && (
                    <MaterialIcons name="check" size={20} color="#4da6ff" />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={tw`flex-1 bg-gray-50 p-2`}>
            <FlatList
                data={departments}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default AllDepartMent;