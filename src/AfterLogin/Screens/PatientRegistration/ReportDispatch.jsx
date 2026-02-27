import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native'
import React, { useState } from 'react'
import tw from 'twrnc';
import { ScrollView } from 'react-native-gesture-handler';
import { useTheme } from '../../../../Authorization/ThemeContext';
import CustomStyles from '../../../../Custom.styles';
import { useNavigation } from '@react-navigation/native';
import GoBackHandler from '../../../GobakHandler';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SelectList } from "react-native-dropdown-select-list";
import Entypo from 'react-native-vector-icons/Entypo';



const ReportDispatch = () => {

    const { pageBackground, saveButtonBackground } = useTheme();
    const navigation = useNavigation();

    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [seachResultsModal, setSearchResultsModal] = useState(false);
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);
    const [selected, setSelected] = React.useState("");

    const dsptch = [
        { key: '1', value: 'Non-Dispatch' },
        { key: '2', value: 'Dispatch' },

    ]
    const status = [
        { key: '1', value: 'Approved' },
        { key: '2', value: 'Un-Approved' },

    ]


    // Format date
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleSearch = () => {
        setSearchResultsModal(true);
    };


return (
    <ScrollView style={[tw`flex-1`, { backgroundColor: pageBackground }]}>

        <View style={tw`p-2`}>

            <GoBackHandler
                style={tw`ml-2`}
                onPress={() => navigation.goBack()}
            />

            <View style={tw`mt-2`}>

                {/* Row 1 */}
                <View style={tw`flex-row items-center mb-2 w-full`}>

                    <View style={tw`w-1/2`}>
                        <Text style={tw`mb-2`}>UHID</Text>
                        <TextInput
                            style={CustomStyles.input}
                            placeholder='Enter UHID'
                        />
                    </View>

                    <View style={tw`w-1/2 p-2`}>
                        <Text style={tw`mb-2`}>Lab no.</Text>
                        <TextInput
                            style={CustomStyles.input}
                            placeholder='Enter Lab no.'
                        />
                    </View>

                </View>

                {/* Row 2 */}
                <View style={tw`flex-row items-center mb-1 w-full`}>

                    {/* From Date */}
                    <View style={tw`w-1/2`}>
                        <Text style={tw`mb-2`}>From date</Text>

                        <TouchableOpacity
                            onPress={() => setShowFromPicker(true)}
                        >
                            <TextInput
                                style={CustomStyles.input}
                                placeholder='Select From Date'
                                value={formatDate(fromDate)}
                                editable={false}
                            />
                        </TouchableOpacity>

                        {showFromPicker && (
                            <DateTimePicker
                                value={fromDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowFromPicker(false);
                                    if (selectedDate) {
                                        setFromDate(selectedDate);
                                    }
                                }}
                            />
                        )}

                    </View>

                    {/* To Date */}
                    <View style={tw`w-1/2 p-2`}>
                        <Text style={tw`mb-2`}>To date</Text>

                        <TouchableOpacity
                            onPress={() => setShowToPicker(true)}
                        >
                            <TextInput
                                style={CustomStyles.input}
                                placeholder='Select To Date'
                                value={formatDate(toDate)}
                                editable={false}
                            />
                        </TouchableOpacity>

                        {showToPicker && (
                            <DateTimePicker
                                value={toDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowToPicker(false);
                                    if (selectedDate) {
                                        setToDate(selectedDate);
                                    }
                                }}
                            />
                        )}

                    </View>

                </View>
                <View>
                    <Text style={tw`mb-1`}>Select Dispatch</Text>
                    <SelectList
                        setSelected={(val) => setSelected(val)}
                        data={dsptch}
                        save="value"
                        placeholder="Select Dispatch/Non-Dispatch"
                    />
                </View>
                <View style={tw`mt-2`}>
                    <Text style={tw`mb-1`}>Select Status</Text>
                    <SelectList
                        setSelected={(val) => setSelected(val)}
                        data={status}
                        save="value"
                        placeholder="Select Status"
                    />
                </View>
            </View>
        </View>

        <TouchableOpacity
            onPress={handleSearch}
            style={[CustomStyles.button,
            tw`self-end  mr-2 mt-6`,
            { backgroundColor: saveButtonBackground }
            ]}
        >
            <Text style={tw`text-white text-sm font-semibold`}>
                Search
            </Text>
        </TouchableOpacity>


        <Modal
            visible={seachResultsModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setSearchResultsModal(false)}
         >
            <View style={tw`flex-1 justify-end bg-black/40`}>

                {/* Modal Container */}
                <View style={tw`bg-white rounded-t-2xl p-4 h-[90%]`}>

                    {/* Header */}
                    <View style={tw`flex-row justify-between items-center mb-3`}>

                        <Text style={tw`text-lg font-semibold text-gray-800`}>
                            Search Results
                        </Text>

                        <TouchableOpacity
                            onPress={() => setSearchResultsModal(false)}
                            style={tw`bg-red-500 rounded-full`}
                        >
                           <Entypo name="cross" size={26} color="#fff" />
                        </TouchableOpacity>

                    </View>

                    {/* Divider */}
                    <View style={tw`h-[1px] bg-gray-300 mb-3`} />

                    {/* Scrollable Content */}
                    <ScrollView>

                        {/* Example content */}
                        <View style={tw`p-2 border border-gray-200 rounded-lg mb-2`}>
                            <Text style={tw`font-semibold`}>Lab No: 12345</Text>
                            <Text>Patient: Rahul Sharma</Text>
                            <Text>Status: Approved</Text>
                        </View>

                        <View style={tw`p-2 border border-gray-200 rounded-lg mb-2`}>
                            <Text style={tw`font-semibold`}>Lab No: 67890</Text>
                            <Text>Patient: Amit Kumar</Text>
                            <Text>Status: Dispatch</Text>
                        </View>

                    </ScrollView>

                </View>

            </View>
        </Modal>


    </ScrollView>
)
}

export default ReportDispatch;
