import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, TextInput } from 'react-native';
import React, { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { referDoctorList } from './services/doctorService';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const ReferDoctor = ({ onSelectDoctor, onClose }) => {
  const [referDoctors, setReferDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getReferDoctorList = async () => {
    try {
      setLoading(true);
      const response = await referDoctorList();
      console.log('Refer Doctor List:', response);
      setReferDoctors(response.data);
    } catch (error) {
      console.error('Error fetching refer doctor list:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getReferDoctorList();
    }, [])
  );

  const handleSelect = (item) => {
    setSelectedId(item.referDoctorId);
    onSelectDoctor(item);
    onClose();
  };

  // Filter doctors based on search query
  const filteredDoctors = useMemo(() => {
    if (!searchQuery.trim()) {
      return referDoctors;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return referDoctors.filter(doctor => 
      doctor.doctorName?.toLowerCase().includes(query) ||
      doctor.specialization?.toLowerCase().includes(query) ||
      doctor.qualification?.toLowerCase().includes(query) ||
      doctor.location?.toLowerCase().includes(query)
    );
  }, [referDoctors, searchQuery]);

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Generate random color based on doctor name for avatar
  const getAvatarColor = (name) => {
    const colors = [
      '#3b82f6', '#8b5cf6', '#ec489a', '#10b981',
      '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Get initials from doctor name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Highlight matching text in search results
  const highlightText = (text, searchText) => {
    if (!searchText.trim()) return <Text style={tw`text-gray-800`}>{text}</Text>;
    
    const parts = text.split(new RegExp(`(${searchText})`, 'gi'));
    return (
      <Text>
        {parts.map((part, index) => 
          part.toLowerCase() === searchText.toLowerCase() ? (
            <Text key={index} style={tw`text-blue-600 font-bold`}>{part}</Text>
          ) : (
            <Text key={index} style={tw`text-gray-800`}>{part}</Text>
          )
        )}
      </Text>
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        tw`bg-white p-3 mb-3 rounded-xl flex-row items-center`,
        {
          borderWidth: 1,
          borderColor: selectedId === item.referDoctorId ? '#10b981' : '#e5e7eb',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2
        }
      ]}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      {/* Avatar/Icon Section */}
      <View style={tw`mr-3`}>
        {item.profileImage ? (
          <Image
            source={{ uri: item.profileImage }}
            style={tw`w-8 h-8 rounded-full bg-gray-100`}
          />
        ) : (
          <View
            style={[
              tw`w-8 h-8 rounded-full items-center justify-center`,
              { backgroundColor: getAvatarColor(item.doctorName) }
            ]}
          >
            <Text style={tw`text-white text-xs `}>
              {getInitials(item.doctorName)}
            </Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View style={tw`flex-1`}>
        <View style={tw`flex-row items-center justify-between`}>
          <Text style={tw`text-md font-semibold text-gray-800`}>
            {searchQuery ? highlightText(item.doctorName, searchQuery) : item.doctorName}
          </Text>
          {selectedId === item.referDoctorId && (
            <View style={tw`bg-green-100 px-2 py-1 rounded-full`}>
              <Text style={tw`text-green-600 text-xs font-medium`}>Selected</Text>
            </View>
          )}
        </View>

        {/* Specialization */}
        {item.specialization && (
          <View style={tw`flex-row items-center mt-1`}>
            <FontAwesome5 name="stethoscope" size={12} color="#9ca3af" />
            <Text style={tw`text-gray-500 text-xs ml-1`}>
              {searchQuery ? highlightText(item.specialization, searchQuery) : item.specialization}
            </Text>
          </View>
        )}

        {/* Qualification and Experience */}
        <View style={tw`flex-row items-center mt-1 flex-wrap`}>
          {item.qualification && (
            <View style={tw`flex-row items-center mr-3`}>
              <Icon2 name="school-outline" size={12} color="#9ca3af" />
              <Text style={tw`text-gray-500 text-xs ml-1`}>
                {searchQuery ? highlightText(item.qualification, searchQuery) : item.qualification}
              </Text>
            </View>
          )}
          
          {item.experience && (
            <View style={tw`flex-row items-center`}>
              <Icon2 name="briefcase-outline" size={12} color="#9ca3af" />
              <Text style={tw`text-gray-500 text-xs ml-1`}>
                {item.experience} years
              </Text>
            </View>
          )}
        </View>

        {/* Contact and Location Info */}
        <View style={tw`flex-row items-center mt-1 flex-wrap`}>
          {item.phone && (
            <View style={tw`flex-row items-center mr-3`}>
              <Icon2 name="call-outline" size={12} color="#9ca3af" />
              <Text style={tw`text-gray-500 text-xs ml-1`}>
                {item.phone}
              </Text>
            </View>
          )}
          
          {item.email && (
            <View style={tw`flex-row items-center mr-3`}>
              <Icon2 name="mail-outline" size={12} color="#9ca3af" />
              <Text style={tw`text-gray-500 text-xs ml-1`}>
                {item.email}
              </Text>
            </View>
          )}

          {item.location && (
            <View style={tw`flex-row items-center`}>
              <Icon name="place" size={12} color="#9ca3af" />
              <Text style={tw`text-gray-500 text-xs ml-1`}>
                {searchQuery ? highlightText(item.location, searchQuery) : item.location}
              </Text>
            </View>
          )}
        </View>

        {/* Available Days/Timings */}
        {item.availableDays && item.availableDays.length > 0 && (
          <View style={tw`flex-row flex-wrap mt-2`}>
            <View style={tw`bg-blue-50 px-2 py-0.5 rounded-full mr-1 mb-1 flex-row items-center`}>
              <Icon2 name="time-outline" size={10} color="#3b82f6" />
              <Text style={tw`text-blue-600 text-xs ml-1`}>
                {item.availableDays.slice(0, 3).join(', ')}
                {item.availableDays.length > 3 && ` +${item.availableDays.length - 3}`}
              </Text>
            </View>
            {item.availableTime && (
              <View style={tw`bg-gray-100 px-2 py-0.5 rounded-full flex-row items-center`}>
                <Icon2 name="calendar-outline" size={10} color="#6b7280" />
                <Text style={tw`text-gray-600 text-xs ml-1`}>
                  {item.availableTime}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Rating */}
        {item.rating && (
          <View style={tw`flex-row items-center mt-2`}>
            <Icon name="star" size={14} color="#f59e0b" />
            <Text style={tw`text-gray-600 text-xs ml-1 font-medium`}>
              {item.rating}
            </Text>
            {item.totalReviews && (
              <Text style={tw`text-gray-400 text-xs ml-1`}>
                ({item.totalReviews} reviews)
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Chevron Icon */}
      <MaterialIcons name="chevron-right" size={24} color="#d1d5db" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-gray-50`}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={tw`text-gray-500 mt-2`}>Loading doctors...</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 `}>
      {/* Header Section */}
      <View style={tw`bg-white s pt-4 pb-3 border-b border-gray-200`}>
        <View style={tw`flex-row items-center justify-between mb-2`}>
          <Text style={tw`text-xl font-bold text-gray-800`}>
            Refer Doctor
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={tw`p-2 rounded-full bg-gray-100`}
          >
            <Icon2 name="close" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
        <Text style={tw`text-gray-500 text-sm`}>
          Select a doctor for patient referral
        </Text>
      </View>

      {/* Search Bar with Functionality */}
      <View style={tw`bg-white  pt-3 pb-3 border-b border-gray-100`}>
        <View style={tw`flex-row items-center bg-gray-100 rounded-lg px-3 py-2`}>
          <Icon2 name="search-outline" size={20} color="#9ca3af" />
          <TextInput
            style={tw`flex-1 ml-2 text-gray-800 py-1`}
            placeholder="Search by name, specialization, qualification or location..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Icon2 name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Search Results Info */}
        {searchQuery.length > 0 && (
          <View style={tw`mt-2 flex-row justify-between items-center`}>
            <Text style={tw`text-xs text-gray-500`}>
              Found {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity onPress={clearSearch}>
              <Text style={tw`text-xs text-blue-500 font-medium`}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Doctor List */}
      <FlatList
        data={filteredDoctors}
        keyExtractor={(item) => item.referDoctorId.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`py-2`}
        ListEmptyComponent={
          <View style={tw`flex-1 justify-center items-center py-12`}>
            {searchQuery.length > 0 ? (
              <>
                <Icon2 name="search-outline" size={64} color="#d1d5db" />
                <Text style={tw`text-center text-gray-500 mt-3 text-base`}>
                  No doctors found for "{searchQuery}"
                </Text>
                <Text style={tw`text-center text-gray-400 text-sm mt-1`}>
                  Try searching with different keywords
                </Text>
                <TouchableOpacity 
                  onPress={clearSearch}
                  style={tw`mt-4 bg-blue-500 px-4 py-2 rounded-full`}
                >
                  <Text style={tw`text-white font-medium`}>Clear Search</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <FontAwesome5 name="user-md" size={48} color="#d1d5db" />
                <Text style={tw`text-center text-gray-500 mt-3`}>
                  No Doctors Found
                </Text>
                <Text style={tw`text-center text-gray-400 text-sm mt-1`}>
                  Please check back later
                </Text>
              </>
            )}
          </View>
        }
      />
    </View>
  );
};

export default ReferDoctor;