import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native'
import React, { useState } from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import tw from 'twrnc'
import { useTheme } from '../../../../Authorization/ThemeContext'
import GobakHandler from '../../../GobakHandler'
import CustomStyles from '../../../../Custom.styles'
import Entypo from 'react-native-vector-icons/Entypo'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import { RadioButton } from 'react-native-paper'

const OPDSattlement = () => {
    const { pageBackground, saveButtonBackground } = useTheme()
    const [searchResultsModal, setSearchResultsModal] = useState(false)
    const [receiptNumber, setReceiptNumber] = useState("")
    const [checked, setChecked] = useState('BillNo')
    const [searchHistory, setSearchHistory] = useState([])

    const handleSearch = () => {
        if (receiptNumber.trim()) {
            setSearchResultsModal(true)
            // Add to search history (optional)
            setSearchHistory(prev => [receiptNumber, ...prev.slice(0, 4)])
        }
    }

    const handleClearInput = () => {
        setReceiptNumber("")
    }

    const RadioOption = ({ value, label, icon }) => (
        <TouchableOpacity
            onPress={() => setChecked(value)}
            style={tw`flex-row items-center bg-gray-50 px-2 py-1 rounded-lg border ${checked === value ? 'border-blue-500' : 'border-gray-200'}`}
        >
            <RadioButton
                value={value}
                status={checked === value ? 'checked' : 'unchecked'}
                onPress={() => setChecked(value)}
                color="#3B82F6"
            />
            {icon}
            <Text style={tw`ml-1 text-gray-700 font-medium`}>{label}</Text>
        </TouchableOpacity>
    )

    return (
        <View style={tw`flex-1 bg-[${pageBackground}]`}>
            {/* Header */}
            <View style={tw``}>
                <View style={tw`flex-row items-center px-4 py-3`}>
                    <GobakHandler />

                </View>
            </View>

            <ScrollView
                style={tw`flex-1 p-2`}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Search Options Card */}
                <View style={tw``}>
                    <Text style={tw` text-gray-700 mb-3`}>Search By</Text>
                    <View style={tw`flex-row justify-start flex-wrap gap-2`}>

                        <RadioOption
                            value="BillNo"
                            label="Bill No."
                        />
                        <RadioOption
                            value="UHID"
                            label="UHID/Barcode"
                        />
                    </View>
                </View>

                {/* Input Card */}
                <View style={tw` my-4`}>
                    <Text style={tw`text-gray-700 mb-3`}>
                        Enter {checked === 'Receipt' ? 'Receipt' : checked === 'BillNo' ? 'Bill' : 'UHID'} Number
                    </Text>

                    <View style={tw`relative`}>
                        <TextInput
                            value={receiptNumber}
                            onChangeText={setReceiptNumber}
                            placeholder={`Enter ${checked === 'Receipt' ? 'receipt' : checked === 'BillNo' ? 'bill' : 'UHID'} number...`}
                            style={[
                                CustomStyles.input,
                                tw` ${receiptNumber ? 'border-blue-300' : 'border-gray-200'} `
                            ]}
                            keyboardType={checked !== 'UHID' ? 'numeric' : 'default'}
                            returnKeyType="search"
                            onSubmitEditing={handleSearch}
                        />
                        {receiptNumber.length > 0 && (
                            <TouchableOpacity
                                onPress={handleClearInput}
                                style={tw`absolute right-3 top-3`}
                            >
                                <Entypo name="circle-with-cross" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Quick Actions */}
                    {searchHistory.length > 0 && (
                        <View style={tw`mt-3`}>
                            <Text style={tw`text-xs text-gray-500 mb-2`}>Recent searches:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {searchHistory.map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => setReceiptNumber(item)}
                                        style={tw`bg-gray-100 px-3 py-1.5 rounded-full mr-2`}
                                    >
                                        <Text style={tw`text-gray-600 text-sm`}>{item}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={handleSearch}
                        disabled={!receiptNumber.trim()}
                        style={[
                            CustomStyles.button,
                            tw`self-end mr-2 mt-6`,
                            { backgroundColor: receiptNumber.length > 0 ? saveButtonBackground : '#D1D5DB' }]}>
                        <Text style={tw`text-white text-sm font-semibold`}>
                            Search
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Search Results Modal */}
            <Modal
                visible={searchResultsModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setSearchResultsModal(false)}
             >
                <View style={tw`flex-1 justify-end bg-black/50`}>
                    <View style={tw`bg-white rounded-t-3xl h-[85%]`}>
                        {/* Modal Header */}
                        <View style={tw`px-5 pt-5 pb-3 border-b border-gray-200`}>
                            <View style={tw`flex-row justify-between items-center`}>
                                <View>
                                    <Text style={tw`text-xl font-bold text-gray-800`}>Search Results</Text>
                                    <Text style={tw`text-sm text-gray-500 mt-1`}>
                                        Found 2 records for "{receiptNumber}"
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setSearchResultsModal(false)}
                                    style={tw`bg-red-500 p-1 rounded-full`}
                                >
                                    <Entypo name="cross" size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Modal Content */}
                        <ScrollView style={tw`p-5`} showsVerticalScrollIndicator={false}>
                            {/* Result Card 1 */}
                            <View style={tw`bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm`}>
                                <View style={tw`flex-row justify-between items-start mb-2`}>
                                    <View style={tw`flex-row items-center`}>
                                        <View style={tw`bg-blue-100 p-2 rounded-lg mr-3`}>
                                            <FontAwesome5 name="receipt" size={20} color="#3B82F6" />
                                        </View>
                                        <View>
                                            <Text style={tw`font-bold text-gray-800 text-lg`}>#REC-12345</Text>
                                            <Text style={tw`text-gray-500 text-sm`}>Lab No: 12345</Text>
                                        </View>
                                    </View>
                                    <View style={tw`bg-green-100 px-3 py-1 rounded-full`}>
                                        <Text style={tw`text-green-700 text-xs font-semibold`}>Approved</Text>
                                    </View>
                                </View>

                                <View style={tw`mt-2 pt-2 border-t border-gray-100`}>
                                    <View style={tw`flex-row items-center mb-1`}>
                                        <FontAwesome5 name="user" size={14} color="#9CA3AF" style={tw`mr-2`} />
                                        <Text style={tw`text-gray-700`}>Rahul Sharma</Text>
                                    </View>
                                    <View style={tw`flex-row items-center`}>
                                        <FontAwesome5 name="calendar" size={14} color="#9CA3AF" style={tw`mr-2`} />
                                        <Text style={tw`text-gray-600`}>15 Mar 2024 • ₹1,500</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Result Card 2 */}
                            <View style={tw`bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm`}>
                                <View style={tw`flex-row justify-between items-start mb-2`}>
                                    <View style={tw`flex-row items-center`}>
                                        <View style={tw`bg-purple-100 p-2 rounded-lg mr-3`}>
                                            <FontAwesome5 name="file-invoice" size={20} color="#8B5CF6" />
                                        </View>
                                        <View>
                                            <Text style={tw`font-bold text-gray-800 text-lg`}>#BILL-67890</Text>
                                            <Text style={tw`text-gray-500 text-sm`}>Lab No: 67890</Text>
                                        </View>
                                    </View>
                                    <View style={tw`bg-yellow-100 px-3 py-1 rounded-full`}>
                                        <Text style={tw`text-yellow-700 text-xs font-semibold`}>Pending</Text>
                                    </View>
                                </View>

                                <View style={tw`mt-2 pt-2 border-t border-gray-100`}>
                                    <View style={tw`flex-row items-center mb-1`}>
                                        <FontAwesome5 name="user" size={14} color="#9CA3AF" style={tw`mr-2`} />
                                        <Text style={tw`text-gray-700`}>Amit Kumar</Text>
                                    </View>
                                    <View style={tw`flex-row items-center`}>
                                        <FontAwesome5 name="calendar" size={14} color="#9CA3AF" style={tw`mr-2`} />
                                        <Text style={tw`text-gray-600`}>16 Mar 2024 • ₹2,800</Text>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default OPDSattlement