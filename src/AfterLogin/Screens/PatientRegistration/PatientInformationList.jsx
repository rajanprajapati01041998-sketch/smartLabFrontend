import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Platform,
    Share,
    Alert,
    Animated,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import tw from 'twrnc';
import { useTheme } from '../../../../Authorization/ThemeContext';
import { getThemeStyles } from '../../../utils/themeStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import Barcode from '@kichiyaki/react-native-barcode-generator';
import { useToast } from '../../../../Authorization/ToastContext';
import UpdatePatientInfo from './UpdatePatientInfo';
import { getPatientInvestigation } from '../../../utils/patinetService.js/investigation';
import ViewUpdateAllTestDetails from './ViewUpdateAllTestDetails';

const { width } = Dimensions.get('window');

const PatientInformationList = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { theme } = useTheme();
    const themed = getThemeStyles(theme);
    const { showToast } = useToast();

    const payload = route?.params?.payload;

    const [viewAllUpdateTestModal, setViewAllUpdateTestModal] = useState(false);
    const [list, setList] = useState([]);
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [actionMenuIndex, setActionMenuIndex] = useState(null);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [clientModal, setClientModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const animations = useRef({});

    const [labeNo, setLabNo] = useState(null);
    const [visitId, setVisitId] = useState(null);
    const [puhid, setPUhid] = useState(null);

    const closeActionMenu = () => {
        setActionMenuIndex(null);
    };

    const fetchInvestigation = useCallback(async (payloadData) => {
        try {
            setLoading(true);
            const response = await getPatientInvestigation(payloadData);

            if (response?.success) {
                setList(response?.data || []);
            } else {
                setList([]);
            }
        } catch (error) {
            console.log('investigation err', error);
            setList([]);
            showToast?.('Failed to load patient list', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    const handleViewAllTestUpdateetails = (item) => {
        closeActionMenu();
        setVisitId(item?.VisitId);
        setLabNo(item?.LabNo);
        setPUhid(item?.UHID);
        setViewAllUpdateTestModal(true);
    };

    useFocusEffect(
        useCallback(() => {
            if (payload) {
                fetchInvestigation(payload);
            }
            return () => { };
        }, [payload, fetchInvestigation])
    );

    const filteredList = useMemo(() => {
        const query = search?.trim()?.toLowerCase();
        if (!query) return list;

        return list.filter((item) => {
            const patientName = String(item?.PatientName || '').toLowerCase();
            const labNo = String(item?.LabNo || '').toLowerCase();
            const barcode = String(item?.BarcodeList || '').toLowerCase();
            const uhid = String(item?.UHID || '').toLowerCase();

            return (
                patientName.includes(query) ||
                labNo.includes(query) ||
                barcode.includes(query) ||
                uhid.includes(query)
            );
        });
    }, [list, search]);

    const toggleExpand = (index) => {
        closeActionMenu();

        if (expandedIndex === index) {
            setExpandedIndex(null);
        } else {
            setExpandedIndex(index);

            if (!animations.current[index]) {
                animations.current[index] = {
                    fadeAnim: new Animated.Value(0),
                    slideAnim: new Animated.Value(50),
                };
            }

            Animated.parallel([
                Animated.timing(animations.current[index].fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(animations.current[index].slideAnim, {
                    toValue: 0,
                    damping: 12,
                    stiffness: 100,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    };

    const closeModal = () => {
        setClientModal(false);
        setSelectedPatient(null);
    };

    const handleShare = async (item) => {
        try {
            const shareMessage = `
Patient Details:
Name: ${item?.PatientName}
UHID: ${item?.UHID}
Lab No: ${item?.LabNo}
Bill Amount: ₹${item?.TotalBillAmount}
Paid Amount: ₹${item?.TotalPaidAmount}
Balance: ₹${item?.TotalBalanceAmount}
`;

            await Share.share({
                message: shareMessage,
                title: `Patient Report - ${item?.PatientName}`,
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const handleDelete = (item) => {
        Alert.alert(
            'Confirm Delete',
            `Are you sure you want to delete patient ${item?.PatientName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            showToast('Patient deleted successfully', 'success');
                        } catch (error) {
                            showToast('Failed to delete', 'error');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const ActionMenu = ({ item, index }) => {
        if (actionMenuIndex !== index) return null;

        return (
            <View
                pointerEvents="box-none"
                style={[
                    tw`absolute right-6 top-12 w-56 rounded-2xl p-2 `,
                    {
                        backgroundColor: theme === 'dark' ? '#172235' : '#ffffff',
                        borderWidth: 1,
                        borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                        shadowColor: '#000',
                        shadowOpacity: 0.25,
                        shadowRadius: 10,
                        elevation: 50,
                        zIndex: 9999,
                    },
                ]}
             >
                <TouchableOpacity
                    onPress={() => {
                        closeActionMenu();
                        setSelectedPatient(item);
                        setClientModal(true);
                    }}
                    style={[
                        tw`flex-row items-center px-3 py-3 rounded-xl mb-1`,
                        { backgroundColor: theme === 'dark' ? '#1e3a5f' : '#eff6ff' },
                    ]}
                >
                    <Feather name="edit" size={18} color="#1d4ed8" />
                    <Text style={tw`ml-3 text-sm font-semibold text-blue-600`}>
                        Edit Information
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        closeActionMenu();
                        navigation.navigate('EditRegistration', { patientData: item });
                    }}
                    style={tw`flex-row items-center px-3 py-3 rounded-xl mb-1`}
                >
                    <Entypo name="lab-flask" size={18} color={themed.chevronColor} />
                    <Text style={[themed.listItemText, tw`ml-3 text-sm font-semibold`]}>
                        Edit Tests
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        closeActionMenu();
                        navigation.navigate('LABReceipts', { item });
                    }}
                    style={tw`flex-row items-center px-3 py-3 rounded-xl mb-1`}
                >
                    <Feather name="printer" size={18} color={themed.chevronColor} />
                    <Text style={[themed.listItemText, tw`ml-3 text-sm font-semibold`]}>
                        Receipts
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        closeActionMenu();
                        navigation.navigate('TRF_Print', { item });
                    }}
                    style={tw`flex-row items-center px-3 py-3 rounded-xl`}
                >
                    <Feather name="file-text" size={18} color={themed.chevronColor} />
                    <Text style={[themed.listItemText, tw`ml-3 text-sm font-semibold`]}>
                        TRF Print
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderItem = ({ item, index }) => {
        const isExpanded = expandedIndex === index;
        const barcodeValue = String(item?.BarcodeList || item?.LabNo || '').trim();
        const balanceAmount = Number(item?.TotalBalanceAmount ?? 0);

        const cardBgStyle =
            balanceAmount === 0
                ? {
                    backgroundColor: theme === 'dark' ? 'rgba(34,197,94,0.12)' : '#ECFDF5',
                    borderColor: '#22C55E',
                }
                : balanceAmount > 0
                    ? {
                        backgroundColor: theme === 'dark' ? 'rgba(245,158,11,0.12)' : '#FFFBEB',
                        borderColor: '#F59E0B',
                    }
                    : {};

        if (!animations.current[index]) {
            animations.current[index] = {
                fadeAnim: new Animated.Value(0),
                slideAnim: new Animated.Value(50),
            };
        }

        const { fadeAnim, slideAnim } = animations.current[index];

        return (
            <Animated.View
                style={[
                    themed.globalCard,
                    themed.border,
                    tw`mb-3 p-4 rounded-xl`,
                    cardBgStyle,
                    {
                        transform: [{ scale: 1 }],
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
                        zIndex: actionMenuIndex === index ? 9999 : 1,
                        overflow: 'visible',
                    },
                ]}
            >
                <ActionMenu item={item} index={index} />

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {toggleExpand(index)}}
                    style={tw`flex-row items-start justify-between`}
                >
                    <View style={tw`flex-1`}>
                        {barcodeValue ? (
                            <View style={tw`mb-2 flex-row justify-between`}>
                                <Barcode
                                    value={barcodeValue}
                                    format="CODE128"
                                    width={Platform.OS === 'ios' ? 1.5 : 1.2}
                                    maxWidth={Math.min(200, width - 160)}
                                    height={Platform.OS === 'ios' ? 24 : 20}
                                    lineColor={theme === 'dark' ? '#e5ebf1' : '#848994'}
                                    background="transparent"
                                    text={barcodeValue}
                                    textStyle={[themed.mutedText, tw`text-[9px]`]}
                                    onError={(e) => console.warn('Barcode error:', e?.message || e)}
                                    style={{ alignSelf: 'flex-start' }}
                                />

                                <TouchableOpacity
                                    style={tw`mr-10`}
                                    onPress={(e) => {
                                        e.stopPropagation?.();
                                        handleViewAllTestUpdateetails(item);
                                    }}
                                >
                                    <Feather name="eye" color="gray" size={16} />
                                </TouchableOpacity>
                            </View>
                        ) : null}

                        <View style={tw`flex-row justify-between items-start`}>
                            <View style={tw`flex-1`}>
                                <View style={tw`flex-row items-center mb-1`}>
                                    <Feather name="user" size={14} color={themed.chevronColor} />
                                    <Text
                                        style={[themed.listItemText, tw`text-sm font-semibold ml-2`]}
                                        numberOfLines={1}
                                    >
                                        {item?.PatientName || '-'}
                                    </Text>
                                </View>

                                <View style={tw`flex-row items-center`}>
                                    <MaterialCommunityIcons
                                        name="hospital-building"
                                        size={14}
                                        color={themed.chevronColor}
                                    />
                                    <Text style={[themed.listItemText, tw`text-xs font-semibold ml-1`]}>
                                        {item?.UHID || '-'}
                                    </Text>
                                </View>
                            </View>

                            <View style={tw`items-end`}>
                                <View style={tw`flex-row items-center mb-1`}>
                                    <Ionicons name="calendar-outline" size={12} color={themed.chevronColor} />
                                    <Text style={[themed.transactionLabel, tw`text-xs ml-1`]}>
                                        {item?.BillDate || ''}
                                    </Text>
                                </View>

                                <View style={tw`flex-row items-center`}>
                                    <Ionicons name="person-outline" size={12} color={themed.chevronColor} />
                                    <Text style={[themed.transactionLabel, tw`text-xs ml-1`]}>
                                        {item?.CurrentAge || '-'} / {item?.Gender || '-'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={tw`ml-2 flex-row items-center`}>
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation?.();
                                setActionMenuIndex((prev) => (prev === index ? null : index));
                            }}
                            activeOpacity={0.7}
                            style={[
                                themed.border,
                                tw`w-8 h-8 rounded-full items-center justify-center mr-2`,
                                {
                                    backgroundColor:
                                        actionMenuIndex === index
                                            ? theme === 'dark'
                                                ? '#1e3a5f'
                                                : '#dbeafe'
                                            : theme === 'dark'
                                                ? '#1f2937'
                                                : '#f3f4f6',
                                    zIndex: 10000,
                                    elevation: 51,
                                },
                            ]}
                        >
                            <Feather name="more-vertical" size={18} color={themed.chevronColor} />
                        </TouchableOpacity>

                        <Animated.View
                            style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
                        >
                            <Ionicons name="chevron-down" size={20} color={themed.chevronColor} />
                        </Animated.View>
                    </View>
                </TouchableOpacity>

                {isExpanded ? (
                    <Animated.View
                        style={[
                            tw`mt-4 pt-4`,
                            themed.borderTop,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <View style={tw`mb-4`}>
                            <Text style={[themed.listItemText, tw`text-sm font-bold mb-2`]}>
                                Patient Information
                            </Text>

                            <View style={tw`flex-row flex-wrap`}>
                                <View style={tw`w-1/2 mb-2`}>
                                    <Text style={[themed.transactionLabel, tw`text-xs`]}>Lab No</Text>
                                    <Text style={[themed.listItemText, tw`text-sm font-medium`]}>
                                        {item?.LabNo || '-'}
                                    </Text>
                                </View>

                                <View style={tw`w-1/2 mb-2`}>
                                    <Text style={[themed.transactionLabel, tw`text-xs`]}>Client</Text>
                                    <Text
                                        style={[themed.listItemText, tw`text-sm font-medium`]}
                                        numberOfLines={1}
                                    >
                                        {item?.ClientName || '-'}
                                    </Text>
                                </View>

                                <View style={tw`w-1/2 mb-2`}>
                                    <Text style={[themed.transactionLabel, tw`text-xs`]}>Contact</Text>
                                    <Text style={[themed.listItemText, tw`text-sm font-medium`]}>
                                        {item?.ContactNumber || '-'}
                                    </Text>
                                </View>

                                <View style={tw`w-1/2 mb-2`}>
                                    <Text style={[themed.transactionLabel, tw`text-xs`]}>Service</Text>
                                    <Text
                                        style={[themed.listItemText, tw`text-sm font-medium`]}
                                        numberOfLines={1}
                                    >
                                        {item?.ServiceName || '-'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View
                            style={[
                                tw`flex-row justify-between mb-1 p-3 rounded-lg`,
                                { backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6' },
                            ]}
                        >
                            <View style={tw`items-center flex-1`}>
                                <Text style={[themed.transactionLabel, tw`text-[10px]`]}>Bill Amount</Text>
                                <Text style={tw`text-base font-bold text-blue-600`}>
                                    ₹ {item?.TotalBillAmount?.toLocaleString() || 0}
                                </Text>
                            </View>

                            <View style={tw`items-center flex-1`}>
                                <Text style={[themed.transactionLabel, tw`text-[10px]`]}>Paid Amount</Text>
                                <Text style={tw`text-base font-bold text-green-600`}>
                                    ₹ {item?.TotalPaidAmount?.toLocaleString() || 0}
                                </Text>
                            </View>

                            <View style={tw`items-center flex-1`}>
                                <Text style={[themed.transactionLabel, tw`text-[10px]`]}>Balance</Text>
                                <Text
                                    style={[
                                        tw`text-base font-bold`,
                                        balanceAmount === 0 ? tw`text-green-600` : tw`text-red-600`,
                                    ]}
                                >
                                    ₹ {item?.TotalBalanceAmount?.toLocaleString() || 0}
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                ) : null}
            </Animated.View>
        );
    };

    return (
        <View style={[tw`flex-1`, themed.childScreen]}>
            <View style={tw`px-3 pt-3`}>
                <View
                    style={[
                        themed.globalCard,
                        themed.border,
                        tw`flex-row items-center px-4 py-3 rounded-xl`,
                    ]}
                >
                    <Ionicons name="search-outline" size={20} color={themed.chevronColor} />
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search by name, UHID, lab no, barcode..."
                        placeholderTextColor={themed.inputPlaceholder}
                        style={[tw`flex-1 ml-3 py-1`, themed.inputText, { fontSize: 14 }]}
                    />
                    {search ? (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Ionicons name="close-circle" size={20} color={themed.chevronColor} />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>

            {loading ? (
                <View style={tw`flex-1 items-center justify-center`}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={[themed.transactionLabel, tw`text-base mt-4`]}>
                        Loading records...
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredList}
                    keyExtractor={(item, index) =>
                        `${item?.VisitId ?? 'visit'}-${item?.LabNo ?? 'lab'}-${item?.BillNo ?? 'bill'}-${index}`
                    }
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={tw`px-3 pb-30 pt-2`}
                    extraData={{ expandedIndex, actionMenuIndex }}
                    onScrollBeginDrag={closeActionMenu}
                    removeClippedSubviews={false}
                    ListEmptyComponent={
                        <View style={tw`flex-1 items-center justify-center mt-20`}>
                            <Ionicons name="folder-open-outline" size={64} color={themed.chevronColor} />
                            <Text style={[themed.transactionLabel, tw`text-base mt-4`]}>
                                No Records Found
                            </Text>
                            <Text style={[themed.transactionLabel, tw`text-xs mt-2 text-center`]}>
                                Try adjusting your search or check back later
                            </Text>
                        </View>
                    }
                />
            )}

            <Modal
                visible={clientModal}
                transparent
                animationType="none"
                onRequestClose={closeModal}
            >
                <View style={tw`flex-1 bg-black/50`}>
                    <TouchableOpacity
                        style={tw`flex-1`}
                        activeOpacity={1}
                        onPress={closeModal}
                    />
                    <Animated.View
                        style={[
                            themed.modalCard,
                            tw`rounded-t-2xl p-3 h-[80%]`,
                        ]}
                    >
                        <View style={tw`items-center mb-2`}>
                            <View style={tw`w-10 h-1 bg-gray-300 rounded-full`} />
                            <Text style={[themed.listItemText, tw`text-lg font-bold mt-2`]}>
                                Update Patient Information
                            </Text>
                        </View>

                        <UpdatePatientInfo
                            data={selectedPatient}
                            onClose={closeModal}
                            onUpdateSuccess={async () => {
                                await fetchInvestigation(payload);
                                showToast('Patient updated successfully', 'success');
                                closeModal();
                            }}
                        />
                    </Animated.View>
                </View>
            </Modal>

            <Modal
                visible={viewAllUpdateTestModal}
                transparent
                animationType="none"
                onRequestClose={() => setViewAllUpdateTestModal(false)}
            >
                <View style={tw`flex-1 bg-black/50`}>
                    <TouchableOpacity
                        style={tw`flex-1`}
                        activeOpacity={1}
                        onPress={() => setViewAllUpdateTestModal(false)}
                    />
                    <Animated.View
                        style={[
                            themed.modalCard,
                            tw`rounded-t-2xl p-3 h-[80%]`,
                        ]}
                    >
                        <ViewUpdateAllTestDetails
                            visitId={visitId}
                            labNo={labeNo}
                            puhid={puhid}
                            onClose={() => setViewAllUpdateTestModal(false)}
                        />
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
};

export default PatientInformationList;