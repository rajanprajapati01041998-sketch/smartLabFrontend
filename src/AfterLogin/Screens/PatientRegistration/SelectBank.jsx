import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import React, { useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { allBankList } from './services/doctorService'

const SelectBank = ({ onSelectBankItem, onClose }) => {
    const [allBankListData, setAllBankListData] = useState([])

    const allActiveBankList = async () => {
        try {
            const response = await allBankList()
            console.log("bank list", response)
            setAllBankListData(response)
        } catch (error) {
            console.log('error bank', error)
        }
    }

    useFocusEffect(
        useCallback(() => {
            allActiveBankList()
        }, [])
    )

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => {
                onSelectBankItem(item)   // send selected bank
                onClose()                // close modal/screen
            }}
            style={{
                padding: 15,
                borderBottomWidth: 1,
                borderColor: '#ddd'
            }}
        >
            <Text>{item.bankName}</Text>
        </TouchableOpacity>
    )

    return (
        <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', padding: 10 }}>
                Select Bank
            </Text>

            <FlatList
                data={allBankListData}
                keyExtractor={(item) => item.bankId.toString()}
                renderItem={renderItem}
            />
        </View>
    )
}

export default SelectBank