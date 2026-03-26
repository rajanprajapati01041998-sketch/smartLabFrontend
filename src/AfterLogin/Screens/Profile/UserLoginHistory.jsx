import { View, Text, FlatList, ActivityIndicator, Animated, Alert } from 'react-native'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import tw from 'twrnc'
import { useAuth } from '../../../../Authorization/AuthContext'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import api from '../../../../Authorization/api'

const UserLoginHistory = () => {
    const { userData } = useAuth()
    const [loading, setLoading] = useState(false)
    const [loginHistory, setLoginHistory] = useState([])
    const navigation = useNavigation()

    // Animation values for main container
    const fadeAnim = useRef(new Animated.Value(0)).current
    const slideAnim = useRef(new Animated.Value(50)).current

    // Store animation values for each item
    const [itemAnimations, setItemAnimations] = useState({})

    const getUserLoginHistory = async (id) => {
        try {
            setLoading(true)
            const response = await api.get(`Login/login-history/${id}`)
            console.log("history", response)

            if (response?.data) {
                setLoginHistory(response.data)
                // Create animation values for each item
                const animations = {}
                response.data.forEach((_, index) => {
                    animations[index] = {
                        fade: new Animated.Value(0),
                        slide: new Animated.Value(30)
                    }
                })
                setItemAnimations(animations)

                // Start main container animation
                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(slideAnim, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                    })
                ]).start()

                // Start staggered animations for items
                Object.keys(animations).forEach((key, index) => {
                    Animated.parallel([
                        Animated.timing(animations[key].fade, {
                            toValue: 1,
                            duration: 300,
                            delay: index * 100,
                            useNativeDriver: true,
                        }),
                        Animated.timing(animations[key].slide, {
                            toValue: 0,
                            duration: 300,
                            delay: index * 100,
                            useNativeDriver: true,
                        })
                    ]).start()
                })
            }
        } catch (error) {
            console.log("history error", error?.response)
        } finally {
            setLoading(false)
        }
    }

    useFocusEffect(
        useCallback(() => {
            if (userData?.id) {
                getUserLoginHistory(userData.id)
            } else {
                navigation.navigate('Dashboard')
            }

            return () => {
                // optional cleanup
            }
        }, [userData])
    )

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    }

    const getDeviceIcon = (browser, device) => {
        if (browser === 'Handset' || device?.includes('phone')) {
            return '📱'
        } else if (browser === 'react native') {
            return '📲'
        }
        return '💻'
    }

    const renderItem = ({ item, index }) => {
        // Get pre-created animations for this item
        const animations = itemAnimations[index]

        // If animations aren't ready yet, render without animation
        if (!animations) {
            return (
                <View style={tw`mx-4 my-2 p-4 bg-white rounded-lg shadow-md`}>
                    <RenderItemContent item={item} index={index} />
                </View>
            )
        }

        return (
            <Animated.View
                style={[
                    tw`mx-4 my-2 p-4 bg-white rounded-lg shadow-md`,
                    {
                        opacity: animations.fade,
                        transform: [{ translateX: animations.slide }]
                    }
                ]}
            >
                <RenderItemContent item={item} index={index} />
            </Animated.View>
        )
    }

    // Separate component for item content to keep code organized
    const RenderItemContent = ({ item, index }) => (
        <View style={tw`flex-row items-start justify-between`}>
            <View style={tw`flex-1`}>
                <View style={tw`flex-row items-center mb-2`}>
                    <Text style={tw`text-2xl mr-2`}>
                        {getDeviceIcon(item.browser, item.device)}
                    </Text>
                    <View>
                        <Text style={tw`font-bold text-gray-800`}>
                            {item.device}
                        </Text>
                        <Text style={tw`text-xs text-gray-500`}>
                            {item.browser}
                        </Text>
                    </View>
                </View>

                <View style={tw`mt-2`}>
                    <Text style={tw`text-sm text-gray-600`}>
                        <Text style={tw`font-semibold`}>OS:</Text> {item.os}
                    </Text>
                    <Text style={tw`text-sm text-gray-600 mt-1`}>
                        <Text style={tw`font-semibold`}>IP:</Text> {item.ipAddress}
                    </Text>
                    <Text style={tw`text-sm text-gray-600 mt-1`}>
                        <Text style={tw`font-semibold`}>Session ID:</Text> {item.sessionId}
                    </Text>
                    <Text style={tw`text-xs text-gray-400 mt-2`}>
                        {formatDate(item.loginAt)}
                    </Text>
                </View>
            </View>

            {index === 0 && (
                <View style={tw`bg-green-500 px-2 py-1 rounded-full`}>
                    <Text style={tw`text-white text-xs font-bold`}>Current</Text>
                </View>
            )}
        </View>
    )

    if (loading) {
        return (
            <View style={tw`flex-1 justify-center items-center bg-gray-50`}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={tw`mt-4 text-gray-600`}>Loading login history...</Text>
            </View>
        )
    }

    return (
        <View style={tw`flex-1 bg-gray-50`}>
            <Text style={tw`text-gray-700 text-md mt-2 px-4`}>
                {loginHistory.length} {loginHistory.length === 1 ? 'session' : 'sessions'} recorded
            </Text>

            {loginHistory.length > 0 ? (
                <FlatList
                    data={loginHistory}
                    keyExtractor={(item, index) => `${item.sessionId}-${index}`}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={tw`py-4`}
                />
            ) : (
                <Animated.View
                    style={[
                        tw`flex-1 justify-center items-center`,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Text style={tw`text-4xl mb-4`}>📭</Text>
                    <Text style={tw`text-gray-500 text-center`}>
                        No login history found
                    </Text>
                </Animated.View>
            )}
        </View>
    )
}

export default UserLoginHistory