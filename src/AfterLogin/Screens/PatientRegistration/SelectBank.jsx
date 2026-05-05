import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
} from 'react-native';
import React, { useCallback, useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { allBankList } from './services/doctorService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import { useTheme } from '../../../../Authorization/ThemeContext';
import { getThemeStyles } from '../../../utils/themeStyles';

const SelectBank = ({ onSelectBankItem = () => { }, onClose = () => { } }) => {
    const [allBankListData, setAllBankListData] = useState([]);
    const [filteredBankList, setFilteredBankList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const { theme } = useTheme();
    const themed = getThemeStyles(theme);

    const allActiveBankList = async () => {
        try {
            const response = await allBankList();
            const list = Array.isArray(response) ? response : response?.data || [];
            setAllBankListData(list);
            setFilteredBankList(list);
        } catch (error) {
            console.log('error bank', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            allActiveBankList();
        }, []),
    );

    useEffect(() => {
        const q = searchQuery.trim().toLowerCase();

        if (!q) {
            setFilteredBankList(allBankListData);
            return;
        }

        const filtered = allBankListData.filter(bank =>
            String(bank?.bankName || '').toLowerCase().includes(q),
        );

        setFilteredBankList(filtered);
    }, [searchQuery, allBankListData]);

    const getInitials = bankName => {
        const words = String(bankName || '').trim().split(' ').filter(Boolean);

        if (words.length === 0) return '??';
        if (words.length === 1) return words[0].substring(0, 2).toUpperCase();

        return `${words[0][0]}${words[1][0]}`.toUpperCase();
    };

    const getAvatarColor = bankName => {
        const colors = [
            '#FF6B6B',
            '#4ECDC4',
            '#45B7D1',
            '#96CEB4',
            '#FFEAA7',
            '#DDA0DD',
            '#98D8C8',
            '#F7DC6F',
            '#BB8FCE',
            '#85C1E2',
            '#F8C471',
            '#A9DFBF',
            '#F9E79F',
            '#D7BDE2',
            '#F5B7B1',
        ];

        let hash = 0;
        const name = String(bankName || '');

        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        return colors[Math.abs(hash) % colors.length];
    };

    const renderBankItem = item => {
        const avatarColor = getAvatarColor(item?.bankName);

        return (
            <TouchableOpacity
                key={String(item?.bankId ?? item?.bankName)}
                onPress={() => {
                    onSelectBankItem(item);
                    onClose();
                }}
                activeOpacity={0.75}
                style={[
                    themed.globalCard || themed.childScreen,
                    themed.border,
                    tw`mx-4 mb-3 p-2 flex-row items-center`,
                ]}
            >
                <View
                    style={[
                        tw`w-8 h-8 rounded-full items-center justify-center mr-3`,
                        { backgroundColor: `${avatarColor}22` },
                    ]}
                >
                    <Text style={[tw`text-[8px]`, { color: avatarColor }]}>
                        {getInitials(item?.bankName)}
                    </Text>
                </View>

                <View style={tw`flex-1`}>
                    <View style={tw`flex-row items-center`}>

                        <Text
                            numberOfLines={2}
                            style={[themed.inputText, tw`text-base font-semibold ml-2`]}
                        >
                            {item?.bankName}
                        </Text>
                    </View>
                </View>

                <Icon name="chevron-right" size={24} color={themed.chevronColor} />
            </TouchableOpacity>
        );
    };

    return (
        <View style={[themed.childScreen, tw`flex-1 min-h-0`]}>
            <View style={tw`px-4 py-2`}>
                <View
                    style={[
                        themed.border,
                        tw`flex-row items-center rounded-xl px-3 border`,
                    ]}
                >
                    <Icon name="magnify" size={20} color={themed.chevronColor} />

                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search by bank name..."
                        placeholderTextColor={themed.inputPlaceholder}
                        style={[themed.inputText, tw`flex-1 ml-2 text-base `]}
                    />

                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icon name="close-circle" size={20} color={themed.chevronColor} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {filteredBankList.length > 0 ? (
                <ScrollView
                    style={tw`flex-1`}
                    contentContainerStyle={tw`pt-2 pb-6`}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {filteredBankList.map(renderBankItem)}
                </ScrollView>
            ) : (
                <View style={tw`flex-1 items-center justify-center px-4`}>
                    <Icon name="bank-off" size={56} color={themed.chevronColor} />

                    <Text style={[themed.inputText, tw`text-base mt-3`]}>
                        No banks found
                    </Text>

                    <Text style={[themed.labelText, tw`text-sm mt-1 text-center`]}>
                        Try searching with a different name
                    </Text>
                </View>
            )}
        </View>
    );
};

export default SelectBank;