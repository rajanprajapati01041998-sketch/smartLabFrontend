import { View, Text, TouchableOpacity, Platform } from 'react-native'
import React, { useCallback, useImperativeHandle, useState, forwardRef } from 'react'
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
} from 'react-native-reanimated'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Feather from 'react-native-vector-icons/Feather'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { useAuth } from '../../../../Authorization/AuthContext'
import LinearGradient from 'react-native-linear-gradient'

const DashboardCollection = forwardRef(({ fromDate, toDate, branchId }, ref) => {

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
    })

    const { loginBranchId, userData, user, userId } = useAuth()
    const navigation = useNavigation()

    const scaleValue = useSharedValue(1)

    const getDashboardData = useCallback(async (id) => {
        const selectedBranchId = branchId ?? loginBranchId;

        try {
            const response = await api.get(
                `Dashboard/states?branchId=${loginBranchId}&userId=${id}&roleId=${user?.roles?.[0] || 1}&clientIdList=${selectedBranchId}&fromDate=${fromDate}&toDate=${toDate}`
            );

            if (response.data) {
                setDashboardData(response.data)
            }

            scaleValue.value = withSpring(1.02, {}, () => {
                scaleValue.value = withSpring(1)
            })

        } catch (error) {
            console.log("dashboard error", error)
        }
    }, [branchId, fromDate, loginBranchId, toDate, user?.roles])

    useFocusEffect(
        useCallback(() => {
            if (userId) {
                getDashboardData(userId)
            }
        }, [branchId, fromDate, getDashboardData, toDate, userId])
    )

    useImperativeHandle(ref, () => ({
        refresh: () => getDashboardData(userId),
    }))

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
        },
        {
            title: "Total Collection",
            value: formatCurrency(dashboardData.totalCollection),
            icon: "wallet",
            gradientType: "collection",
        },
        {
            title: "Hospital Collection",
            value: formatCurrency(dashboardData.totalHospitalCollection),
            icon: "hospital-building",
            gradientType: "hospital",
        },
        {
            title: "Store Collection",
            value: formatCurrency(dashboardData.totalStoreCollection),
            icon: "store",
            gradientType: "store",
        },
        {
            title: "Sample Pending",
            value: dashboardData.totalSamplePending,
            icon: "package-variant",
            gradientType: "samplePending",
        },
        {
            title: "Sample Collected",
            value: dashboardData.totalSampleCollected,
            icon: "check-circle",
            gradientType: "sampleCollected",
        },
        {
            title: "Reports Pending",
            value: dashboardData.totalResultsPending,
            icon: "file-document",
            gradientType: "reportsPending",
        },
        {
            title: "Reports Done",
            value: dashboardData.totalResultsDone,
            icon: "clock-check",
            gradientType: "reportsDone",
        }
    ]

    const StatsCard = ({ item, index }) => {

        const gradientColors = getGradientColors(item.gradientType)

        return (
            <Animated.View
                entering={FadeInDown.delay(index * 80).springify()}
                layout={Layout.springify()}
                style={[
                    tw`mb-4`,
                    { width: Platform.OS === 'ios' ? '48%' : '48%' } // ✅ iOS fix
                ]}
            >
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('HelpDesk', {
                        screen: 'HelpDeskHome',
                    })}
                >
                    <Animated.View>
                        <View style={tw`rounded-2xl shadow-lg `}>

                            <LinearGradient
                                colors={gradientColors}
                                style={[
                                    tw`rounded-md h-24 `,
                                    Platform.OS === 'ios'
                                        ? {
                                            paddingHorizontal: 1,
                                            paddingVertical: 4,
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 3 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 4,
                                        }
                                        : {
                                            padding: 16,
                                            elevation: 5,
                                        }
                                ]}
                             >

                                {/* Header */}
                                <View style={tw`flex-row ${Platform.OS === 'ios' ? 'justify-center gap-2' : "justify-between"}  items-center mb-3`}>
                                    <View style={tw`bg-white/20 rounded-full p-2`}>
                                        <Icon
                                            name={item.icon}
                                            size={Platform.OS === 'ios' ? 20 : 24}
                                            color="white"
                                        />
                                    </View>

                                    <Text style={[
                                        tw`text-white font-bold`,
                                        { fontSize: Platform.OS === 'ios' ? 14 : 24 } // ✅ font fix
                                    ]}>
                                        {item.value}
                                    </Text>
                                </View>

                                {/* Title */}
                                <Text style={[
                                    tw`text-white/90 text-center`,
                                    { fontSize: Platform.OS === 'ios' ? 13 : 14 }
                                ]}>
                                    {item.title}
                                </Text>

                            </LinearGradient>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            </Animated.View>
        )
    }

    return (
        <View style={[
            tw`pt-2 flex-row flex-wrap justify-between`,
            { paddingHorizontal: Platform.OS === 'ios' ? 2 : 0 } // ✅ spacing fix
        ]}>
            {statsCards.map((item, index) => (
                <StatsCard key={index} item={item} index={index} />
            ))}
        </View>
    )
})

export default DashboardCollection