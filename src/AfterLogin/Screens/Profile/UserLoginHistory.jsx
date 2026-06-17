import { View, Text, FlatList, ActivityIndicator, RefreshControl, Dimensions } from 'react-native'
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import api from '../../../../Authorization/api'
import { useAuth } from '../../../../Authorization/AuthContext'
import tw from 'twrnc'
import { getAddressFromLatLng } from '../../../utils/patinetService.js/location'
import { useTheme } from '../../../../Authorization/ThemeContext'
import { getThemeStyles } from '../../../utils/themeStyles'

const { width } = Dimensions.get('window')

const UserLoginHistory = () => {
    const { userId } = useAuth()
    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize] = useState(20)
    const [loginHistory, setLoginHistory] = useState([])
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [totalRecords, setTotalRecords] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const theme = useTheme()
    const themed = getThemeStyles(theme)

    const getAllLocation = async (refresh = false) => {
        try {
            if (refresh) {
                setRefreshing(true);
                setPageNumber(1);
            } else {
                setLoading(true);
            }

            const response = await api.get(
                `Login/login-history/${userId}?pageNumber=${pageNumber}&pageSize=${pageSize}`
            );

            if (response?.data?.data) {

                const historyWithAddress = await Promise.all(
                    response.data.data.map(async (item) => {
                        let address = 'Location not available';

                        if (item.latitudeApp && item.longitudeApp) {
                            address = await getAddressFromLatLng(
                                item.latitudeApp,
                                item.longitudeApp
                            );
                        }

                        return {
                            ...item,
                            address,
                        };
                    })
                );

                if (refresh || pageNumber === 1) {
                    setLoginHistory(historyWithAddress);
                } else {
                    setLoginHistory(prev => [
                        ...prev,
                        ...historyWithAddress,
                    ]);
                }

                setTotalRecords(response.data.totalRecords || 0);
                setTotalPages(response.data.totalPages || 0);
            }
        } catch (error) {
            console.log('history error', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (userId) {
            getAllLocation()
        }
    }, [userId, getAllLocation])

    const formatDate = useCallback((dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    }, [])

    const getDeviceIcon = useCallback((device) => {
        const deviceLower = device?.toLowerCase() || ''
        if (deviceLower.includes('iphone') || deviceLower.includes('ios')) return '📱'
        if (deviceLower.includes('android')) return '🤖'
        if (deviceLower.includes('windows')) return '💻'
        if (deviceLower.includes('mac')) return '🍎'
        if (deviceLower.includes('linux')) return '🐧'
        return '📟'
    }, [])

    const getBrowserIcon = useCallback((browser) => {
        const browserLower = browser?.toLowerCase() || ''
        if (browserLower.includes('chrome')) return '🌐'
        if (browserLower.includes('firefox')) return '🦊'
        if (browserLower.includes('safari')) return '🧭'
        if (browserLower.includes('edge')) return '🌊'
        if (browserLower.includes('opera')) return '🎭'
        return '🌍'
    }, [])

    const getStatusColor = useCallback((item) => {
        const logoutAt = item?.logoutAt
        if (!logoutAt) return 'bg-green-100 border-green-300'
        const logoutDate = new Date(logoutAt)
        const now = new Date()
        const diffHours = (now - logoutDate) / (1000 * 60 * 60)
        if (diffHours > 24) return 'bg-gray-100 border-gray-300'
        if (diffHours > 1) return 'bg-yellow-100 border-yellow-300'
        return 'bg-blue-100 border-blue-300'
    }, [])

    const getStatusText = useCallback((item) => {
        const logoutAt = item?.logoutAt
        if (!logoutAt) return { text: 'Active', color: 'text-green-700' }
        const logoutDate = new Date(logoutAt)
        const now = new Date()
        const diffHours = (now - logoutDate) / (1000 * 60 * 60)
        if (diffHours > 24) return { text: 'Expired', color: 'text-gray-700' }
        if (diffHours > 1) return { text: 'Inactive', color: 'text-yellow-700' }
        return { text: 'Recent', color: 'text-blue-700' }
    }, [])

    const renderItem = useCallback(({ item, index }) => {
        const status = getStatusText(item)
        const statusColor = getStatusColor(item)
        const deviceIcon = getDeviceIcon(item.device)
        const browserIcon = getBrowserIcon(item.browser)

        return (
            <View
                style={[themed.childScreen2, themed.border, tw`mx-4 my-2  overflow-hidden`]}
            >
                {/* Header with status */}
                <View style={tw`px-5 py-3 flex-row justify-between items-center border-b border-gray-100`}>
                    <View style={tw`flex-row items-center`}>
                        <Text style={tw`text-lg mr-2`}>🔐</Text>
                        <Text style={tw`text-sm font-semibold text-gray-700`}>
                            Session #{loginHistory.length - index}
                        </Text>
                    </View>
                    <View style={[tw`px-3 py-1 rounded-full border`, statusColor]}>
                        <Text style={[tw`text-xs font-medium`, status.color]}>
                            {status.text}
                        </Text>
                    </View>
                </View>

                {/* Device & Browser Info */}
                <View style={tw`px-5 py-3 flex-row items-center border-b border-gray-50`}>
                    <View style={tw`flex-row items-center flex-1 mr-4`}>
                        <Text style={tw`text-lg mr-2`}>{deviceIcon}</Text>
                        <Text style={tw`text-sm text-gray-700`} numberOfLines={1}>
                            {item.device || 'Unknown Device'}
                        </Text>
                    </View>
                    <View style={tw`flex-row items-center`}>
                        <Text style={tw`text-base mr-1.5`}>{browserIcon}</Text>
                        <Text style={tw`text-sm text-gray-600`} numberOfLines={1}>
                            {item.browser || 'N/A'}
                        </Text>
                    </View>
                </View>

                {/* OS & IP */}
                <View style={tw`px-5 py-2 flex-row justify-between border-b border-gray-50`}>
                    <View style={tw`flex-row items-center`}>
                        <Text style={tw`text-sm text-gray-400 mr-2`}>💿</Text>
                        <Text style={tw`text-sm text-gray-600`}>
                            {item.os || 'N/A'}
                        </Text>
                    </View>
                    <View style={tw`flex-row items-center`}>
                        <Text style={tw`text-sm text-gray-400 mr-2`}>🌐</Text>
                        <Text style={tw`text-sm text-gray-600 font-mono`}>
                            {item.ipAddress || 'N/A'}
                        </Text>
                    </View>
                </View>

                {/* Location */}
                {item.latitudeApp && item.longitudeApp && (
                    <View style={tw`py-1.5 border-b border-gray-50 px-8`}>
                        <View style={tw`flex-row items-start`}>
                            <Text style={tw`text-sm text-gray-800 flex-1 italic`}>
                                {item.address}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Timestamps */}
                <View style={tw`px-5 py-3 flex-row justify-between bg-gray-50/50`}>
                    <View style={tw`flex-1 mr-4`}>
                        <Text style={tw`text-xs text-gray-400 uppercase tracking-wider mb-0.5`}>
                            Login
                        </Text>
                        <Text style={tw`text-xs text-gray-700 font-medium`}>
                            {formatDate(item.loginAt)}
                        </Text>
                    </View>
                    {item.logoutAt && (
                        <View style={tw`flex-1`}>
                            <Text style={tw`text-xs text-gray-400 uppercase tracking-wider mb-0.5`}>
                                Logout
                            </Text>
                            <Text style={tw`text-xs text-gray-700 font-medium`}>
                                {formatDate(item.logoutAt)}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        )
    }, [formatDate, getBrowserIcon, getDeviceIcon, getStatusColor, getStatusText, loginHistory.length])

    const loadMore = useCallback(() => {
        if (!loading && !refreshing && pageNumber < totalPages) {
            setPageNumber(prev => prev + 1)
        }
    }, [loading, refreshing, pageNumber, totalPages])

    const onRefresh = useCallback(() => {
        if (userId) {
            getAllLocation(true)
        }
    }, [userId, getAllLocation])

    const keyExtractor = useCallback((item, index) =>
        `${item.sessionId}-${index}-${item.loginAt || ''}`, [])

    // Memoized header component
    const headerComponent = useMemo(() => (
        <View style={[themed.childScreen2, themed.border_b, tw` px-5 py-5 `]}>
            <View style={tw`flex-row justify-between items-center `}>
                <Text style={[themed.headerTitle, tw`text-xl font-bold text-gray-800`]}>
                    Login Activity
                </Text>
                <View style={tw`bg-blue-500 rounded-full w-8 h-8 items-center justify-center`}>
                    <Text style={tw`text-white text-xs font-bold`}>
                        {totalRecords}
                    </Text>
                </View>
            </View>
            <View style={tw`flex-row justify-between items-center`}>
                <Text style={tw`text-xs text-gray-500`}>
                    {totalRecords} total sessions
                </Text>
                <View style={tw`bg-gray-100 px-3 py-1 rounded-lg`}>
                    <Text style={tw`text-xs font-medium text-gray-600`}>
                        Page {pageNumber} / {totalPages || 1}
                    </Text>
                </View>
            </View>
        </View>
    ), [totalRecords, totalPages, pageNumber])

    // Loading State
    if (loading && loginHistory.length === 0) {
        return (
            <View style={[themed.childScreen2, tw`flex-1 justify-center items-center `]}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={tw`mt-4 text-gray-600 text-base font-medium`}>
                    Loading session history...
                </Text>
                <View style={tw`mt-2 flex-row items-center`}>
                    <View style={tw`w-2 h-2 bg-blue-400 rounded-full mr-1`} />
                    <View style={tw`w-2 h-2 bg-blue-400 rounded-full mr-1 opacity-60`} />
                    <View style={tw`w-2 h-2 bg-blue-400 rounded-full opacity-30`} />
                </View>
            </View>
        )
    }

    return (
        <View style={[themed.childScreen2, tw`flex-1`]}>
            {headerComponent}
            <FlatList
                data={loginHistory}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#3B82F6']}
                        tintColor="#3B82F6"
                        progressBackgroundColor="#FFFFFF"
                    />
                }
                ListFooterComponent={
                    loading && loginHistory.length > 0 ? (
                        <View style={tw`py-6 items-center`}>
                            <ActivityIndicator size="small" color="#3B82F6" />
                            <Text style={tw`text-gray-400 text-xs mt-2`}>
                                Loading more sessions...
                            </Text>
                        </View>
                    ) : pageNumber >= totalPages && loginHistory.length > 0 ? (
                        <View style={tw`py-8 items-center`}>
                            <View style={tw`w-12 h-0.5 bg-gray-200 rounded-full mb-3`} />
                            <Text style={tw`text-gray-300 text-sm font-medium tracking-widest`}>
                                END OF HISTORY
                            </Text>
                            <Text style={tw`text-gray-400 text-xs mt-1`}>
                                {totalRecords} total sessions
                            </Text>
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    <View style={tw`py-20 items-center`}>
                        <View style={tw`w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4`}>
                            <Text style={tw`text-4xl`}>📋</Text>
                        </View>
                        <Text style={tw`text-gray-400 text-base font-medium`}>
                            No login history found
                        </Text>
                        <Text style={tw`text-gray-300 text-sm mt-1`}>
                            Your sessions will appear here
                        </Text>
                    </View>
                }
                contentContainerStyle={tw`pb-6 pt-1`}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={21}
            />
        </View>
    )
}

export default UserLoginHistory