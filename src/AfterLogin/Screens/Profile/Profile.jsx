import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform
} from 'react-native'
import React, { useEffect, useState } from 'react'
import tw from 'twrnc'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Icon2 from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useAuth } from '../../../../Authorization/AuthContext'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import styles from '../../../utils/InputStyle'

const { width } = Dimensions.get('window')

const Profile = () => {
  const { logout, userData } = useAuth()
  const navigation = useNavigation()

  const [labname, setLabName] = useState("")
  const [userName, setUserName] = useState("")

  useEffect(() => {
    setLabName(userData?.name || "")
    setUserName(userData?.userName || "")
  }, [userData])

  const handleLogout = async () => {
    await logout()
  }

  return (
    <View style={tw`flex-1 bg-gray-100`}>
      {/* Scroll Content */}
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>

        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={tw`mt-4 px-4`}>
          <Text
            style={[tw`text-gray-900 font-bold`, { fontSize: width * 0.04 }]}
            numberOfLines={2}
          >
            {labname}
          </Text>

          <View style={tw`flex-row items-center mt-1`}>
            <Icon2 name="shield-checkmark" size={16} color="#16a34a" />
            <Text style={tw`ml-1 text-green-600 text-sm`}>
              Admin
            </Text>
          </View>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View
          entering={FadeInDown.delay(200)}
          style={[
            styles.cardShadow,
            tw`mx-2 mt-5 bg-white p-4 rounded-xl`,
            { elevation: 3 }
          ]}
        >

          {/* Lab Name */}
          <View style={tw`mb-4`}>
            <View style={tw`flex-row items-center mb-1`}>
              <Icon2 name="business" size={18} color="#6b7280" />
              <Text style={tw`text-gray-500 ml-2 text-sm`}>Lab Name</Text>
            </View>
            <Text style={tw`text-gray-900 text-base ml-7 font-medium`}>
              {labname}
            </Text>
          </View>

          {/* User ID */}
          <View style={tw`mb-4`}>
            <View style={tw`flex-row items-center mb-1`}>
              <Icon name="person" size={18} color="#6b7280" />
              <Text style={tw`text-gray-500 ml-2 text-sm`}>User ID</Text>
            </View>
            <Text style={tw`text-gray-900 text-base ml-7 font-medium`}>
              {userName}
            </Text>
          </View>

          {/* Gender */}
          <View style={tw`mb-4`}>
            <View style={tw`flex-row items-center mb-1`}>
              <Icon name="wc" size={18} color="#6b7280" />
              <Text style={tw`text-gray-500 ml-2 text-sm`}>Gender</Text>
            </View>
            <Text style={tw`text-gray-900 text-base ml-7 font-medium`}>
              {userData?.gender}
            </Text>
          </View>

          {/* DOB */}
          <View>
            <View style={tw`flex-row items-center mb-1`}>
              <Icon name="cake" size={18} color="#6b7280" />
              <Text style={tw`text-gray-500 ml-2 text-sm`}>Date of Birth</Text>
            </View>
            <Text style={tw`text-gray-900 text-base ml-7 font-medium`}>
              {userData?.dob
                ? new Date(userData.dob).toLocaleDateString()
                : ""}
            </Text>
          </View>

        </Animated.View>

        {/* Login History Button */}
        <View style={tw`px-2`}>
          <TouchableOpacity
            style={[styles.cardShadow, tw`p-4 mt-3 bg-white rounded-xl`]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('UserLoginHistory')}
          >
            <View style={tw`flex-row items-center`}>
              <View style={tw`bg-blue-50 p-2 rounded-lg mr-3`}>
                <MaterialIcons name="history" size={24} color="#3b82f6" />
              </View>

              <View style={tw`flex-1`}>
                <Text style={tw`text-base font-semibold text-gray-800`}>
                  Login History
                </Text>
                <Text style={tw`text-xs text-gray-500 mt-1`}>
                  View your login sessions
                </Text>
              </View>

              <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* 🔥 Fixed Logout Button */}
      <View
        style={[
          tw`absolute left-0 right-0 bg-white border-t border-gray-200 px-3 py-2`,
          { bottom: Platform.OS === 'ios' ? 20 : 10 }
        ]}
      >
        <TouchableOpacity
          style={tw`bg-red-500 rounded-xl py-4 flex-row items-center justify-center`}
          onPress={handleLogout}
        >
          <Icon2 name="log-out-outline" size={22} color="white" />
          <Text style={tw`text-white font-bold text-lg ml-2`}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  )
}

export default Profile