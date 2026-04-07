import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native'
import React, { useCallback, useState, useEffect } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { allBankList } from './services/doctorService'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import tw from 'twrnc'

const SelectBank = ({ onSelectBankItem = () => {}, onClose = () => {} }) => {
    const [allBankListData, setAllBankListData] = useState([])
    const [filteredBankList, setFilteredBankList] = useState([])
    const [searchQuery, setSearchQuery] = useState('')

    const allActiveBankList = async () => {
        try {
            const response = await allBankList()
            console.log("bank list", response)
            setAllBankListData(response)
            setFilteredBankList(response)
        } catch (error) {
            console.log('error bank', error)
        }
    }

    useFocusEffect(
        useCallback(() => {
            allActiveBankList()
        }, [])
    )

    // Filter banks based on search query
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredBankList(allBankListData)
        } else {
            const filtered = allBankListData.filter(bank => 
                bank.bankName?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setFilteredBankList(filtered)
        }
    }, [searchQuery, allBankListData])

    // Get initials from bank name
    const getInitials = (bankName) => {
        if (!bankName) return '??'
        const words = bankName.split(' ')
        if (words.length === 1) {
            return bankName.substring(0, 2).toUpperCase()
        }
        return (words[0][0] + words[1][0]).toUpperCase()
    }

    // Get random pastel color based on bank name
    const getAvatarColor = (bankName) => {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
            '#F8C471', '#A9DFBF', '#F9E79F', '#D7BDE2', '#F5B7B1'
        ]
        let hash = 0
        for (let i = 0; i < bankName.length; i++) {
            hash = bankName.charCodeAt(i) + ((hash << 5) - hash)
        }
        const index = Math.abs(hash) % colors.length
        return colors[index]
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => {
                onSelectBankItem(item)
                onClose()
            }}
            style={tw`flex-row items-center p-4 border-b border-gray-100 bg-white`}
            activeOpacity={0.7}
        >
            {/* Avatar Circle */}
            <View 
                style={[
                    tw`w-12 h-12 rounded-full items-center justify-center mr-3`,
                    { backgroundColor: getAvatarColor(item.bankName) + '20' }
                ]}
            >
                <Text 
                    style={[
                        tw`text-base font-semibold`,
                        { color: getAvatarColor(item.bankName) }
                    ]}
                >
                    {getInitials(item.bankName)}
                </Text>
            </View>

            {/* Bank Info */}
            <View style={tw`flex-1`}>
                <View style={tw`flex-row items-center`}>
                    <Icon name="bank" size={14} color="#545557" />
                    <Text style={tw`text-base font-semibold  ml-1`}>
                        {item.bankName}
                    </Text>
                </View>
            </View>

            {/* Chevron Icon */}
            <Icon name="chevron-right" size={20} color="#D1D5DB" />
        </TouchableOpacity>
    )

    return (
        <View style={tw`flex-1 bg-gray-50`}>
            {/* Search Bar */}
            <View style={tw`px-4 pb-2 bg-white`}>
                <View style={tw`flex-row items-center border border-gray-200 rounded-lg px-3 `}>
                    <Icon name="magnify" size={20} color="#9CA3AF" />
                    <TextInput
                        style={tw`flex-1 ml-2 text-base text-gray-800`}
                        placeholder="Search by bank name..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icon name="close-circle" size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Bank List */}
            {filteredBankList.length > 0 ? (
                <FlatList
                    data={filteredBankList}
                    keyExtractor={(item) => item.bankId?.toString() || item.bankName}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={tw`bg-white`}
                />
            ) : (
                <View style={tw`flex-1 items-center justify-center py-10`}>
                    <Icon name="bank-off" size={60} color="#D1D5DB" />
                    <Text style={tw`text-base text-gray-400 mt-3`}>
                        No banks found
                    </Text>
                    <Text style={tw`text-sm text-gray-400 mt-1`}>
                        Try searching with a different name
                    </Text>
                </View>
            )}
        </View>
    )
}

export default SelectBank