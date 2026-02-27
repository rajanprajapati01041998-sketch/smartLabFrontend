import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native'
import React, { useState } from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import tw from 'twrnc'
import { useTheme } from '../../../../Authorization/ThemeContext'
import GobakHandler from '../../../GobakHandler'
import CustomStyles from '../../../../Custom.styles'
import Entypo from 'react-native-vector-icons/Entypo';


const DiscountAfterRegistration = () => {
    const { pageBackground, saveButtonBackground } = useTheme()
    const [seachResultsModal, setSearchResultsModal] = useState(false);
    const [receiptNumber, setRecieptNumber] = useState("")

    const handleSearch = () => {
        setSearchResultsModal(true);
    };
    return (
        <ScrollView style={tw`flex-1 p-2 bg-[${pageBackground}] `} showsVerticalScrollIndicator={true}>
            <View style={tw`flex flex-row gap-4`}>
                <GobakHandler />
                <View style={tw``}>
                    <Text style={tw`mt-2 text-md border-b border-gray-200 pb-2`}>Search Details</Text>
                </View>
            </View>

            <View style={tw`my-2`}>
                <Text style={tw`py-1`}>Receipt No.</Text>
                <TextInput
                    value={receiptNumber}
                    onChangeText={text => setRecieptNumber(text)}
                    placeholder='Enter Receipt Number'
                    style={CustomStyles.input}
                />
            </View>
            <TouchableOpacity
                onPress={handleSearch}
                style={[CustomStyles.button,
                tw`self-end  mr-2 mt-6`,
                { backgroundColor: saveButtonBackground }
                ]} >
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
                            <Text>{receiptNumber}</Text>

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

export default DiscountAfterRegistration