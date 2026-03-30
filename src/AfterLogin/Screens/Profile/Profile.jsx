import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  KeyboardAvoidingView
} from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import tw from 'twrnc'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Icon2 from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  SlideInRight,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated'
import { useAuth } from '../../../../Authorization/AuthContext'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import styles from '../../../utils/InputStyle'

const { width, height } = Dimensions.get('window')

const Profile = () => {
  const { logout, userData } = useAuth()
  const navigation = useNavigation()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const [labname, setLabName] = useState("")
  const [userName, setUserName] = useState("")
  
  // Animation values
  const scaleValue = useSharedValue(1)
  const opacityValue = useSharedValue(1)

  useEffect(() => {
    setLabName(userData?.name || "")
    setUserName(userData?.userName || "")
  }, [userData])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    // Animate logout button
    scaleValue.value = withSpring(0.95, {}, () => {
      scaleValue.value = withSpring(1)
    })
    opacityValue.value = withTiming(0.8, { duration: 200 })
    
    setTimeout(async () => {
      await logout()
      setIsLoggingOut(false)
    }, 300)
  }

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
      opacity: opacityValue.value
    }
  })

  return (
    <View style={tw`flex-1 bg-gray-100`}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={tw`flex-1`}
      >
        {/* Header with animation */}
        <Animated.View 
          entering={FadeInDown.delay(100).springify()}
          style={tw`px-4 pt-4 pb-2 bg-white border-b border-gray-200`}
        >
          <View style={tw`flex-row justify-between items-center`}>
            <View>
              <Animated.Text
                entering={SlideInRight.delay(200)}
                style={[tw`text-gray-900 font-bold`, { fontSize: width * 0.03 }]}
                numberOfLines={1}
              >
                {labname || "Loading..."}
              </Animated.Text>

              <Animated.View 
                entering={FadeInUp.delay(300)}
                style={tw`flex-row items-center mt-1`}
               >
                <Icon2 name="shield-checkmark" size={16} color="#16a34a" />
                <Text style={tw`ml-1 text-green-600 text-sm font-medium`}>
                  Administrator
                </Text>
              </Animated.View>
            </View>
            
            <Animated.View 
              entering={ZoomIn.delay(150)}
              style={tw`bg-green-100 p-2 rounded-full`}
             >
              <Icon2 name="person-circle" size={20} color="#16a34a" />
            </Animated.View>
          </View>
        </Animated.View>

        <ScrollView 
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Card with staggered animations */}
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={[
              styles.cardShadow,
              tw`mx-4 mt-5 bg-white p-5 rounded-2xl`,
              { elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 } }
            ]}
           >
            {/* Profile Info Items */}
            {[
              { icon: "person", name: "User ID", value: userName, color: "#8b5cf6" },
              { icon: "wc", name: "Gender", value: userData?.gender, color: "#ec489a" },
              { icon: "cake", name: "Date of Birth", value: userData?.dob ? new Date(userData.dob).toLocaleDateString() : "", color: "#f59e0b" }
            ].map((item, index) => (
              <Animated.View
                key={item.name}
                entering={FadeInDown.delay(300 + index * 100)}
                style={tw`mb-2 ${index !== 3 ? 'border-b border-gray-100 pb-4' : ''}`}
              >
                <View style={tw`flex-row items-center `}>
                  <View style={[tw`p-1 rounded-lg`, { backgroundColor: `${item.color}10` }]}>
                    <Icon name={item.icon} size={20} color={item.color} />
                  </View>
                  <Text style={[tw`text-gray-500 ml-3 text-sm font-medium`, { letterSpacing: 0.5 }]}>
                    {item.name}
                  </Text>
                </View>
                <Text style={tw`text-gray-900 text-base ml-11 font-semibold`}>
                  {item.value || "Not specified"}
                </Text>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Login History Button with animation */}
          <Animated.View
            entering={FadeInDown.delay(500).springify()}
            style={tw`px-4 mt-4`}
          >
            <TouchableOpacity
              style={[styles.cardShadow, tw`p-4 bg-white rounded-2xl`, { elevation: 2 }]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('UserLoginHistory')}
            >
              <View style={tw`flex-row items-center`}>
                <Animated.View 
                  entering={ZoomIn.delay(550)}
                  style={tw`bg-blue-50 p-3 rounded-xl mr-4`}
                >
                  <MaterialIcons name="history" size={26} color="#3b82f6" />
                </Animated.View>

                <View style={tw`flex-1`}>
                  <Text style={tw`text-base font-semibold text-gray-800`}>
                    Login History
                  </Text>
                  <Text style={tw`text-xs text-gray-500 mt-1`}>
                    View and manage your login sessions
                  </Text>
                </View>

                <MaterialIcons name="chevron-right" size={28} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Additional Info Card (Optional) */}
          <Animated.View
            entering={FadeInDown.delay(600).springify()}
            style={tw`px-4 mt-4`}
          >
            <View style={[styles.cardShadow, tw`p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl`]}>
              <View style={tw`flex-row items-center`}>
                <Icon2 name="information-circle" size={24} color="#3b82f6" />
                <Text style={tw`ml-2 text-blue-800 font-medium`}>
                  Account Status
                </Text>
              </View>
              <View style={tw`flex-row items-center mt-2 ml-6`}>
                <View style={tw`w-2 h-2 bg-green-500 rounded-full mr-2`} />
                <Text style={tw`text-gray-700 text-sm`}>
                  Active • Verified Account
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Fixed Logout Button at Bottom */}
        <Animated.View
          entering={FadeInUp.delay(400).springify()}
          style={[
            tw`absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200`,
            { paddingHorizontal: 16, paddingVertical: 10, paddingBottom: Platform.OS === 'ios' ? 34 : 16 }
          ]}
         >
          <Animated.View style={animatedButtonStyle}>
            <TouchableOpacity
              style={[
                tw`bg-red-500 rounded-xl py-4 flex-row items-center justify-center`,
                isLoggingOut && tw`opacity-70`
              ]}
              onPress={handleLogout}
              disabled={isLoggingOut}
              activeOpacity={0.8}
             >
              <Animated.View
                entering={ZoomIn.delay(450)}
                style={tw`flex-row items-center`}
               >
                <Icon2 
                  name={isLoggingOut ? "hourglass-outline" : "log-out-outline"} 
                  size={22} 
                  color="white" 
                />
                <Text style={tw`text-white font-bold text-lg ml-2`}>
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  )
}

export default Profile