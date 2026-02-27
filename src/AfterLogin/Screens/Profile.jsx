import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native'
import React, { useState } from 'react'
import tw from 'twrnc'
import CustomStyles from '../../../Custom.styles'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Icon2 from 'react-native-vector-icons/Ionicons'
import Icon3 from 'react-native-vector-icons/Feather'

const Profile = () => {
  const [labname, setLabName] = useState("Harshit Lab")
  const [contact, setContact] = useState("987563636")
  const [email, setEmail] = useState('harshi@gmail.com')
  const [userName, setUserName] = useState("surabhi labs")
  const [isEditing, setIsEditing] = useState(false)

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: () => console.log("Logged out"),
          style: 'destructive'
        }
      ]
    )
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. Are you sure you want to delete your account?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => console.log("Account deleted"),
          style: 'destructive'
        }
      ]
    )
  }

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      {/* Header with Gradient Effect */}
      <View style={tw`mt-2 px-3`}>
        <Text style={tw` text-xl font-bold`}>{labname}</Text>
        <View style={tw`flex-row items-center mt-1`}>
          <Icon2 name="shield-checkmark" size={16} color="#fbbf24" />
          <Text style={tw` ml-1 text-sm`}>Admin</Text>
        </View>
      </View>

      {/* Main Content */}

      {/* Profile Details Card */}
      <View style={tw`mx-4 mt-4`}>

        {/* Lab Name Field */}
        <View style={tw`mb-4`}>
          <View style={tw`flex-row items-center mb-1`}>
            <Icon2 name="business" size={18} color="#6b7280" />
            <Text style={tw`text-gray-600 ml-2 text-sm`}>Lab Name</Text>
          </View>
          <Text style={tw`text-gray-800 text-base ml-7`}>{labname}</Text>
        </View>

        {/* Contact Field */}
        <View style={tw`mb-4`}>
          <View style={tw`flex-row items-center mb-1`}>
            <Icon name="phone" size={18} color="#6b7280" />
            <Text style={tw`text-gray-600 ml-2 text-sm`}>Contact Number</Text>
          </View>
          <Text style={tw`text-gray-800 text-base ml-7`}>{contact}</Text>

        </View>

        {/* Email Field */}
        <View style={tw`mb-4`}>
          <View style={tw`flex-row items-center mb-1`}>
            <Icon name="email" size={18} color="#6b7280" />
            <Text style={tw`text-gray-600 ml-2 text-sm`}>Email ID</Text>
          </View>
          <Text style={tw`text-gray-800 text-base ml-7`}>{email}</Text>

        </View>

        {/* User ID Field */}
        <View style={tw`mb-2`}>
          <View style={tw`flex-row items-center mb-1`}>
            <Icon name="person" size={18} color="#6b7280" />
            <Text style={tw`text-gray-600 ml-2 text-sm`}>User ID</Text>
          </View>
          <Text style={tw`text-gray-800 text-base ml-7`}>{userName}</Text>

        </View>

        
      </View>

      {/* Account Settings Card */}


      {/* Danger Zone */}
      <View style={tw`mx-4 mt-4`}>
        <TouchableOpacity
          style={[tw`flex flex-row justify-center items-center`, CustomStyles.deleteAccountButton]}
          onPress={handleDeleteAccount}
         >
          <Icon name="delete" size={22} color="#ef4444" />
          <Text style={tw`text-red-600 ml-3`}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      {/* Extra bottom padding for logout button */}
      <View style={tw`h-20`} />


      {/* Logout Button at Bottom */}
      <View style={tw`absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg`}>
        <TouchableOpacity
          style={tw`bg-red-500 rounded-xl py-4 flex-row items-center justify-center shadow-md`}
          onPress={handleLogout}
        >
          <Icon2 name="log-out-outline" size={24} color="white" />
          <Text style={tw`text-white font-bold text-lg ml-2`}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
export default Profile