import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import React, { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { referDoctorList } from './services/doctorService';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useTheme } from '../../../../Authorization/ThemeContext';
import { getThemeStyles } from '../../../utils/themeStyles';

const ReferDoctor = ({ onSelectDoctor, onClose }) => {
  const [referDoctors, setReferDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { theme } = useTheme();
  const themed = getThemeStyles(theme);
  const isDark = theme === 'dark';

  const getReferDoctorList = async () => {
    try {
      setLoading(true);
      const response = await referDoctorList();
      console.log('Refer Doctor List:', response);
      setReferDoctors(response?.data || []);
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

  const clearSearch = () => {
    setSearchQuery('');
  };

  const getAvatarColor = (name = '') => {
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

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .filter(Boolean)
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const highlightText = (text = '', searchText = '', normalStyle = {}, highlightStyle = {}) => {
    if (!searchText.trim()) {
      return <Text style={normalStyle}>{text}</Text>;
    }

    const parts = text.split(new RegExp(`(${searchText})`, 'gi'));

    return (
      <Text style={normalStyle}>
        {parts.map((part, index) =>
          part.toLowerCase() === searchText.toLowerCase() ? (
            <Text key={index} style={highlightStyle}>
              {part}
            </Text>
          ) : (
            <Text key={index} style={normalStyle}>
              {part}
            </Text>
          )
        )}
      </Text>
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        themed.border,
        tw`p-3 mb-3 rounded-xl flex-row items-center`,
        {
          borderWidth: 1,
          borderColor: selectedId === item.referDoctorId
            ? '#10b981'
            : (isDark ? '#334155' : '#e5e7eb'),
          backgroundColor: isDark ? '#16263a' : '#ffffff',
        },
      ]}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <View style={tw`mr-3`}>
        {item.profileImage ? (
          <Image
            source={{ uri: item.profileImage }}
            style={tw`w-12 h-12 rounded-full bg-gray-100`}
          />
        ) : (
          <View
            style={[
              tw`w-12 h-12 rounded-full items-center justify-center`,
              { backgroundColor: getAvatarColor(item.doctorName || '') },
            ]}
          >
            <Text style={[themed.inputText, tw`text-base font-semibold`]}>
              {getInitials(item.doctorName || '')}
            </Text>
          </View>
        )}
      </View>

      <View style={tw`flex-1 pr-2`}>
        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`flex-1 pr-2`}>
            {searchQuery ? (
              highlightText(
                item.doctorName || '',
                searchQuery,
                {
                  color: isDark ? '#F8FAFC' : '#1F2937',
                  fontSize: 16,
                  fontWeight: '600',
                },
                {
                  color: '#3b82f6',
                  fontSize: 16,
                  fontWeight: '700',
                }
              )
            ) : (
              <Text
                numberOfLines={1}
                style={{
                  color: isDark ? '#F8FAFC' : '#1F2937',
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                {item.doctorName}
              </Text>
            )}
          </View>

          {selectedId === item.referDoctorId && (
            <View style={tw`bg-green-100 px-2 py-1 rounded-full`}>
              <Text style={tw`text-green-600 text-xs font-medium`}>Selected</Text>
            </View>
          )}
        </View>

        {item.specialization ? (
          <View style={tw`flex-row items-center mt-1`}>
            <FontAwesome5 name="stethoscope" size={12} color={isDark ? '#94a3b8' : '#9ca3af'} />
            <View style={tw`ml-1 flex-1`}>
              {searchQuery ? (
                highlightText(
                  item.specialization,
                  searchQuery,
                  {
                    color: isDark ? '#CBD5E1' : '#6B7280',
                    fontSize: 12,
                  },
                  {
                    color: '#3b82f6',
                    fontSize: 12,
                    fontWeight: '700',
                  }
                )
              ) : (
                <Text
                  numberOfLines={1}
                  style={{
                    color: isDark ? '#CBD5E1' : '#6B7280',
                    fontSize: 12,
                  }}
                >
                  {item.specialization}
                </Text>
              )}
            </View>
          </View>
        ) : null}

        <View style={tw`flex-row items-center mt-1 flex-wrap`}>
          {item.qualification ? (
            <View style={tw`flex-row items-center mr-3 mb-1`}>
              <Icon2 name="school-outline" size={12} color={isDark ? '#94a3b8' : '#9ca3af'} />
              <View style={tw`ml-1`}>
                {searchQuery ? (
                  highlightText(
                    item.qualification,
                    searchQuery,
                    {
                      color: isDark ? '#CBD5E1' : '#6B7280',
                      fontSize: 12,
                    },
                    {
                      color: '#3b82f6',
                      fontSize: 12,
                      fontWeight: '700',
                    }
                  )
                ) : (
                  <Text
                    style={{
                      color: isDark ? '#CBD5E1' : '#6B7280',
                      fontSize: 12,
                    }}
                  >
                    {item.qualification}
                  </Text>
                )}
              </View>
            </View>
          ) : null}

          {item.experience ? (
            <View style={tw`flex-row items-center mb-1`}>
              <Icon2 name="briefcase-outline" size={12} color={isDark ? '#94a3b8' : '#9ca3af'} />
              <Text
                style={{
                  color: isDark ? '#CBD5E1' : '#6B7280',
                  fontSize: 12,
                  marginLeft: 4,
                }}
              >
                {item.experience} years
              </Text>
            </View>
          ) : null}
        </View>

        <View style={tw`flex-row items-center mt-1 flex-wrap`}>
          {item.phone ? (
            <View style={tw`flex-row items-center mr-3 mb-1`}>
              <Icon2 name="call-outline" size={12} color={isDark ? '#94a3b8' : '#9ca3af'} />
              <Text
                style={{
                  color: isDark ? '#CBD5E1' : '#6B7280',
                  fontSize: 12,
                  marginLeft: 4,
                }}
              >
                {item.phone}
              </Text>
            </View>
          ) : null}

          {item.email ? (
            <View style={tw`flex-row items-center mr-3 mb-1`}>
              <Icon2 name="mail-outline" size={12} color={isDark ? '#94a3b8' : '#9ca3af'} />
              <Text
                numberOfLines={1}
                style={{
                  color: isDark ? '#CBD5E1' : '#6B7280',
                  fontSize: 12,
                  marginLeft: 4,
                  maxWidth: 180,
                }}
              >
                {item.email}
              </Text>
            </View>
          ) : null}

          {item.location ? (
            <View style={tw`flex-row items-center mb-1`}>
              <Icon name="place" size={12} color={isDark ? '#94a3b8' : '#9ca3af'} />
              <View style={tw`ml-1`}>
                {searchQuery ? (
                  highlightText(
                    item.location,
                    searchQuery,
                    {
                      color: isDark ? '#CBD5E1' : '#6B7280',
                      fontSize: 12,
                    },
                    {
                      color: '#3b82f6',
                      fontSize: 12,
                      fontWeight: '700',
                    }
                  )
                ) : (
                  <Text
                    style={{
                      color: isDark ? '#CBD5E1' : '#6B7280',
                      fontSize: 12,
                    }}
                  >
                    {item.location}
                  </Text>
                )}
              </View>
            </View>
          ) : null}
        </View>
      </View>

      <MaterialIcons
        name="chevron-right"
        size={24}
        color={isDark ? '#CBD5E1' : '#d1d5db'}
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[tw`flex-1 justify-center items-center`, { backgroundColor: isDark ? '#0f172a' : '#f9fafb' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: isDark ? '#CBD5E1' : '#6B7280', marginTop: 8 }}>
          Loading doctors...
        </Text>
      </View>
    );
  }

  return (
    <View style={[themed.childScreen, tw`flex-1`]}>
      <View style={[themed.borderBottom]}>
        <View style={tw`flex-row items-center justify-between mb-2`}>
          <Text style={[themed.modalHeaderTitle]}>
            Refer Doctor
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={[
              tw`p-2 rounded-full`,
              { backgroundColor: isDark ? '#e5e7eb' : '#f3f4f6' },
            ]}
          >
            <Icon2 name="close" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
        <Text style={{ color: isDark ? '#94a3b8' : '#6B7280', fontSize: 14 }}>
          Select a doctor for patient referral
        </Text>
      </View>

      <View>
        <View style={[themed.searchContainer, tw`mt-1`]}>
          <View style={themed.searchBox}>
            <Icon2 name="search-outline" size={20} color={themed.iconColor} />
            <TextInput
              style={[themed.searchInput]}
              placeholder="Search by name, specialization, qualification or location..."
              placeholderTextColor={themed.placeholderColor}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Icon2 name="close-circle" size={20} color={themed.iconColor} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {searchQuery.length > 0 && (
          <View style={tw`mt-2 flex-row justify-between items-center px-4`}>
            <Text style={{ color: isDark ? '#94a3b8' : '#6B7280', fontSize: 12 }}>
              Found {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity onPress={clearSearch}>
              <Text style={tw`text-xs text-blue-500 font-medium`}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

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
                <Icon2 name="search-outline" size={64} color={isDark ? '#475569' : '#d1d5db'} />
                <Text
                  style={{
                    textAlign: 'center',
                    color: isDark ? '#CBD5E1' : '#6B7280',
                    marginTop: 12,
                    fontSize: 16,
                  }}
                >
                  No doctors found for "{searchQuery}"
                </Text>
                <Text
                  style={{
                    textAlign: 'center',
                    color: isDark ? '#94a3b8' : '#9CA3AF',
                    fontSize: 14,
                    marginTop: 4,
                  }}
                >
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
                <FontAwesome5 name="user-md" size={48} color={isDark ? '#475569' : '#d1d5db'} />
                <Text
                  style={{
                    textAlign: 'center',
                    color: isDark ? '#CBD5E1' : '#6B7280',
                    marginTop: 12,
                  }}
                >
                  No Doctors Found
                </Text>
                <Text
                  style={{
                    textAlign: 'center',
                    color: isDark ? '#94a3b8' : '#9CA3AF',
                    fontSize: 14,
                    marginTop: 4,
                  }}
                >
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