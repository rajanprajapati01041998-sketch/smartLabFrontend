import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  useWindowDimensions,
} from 'react-native'
import React, { useState } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import tw from 'twrnc'
import DashboardAddFund from './DashboardAddFund'
import { getThemeStyles } from '../../../utils/themeStyles'
import { useTheme } from '../../../../Authorization/ThemeContext'

const DashboardPaymentColloection = ({ selectedBranches }) => {
  const [modalVisible, setModalVisible] = useState(false)

  console.log('selected branch', selectedBranches)

  const { width } = useWindowDimensions()
  const isLargeScreen = width > 600
  const { theme } = useTheme()
  const themed = getThemeStyles(theme)

  return (
    <View>
      <View style={tw`flex-row justify-end py-1`}>
        <TouchableOpacity
          style={[themed.addButton]}
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="plus-circle" size={18} color="#fff" />
          <Text style={[themed.addButtonText]}>
            Add Fund
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={themed.modalOverlay}>
          {/* Backdrop */}
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={tw`absolute inset-0`} />
          </TouchableWithoutFeedback>

          {/* Center Wrapper */}
          <View style={tw`flex-1 justify-center items-center p-4`}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                style={[
                  themed.modalContainer,
                  tw`rounded-3xl overflow-hidden shadow-xl`,
                  isLargeScreen ? tw`w-[500px]` : tw`w-full`,
                  {
                    maxHeight: '85%',
                    minHeight: 260,
                  },
                ]}
              >
                {/* Header */}
                <View style={themed.modalHeader}>
                  <Text style={themed.modalHeaderTitle}>Add Funds</Text>

                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={[
                      themed.modalCloseButton,
                      tw`w-8 h-8 items-center justify-center`,
                    ]}
                  >
                    <Icon
                      name="close"
                      size={20}
                      color={theme === 'dark' ? '#D1D5DB' : '#6B7280'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Body */}
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    padding: 16,
                    paddingBottom: 20,
                  }}
                >
                  <DashboardAddFund onClose={() => setModalVisible(false)} />
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default DashboardPaymentColloection