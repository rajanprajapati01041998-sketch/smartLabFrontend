import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState } from 'react';
import styles from '../../../utils/InputStyle';
import tw from 'twrnc';
import SelectTitle from './SelectTitle';
import BottomModal from '../../../utils/BottomModal';
import Feather from 'react-native-vector-icons/Feather';
import { useToast } from '../../../../Authorization/ToastContext';
import api from '../../../../Authorization/api';
import { useAuth } from '../../../../Authorization/AuthContext';
import { useTheme } from '../../../../Authorization/ThemeContext';
import { getThemeStyles } from '../../../utils/themeStyles';


const AddReferDoctor = ({ onClose }) => {
    const [doctorName, setDoctorName] = useState('');
    const [doctorMobile, setDoctorMobile] = useState('');
    const [selectedTitle, setSelectedTitle] = useState('Dr');
    const [selectTitleModal, setSelectTitleModal] = useState(false);
    const { hosId, userId,ipAddress } = useAuth()
    const { showToast} = useToast()
    const {theme} = useTheme()
    const themed = getThemeStyles(theme)

    const handleSelectTitle = (title) => {
        setSelectedTitle(title);
        setSelectTitleModal(false);
    };

    const handleSave = async () => {
        // ✅ Validation
        if (!doctorName.trim()) {
            showToast('Please enter doctor name', 'error');
            return;
        }

        // if (!doctorMobile.trim()) {
        //     showToast('Please enter doctor mobile number', 'error');
        //     return;
        // }

        // if (!/^\d{10,15}$/.test(doctorMobile.trim())) {
        //     showToast('Please enter a valid mobile number', 'error');
        //     return;
        // }

        // ✅ Payload (match your API)
        const payload = {
            hospId: hosId,
            title: selectedTitle ,
            name: doctorName,
            doctorContacNo: doctorMobile,
            userId: userId,
            ipAddress: ipAddress
        };
        console.log('Saving refer doctor with payload:', payload);
        try {
            const response = await api.post(`ReferDoctor/save-refer-doctor`,
                payload
            );
            console.log('Refer doctor response:', response?.data);
            if (response?.data?.status === false) {
                showToast(response?.data?.message || 'Duplicate doctor', 'error');
                return;
            }
            showToast('Refer doctor added successfully', 'success');
            onClose?.();

        } catch (error) {
            console.error('Error saving refer doctor:', error?.response?.data || error.message);
            showToast('Failed to save refer doctor', 'error');
        }
    };

    return (
        <View style={[,tw`rounded-t-2xl `]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[themed.headerTitle, tw` text-start border-b border-b-gray-200 pb-2  mb-4`]}>
                    New Refer Doctor
                </Text>

                {/* Title + Name */}
                <View style={tw`flex-row items-end mb-3`}>
                    <View style={tw`w-24 mr-2`}>
                        <Text style={themed.labelText}>Title</Text>
                        <TouchableOpacity
                            onPress={() => setSelectTitleModal(true)}
                            style={[themed.inputBox, tw`mt-1`]}
                        >
                            <View style={[tw`flex-row justify-between items-center`]}>
                                <Text style={[themed.inputText,tw``]}>
                                    {selectedTitle || 'Mr'}
                                </Text>
                                <Feather name="chevron-down" size={20} color="gray" />
                            </View>

                        </TouchableOpacity>
                    </View>

                    <View style={tw`flex-1`}>
                        <Text style={themed.labelText}>Name</Text>
                        <TextInput
                            value={doctorName}
                            onChangeText={setDoctorName}
                            style={[themed.inputBox,themed.inputText, tw`mt-1 capitalize`]}
                            placeholder="Enter doctor name"
                            placeholderTextColor="gray"
                           
                        />
                    </View>
                </View>

                {/* Mobile */}
                {/* <View style={tw`mb-3`}>
                    <Text style={styles.labelText}>Mobile Number</Text>
                    <TextInput
                        value={doctorMobile}
                        onChangeText={(text) => {
                            const numeric = text.replace(/[^0-9]/g, '');
                            setDoctorMobile(numeric);
                        }}
                        style={[styles.inputBox, tw`mt-1`]}
                        placeholder="Enter mobile number"
                        placeholderTextColor="gray"
                        keyboardType="number-pad"
                        maxLength={10}
                    />
                </View> */}

                {/* Buttons */}
                <View style={tw`flex-row justify-between mt-4`}>

                    <TouchableOpacity
                        onPress={onClose}
                        style={[styles.closeButton, tw`flex-1 mr-2`]}
                    >
                        <Text style={tw`text-center text-gray-700 font-medium`}>
                            Cancel
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSave}
                        style={[styles.saveButton, tw`flex-1 ml-2`]}
                    >
                        <Text style={tw`text-center text-white font-medium`}>
                            Save
                        </Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>

            <BottomModal
                visible={selectTitleModal}
                onClose={() => setSelectTitleModal(false)}
            >
                <SelectTitle
                    onClose={() => setSelectTitleModal(false)}
                    onSelectTitle={handleSelectTitle}
                />
            </BottomModal>
        </View>
    );
};

export default AddReferDoctor;