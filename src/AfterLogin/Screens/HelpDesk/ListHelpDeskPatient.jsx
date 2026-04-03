import { PermissionsAndroid, Easing, LayoutAnimation, UIManager, Platform, View, Text, FlatList, TouchableOpacity, Dimensions, Modal, TextInput, ScrollView, Animated, ActivityIndicator } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import tw from 'twrnc';
import api from '../../../../Authorization/api';
import { useNavigation, useRoute } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import QRCode from 'react-native-qrcode-svg';
import Svg from 'react-native-svg';
import Barcode from '@kichiyaki/react-native-barcode-generator';
import Entypo from 'react-native-vector-icons/Entypo';
import styles from '../../../utils/InputStyle';
import RNFetchBlob from 'react-native-blob-util';
import FileViewer from 'react-native-file-viewer';
import { useToast } from '../../../../Authorization/ToastContext';




const { width } = Dimensions.get('window');

const ListHelpDeskPatient = () => {
  const route = useRoute();
  const navigation = useNavigation()
  const [showFilter, setShowFilter] = useState(false);
  const payload = route?.params?.payload || null;
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterModal, setFilterModal] = useState(false);
  const [showStatusLegend, setShowStatusLegend] = useState(false);
  const { showToast } = useToast()
  const [downloadingId, setDownloadingId] = useState(null)

  // Filter states
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [openItemIndex, setOpenItemIndex] = useState(null); // Track which item is open
  const animationRefs = useRef({}); // Store animation values for each item

  // Status legend items
  const statusLegend = [
    { key: 'sample_pending', label: 'Sample Collection Pending', color: '#ef4444', bg: '#fee2e2', condition: (item) => !item.IsSampleCollected && !item.IsResultDone },
    { key: 'sample_collected', label: 'Sample Collected', color: '#3b82f6', bg: '#dbeafe', condition: (item) => item.IsSampleCollected === 1 && !item.IsResultDone },
    { key: 'department_received', label: 'Department Received', color: '#8b5cf6', bg: '#ede9fe', condition: (item) => item.IsSampleReceivedByDepartment === 1 },
    { key: 'abnormal', label: 'Abnormal', color: '#f97316', bg: '#ffedd5', condition: (item) => item.IsAbnormalResult === 1 },
    { key: 'hold', label: 'Hold', color: '#6b7280', bg: '#f3f4f6', condition: (item) => item.IsReportHold === 1 },
    { key: 'report_pending', label: 'Report Approval Pending', color: '#f59e0b', bg: '#fed7aa', condition: (item) => item.IsResultDone === 1 && item.IsReportApproved !== 1 },
    { key: 'approved', label: 'Approved', color: '#10b981', bg: '#d1fae5', condition: (item) => item.IsReportApproved === 1 && item.IsDispatched !== 1 },
    { key: 'dispatched', label: 'Dispatched', color: '#06b6d4', bg: '#cffafe', condition: (item) => item.IsDispatched === 1 },
    { key: 'urgent', label: 'Urgent', color: '#dc2626', bg: '#fee2e2', condition: (item) => item.isUrgent === 1 }
  ];

  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const gethelpDesk = async () => {
    console.log("help payload", payload);
    try {
      setLoading(true);
      const response = await api.post(`HelpDesk/help_desk`, payload);
      const responseData = response?.data?.data || response?.data || [];
      setData(responseData);
      setFilteredData(responseData);
    } catch (error) {
      console.log("ERROR RESPONSE >>>", error?.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (openItemIndex === index) {
      // Close the current item
      setOpenItemIndex(null);
    } else {
      // Open new item and close previous
      setOpenItemIndex(index);
    }
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    requestStoragePermission()
  }, [])

  // Create animation values for each item when needed
  const getAnimationValue = (index) => {
    if (!animationRefs.current[index]) {
      animationRefs.current[index] = {
        rotateAnim: new Animated.Value(openItemIndex === index ? 1 : 0)
      };
    }
    return animationRefs.current[index];
  };

  // Update animation when openItemIndex changes
  useEffect(() => {
    // Animate all items based on their open state
    Object.keys(animationRefs.current).forEach((key) => {
      const index = parseInt(key);
      const animValue = animationRefs.current[index];
      if (animValue) {
        Animated.timing(animValue.rotateAnim, {
          toValue: openItemIndex === index ? 1 : 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic)
        }).start();
      }
    });
  }, [openItemIndex]);

  const getChevronRotation = (index) => {
    const animValue = animationRefs.current[index];
    if (animValue) {
      return animValue.rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg']
      });
    }
    return '0deg';
  };

  useEffect(() => {
    if (payload) {
      gethelpDesk();
    }
  }, [payload]);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [searchText, selectedStatus, selectedType, data]);

  const applyFilters = () => {
    let filtered = [...data];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(item =>
        item.PatientName?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.UHID?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.Name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.Barcode?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => {
        if (selectedStatus === 'sample_pending') {
          return !item.IsSampleCollected && !item.IsResultDone;
        } else if (selectedStatus === 'sample_collected') {
          return item.IsSampleCollected === 1 && !item.IsResultDone;
        } else if (selectedStatus === 'department_received') {
          return item.IsSampleReceivedByDepartment === 1;
        } else if (selectedStatus === 'abnormal') {
          return item.IsAbnormalResult === 1;
        } else if (selectedStatus === 'hold') {
          return item.IsReportHold === 1;
        } else if (selectedStatus === 'report_pending') {
          return item.IsResultDone === 1 && item.IsReportApproved !== 1;
        } else if (selectedStatus === 'approved') {
          return item.IsReportApproved === 1 && item.IsDispatched !== 1;
        } else if (selectedStatus === 'dispatched') {
          return item.IsDispatched === 1;
        } else if (selectedStatus === 'urgent') {
          return item.isUrgent === 1;
        }
        return true;
      });
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.Type === selectedType);
    }

    setFilteredData(filtered);
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedStatus('all');
    setSelectedType('all');
    setFilterModal(false);
  };

  // Get card background color based on status
  const getCardColor = (item) => {
    if (item.isUrgent === 1) return { bg: '#fee2e2', border: '#dc2626' };
    if (item.IsDispatched === 1) return { bg: '#cffafe', border: '#06b6d4' };
    if (item.IsReportApproved === 1) return { bg: '#d1fae5', border: '#10b981' };
    if (item.IsResultDone === 1 && item.IsReportApproved !== 1) return { bg: '#fed7aa', border: '#f59e0b' };
    if (item.IsReportHold === 1) return { bg: '#f3f4f6', border: '#6b7280' };
    if (item.IsAbnormalResult === 1) return { bg: '#ffedd5', border: '#f97316' };
    if (item.IsSampleReceivedByDepartment === 1) return { bg: '#ede9fe', border: '#8b5cf6' };
    if (item.IsSampleCollected === 1) return { bg: '#dbeafe', border: '#3b82f6' };
    return { bg: '#fee2e2', border: '#ef4444' };
  };

  // Get detailed status text
  const getDetailedStatus = (item) => {
    if (item.isUrgent === 1) return 'URGENT';
    if (item.IsDispatched === 1) return 'Dispatched';
    if (item.IsReportApproved === 1) return 'Report Approved';
    if (item.IsResultDone === 1 && item.IsReportApproved !== 1) return 'Report Approval Pending';
    if (item.IsReportHold === 1) return 'Hold';
    if (item.IsAbnormalResult === 1) return 'Abnormal';
    if (item.IsSampleReceivedByDepartment === 1) return 'Department Received';
    if (item.IsSampleCollected === 1) return 'Sample Collected';
    return 'Sample Collection Pending';
  };

  // Format date to "22 Oct 2025, 2:52 PM"
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      let date;

      if (dateString.includes('-') && !dateString.includes(' ')) {
        const [day, month, year] = dateString.split('-');
        const monthMap = {
          'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
          'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        date = new Date(parseInt(year), monthMap[month], parseInt(day));
      }
      else if (dateString.includes(' ')) {
        const parts = dateString.split(' ');
        if (parts.length >= 4) {
          const month = parts[0];
          const day = parseInt(parts[1]);
          const year = parseInt(parts[2]);
          let timeStr = parts[3];

          let hours = 0, minutes = 0;
          const timeMatch = timeStr.match(/(\d+):?(\d*)([AP]M)/i);
          if (timeMatch) {
            hours = parseInt(timeMatch[1]);
            minutes = parseInt(timeMatch[2]) || 0;
            const isPM = timeMatch[3].toUpperCase() === 'PM';
            if (isPM && hours !== 12) hours += 12;
            if (!isPM && hours === 12) hours = 0;
          }

          const monthMap = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
          };
          date = new Date(year, monthMap[month], day, hours, minutes);
        } else {
          date = new Date(dateString);
        }
      }
      else {
        date = new Date(dateString);
      }
      if (isNaN(date.getTime())) return dateString;
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
    } catch {
      return dateString;
    }
  };

  // Format date only (without time) to "22 Oct 2025"
  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      if (dateString.includes('-') && !dateString.includes(' ')) {
        const [day, month, year] = dateString.split('-');
        return `${day} ${month} ${year}`;
      }

      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();

      return `${day} ${month} ${year}`;
    } catch {
      return dateString;
    }
  };

  const handleDownloadReport = async (id, name) => {
    // console.log("download report:", id, name)
    try {
      setDownloadingId(id)
      const { config, fs } = RNFetchBlob;
      const path = `${fs.dirs.DownloadDir}/report-${id}/${name}.pdf`;
      const branchId = payload?.branchId ? String(payload.branchId) : '1'
      const res = await config({
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: path,
          description: 'Downloading report...',
        },
      }).fetch('GET',
        `http://103.217.247.236/LabApp/api/ReportPrint/DownloadCombinedReport?ptInvstId=${id}&isHeaderPNG=0&printBy=1&branchId=${branchId}`
      );
      showToast('File downloaded', 'success');
    } catch (error) {
      console.error("Download failed", error);
    } finally {
      setDownloadingId(null); // STOP loading (always runs)
    }
  };

  // Get status color and icon (for badge)
  const getStatusInfo = (item) => {
    const status = getDetailedStatus(item);
    if (status === 'Dispatched') return { text: status, color: '#06b6d4', bg: '#cffafe', icon: 'truck-fast' };
    if (status === 'Report Approved') return { text: status, color: '#10b981', bg: '#d1fae5', icon: 'file-check' };
    if (status === 'Report Approval Pending') return { text: status, color: '#f59e0b', bg: '#fed7aa', icon: 'clock-time-four' };
    if (status === 'Hold') return { text: status, color: '#6b7280', bg: '#f3f4f6', icon: 'pause-circle' };
    if (status === 'Abnormal') return { text: status, color: '#f97316', bg: '#ffedd5', icon: 'alert-circle' };
    if (status === 'Department Received') return { text: status, color: '#8b5cf6', bg: '#ede9fe', icon: 'office-building' };
    if (status === 'Sample Collected') return { text: status, color: '#3b82f6', bg: '#dbeafe', icon: 'test-tube' };
    if (status === 'URGENT') return { text: status, color: '#dc2626', bg: '#fee2e2', icon: 'alert' };
    return { text: 'Sample Collection Pending', color: '#ef4444', bg: '#fee2e2', icon: 'clock-time-four' };
  };

  // Get gender icon
  const getGenderIcon = (gender) => {
    if (gender === 'MALE') {
      return { name: 'gender-male', color: '#3b82f6' };
    }
    if (gender === 'FEMALE') {
      return { name: 'gender-female', color: '#ec489a' };
    }
    return { name: 'gender-male-female', color: '#9ca3af' };
  };

  const renderItem = ({ item, index }) => {
    const statusInfo = getStatusInfo(item);
    const genderIcon = getGenderIcon(item.Gender);
    const cardColor = getCardColor(item);
    const isUrgent = item.isUrgent === 1;
    const isVIP = item.VIPPatient === 1;
    const isOpen = openItemIndex === index;

    // Initialize animation for this item if needed
    getAnimationValue(index);
    const chevronRotation = getChevronRotation(index);

    return (
      <View
        style={[
          tw`rounded-lg mb-4 shadow-sm overflow-hidden`,
          { backgroundColor: cardColor.bg, borderLeftWidth: 4, borderLeftColor: cardColor.border }
        ]}
      >
        {/* Header Section */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => toggleItem(index)}
          style={tw`flex flex-col py-2 px-4`}
        >
          <View style={tw`flex-row justify-between items-start`}>
            <View style={tw`flex-row items-center flex-1`}>
              <View style={tw`mr-3 border border-gray-300 rounded-full p-1 bg-white`}>
                <MaterialCommunityIcons name="account" size={24} color={genderIcon.color} />
              </View>
              <View style={tw`flex-1 justify-start items-start`}>
                <Text style={tw`text-md font-bold text-gray-800`}>
                  {item.PatientName || 'No Name'}
                </Text>
                <Text style={tw`text-xs text-gray-500 mt-0.5`}>
                  {`${item.UHID || 'N/A'} • ${formatDateOnly(item.BillDate)}`}
                </Text>
                {item.Barcode && (
                  <View style={tw`mt-1`}>
                    <Barcode
                      value={String(item.Barcode).trim()}
                      format="CODE128"
                      width={1.2}
                      maxWidth={Math.min(240, width - 160)}
                      height={24}
                      lineColor="#111827"
                      background="transparent"
                      text={String(item.Barcode).trim()}
                      textStyle={tw`text-[10px] text-gray-700`}
                      onError={(e) => console.warn('Barcode render error:', e?.message || e)}
                      style={{ alignSelf: 'flex-start' }}
                    />
                  </View>
                )}
              </View>
              <View
                style={[
                  styles.cardShadow,
                  tw`flex flex-row justify-between items-center bg-white p-3 rounded-full`
                ]}
              >
                <Animated.View style={[tw`bg-gray-100 rounded-full p-1.5`, { transform: [{ rotate: chevronRotation }] }]}>
                  <Entypo name='chevron-down' size={18} color="#4b5563" />
                </Animated.View>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Timeline Section */}
        {isOpen && (
          <View style={tw`p-4 border-t border-gray-100 bg-white/30`}>
            <View style={tw`gap-2 `}>
              <View style={tw`flex flex-row justify-between items-center`}>
                <Text>{item?.Name || ""}</Text>
                {/* <TouchableOpacity
                  onPress={() => console.log('Print clicked')}
                  style={tw`border border-gray-300 p-2 rounded-full bg-white`}
                  activeOpacity={0.7}
                >
                  <AntDesign name='printer' size={16} color="#4b5563" />
                </TouchableOpacity> */}
              </View>
              <View style={tw`flex-row flex-wrap gap-3 mb-2`}>
                <View style={tw`flex-row items-center`}>
                  <MaterialCommunityIcons name="calendar" size={14} color="#9ca3af" />
                  <Text style={tw`text-xs text-gray-600 ml-1`}>
                    Age: {item.CurrentAge || 'N/A'}
                  </Text>
                </View>
                <View style={tw`flex-row items-center`}>
                  <MaterialCommunityIcons name="phone" size={14} color="#9ca3af" />
                  <Text style={tw`text-xs text-gray-600 ml-1`}>
                    {item.ContactNumber || 'No Contact'}
                  </Text>
                </View>
              </View>

              {item.BillDate && (
                <View style={tw`flex-row items-center justify-between`}>
                  <View style={tw`flex-row items-center`}>
                    <MaterialCommunityIcons name="calendar-clock" size={14} color="#9ca3af" />
                    <Text style={tw`text-xs text-gray-600 ml-2`}>Bill Date</Text>
                  </View>
                  <Text style={tw`text-xs text-gray-500`}>{formatDateOnly(item.BillDate)}</Text>
                </View>
              )}
              {item.SampleCollectedOn && (
                <View style={tw`flex-row items-center justify-between`}>
                  <View style={tw`flex-row items-center`}>
                    <MaterialCommunityIcons name="test-tube" size={14} color="#9ca3af" />
                    <Text style={tw`text-xs text-gray-600 ml-2`}>Sample Collected</Text>
                  </View>
                  <Text style={tw`text-xs text-gray-500`}>{formatDate(item.SampleCollectedOn)}</Text>
                </View>
              )}
              {item.ResultDoneOn && (
                <View style={tw`flex-row items-center justify-between`}>
                  <View style={tw`flex-row items-center`}>
                    <MaterialCommunityIcons name="file-check" size={14} color="#9ca3af" />
                    <Text style={tw`text-xs text-gray-600 ml-2`}>Result Done</Text>
                  </View>
                  <Text style={tw`text-xs text-gray-500`}>{formatDate(item.ResultDoneOn)}</Text>
                </View>
              )}
              {item.ReportApprovedOn && (
                <View style={tw`flex-row items-center justify-between`}>
                  <View style={tw`flex-row items-center`}>
                    <MaterialCommunityIcons name="check-circle" size={14} color="#9ca3af" />
                    <Text style={tw`text-xs text-gray-600 ml-2`}>Report Approved</Text>
                  </View>
                  <Text style={tw`text-xs text-gray-500`}>{formatDate(item.ReportApprovedOn)}</Text>
                </View>
              )}
              {item.DispatchedOn && (
                <View style={tw`flex-row items-center justify-between`}>
                  <View style={tw`flex-row items-center`}>
                    <MaterialCommunityIcons name="truck-fast" size={14} color="#9ca3af" />
                    <Text style={tw`text-xs text-gray-600 ml-2`}>Dispatched</Text>
                  </View>
                  <Text style={tw`text-xs text-gray-500`}>{formatDate(item.DispatchedOn)}</Text>
                </View>
              )}
            </View>
            {/* {console.log("request",item?.IsResultDone)} */}
            {item?.IsReportApproved === 1 && (
              <View style={tw`flex-row gap-2 mt-4`}>

                {/* DOWNLOAD */}
                <TouchableOpacity
                  onPress={() =>
                    handleDownloadReport(item?.PatientInvestigationId, item?.PatientName)
                  }
                  style={tw`flex-1 flex-row items-center justify-center border border-gray-300 py-2 rounded-lg bg-white`}
                  activeOpacity={0.7}
                  disabled={downloadingId === item?.PatientInvestigationId}
                >
                  {downloadingId === item?.PatientInvestigationId ? (
                    <ActivityIndicator size="small" color="#4b5563" />
                  ) : (
                    <>
                      <Feather name="download" size={14} color="#4b5563" />
                      <Text  numberOfLines={1}  adjustsFontSizeToFit style={tw`ml-1 text-xs text-gray-700 font-medium`} >  Download  </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* VIEW */}
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('ViewLabReport', {
                      patientInvestigationId: item?.PatientInvestigationId,
                      patientName: item?.PatientName,
                      branchId: payload?.branchId ,
                    })
                  }
                  style={tw`flex-1 flex-row items-center justify-center border border-blue-500 py-2 rounded-lg bg-blue-50`}
                  activeOpacity={0.7}
                >
                  <Feather name="eye" size={14} color="#3b82f6" />
                  <Text numberOfLines={1} adjustsFontSizeToFit  style={tw`ml-1 text-xs text-blue-600 font-medium`} >  View </Text>
                </TouchableOpacity>

              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  if (!payload) {
    return (
      <View style={tw`flex-1`}>
        <View style={tw`flex-1 bg-white items-center justify-center px-6`}>
          <MaterialCommunityIcons name="magnify" size={44} color="#6b7280" />
          <Text style={tw`mt-3 text-base font-semibold text-gray-800 text-center`}>
            Search required
          </Text>
          <Text style={tw`mt-1 text-sm text-gray-500 text-center`}>
            Please search from Help Desk to view the patient list.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('HelpDeskHome')}
            style={tw`mt-4 bg-blue-500 px-4 py-3 rounded-lg`}
            activeOpacity={0.8}
          >
            <Text style={tw`text-white font-semibold`}>Go to Search</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={tw`flex-1`}>
      {/* Header with Filter Button */}
      <View style={tw`bg-white px-4 py-3 border-b border-gray-200`}>
        <View style={tw`flex-row justify-between items-center mb-3`}>
          <View>
            <Text style={tw`text-xl font-bold text-gray-800`}>Patient List</Text>
            <Text style={tw`text-sm text-gray-500 mt-1`}>
              {filteredData.length} {filteredData.length === 1 ? 'record' : 'records'} found
            </Text>
          </View>

          <View style={tw`flex-row gap-2`}>
            <TouchableOpacity
              onPress={() => setShowStatusLegend(!showStatusLegend)}
              style={tw`flex-row items-center border bg-gray-100 px-3 py-2 rounded-lg`}
            >
              <MaterialCommunityIcons name="information-outline" size={18} color="#6b7280" />
              <Text style={tw`text-gray-600 text-sm font-medium ml-1`}>Status Info</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilterModal(true)}
              style={tw`flex-row items-center bg-blue-500 px-3 py-2 rounded-lg shadow-sm`}
            >
              <MaterialCommunityIcons name="filter-variant" size={18} color="white" />
              <Text style={tw`text-white text-sm font-medium ml-1`}>Filter</Text>
              {(selectedStatus !== 'all' || selectedType !== 'all' || searchText) && (
                <View style={tw`bg-red-500 rounded-full w-5 h-5 items-center justify-center ml-2`}>
                  <Text style={tw`text-white text-[10px] font-bold`}>
                    {selectedStatus !== 'all' && selectedType !== 'all' ? 2 : (selectedStatus !== 'all' || selectedType !== 'all' ? 1 : 0)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={tw`flex flex-row items-center gap-2`}>
          {/* Search Input */}
          <View style={tw`flex-1 flex-row items-center border border-gray-300 bg-white rounded-xl px-3`}>
            <Feather name="search" size={18} color="#9ca3af" />
            <TextInput
              style={tw`flex-1 ml-2 text-base text-gray-700 py-2`}
              placeholder="Search by name, UHID, test or barcode..."
              placeholderTextColor="#9ca3af"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <MaterialCommunityIcons name="close-circle" size={16} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>

          {/* Barcode Scan Button with Text */}
          <TouchableOpacity
            // onPress={() => setScanCameraModal(true)}
            style={tw`bg-blue-500 px-4 py-2.5 rounded-xl flex-row items-center justify-center gap-1`}
            activeOpacity={0.7}
          >
            <MaterialIcons name="qr-code-scanner" size={18} color="white" />
            <Text style={tw`text-white text-sm font-medium`}>Scan</Text>
          </TouchableOpacity>
        </View>


        {/* Status Legend */}
        {showStatusLegend && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={tw`mt-3`}
            contentContainerStyle={tw`gap-2`}
          >
            <View style={tw`flex-row gap-2`}>
              {statusLegend.map((status) => (
                <TouchableOpacity
                  key={status.key}
                  onPress={() => setSelectedStatus(selectedStatus === status.key ? 'all' : status.key)}
                  style={[
                    tw`flex-row items-center rounded-full px-3 py-1.5`,
                    { backgroundColor: status.bg, borderWidth: selectedStatus === status.key ? 2 : 1, borderColor: status.color }
                  ]}
                >
                  <View style={[tw`w-2 h-2 rounded-full mr-2`, { backgroundColor: status.color }]} />
                  <Text style={[tw`text-xs font-medium`, { color: status.color }]}>
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {/* Active Filters Display */}
        {(selectedStatus !== 'all' || selectedType !== 'all') && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mt-2`}>
            <View style={tw`flex-row gap-2`}>
              {selectedStatus !== 'all' && (
                <TouchableOpacity
                  onPress={() => setSelectedStatus('all')}
                  style={tw`flex-row items-center bg-blue-100 rounded-full px-2 py-1`}
                >
                  <Text style={tw`text-xs text-blue-700`}>
                    {statusLegend.find(s => s.key === selectedStatus)?.label || selectedStatus}
                  </Text>
                  <MaterialCommunityIcons name="close" size={12} color="#3b82f6" style={tw`ml-1`} />
                </TouchableOpacity>
              )}
              {selectedType !== 'all' && (
                <TouchableOpacity
                  onPress={() => setSelectedType('all')}
                  style={tw`flex-row items-center bg-blue-100 rounded-full px-2 py-1`}
                >
                  <Text style={tw`text-xs text-blue-700`}>Type: {selectedType}</Text>
                  <MaterialCommunityIcons name="close" size={12} color="#3b82f6" style={tw`ml-1`} />
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        )}
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item, index) => `${item.LabNo || index}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={tw`p-4`}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={gethelpDesk}
        ListEmptyComponent={
          <View style={tw`items-center justify-center py-12`}>
            <MaterialCommunityIcons name="file-search-outline" size={64} color="#d1d5db" />
            <Text style={tw`text-gray-400 text-base mt-4 font-medium`}>
              No Data Found
            </Text>
            <Text style={tw`text-gray-400 text-sm mt-1`}>
              {searchText || selectedStatus !== 'all' || selectedType !== 'all'
                ? 'No matching records found'
                : 'No patient records available'}
            </Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={filterModal}
        transparent
        animationType="slide"
        statusBarTranslucent
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setFilterModal(false)}
          style={tw`flex-1 bg-black/50 justify-end`}
        >
          <View style={tw`bg-white rounded-t-2xl max-h-[80%]`}>
            <View style={tw`p-4 border-b border-gray-200 flex-row justify-between items-center`}>
              <Text style={tw`text-xl font-bold text-gray-800`}>Filter Patients</Text>
              <TouchableOpacity onPress={() => setFilterModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={tw`p-4`} showsVerticalScrollIndicator={false}>
              {/* Status Filter */}
              <Text style={tw`text-base font-semibold text-gray-700 mb-3`}>Status</Text>
              <View style={tw`flex-row flex-wrap gap-2 mb-6`}>
                {statusLegend.map((status) => (
                  <TouchableOpacity
                    key={status.key}
                    onPress={() => setSelectedStatus(status.key)}
                    style={[
                      tw`px-4 py-2 rounded-full`,
                      selectedStatus === status.key ? { backgroundColor: status.color } : tw`bg-gray-100`
                    ]}
                  >
                    <Text style={[
                      tw`text-sm font-medium`,
                      selectedStatus === status.key ? tw`text-white` : tw`text-gray-700`
                    ]}>
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={tw`p-4 border-t border-gray-200 flex-row gap-3`}>
              <TouchableOpacity
                onPress={clearFilters}
                style={tw`flex-1 py-3 rounded-xl border border-gray-300 bg-white`}
              >
                <Text style={tw`text-center text-gray-700 font-medium`}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilterModal(false)}
                style={tw`flex-1 py-3 rounded-xl bg-blue-500`}
              >
                <Text style={tw`text-white text-center font-semibold`}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
};

export default ListHelpDeskPatient;
