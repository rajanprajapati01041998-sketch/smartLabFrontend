import { View, Text, ScrollView, TouchableOpacity, Platform, Modal, TouchableWithoutFeedback, useWindowDimensions } from 'react-native'
import React, { useState } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import tw from 'twrnc'
import DashboardAddFund from './DashboardAddFund'
import { get } from 'react-native/Libraries/NativeComponent/NativeComponentRegistry'
import { getThemeStyles } from '../../../utils/themeStyles'
import { useTheme } from '../../../../Authorization/ThemeContext'

const DashboardPaymentColloection = ({ selectedBranches }) => {
    const [modalVisible, setModalVisible] = useState(false)
    console.log('selected branch', selectedBranches)
    const { width, height } = useWindowDimensions()
    const isLargeScreen = width > 600
    const { theme } = useTheme()
    const themed = getThemeStyles(theme)


    return (
        <View style={[]}>
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
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={[themed.modalOverlay, tw`flex-1 justify-center items-center p-4`]}>
                    {/* Backdrop */}
                    <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                        <View style={tw`absolute inset-0`} />
                    </TouchableWithoutFeedback>

                    {/* Modal Content */}
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <View
                            style={[themed.modalContainer,
                            tw` rounded-3xl shadow-xl overflow-hidden p-4`,
                            isLargeScreen ? tw`w-[500px] h-[30%]` : tw`w-full h-[35%]`,
                            ]}
                         >
                            {/* Modal Header */}
                            <View style={themed.modalHeader}>
                                <Text style={themed.modalHeaderTitle}>
                                    Add Funds
                                </Text>

                                <TouchableOpacity
                                    onPress={() => setModalVisible(false)}
                                    style={tw`w-8 h-8 rounded-full bg-gray-100 items-center justify-center`}
                                >
                                    <Icon name="close" size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>


                            <DashboardAddFund onClose={() => setModalVisible(false)} />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </Modal>
        </View>
    )
}

export default DashboardPaymentColloection