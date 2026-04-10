import { View, Text, ScrollView, TouchableOpacity, Platform, Modal, TouchableWithoutFeedback, useWindowDimensions } from 'react-native'
import React, { useState } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import tw from 'twrnc'
import DashboardAddFund from './DashboardAddFund'

const DashboardPaymentColloection = ({ selectedBranches }) => {
    const [modalVisible, setModalVisible] = useState(false)
    console.log('selected branch', selectedBranches)
    const { width, height } = useWindowDimensions()
    const isLargeScreen = width > 600

    

    

    return (
        <View style={tw``}>
            <View style={tw`flex-row justify-end py-1`}>
                <TouchableOpacity
                    style={tw`bg-blue-500 flex-row items-center px-4 py-2.5 rounded-lg `}
                    activeOpacity={0.8}
                    onPress={() => setModalVisible(true)}
                >
                    <Icon
                        name={Platform.OS === 'ios' ? 'plus-circle' : 'plus-circle'}
                        size={18}
                        color="#fff"
                    />
                    <Text style={tw`text-white font-semibold text-sm ml-2`}>
                        Add Fund
                    </Text>
                </TouchableOpacity>
            </View>


            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                statusBarTranslucent={true}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={tw`flex-1 bg-black/50 justify-center items-center p-4`}>
                        <View style={[
                            tw`bg-white rounded-3xl shadow-xl overflow-hidden`,
                            isLargeScreen ? tw`w-[500px] max-h-[80%]` : tw`w-full max-h-[85%]`
                        ]}>
                            {/* Modal Header */}
                            <View style={tw`flex-row justify-between items-center p-4 border-b border-gray-100`}>
                                <Text style={tw`text-xl font-bold text-gray-800`}>
                                    Add Funds
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setModalVisible(false)}
                                    style={tw`w-8 h-8 rounded-full bg-gray-100 items-center justify-center`}
                                >
                                    <Icon name="close" size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            <View style={tw`p-4`}>
                                <DashboardAddFund onClose={()=>setModalVisible(false)} />
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    )
}

export default DashboardPaymentColloection