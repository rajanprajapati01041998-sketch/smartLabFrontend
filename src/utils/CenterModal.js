import React, { useRef, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    Pressable,
    Animated,
    Dimensions,
} from "react-native";
import tw from "twrnc";

const { height: screenHeight } = Dimensions.get("window");

const CenterModal = ({ visible, onClose, children }) => {
    // Animation values
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        if (visible) {
            // Animate in
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Reset values when modal closes
            scaleAnim.setValue(0);
            fadeAnim.setValue(0);
            slideAnim.setValue(50);
        }
    }, [visible]);

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            {/* BACKDROP with fade animation */}
            <Animated.View 
                style={[
                    tw`flex-1 bg-black/50 justify-center items-center px-4`,
                    { opacity: fadeAnim }
                ]}
            >
                {/* STOP CLICK PROPAGATION */}
                <Pressable onPress={() => {}}>
                    {/* 🔥 ANIMATED MODAL - FULL WIDTH, 1/2 HEIGHT MAX */}
                    <Animated.View 
                        style={[
                            tw`bg-white w-full rounded-2xl p-5`,
                            {
                                maxHeight: screenHeight * 0.5, // 50% of screen height max
                                transform: [
                                    { scale: scaleAnim },
                                    { translateY: slideAnim }
                                ],
                            }
                        ]}
                    >
                        {/* Scrollable content area if content exceeds max height */}
                        <View style={tw`flex-1`}>
                            {children}
                        </View>
                        
                        <TouchableOpacity
                            onPress={onClose}
                            style={tw`mt-4 bg-purple-500 py-3 rounded-xl`}
                            activeOpacity={0.8}
                        >
                            <Text style={tw`text-white text-center font-semibold`}>
                                Close
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Pressable>
            </Animated.View>
        </Modal>
    );
};

export default CenterModal;