import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Dimensions } from 'react-native'
import React, { useCallback, useState, useRef } from 'react'
import tw from 'twrnc'
import api from '../../../../Authorization/api'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import Animated, {
    FadeInDown,
    FadeInUp,
    Layout,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    interpolate,
    Extrapolate
} from 'react-native-reanimated'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Feather from 'react-native-vector-icons/Feather'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { useAuth } from '../../../../Authorization/AuthContext'
import LinearGradient from 'react-native-linear-gradient'

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
    const { loginBranchId, userData, user, userId } = useAuth()
    const navigation = useNavigation()

    // Animation values
    const scaleValue = useSharedValue(1)
    const fadeAnim = useSharedValue(0)
    const translateY = useSharedValue(50)
    const headerScale = useSharedValue(0.8)
    const headerOpacity = useSharedValue(0)

    useFocusEffect(
        useCallback(() => {
            console.log("dashboard", fromDate, toDate, branchId)
            console.log("ON user", userData)
            if (userId) {
                getDashboardData(userId)
            }

            // Start animations
            fadeAnim.value = withTiming(1, { duration: 1000 })
            translateY.value = withTiming(0, { duration: 800 })
            headerScale.value = withSpring(1, { damping: 10, stiffness: 100 })
            headerOpacity.value = withTiming(1, { duration: 600 })
        }, [fromDate, toDate, branchId, userId])
    )

    const getDashboardData = async (id) => {
        const selectedBranchId = branchId ?? loginBranchId;

        try {
            setLoading(true)
            const response = await api.get(
                `Dashboard/states?branchId=${loginBranchId}&userId=${id}&roleId=${user?.roles?.[0] || 1}&clientIdList=${selectedBranchId}&fromDate=${fromDate}&toDate=${toDate}`
            );
            console.log("dashboard", response.data)

            if (response.data) {
                setDashboardData(response.data)
            }

            // Animate scale for refresh effect with bounce
            scaleValue.value = withSpring(1.02, {
                damping: 8,
                stiffness: 150,
                mass: 0.5
            }, () => {
                scaleValue.value = withSpring(1, { damping: 12, stiffness: 120 })
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
        getDashboardData(userId)
    }, [userId])

    // Animated styles
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scaleValue.value }],
            opacity: fadeAnim.value
        }
    })

    const headerAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: translateY.value },
                { scale: headerScale.value }
            ],
            opacity: headerOpacity.value
        }
    })

    const formatCurrency = (amount) => {
        return `₹ ${amount?.toLocaleString('en-IN') || '0'}`
    }

    const getGradientColors = (type) => {
        const gradients = {
            visited: ['#9bf6d8', '#23b98a'],
            collection: ['#efa017', '#cfb69a'],
            hospital: ['#bda6f3', '#6d42b8'],
            store: ['#cb92ae', '#f56eab'],
            samplePending: ['#f97316', '#efb392'],
            sampleCollected: ['#a4e8f4', '#39bcdc'],
            reportsPending: ['#63a1f1', '#8582c8'],
            reportsDone: ['#5ec1b5', '#449a64']
        }
        return gradients[type] || ['#6b7280', '#4b5563']
    }

    const statsCards = [
        {
            title: "Visited Patients",
            value: dashboardData.totalVisitedCount,
            icon: "account-group",
            gradientType: "visited",
            suffix: "Patients",

        },
        {
            title: "Total Collection",
            value: formatCurrency(dashboardData.totalCollection),
            icon: "wallet",
            gradientType: "collection",
            suffix: "Collected",

        },
        {
            title: "Hospital Collection",
            value: formatCurrency(dashboardData.totalHospitalCollection),
            icon: "hospital-building",
            gradientType: "hospital",
            suffix: "Revenue",

        },
        {
            title: "Store Collection",
            value: formatCurrency(dashboardData.totalStoreCollection),
            icon: "store",
            gradientType: "store",
            suffix: "Sales",

        },
        {
            title: "Sample Pending",
            value: dashboardData.totalSamplePending,
            icon: "package-variant",
            gradientType: "samplePending",
            suffix: "Samples",

        },
        {
            title: "Sample Collected",
            value: dashboardData.totalSampleCollected,
            icon: "check-circle",
            gradientType: "sampleCollected",
            suffix: "Samples",

        },
        {
            title: "Reports Pending",
            value: dashboardData.totalResultsPending,
            icon: "file-document",
            gradientType: "reportsPending",
            suffix: "Reports",

        },
        {
            title: "Reports Done",
            value: dashboardData.totalResultsDone,
            icon: "clock-check",
            gradientType: "reportsDone",
            suffix: "Reports",

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
        const scaleAnim = useSharedValue(1)

        const handlePressIn = () => {
            scaleAnim.value = withSpring(0.96, { damping: 10 })
        }

        const handlePressOut = () => {
            scaleAnim.value = withSpring(1, { damping: 10 })
        }

        const animatedCardStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scaleAnim.value }]
        }))

        const gradientColors = getGradientColors(item.gradientType)

        return (
            <Animated.View
                entering={FadeInDown
                    .delay(index * 80)
                    .duration(600)
                    .springify()
                    .damping(12)
                    .stiffness(100)
                }
                layout={Layout.springify()}
                style={tw`w-[48%] mb-4 `}
            >
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={() => navigation.navigate('HelpDesk', {
                        screen: 'HelpDeskHome',
                    })}
                >
                    <Animated.View style={animatedCardStyle}>
                        <LinearGradient
                            colors={gradientColors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={tw`rounded-2xl p-4 shadow-lg`}
                        >
                            {/* Icon and Trend Indicator */}
                            <View style={tw`flex-row justify-between items-center mb-3`}>
                                <View style={tw`bg-white/20 rounded-full p-2`}>
                                    {renderIcon(item.icon, "MaterialCommunityIcons", 24, "white")}
                                </View>

                                {/* Value */}
                                <Text style={tw`text-2xl font-bold text-white mb-1`}>
                                    {item.value}
                                </Text>
                            </View>



                            {/* Title */}
                            <Text style={tw`text-white/90 text-sm font-medium mb-2 text-center`}>
                                {item.title}
                            </Text>

                        </LinearGradient>
                    </Animated.View>
                </TouchableOpacity>
            </Animated.View>
        )
    }




    return (
        <ScrollView
            style={tw`flex-1 bg-white`}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#10b981"
                    colors={['#10b981']}
                    progressBackgroundColor="white"
                />
            }
        >





            {/* Stats Cards Grid */}
            <View style={tw` pt-2 `}>
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