import React, { useState, useEffect } from 'react';
import { Searchbar } from 'react-native-paper';
import { searchInvestigation } from './services/doctorService';
import Icon from "react-native-vector-icons/Feather"; // or Ionicons
import tw from 'twrnc';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
    FlatList,
    ActivityIndicator,
    TextInput,
} from 'react-native';

import SearchSelectServiceItem from './SearchSelectServiceItem';
import { useAuth } from '../../../../Authorization/AuthContext';
import styles from '../../../utils/InputStyle';

const SearchSelectService = ({ onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const { serviceItem } = useAuth()

    // ✅ MULTI SELECT STATE
    const [selectedServices, setSelectedServices] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);

    // 🔹 API call
    const searchInvestigationService = async (query) => {
        try {
            setLoading(true);

            const response = await searchInvestigation(query);

            if (response?.success) {
                setResults(response.data);
            } else {
                setResults([]);
            }

        } catch (error) {
            console.error('Error:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Debounce
    useEffect(() => {
        const delay = setTimeout(() => {
            if (searchQuery.trim()) {
                searchInvestigationService(searchQuery);
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(delay);
    }, [searchQuery]);

    // 🔹 MULTI SELECT ADD
    const handleSelectItem = (item) => {
        setSelectedServices((prev) => {
            const exists = prev.find(i => i.itemId === item.itemId);
            if (exists) return prev;
            return [...prev, item];
        });

        setModalVisible(true);
    };

    // 🔹 DELETE
    const handleDelete = (item) => {
        setSelectedServices(prev =>
            prev.filter(i => i.itemId !== item.serviceItemId)
        );
    };

    return (
        <View style={tw`flex-1 bg-white`}>

            {/* 🔍 Search */}

            <View style={tw`flex-row items-center border border-gray-300 rounded-xl px-3 bg-white`}>

                {/* 🔍 ICON */}
                <Icon name="search" size={18} color="#6B7280" />

                {/* INPUT */}
                <TextInput
                    placeholder="Search Investigation..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={tw`flex-1 ml-2 py-3 text-base`}
                    placeholderTextColor="#9CA3AF"
                />

            </View>

            {/* 🔄 Loader */}
            {loading && <ActivityIndicator size="large" />}

            {/* 📋 Results */}
            <FlatList
                data={results}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={tw`p-3`}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handleSelectItem(item)}
                        style={tw`p-3 mb-2 bg-gray-100 rounded`}
                    >
                        <Text>{item?.name}</Text>
                    </TouchableOpacity>
                )}
            />

            {/* 📦 Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                {/* BACKDROP */}
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={tw`flex-1 justify-end bg-black/40`}>

                        {/* PREVENT CLOSE INSIDE */}
                        <TouchableWithoutFeedback onPress={() => { }}>

                            {/* 🔥 BOTTOM SHEET */}
                            <View style={tw`bg-white w-full h-[60%] rounded-t-3xl pt-3 px-4`}>

                                {/* 🔹 DRAG HANDLE */}
                                <View style={tw`w-12 h-1 bg-gray-300 self-center mb-3 rounded-full`} />

                                {/* 🔹 CONTENT */}
                                <View style={tw`flex-1`}>
                                    <SearchSelectServiceItem
                                        data={selectedServices}
                                        onDelete={handleDelete}
                                    />
                                </View>

                                {/* 🔹 FIXED FOOTER BUTTONS */}
                                <View style={tw`pb-4 pt-2`}>

                                    <View style={tw`flex-row gap-3`}>

                                        {/* Select Another */}
                                        <TouchableOpacity
                                            style={tw`flex-1 bg-blue-50 border border-blue-200 py-3 rounded-full`}
                                            onPress={() => setModalVisible(false)}
                                        >
                                            <Text style={tw`text-blue-500 text-center font-medium`}>
                                                Select Another
                                            </Text>
                                        </TouchableOpacity>

                                        {/* Next Button */}
                                        {serviceItem?.Services.length > 0 && (
                                            <TouchableOpacity
                                                style={tw`flex-1 bg-green-50 border border-green-400 py-3 rounded-full`}
                                                onPress={() => {
                                                    setModalVisible(false);
                                                    onClose();
                                                }}
                                            >
                                                <Text style={tw`text-green-500 text-center font-medium`}>
                                                    Next
                                                </Text>
                                            </TouchableOpacity>
                                        )}

                                    </View>

                                </View>

                            </View>

                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

export default SearchSelectService;