import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import React, { useState } from 'react';
import tw from 'twrnc';

const AddDoctor = ({ onClose, onSave }) => {

    const [titleModal, setTitleModal] = useState(false);
    const [title, setTitle] = useState('Dr.');
    const [doctorName, setDoctorName] = useState('');
    const [contactNo, setContactNo] = useState('');

    const titleList = ['Mr.', 'Mrs.', 'Miss', 'Master', 'B/O', 'Dr.', 'Prof.'];

    const handleSave = () => {

        if (!doctorName.trim()) {
            alert("Please enter doctor name");
            return;
        }

        const data = {
            title,
            doctorName,
            contactNo,
        };

        console.log('Doctor Saved:', data);

        if (onSave) onSave(data);
        if (onClose) onClose();
    };

    return (

        <View style={tw`w-full`}>

            {/* Heading */}
            <Text style={tw`text-xl font-bold mb-4 text-center`}>
                Add Refer Doctor
            </Text>

            {/* Doctor Name Label */}
            <Text style={tw`mb-1 font-semibold`}>
                Doctor Name *
            </Text>

            {/* Title + Name input combined box */}
            <View style={tw`flex-row items-center border border-gray-300 rounded-md mb-3`}>

                {/* Title selector */}
                <TouchableOpacity
                    onPress={() => setTitleModal(true)}
                    style={tw`px-3 py-3 border-r border-gray-300 bg-gray-100`}
                >
                    <Text style={tw`font-semibold`}>
                        {title}
                    </Text>
                </TouchableOpacity>

                {/* Name input */}
              
                <TextInput
                    placeholder="Enter Refer Doctor Name"
                    value={doctorName}
                    onChangeText={setDoctorName}
                    maxLength={40}
                    style={tw`flex-1 px-3 py-3`}
                />

            </View>

            {/* Contact No */}
              <Text style={tw`mb-1 font-semibold`}>
                    Mobile *
                </Text>
            <TextInput
                placeholder="Enter Contact No."
                value={contactNo}
                maxLength={10}
                onChangeText={setContactNo}
                keyboardType="numeric"
                returnKeyType="done"
                style={tw`border border-gray-300 rounded-md px-3 py-3 mb-4`}
            />

            {/* Buttons */}
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


            {/* Title Selection Modal */}
            <Modal
                visible={titleModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setTitleModal(false)}
            >

                <TouchableOpacity
                    style={tw`flex-1 justify-center items-center bg-black/40`}
                    activeOpacity={1}
                    onPressOut={() => setTitleModal(false)}
                >

                    <View style={tw`bg-white rounded-lg w-40`}>

                        {titleList.map((item, index) => (

                            <TouchableOpacity
                                key={index}
                                style={tw`px-4 py-3 border-b border-gray-200`}
                                onPress={() => {
                                    setTitle(item);
                                    setTitleModal(false);
                                }}
                            >
                                <Text style={tw`font-semibold`}>
                                    {item}
                                </Text>
                            </TouchableOpacity>

                        ))}

                    </View>

                </TouchableOpacity>

            </Modal>

        </View>

    );
};

export default AddDoctor;
