import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/Feather';

const CustomToast = ({ message, visible, type = 'success', onHide }) => {
    const translateY = useRef(new Animated.Value(-120)).current;
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Slide down
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();

            // Progress bar animation
            progress.setValue(0);
            Animated.timing(progress, {
                toValue: 1,
                duration: 2500,
                useNativeDriver: false,
            }).start();

            // Auto hide
            setTimeout(() => {
                hide();
            }, 2500);
        }
    }, [visible]);

    const hide = () => {
        Animated.timing(translateY, {
            toValue: -120,
            duration: 300,
            useNativeDriver: true,
        }).start(onHide);
    };

    // 🎨 Colors & Icons based on type
    const config = {
        success: {
            bg: 'bg-green-500',
            icon: 'check-circle',
            text: 'text-white',
        },
        info: {
            bg: 'bg-blue-500',
            icon: 'info',
            text: 'text-white',
        },
        warning: {
            bg: 'bg-orange-500',
            icon: 'alert-triangle',
            text: 'text-white',
        },
        error: {
            bg: 'bg-red-500',
            icon: 'alert-circle',
            text: 'text-white',
        },
    };

    const current = config[type] || config.success;

    return (
        <Animated.View
            style={[
                tw`absolute top-10 left-4 right-4 z-50`,
                { transform: [{ translateY }] },
            ]}
        >
            <View style={tw`${current.bg} rounded-full shadow-md p-3`}>

                {/* Top Row */}
                <View style={tw`flex-row items-center justify-between`}>

                    {/* Left Section */}
                    <View style={tw`flex-row items-center flex-1`}>
                        <Icon
                            name={current.icon}
                            size={20}
                            color="#fff"
                            style={tw`mr-2`}
                        />

                        <Text style={tw`text-white`}>
                            {message}
                        </Text>
                    </View>

                    {/* Close Button */}
                    <TouchableOpacity onPress={hide}>
                        <Icon name="x" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Progress Bar */}
                <Animated.View
                    style={[
                        tw`h-0.5 mt-2 rounded bg-white`, // ✅ correct
                        {
                            width: progress.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '100%'],
                            }),
                        },
                    ]}
                />
            </View>
        </Animated.View>
    );
};

export default CustomToast;