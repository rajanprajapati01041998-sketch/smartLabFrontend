import { View, Text, TouchableOpacity } from 'react-native'
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
    const [showFromPicker, setShowFromPicker] = useState(false)
    const [showToPicker, setShowToPicker] = useState(false)
    // dd-mm-yyyy format function
    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        return `${day}-${month}-${year}`
    }

    const onChangeFrom = (event, selectedDate) => {
        setShowFromPicker(false)
        if (selectedDate) setFromDate(selectedDate)
    }

    const onChangeTo = (event, selectedDate) => {
        setShowToPicker(false)
        if (selectedDate) setToDate(selectedDate)
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

                {/* From Date */}
                <Text>From</Text>

                <TouchableOpacity
                    style={[tw`flex-row justify-between items-center`, CustomStyles.input]}
                    onPress={() => setShowFromPicker(true)}
                >
                    <Text>{formatDate(fromDate)}</Text>
                    <MaterialIcons name="calendar-month" size={20} />
                </TouchableOpacity>

                {/* To Date */}
                <Text style={tw`mt-3`}>To</Text>

                <TouchableOpacity
                    style={[tw`flex-row justify-between items-center`, CustomStyles.input]}
                    onPress={() => setShowToPicker(true)}
                >
                    <Text>{formatDate(toDate)}</Text>
                    <MaterialIcons name="calendar-month" size={20} />
                </TouchableOpacity>

                {/* Buttons */}
                <View style={tw`flex-row gap-2 justify-end items-center mt-5`}>

                    <TouchableOpacity
                        style={ButtonStyles.button}
                        onPress={() =>
                            onSave({
                                fromDate: formatDate(fromDate),
                                toDate: formatDate(toDate),
                            })
                        }
                    >
                        <Text>Save</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onClose}
                        style={CustomStyles.cancleButton}
                    >
                        <Text style={tw`text-white`}>Clear</Text>
                    </TouchableOpacity>

                </View>

            </View>

            {/* From Date Picker */}
            {showFromPicker && (
                <DateTimePicker
                    value={fromDate}
                    mode="date"
                    display="default"
                    onChange={onChangeFrom}
                />
            )}

            {/* To Date Picker */}
            {showToPicker && (
                <DateTimePicker
                    value={toDate}
                    mode="date"
                    display="default"
                    onChange={onChangeTo}
                />
            )}

        </View>
    )
}

export default FilterDate