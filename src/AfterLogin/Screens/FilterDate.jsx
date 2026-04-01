import { View, Text, TouchableOpacity, Modal, Platform } from 'react-native'
import React, { useState } from 'react'
import tw from 'twrnc'
import CustomStyles from '../../../Custom.styles'
import Entypo from 'react-native-vector-icons/Entypo'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import DateTimePicker from '@react-native-community/datetimepicker'
import ButtonStyles from '../../utils/ButtonStyle'

const FilterDate = ({ onClose, onSave }) => {

    const [fromDate, setFromDate] = useState(new Date())
    const [toDate, setToDate] = useState(new Date())
    const [showPicker, setShowPicker] = useState(null) // 'from' | 'to'
    const [tempDate, setTempDate] = useState(new Date()) // For iOS modal

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        return `${day}-${month}-${year}`
    }

    const onChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            // For Android, close the picker immediately
            setShowPicker(null)
            
            if (selectedDate) {
                if (showPicker === 'from') {
                    setFromDate(selectedDate)
                } else if (showPicker === 'to') {
                    setToDate(selectedDate)
                }
            }
        } else {
            // For iOS, update temp date while user is scrolling
            if (selectedDate) {
                setTempDate(selectedDate)
            }
        }
    }

    const onIOSConfirm = () => {
        if (showPicker === 'from') {
            setFromDate(tempDate)
        } else if (showPicker === 'to') {
            setToDate(tempDate)
        }
        setShowPicker(null)
    }

    const renderDatePicker = () => {
        if (Platform.OS === 'android') {
            // For Android, show picker directly without modal
            if (showPicker) {
                return (
                    <DateTimePicker
                        value={showPicker === 'from' ? fromDate : toDate}
                        mode="date"
                        display="default"
                        onChange={onChange}
                        maximumDate={new Date()}
                    />
                )
            }
            return null
        } else {
            // For iOS, show picker in modal
            if (showPicker) {
                return (
                    <Modal
                        visible={showPicker !== null}
                        transparent
                        animationType="slide"
                    >
                        <View style={{
                            flex: 1,
                            justifyContent: 'flex-end',
                            backgroundColor: 'rgba(0,0,0,0.4)'
                        }}>
                            <View style={{
                                backgroundColor: '#fff',
                                borderTopLeftRadius: 20,
                                borderTopRightRadius: 20,
                                padding: 15
                            }}>
                                {/* Header */}
                                <View style={tw`flex-row justify-between items-center mb-4`}>
                                    <Text style={tw`font-bold text-base`}>
                                        Select {showPicker === 'from' ? 'From' : 'To'} Date
                                    </Text>
                                    <TouchableOpacity onPress={() => setShowPicker(null)}>
                                        <Text style={{ color: 'red', fontSize: 16 }}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>

                                <DateTimePicker
                                    value={showPicker === 'from' ? fromDate : toDate}
                                    mode="date"
                                    display="spinner"
                                    onChange={onChange}
                                    maximumDate={new Date()}
                                    style={{ backgroundColor: 'white' }}
                                />

                                {/* Confirm Button */}
                                <TouchableOpacity
                                    style={[tw`mt-4 py-3 rounded-lg`, { backgroundColor: '#007AFF' }]}
                                    onPress={onIOSConfirm}
                                >
                                    <Text style={tw`text-white text-center font-semibold`}>Confirm</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                )
            }
            return null
        }
    }

    return (
        <View style={tw`p-4`}>

            {/* Header */}
            <View style={tw`flex-row justify-between items-center`}>
                <Text style={tw`text-lg font-bold`}>Filter</Text>

                <TouchableOpacity onPress={onClose}>
                    <Entypo name="cross" size={22} />
                </TouchableOpacity>
            </View>

            <View style={tw`mt-8`}>

                {/* From */}
                <Text style={tw`mb-1 text-gray-700`}>From</Text>
                <TouchableOpacity
                    style={[tw`flex-row justify-between items-center p-3 border border-gray-300 rounded-lg`, CustomStyles.input]}
                    onPress={() => {
                        setTempDate(fromDate)
                        setShowPicker('from')
                    }}
                >
                    <Text style={tw`text-gray-800`}>{formatDate(fromDate)}</Text>
                    <MaterialIcons name="calendar-month" size={20} color="#666" />
                </TouchableOpacity>

                {/* To */}
                <Text style={tw`mt-4 mb-1 text-gray-700`}>To</Text>
                <TouchableOpacity
                    style={[tw`flex-row justify-between items-center p-3 border border-gray-300 rounded-lg`, CustomStyles.input]}
                    onPress={() => {
                        setTempDate(toDate)
                        setShowPicker('to')
                    }}
                >
                    <Text style={tw`text-gray-800`}>{formatDate(toDate)}</Text>
                    <MaterialIcons name="calendar-month" size={20} color="#666" />
                </TouchableOpacity>

                {/* Buttons */}
                <View style={tw`flex-row gap-2 justify-end items-center mt-6`}>
                    <TouchableOpacity
                        style={[ButtonStyles.button, tw`px-6 py-2 rounded-lg`]}
                        onPress={() =>
                            onSave({
                                fromDate: formatDate(fromDate),
                                toDate: formatDate(toDate),
                            })
                        }
                     >
                        <Text style={tw``}>Save</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            setFromDate(new Date())
                            setToDate(new Date())
                            onClose()
                        }}
                        style={[ButtonStyles.cancleButton, tw`px-6 py-2 rounded-lg`]}
                    >
                        <Text style={tw`text-white`}>Clear</Text>
                    </TouchableOpacity>
                </View>

            </View>

            {/* Render Date Picker based on platform */}
            {renderDatePicker()}

        </View>
    )
}

export default FilterDate