import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import CustomStyles from '../../../../Custom.styles';
import DateTimePicker from '@react-native-community/datetimepicker';
import GoBackHandler from '../../../GobakHandler';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../../Authorization/ThemeContext';

const PatientInformation = () => {
    const [selectedTab, setSelectedTab] = useState('All');
    const [fromDate, setFromDate] = useState('19-Feb-2026');
    const [toDate, setToDate] = useState('19-Feb-2026');
    const navigation = useNavigation();
    const { pageBackground } = useTheme();
    // Calendar state
    const [showFromCalendar, setShowFromCalendar] = useState(false);
    const [showToCalendar, setShowToCalendar] = useState(false);
    const [selectedFromDate, setSelectedFromDate] = useState(new Date(2026, 1, 19)); // Feb 19, 2026
    const [selectedToDate, setSelectedToDate] = useState(new Date(2026, 1, 19)); // Feb 19, 2026
    const [modalVisible, setModalVisible] = useState(false);
    const [activeDateField, setActiveDateField] = useState(null); // 'from' or 'to'

    const tabs = [
        { id: 'All', label: 'All' },
        { id: 'Full Paid', label: 'Full Paid' },
        { id: 'Partial Paid', label: 'Partial Paid' },
        { id: 'Fully Unpaid', label: 'Fully Unpaid' },
        { id: 'Credit', label: 'Credit' },
    ];

    const tableHeaders = [
        '#', 'Bill Date', 'Lab No', 'Barcode', 'UHID', 'Patient Name',
        'Age/Gender', 'Mobile', 'Client Name', 'Gross Amt', 'Disc.',
        'Net Amt', 'Paid Amt', 'Balance Amt', 'User', 'Discount Reason',
        'Edit Info.', 'Edit Reg.', 'Bill Settlement', 'Test Refund',
        'Discount After Bill', 'Change'
    ];

    // Format date to DD-MMM-YYYY (e.g., 19-Feb-2026)
    const formatDate = (date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = date.getDate().toString().padStart(2, '0');
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleFromDatePress = () => {
        if (Platform.OS === 'android') {
            setShowFromCalendar(true);
        } else {
            setActiveDateField('from');
            setModalVisible(true);
        }
    };

    const handleToDatePress = () => {
        if (Platform.OS === 'android') {
            setShowToCalendar(true);
        } else {
            setActiveDateField('to');
            setModalVisible(true);
        }
    };

    const onFromDateChange = (event, selectedDate) => {
        setShowFromCalendar(false);
        if (selectedDate) {
            setSelectedFromDate(selectedDate);
            setFromDate(formatDate(selectedDate));
        }
    };

    const onToDateChange = (event, selectedDate) => {
        setShowToCalendar(false);
        if (selectedDate) {
            setSelectedToDate(selectedDate);
            setToDate(formatDate(selectedDate));
        }
    };

    const handleModalDateSelect = (date) => {
        if (activeDateField === 'from') {
            setSelectedFromDate(date);
            setFromDate(formatDate(date));
        } else if (activeDateField === 'to') {
            setSelectedToDate(date);
            setToDate(formatDate(date));
        }
        setModalVisible(false);
    };

    // Custom Calendar Modal for iOS
    const CalendarModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={tw`flex-1 justify-end bg-black bg-opacity-50`}>
                <View style={tw`bg-white rounded-t-3xl p-5`}>
                    <View style={tw`flex-row justify-between items-center mb-5`}>
                        <Text style={tw`text-lg font-semibold text-gray-800`}>
                            Select {activeDateField === 'from' ? 'From' : 'To'} Date
                        </Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Icon name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                    
                    <DateTimePicker
                        value={activeDateField === 'from' ? selectedFromDate : selectedToDate}
                        mode="date"
                        display="spinner"
                        onChange={(event, date) => {
                            if (date) {
                                handleModalDateSelect(date);
                            }
                        }}
                        style={tw`h-40`}
                    />
                    
                    <View style={tw`flex-row justify-end mt-5`}>
                        <TouchableOpacity
                            style={tw`px-4 py-2 mr-2`}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={tw`text-gray-600`}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={tw`bg-blue-600 px-4 py-2 rounded-lg`}
                            onPress={() => {
                                // Confirm selection - the onChange handler already updates
                                setModalVisible(false);
                            }}
                        >
                            <Text style={tw`text-white font-semibold`}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={tw`flex-1 bg-[${pageBackground}] `}>
            <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
                {/* Search Filters Card */}
                <GoBackHandler
                    style={tw`mx-2 mt-2`}
                    onPress={() => navigation.goBack()}
                />
                <View style={tw`  p-4  border-b border-gray-200`}>
                    <Text style={tw`text-lg font-semibold text-gray-800 mb-3`}>Search Filters</Text>

                    {/* First Row */}
                    <View style={tw`flex-row flex-wrap gap-3 mb-3`}>
                        {/* UHID Input */}
                        <View style={tw`flex-1 min-w-36`}>
                            <Text style={tw`text-xs text-gray-500 mb-1`}>UHID</Text>
                            <TextInput
                                style={[CustomStyles.input, tw`text-sm`]}
                                placeholder="Enter UHID"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        {/* Barcode Input */}
                        <View style={tw`flex-1 min-w-48`}>
                            <Text style={tw`text-xs text-gray-500 mb-1`}>Barcode</Text>
                            <TextInput
                                style={[CustomStyles.input, tw`text-sm`]}
                                placeholder="Enter Barcode No & Press Enter to Search"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

                    {/* Second Row */}
                    <View style={tw`flex-row flex-wrap gap-3 mb-3`}>
                        {/* Client/Panel */}
                        <View style={tw`flex-1 min-w-36`}>
                            <Text style={tw`text-xs text-gray-500 mb-1`}>Client/Panel</Text>
                            <TouchableOpacity style={[tw`border border-gray-300 rounded-lg p-2 flex-row justify-between items-center`, CustomStyles.input]}>
                                <Text style={tw`text-sm text-gray-700`}>All selected (4)</Text>
                                <Icon name="chevron-down" size={18} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Status */}
                        <View style={tw`flex-1 min-w-36`}>
                            <Text style={tw`text-xs text-gray-500 mb-1`}>Status</Text>
                            <TouchableOpacity style={[CustomStyles.input, tw`flex-row justify-between items-center`]}>
                                <Text style={tw`text-sm text-gray-700`}>All</Text>
                                <Icon name="chevron-down" size={18} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Patient Name */}
                        <View style={tw`flex-1 min-w-36`}>
                            <Text style={tw`text-xs text-gray-500 mb-1`}>Patient Name</Text>
                            <TextInput
                                style={[CustomStyles.input, tw`text-sm`]}
                                placeholder="Enter Patient Name"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

                    {/* Third Row */}
                    <View style={tw`flex-row flex-wrap gap-3 mb-3`}>
                        {/* Lab No */}
                        <View style={tw`flex-1 min-w-36`}>
                            <Text style={tw`text-xs text-gray-500 mb-1`}>Lab No</Text>
                            <TextInput
                                style={[CustomStyles.input, tw`text-sm`]}
                                placeholder="Enter Lab No"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        {/* From Date */}
                        <View style={tw`flex-1 min-w-32`}>
                            <Text style={tw`text-xs text-gray-500 mb-1`}>From Date</Text>
                            <TouchableOpacity 
                                style={[tw`border border-gray-300 rounded-lg p-2 flex-row justify-between items-center`, CustomStyles.input]}
                                onPress={handleFromDatePress}
                            >
                                <Text style={tw`text-sm text-gray-700`}>{fromDate}</Text>
                                <Icon name="calendar-outline" size={18} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {/* To Date */}
                        <View style={tw`flex-1 min-w-32`}>
                            <Text style={tw`text-xs text-gray-500 mb-1`}>To Date</Text>
                            <TouchableOpacity 
                                style={[tw`border border-gray-300 rounded-lg p-2 flex-row justify-between items-center`, CustomStyles.input]}
                                onPress={handleToDatePress}
                            >
                                <Text style={tw`text-sm text-gray-700`}>{toDate}</Text>
                                <Icon name="calendar-outline" size={18} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Search Button */}
                        <View style={tw`mt-5`}>
                            <TouchableOpacity style={[tw`bg-blue-600 px-6 py-4 rounded-lg flex-row items-center`]}>
                                <Icon name="search" size={18} color="white" />
                                <Text style={tw`text-white font-semibold ml-2`}>Search</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Tabs */}
                <View style={tw`bg-white mt-2 rounded-t-lg border-b border-gray-200`}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={tw`flex-row`}>
                            {tabs.map((tab) => (
                                <TouchableOpacity
                                    key={tab.id}
                                    style={tw`px-6 py-3 ${selectedTab === tab.id ? 'border-b-2 border-blue-600' : ''}`}
                                    onPress={() => setSelectedTab(tab.id)}
                                >
                                    <Text style={tw`${selectedTab === tab.id ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>
                                        {tab.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Table */}
                <View style={tw`bg-white mx-2 rounded-b-lg shadow-sm mb-4`}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                        <View>
                            {/* Table Header */}
                            <View style={tw`flex-row bg-gray-100 border-b border-gray-300`}>
                                {tableHeaders.map((header, index) => (
                                    <View
                                        key={index}
                                        style={tw`p-3 ${index === 0 ? 'w-12' : 'w-28'} justify-center`}
                                    >
                                        <Text style={tw`text-xs font-semibold text-gray-700`} numberOfLines={2}>
                                            {header}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {/* Table Body - Empty State */}
                            <View style={tw`h-40 items-center justify-center`}>
                                <Icon name="document-text-outline" size={40} color="#D1D5DB" />
                                <Text style={tw`text-gray-400 mt-2`}>No data available</Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </ScrollView>

            {/* Android Date Pickers */}
            {showFromCalendar && (
                <DateTimePicker
                    value={selectedFromDate}
                    mode="date"
                    display="default"
                    onChange={onFromDateChange}
                />
            )}
            {showToCalendar && (
                <DateTimePicker
                    value={selectedToDate}
                    mode="date"
                    display="default"
                    onChange={onToDateChange}
                />
            )}

            {/* iOS Calendar Modal */}
            <CalendarModal />
        </View>
    );
};

export default PatientInformation;