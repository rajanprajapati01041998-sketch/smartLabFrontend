import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native'
import React, { useCallback, useState } from 'react'
import tw from 'twrnc'
import api from '../../../../Authorization/api'
import { useFocusEffect } from '@react-navigation/native'
import Animated, {
    FadeInDown,
    FadeInUp,
    Layout,
    SlideInRight,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Feather from 'react-native-vector-icons/Feather'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { Dimensions } from 'react-native'
import { LineChart } from 'react-native-chart-kit'
import { useAuth } from '../../../../Authorization/AuthContext'

const { width: screenWidth } = Dimensions.get('window')

const DashboardCollection = ({ fromDate, toDate, branchId }) => {
    const [dashboardData, setDashboardData] = useState({
        totalVisitedCount: 0,
        totalCollection: 0,
        grandTotalCollection: 0,
        totalHospitalCollection: 0,
        totalStoreCollection: 0,
        totalSamplePending: 0,
        totalSampleCollected: 0,
        totalResultsPending: 0,
        totalResultsDone: 0,
        todayPurchaseTotalInvoice: 0,
        todayPurchaseTotalMRP: 0,
        totalStockOnMRP: 0,
        totalStockOnTrade: 0
    })

    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const { loginBranchId, userData, user } = useAuth()

    // Animation values
    const scaleValue = useSharedValue(1)
    const fadeAnim = useSharedValue(0)
    const translateY = useSharedValue(50)

    useFocusEffect(
        useCallback(() => {
            console.log("ON user", userData)
            if (userData?.user?.id) {
                getDashboardData(userData?.user?.id)

            }
            fadeAnim.value = withTiming(1, { duration: 800 })
            translateY.value = withTiming(0, { duration: 600 })
        }, [fromDate, toDate, branchId])
    )

    console.log(user.roles)

    const getDashboardData = async (id) => {
        const selectedBranchId = branchId ?? loginBranchId;
        // console.log("clientid",selectedBranchId)

        try {
            setLoading(true)
            const response = await api.get(
                `Dashboard/states?branchId=${loginBranchId}&userId=${id}&roleId=${user.roles[0]}&clientIdList=${selectedBranchId}&fromDate=${fromDate}&toDate=${toDate}`
            );
            console.log("dashboard", response.data)

            if (response.data) {
                setDashboardData(response.data)
            }

            // Animate scale for refresh effect
            scaleValue.value = withSpring(1.05, { damping: 10 }, () => {
                scaleValue.value = withSpring(1)
            })

        } catch (error) {
            console.log("dashboard error", error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        getDashboardData()
    }, [])

    // Animated styles
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scaleValue.value }],
            opacity: fadeAnim.value
        }
    })

    const headerAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
            opacity: fadeAnim.value
        }
    })

    const formatCurrency = (amount) => {
        return `₹ ${amount?.toLocaleString('en-IN') || '0'}`
    }

    const statsCards = [
        {
            title: "Visited Patients",
            value: dashboardData.totalVisitedCount,
            bg: "bg-emerald-100",
            icon: "account-group",
            iconType: "MaterialCommunityIcons",
            iconBg: "bg-emerald-200",
            textColor: "text-emerald-700",
            valueColor: "text-emerald-800",
            suffix: "Patients"
        },
        {
            title: "Total Collection",
            value: formatCurrency(dashboardData.totalCollection),
            bg: "bg-amber-100",
            icon: "wallet",
            iconType: "MaterialCommunityIcons",
            iconBg: "bg-amber-200",
            textColor: "text-amber-700",
            valueColor: "text-amber-800",
            suffix: "Collected"
        },
        {
            title: "Hospital Collection",
            value: formatCurrency(dashboardData.totalHospitalCollection),
            bg: "bg-purple-100",
            icon: "hospital-building",
            iconType: "MaterialCommunityIcons",
            iconBg: "bg-purple-200",
            textColor: "text-purple-700",
            valueColor: "text-purple-800",
            suffix: "Revenue"
        },
        {
            title: "Store Collection",
            value: formatCurrency(dashboardData.totalStoreCollection),
            bg: "bg-rose-100",
            icon: "store",
            iconType: "MaterialCommunityIcons",
            iconBg: "bg-rose-200",
            textColor: "text-rose-700",
            valueColor: "text-rose-800",
            suffix: "Sales"
        },
        {
            title: "Sample Pending",
            value: dashboardData.totalSamplePending,
            bg: "bg-orange-100",
            icon: "package-variant",
            iconType: "MaterialCommunityIcons",
            iconBg: "bg-orange-200",
            textColor: "text-orange-700",
            valueColor: "text-orange-800",
            suffix: "Samples"
        },
        {
            title: "Sample Collected",
            value: dashboardData.totalSampleCollected,
            bg: "bg-cyan-100",
            icon: "check-circle",
            iconType: "MaterialCommunityIcons",
            iconBg: "bg-cyan-200",
            textColor: "text-cyan-700",
            valueColor: "text-cyan-800",
            suffix: "Samples"
        },
        {
            title: "Reports Pending",
            value: dashboardData.totalResultsPending,
            bg: "bg-indigo-100",
            icon: "file-document",
            iconType: "MaterialCommunityIcons",
            iconBg: "bg-indigo-200",
            textColor: "text-indigo-700",
            valueColor: "text-indigo-800",
            suffix: "Reports"
        },
        {
            title: "Reports Done",
            value: dashboardData.totalResultsDone,
            bg: "bg-teal-100",
            icon: "clock-check",
            iconType: "MaterialCommunityIcons",
            iconBg: "bg-teal-200",
            textColor: "text-teal-700",
            valueColor: "text-teal-800",
            suffix: "Reports"
        }
    ]

    const renderIcon = (iconName, iconType, size, color) => {
        switch (iconType) {
            case 'MaterialCommunityIcons':
                return <Icon name={iconName} size={size} color={color} />
            case 'Ionicons':
                return <Ionicons name={iconName} size={size} color={color} />
            case 'FontAwesome':
                return <FontAwesome name={iconName} size={size} color={color} />
            case 'Feather':
                return <Feather name={iconName} size={size} color={color} />
            case 'AntDesign':
                return <AntDesign name={iconName} size={size} color={color} />
            default:
                return <Icon name={iconName} size={size} color={color} />
        }
    }

    const StatsCard = ({ item, index }) => {
        const isNumericValue = typeof item.value === 'number' && item.value !== 'string'

        return (
            <Animated.View
                entering={FadeInDown.delay(index * 100).springify()}
                layout={Layout.springify()}
                style={tw`w-[48%] mb-3`}
            >
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => console.log(`Pressed ${item.title}`)}
                >
                    <Animated.View
                        style={[
                            tw`${item.bg} rounded-xl p-4 shadow-sm`,
                            { elevation: 2 }
                        ]}
                    >
                        {/* <View style={tw`flex-row justify-between items-start mb-3`}>
                            <View style={tw`${item.iconBg} rounded-full p-2`}>
                                {renderIcon(item.icon, item.iconType, 16, item.valueColor?.replace('text-', '').replace('-800', '-600') || '#374151')}
                            </View>
                            {item.trend && (
                                <View style={tw`flex-row items-center bg-white rounded-full px-2 py-1 shadow-sm`}>
                                    {item.trendUp ? (
                                        <AntDesign name="arrowup" size={12} color="#10b981" />
                                    ) : (
                                        <AntDesign name="arrowdown" size={12} color="#ef4444" />
                                    )}
                                    <Text style={tw`text-gray-600 text-xs ml-1 font-semibold`}>
                                        {item.trend}
                                    </Text>
                                </View>
                            )}
                        </View> */}

                        <View style={tw`flex flex-col justify-center items-center`}>
                            <Text style={tw`text-xl font-bold ${item.valueColor} mb-1 text-center`}>
                                {item.value}
                            </Text>

                            <Text style={tw`text-sm ${item.textColor} font-medium text-center`}>
                                {item.title}
                            </Text>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            </Animated.View>
        )
    }

    return (
        <ScrollView
            style={tw`flex-1 `}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#10b981"
                    colors={['#10b981']}
                />
            }
        >
            {/* Header Section */}


            {/* Stats Cards Grid */}
            <View style={tw``}>
                <Animated.View
                    entering={FadeInUp.delay(200).springify()}
                    style={tw`flex-row flex-wrap justify-between`}
                >
                    {statsCards.map((item, index) => (
                        <StatsCard key={index} item={item} index={index} />
                    ))}
                </Animated.View>
            </View>
        </ScrollView>
    )
}

export default DashboardCollection