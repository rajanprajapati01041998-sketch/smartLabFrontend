import { View, Text } from 'react-native'
import React from 'react'
import tw from 'twrnc';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';


const GobakHandler = () => {

    const navigation = useNavigation();

    return (
        <View style={tw``}>
            <Ionicons
                onPress={() => navigation.goBack()}
                name='chevron-back-circle-outline' size={36} color={'#000'} />
        </View>
    )
}

export default GobakHandler