import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import tw from 'twrnc';
import CustomStyles from '../../../Custom.styles';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FilterDate from './FilterDate'
import { useNavigation } from '@react-navigation/native';


const LabDashboard = () => {
  const navigation = useNavigation()
  const [filetrModal, setFilterModal] = useState(false)
  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)
  // Stats data
  const stats = [
    { label: 'Registrations', value: '0' },
    { label: 'B2B Registrations', value: '0' },
    { label: 'Total Income', value: '₹0/-', highlight: true },
    { label: 'Tests', value: '0' },
    { label: 'Paid Amount', value: '₹0/-' },
    { label: 'Due Amount', value: '₹0/-' },
  ];

  const openFilterModal = () => {
    setFilterModal(true)
  }

  const handleSearchFilter = (data) => {

    console.log("From Date:", data.fromDate)
    console.log("To Date:", data.toDate)

    // Save in parent state
    setFromDate(data.fromDate)
    setToDate(data.toDate)

    // Close modal
    setFilterModal(false)

    // Call API or filter logic here
    // fetchData(data.fromDate, data.toDate)
  }

  return (
    <ScrollView style={tw` `}>
      {/* Header */}
      <View style={tw`bg-white px-4 pt-2 pb-4 border-b border-gray-200`}>
        <View style={tw`flex-row justify-between items-center`}>
          <View>
            <Text style={tw`text-xs text-gray-500`}>Welcome</Text>
            <Text style={tw`text-xl font-bold text-gray-800`}>Harshit</Text>
          </View>
          <View style={tw`flex-row gap2`}>
            <TouchableOpacity
              onPress={openFilterModal}
              style={[tw`flex-row items-center`, CustomStyles.filterButton]}>
              <MaterialIcons name="calendar-month" size={20} color="#4B5563" />
              <Text style={tw`text-gray-600 ml-2`}>Filter</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Profile")}
              style={[tw`flex-row items-center`, CustomStyles.filterButton]}>
              <MaterialIcons name="supervised-user-circle" size={20} color="#4B5563" />
              <Text style={tw`text-gray-600 ml-2`}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={tw`px-4 py-3`}>
        {/* Stats Grid */}
        <View style={tw`flex-row flex-wrap -mx-1`}>

          {/* Card 1 */}
          <View style={tw`w-1/2 px-1 mb-2`}>
            <View style={tw`bg-blue-50 rounded-lg p-3 shadow-sm border border-blue-200`}>
              <Text style={tw`text-xs text-blue-600 mb-1`}>Total Patients</Text>
              <Text style={tw`text-base font-bold text-blue-800`}>
                1250
              </Text>
            </View>
          </View>

          {/* Card 2 */}
          <View style={tw`w-1/2 px-1 mb-2`}>
            <View style={tw`bg-green-50 rounded-lg p-3 shadow-sm border border-green-200`}>
              <Text style={tw`text-xs text-green-600 mb-1`}>Total Reports</Text>
              <Text style={tw`text-base font-bold text-green-800`}>
                845
              </Text>
            </View>
          </View>

          {/* Card 3 */}
          <View style={tw`w-1/2 px-1 mb-2`}>
            <View style={tw`bg-yellow-50 rounded-lg p-3 shadow-sm border border-yellow-300`}>
              <Text style={tw`text-xs text-yellow-600 mb-1`}>Pending Reports</Text>
              <Text style={tw`text-base font-bold text-yellow-700`}>
                42
              </Text>
            </View>
          </View>

          {/* Card 4 */}
          <View style={tw`w-1/2 px-1 mb-2`}>
            <View style={tw`bg-red-50 rounded-lg p-3 shadow-sm border border-red-200`}>
              <Text style={tw`text-xs text-red-600 mb-1`}>Critical Alerts</Text>
              <Text style={tw`text-base font-bold text-red-700`}>
                8
              </Text>
            </View>
          </View>

          <View style={tw`w-1/2 px-1 mb-2`}>
            <View style={tw`bg-cyan-50 rounded-lg p-3 shadow-sm border border-cyan-300`}>
              <Text style={tw`text-xs text-cyan-600 mb-1`}>Pending Reports</Text>
              <Text style={tw`text-base font-bold text-cyan-700`}>
                42
              </Text>
            </View>
          </View>

          {/* Card 4 */}
          <View style={tw`w-1/2 px-1 mb-2`}>
            <View style={tw`bg-pink-50 rounded-lg p-3 shadow-sm border border-pink-200`}>
              <Text style={tw`text-xs text-pink-600 mb-1`}>Critical Alerts</Text>
              <Text style={tw`text-base font-bold text-pink-700`}>
                8
              </Text>
            </View>
          </View>

        </View>

        {/* Support Ticket Section */}
        <TouchableOpacity style={tw` border border-gray-300 rounded-lg p-4 my-3 flex-row justify-between items-center`}>
          <View>
            <Text style={tw` font-semibold text-gray-800`}>Raise Support Ticket</Text>
            <Text style={tw`text-xs text-gray-500 mt-1`}>Mon - Fri, 10AM - 5PM</Text>
          </View>
          <Text style={tw`text-gray-400 text-4xl`}>›</Text>
        </TouchableOpacity>

        {/* Activity Tracking */}
        <View style={tw`border flex flex-row border-gray-300 rounded-lg p-4 mb-3  flex-row justify-between items-center`}>
          <View style={tw`flex flex-col`}>
            <Text style={tw`text-base font-semibold text-gray-800`}>Activity Tracking</Text>
            <Text style={tw`text-gray-600`}>0 new changes</Text>
          </View>
          <Text style={tw`text-gray-400 text-4xl`}>›</Text>

        </View>

        {/* Login Details */}
        <View style={tw`border flex flex-row border-gray-300 rounded-lg p-4 mb-4  flex-row justify-between items-center`}>
          <View style={tw`flex flex-col`}>
            <Text style={tw`text-base font-semibold text-gray-800`}>Login Details</Text>
            <Text style={tw`text-gray-600`}>4 devices</Text>
          </View>
          <Text style={tw`text-gray-400 text-4xl`}>›</Text>
        </View>

        <View style={tw`border border-gray-300 bg-gray-100 px-2 py-3 rounded-md`}>
          <View style={tw`flex flex-row justify-between`}>
            <View style={tw`flex flex-row gap-1 justify-start items-center`}>
              <MaterialIcons name="keyboard-arrow-down" size={24} />
              <Text>Top Referrals (Monthly)</Text>
            </View>
            <TouchableOpacity
              onPress={openFilterModal}
              style={tw` bg-white flex flex-row justify-center items-center gap-1 border border-gray-300 p-1.5 rounded-md`}>
              <MaterialIcons name="calendar-month" />
              <Text>Filter</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={tw`border mt-2 border-gray-300 bg-gray-100 px-2 py-3 rounded-md`}>
          <View style={tw`flex flex-row justify-between`}>
            <View style={tw`flex flex-row gap-1 justify-start items-center`}>
              <MaterialIcons name="keyboard-arrow-down" size={24} />
              <Text>Top 10 Tests (Monthly)</Text>
            </View>
            <TouchableOpacity
              onPress={openFilterModal}
              style={tw` bg-white flex flex-row justify-center items-center gap-1 border border-gray-300 p-1.5 rounded-md`}>
              <MaterialIcons name="calendar-month" />
              <Text>Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>


      <Modal
        visible={filetrModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setFilterModal(false)}>
          <View style={tw`flex-1 justify-center items-center bg-black/50`}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <View style={tw`bg-white rounded-md w-[95%] p-4`}>
                <FilterDate onClose={() => setFilterModal(false)} onSave={handleSearchFilter} />
              </View>
            </TouchableWithoutFeedback>

          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
};

export default LabDashboard;