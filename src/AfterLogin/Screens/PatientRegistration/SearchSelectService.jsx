import React, { useState, useEffect } from 'react';
import { searchInvestigation } from './services/doctorService';
import Icon from "react-native-vector-icons/Feather"; // or Ionicons
import tw from 'twrnc';
import {
    View,
    Text,
    TouchableOpacity,
    Pressable,
    FlatList,
    ActivityIndicator,
    TextInput,
    Keyboard,
} from 'react-native';

import SearchSelectServiceItem from './SearchSelectServiceItem';
import { useAuth } from '../../../../Authorization/AuthContext';
import { useToast } from '../../../../Authorization/ToastContext';
import styles from '../../../utils/InputStyle';
import { useTheme } from '../../../../Authorization/ThemeContext';
import { getThemeStyles } from '../../../utils/themeStyles';

const SearchSelectService = ({ onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const { serviceItem } = useAuth()
    const { showToast } = useToast()
    const { theme } = useTheme()
    const themed = getThemeStyles(theme)
    const [isDirty, setIsDirty] = useState(false);

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
        Keyboard.dismiss();
        setSelectedServices((prev) => {
            const exists = prev.find(i => i.itemId === item.itemId);
            if (exists) {
                showToast('This service is already selected.', 'warning')
                // Alert.alert('Already Selected', 'This service is already selected.');
                return prev;
            }

            // Any NEW selection means footer needs Add Tests again.
            setIsDirty(true);
            return [...prev, item];
        });
        setModalVisible(true);
    };

    // 🔹 DELETE
    const handleDelete = (item) => {
        setSelectedServices(prev =>
            prev.filter(i => i.itemId !== item.serviceItemId)
        );

        // If user deletes/changes, require Add Tests again.
        setIsDirty(true);
    };

    const showNext = Boolean(serviceItem?.Services?.length > 0 && !isDirty);

    return (
        <View style={[themed.childScreen,tw`flex-1  relative`]}>
            {/* Drag Handle */}
            <View style={tw`px-4 pt-3`}>
                <View style={tw`w-12 h-1 bg-gray-300 self-center mb-3 rounded-full`} />
            </View>

            {/* 🔍 Search */}
            <View style={themed.searchContainer}>
                <View style={themed.searchBox}>
                    <Icon name="search" size={18} color={themed.iconColor} />

                    <TextInput
                        placeholder="Search Investigation..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={themed.searchInput}
                        placeholderTextColor={themed.placeholderColor}
                    />
                </View>
            </View>

            {/* 🔄 Loader */}
            {loading && <ActivityIndicator size="large" />}

            {/* 📋 Results */}
            <FlatList
                data={results}
                keyExtractor={(item, index) => String(item?.itemId ?? item?.serviceItemId ?? item?.id ?? index)}
                style={tw`flex-1`}
                contentContainerStyle={tw`px-4 pt-3 pb-6`}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                keyboardDismissMode="on-drag"
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handleSelectItem(item)}
                        style={[themed.childScreen, themed.border,tw`p-3 mb-2   rounded`]}
                    >
                        <Text style={themed.inputText}>{item?.name}</Text>
                    </TouchableOpacity>
                )}
            />

            <View style={tw`px-4`}>
                <TouchableOpacity
                    onPress={onClose}
                    style={[styles.closeButton, tw` `]}
                >
                    <Text style={tw`text-white text-center font-semibold`}>
                        Close
                    </Text>
                </TouchableOpacity>
            </View>

            {/* iOS: avoid nested native Modals (Registration already renders this inside a Modal) */}
            {modalVisible && (
                <View style={tw`absolute inset-0 justify-end`}>
                    <Pressable style={tw`absolute inset-0 bg-black/40`} onPress={() => setModalVisible(false)} />
                    <View style={[themed.childScreen,tw`w-full h-full rounded-t-3xl pt-3 px-4`]}>
                        <View style={tw`w-12 h-1 bg-gray-300 self-center mb-3 rounded-full`} />

                        <View style={tw`flex-1`}>
                            <SearchSelectServiceItem
                                data={selectedServices}
                                onDelete={handleDelete}
                                isDirty={isDirty}
                                onDirtyChange={setIsDirty}
                                onSaved={() => setIsDirty(false)}
                            />
                        </View>

                        <View style={tw`pb-4 pt-2`}>
                            <View style={tw`flex-row gap-3`}>
                                <TouchableOpacity
                                    style={tw`flex-1 bg-blue-300 border border-blue-200 py-3 rounded-full`}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={tw`text-blue-500 text-center font-medium`}>
                                        Select Another
                                    </Text>
                                </TouchableOpacity>

                                {showNext && (
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
                </View>
            )}
        </View>
    );
};

export default SearchSelectService;
