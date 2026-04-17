import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native'
import React, { useCallback, useState } from 'react'
import api from '../../../../Authorization/api'
import { useAuth } from '../../../../Authorization/AuthContext'
import { useFocusEffect, useRoute } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import tw from 'twrnc'
import DashboardPaymentColloection from './DashboardPaymentColloection'
import DashboardPaymentHistory from './DashboardPaymentHistory'
import { useDash } from '../../../../Authorization/DashContext'
import { useTheme } from '../../../../Authorization/ThemeContext'

const DashboardPayment = () => {
  const { loginBranchId, userId } = useAuth()
  const { walletData } = useDash()
  const { theme } = useTheme()

  const route = useRoute()
  const data = route?.params?.data ?? null

  const [branchList, setBranchList] = useState([])
  const [summaryData, setSummaryData] = useState([])
  const [selectedBranches, setSelectedBranches] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [dashboardSummary, setDashboardSummary] = useState({
    totalLimit: 0,
    usedLimit: 0,
    remaining: 0,
    balance: 0,
  })

  useFocusEffect(
    useCallback(() => {
      if (loginBranchId && userId) {
        getAllActiveBranch(loginBranchId, userId)
      }
    }, [loginBranchId, userId])
  )

  const getAllActiveBranch = async (branchId, userId) => {
    try {
      const response = await api.get(
        `Branch/branch-user-list?branchId=${branchId}&userId=${userId}`
      )

      console.log('Branch List Response:', response?.data || response)

      const branches = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
        ? response.data
        : []

      setBranchList(branches)
      setSelectedBranches(branches)
    } catch (error) {
      console.log('API error', error)
      setBranchList([])
      setSelectedBranches([])
    }
  }

  const handleSelect = item => {
    const exists = selectedBranches.some(b => b.BranchId === item.BranchId)

    if (exists) {
      setSelectedBranches(prev =>
        prev.filter(b => b.BranchId !== item.BranchId)
      )
    } else {
      setSelectedBranches(prev => [...prev, item])
    }
  }

  const handleSelectAll = () => {
    if (selectedBranches.length === branchList.length) {
      setSelectedBranches([])
    } else {
      setSelectedBranches([...branchList])
    }
  }

  const getSelectedText = () => {
    if (selectedBranches.length === 0) return 'Select Branch'
    if (selectedBranches.length === branchList.length) {
      return `${selectedBranches.length} Branches Selected`
    }
    if (selectedBranches.length === 1) return selectedBranches[0]?.BranchName
    return `${selectedBranches.length} Branches Selected`
  }

  const getSelectedCount = () => {
    if (selectedBranches.length === 0) return ''
    if (selectedBranches.length === branchList.length) return ' (All)'
    return ` (${selectedBranches.length})`
  }

  const StatCard = ({ title, value, icon, bgColor, textColor, iconColor }) => (
    <View
      style={tw`bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 flex-1 mx-1`}
    >
      <View style={tw`flex-row justify-between items-start mb-2`}>
        <Text style={tw`text-xs text-gray-500 dark:text-gray-300 font-medium`}>{title}</Text>
        <View
          style={[
            tw`w-8 h-8 rounded-full items-center justify-center`,
            { backgroundColor: bgColor },
          ]}
        >
          <Icon name={icon} size={16} color={iconColor} />
        </View>
      </View>
      <Text style={[tw`text-lg font-bold`, { color: textColor }]}>
        ₹ {typeof value === 'number' ? value.toLocaleString('en-IN') : value ?? 0}
      </Text>
    </View>
  )

  return (
    <ScrollView style={tw`flex-1 bg-gray-50 dark:bg-gray-900`}>
      <View style={tw`px-4 py-3`}>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={tw`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex-row justify-between items-center shadow-sm mb-4`}
          activeOpacity={0.7}
        >
          <View style={tw`flex-row items-center flex-1`}>
            <View
              style={tw`w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3`}
            >
              <Icon name="bank" size={20} color="#3B82F6" />
            </View>
            <View style={tw`flex-1`}>
              <View style={tw`flex-row items-center gap-2 mb-0.5`}>
                <Text style={tw`text-gray-500 dark:text-gray-300 text-xs font-medium`}>
                  Dashboard View
                </Text>
                <View style={tw`bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded-full`}>
                  <Text style={tw`text-gray-600 dark:text-gray-300 text-xs font-medium`}>
                    Total: {branchList.length}
                  </Text>
                </View>
              </View>
              <Text
                style={tw`text-gray-800 dark:text-gray-100 text-base font-semibold`}
                numberOfLines={1}
              >
                {getSelectedText()}
              </Text>
            </View>
          </View>
          <Icon name="chevron-down" size={24} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
        </TouchableOpacity>

        <View style={tw`mb-3`}>
          <Text style={tw`text-lg font-bold text-gray-800 dark:text-gray-100`}>
            Dashboard Overview
          </Text>
          <View style={tw`flex-row items-center mt-1`}>
            <View style={tw`bg-blue-500 rounded-full px-2 py-0.5 mr-2`}>
              <Text style={tw`text-white text-xs font-medium`}>
                {selectedBranches.length} Branches
              </Text>
            </View>
            <Text style={tw`text-xs text-gray-500 dark:text-gray-300`}>
              {selectedBranches.length === branchList.length
                ? '(All selected)'
                : `${selectedBranches.length} of ${branchList.length} selected`}
            </Text>
          </View>
        </View>

        <View style={tw`mb-4`}>
          <View style={tw`flex-row mb-2`}>
            <StatCard
              title="Your Balance"
              value={
                walletData?.balanceMain > 0
                  ? `+${walletData.balanceMain}`
                  : walletData?.balanceMain ?? 0
              }
              icon="wallet"
              bgColor="#f4bbb7"
              textColor={walletData?.balanceMain > 0 ? '#057d05' : '#c53d28'}
              iconColor="#822608"
            />
            <StatCard
              title="Total Limit"
              value={walletData?.totalCredit ?? 0}
              icon="trending-up"
              bgColor="#abd5b9"
              textColor="#085f03"
              iconColor="#458746"
            />
          </View>
          <View style={tw`flex-row`}>
            <StatCard
              title="Used Limit"
              value={walletData?.totalDebit ?? 0}
              icon="progress-clock"
              bgColor="#ecf1b8"
              textColor="#816605"
              iconColor="#857803"
            />
            <StatCard
              title="Remaining limit"
              value={walletData?.balance ?? 0}
              icon="bank-transfer"
              bgColor="#f9dec3"
              textColor="#cd6d06"
              iconColor="#c28304"
            />
          </View>
        </View>

        <DashboardPaymentColloection selectedBranches={selectedBranches} />

        <DashboardPaymentHistory
          selectedBranches={selectedBranches}
          setSummaryData={setSummaryData}
        />
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={tw`flex-1 bg-black/50 justify-end`}>
            <TouchableWithoutFeedback>
              <View style={tw`bg-white rounded-t-3xl max-h-[80%]`}>
                <View
                  style={tw`flex-row justify-between items-center p-4 border-b border-gray-100`}
                >
                  <View>
                    <Text style={tw`text-xl font-bold text-gray-800`}>
                      Select Branches
                    </Text>
                    <View style={tw`flex-row items-center gap-2 mt-1`}>
                      <Text style={tw`text-sm text-gray-500`}>
                        Choose branches to view dashboard
                      </Text>
                      <View style={tw`bg-blue-100 px-2 py-0.5 rounded-full`}>
                        <Text style={tw`text-blue-600 text-xs font-medium`}>
                          {branchList.length} Total
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={tw`w-8 h-8 rounded-full bg-gray-100 items-center justify-center`}
                  >
                    <Icon name="close" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View style={tw`px-4 pb-2 pt-2`}>
                  <TouchableOpacity
                    onPress={handleSelectAll}
                    style={tw`flex-row items-center justify-between border border-blue-200 bg-white p-3 rounded-xl`}
                    activeOpacity={0.7}
                  >
                    <View style={tw`flex-row items-center`}>
                      <Icon
                        name={
                          selectedBranches.length === branchList.length &&
                          branchList.length > 0
                            ? 'checkbox-marked'
                            : 'checkbox-blank-outline'
                        }
                        size={22}
                        color={
                          selectedBranches.length === branchList.length &&
                          branchList.length > 0
                            ? '#3B82F6'
                            : '#9CA3AF'
                        }
                      />
                      <Text
                        style={tw`text-base font-semibold text-gray-800 ml-3`}
                      >
                        Select All Branches
                      </Text>
                    </View>
                    <View style={tw`bg-blue-500 rounded-full px-2 py-1`}>
                      <Text style={tw`text-white text-xs font-medium`}>
                        {branchList.length}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {selectedBranches.length > 0 &&
                  selectedBranches.length !== branchList.length && (
                    <View style={tw`px-4 pt-2 pb-1`}>
                      <Text style={tw`text-sm text-blue-600 font-medium`}>
                        ✓ {selectedBranches.length} branch
                        {selectedBranches.length > 1 ? 'es' : ''} selected
                      </Text>
                    </View>
                  )}

                <FlatList
                  data={branchList}
                  keyExtractor={item => item.BranchId.toString()}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={tw`pb-4`}
                  renderItem={({ item }) => {
                    const isSelected = selectedBranches.some(
                      b => b.BranchId === item.BranchId
                    )

                    return (
                      <TouchableOpacity
                        onPress={() => handleSelect(item)}
                        style={tw`flex-row items-center justify-between px-4 py-3 active:bg-gray-50`}
                        activeOpacity={0.7}
                      >
                        <View style={tw`flex-row items-center flex-1`}>
                          <View
                            style={tw`w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3`}
                          >
                            <Text style={tw`text-gray-600 font-semibold`}>
                              {item.BranchName?.charAt(0) || 'B'}
                            </Text>
                          </View>
                          <View style={tw`flex-1`}>
                            <Text
                              style={tw`text-gray-800 font-medium text-base`}
                            >
                              {item.BranchName}
                            </Text>
                          </View>
                        </View>

                        <View style={tw`ml-3`}>
                          <Icon
                            name={
                              isSelected ? 'check-circle' : 'circle-outline'
                            }
                            size={24}
                            color={isSelected ? '#3B82F6' : '#D1D5DB'}
                          />
                        </View>
                      </TouchableOpacity>
                    )
                  }}
                  ListEmptyComponent={() => (
                    <View style={tw`py-8 items-center`}>
                      <Text style={tw`text-gray-500 text-base`}>
                        No branches found
                      </Text>
                    </View>
                  )}
                />

                <View style={tw`p-4 border-t border-gray-100`}>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={tw`bg-blue-600 py-3 rounded-xl`}
                  >
                    <Text
                      style={tw`text-white text-center font-semibold text-base`}
                    >
                      Apply Filters
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  )
}

export default DashboardPayment
