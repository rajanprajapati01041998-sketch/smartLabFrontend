import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform, Dimensions, StatusBar, Image, ScrollView, Keyboard, TouchableWithoutFeedback, Alert } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence, FadeInDown, FadeInUp, SlideInRight, SlideInLeft, BounceIn } from 'react-native-reanimated';
import tw from "twrnc";
import { SelectList } from "react-native-dropdown-select-list";
import LoginBgImg from "../Assets/Login/login.jpg";
import LoginBgImg2 from '../Assets/Login/loginbg1.jpg';
import LoginBgImg3 from '../Assets/Login/loginbg2.jpg';
import { useAuth } from '../Authorization/AuthContext';
import { useTheme } from '../Authorization/ThemeContext';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import axiosInstance from '../Authorization/AxiosInstance'
import { useNavigation } from "@react-navigation/native";
import api from "../Authorization/api";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "../Authorization/ToastContext";
import loginLogo from '../Assets/Login/login_logo.jpg'

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
    const { setSessionId, loadDeviceInfo, user, login, logout, isAuthenticated, setToken, setUserData, token, userData, setUserId, setLoginBranchId, deviceData,setAllBranchInfo } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [theme1, setTheme1] = useState(false);
    const [theme2, setTheme2] = useState(false);
    const [theme3, setTheme3] = useState(true);
    const [selected, setSelected] = useState("");
    const [togglePassword, setTogglePassword] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [branches, setBranches] = useState([]);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const { showToast } = useToast()

    // Animation values
    const cardScale = useSharedValue(0.9);
    const cardOpacity = useSharedValue(0);
    const logoTranslateY = useSharedValue(-50);
    const logoOpacity = useSharedValue(0);
    const logoScale = useSharedValue(1);
    const buttonScale = useSharedValue(1);
    const menuRotate = useSharedValue(0);

    const image1 = LoginBgImg;
    const image2 = LoginBgImg2;
    const image3 = LoginBgImg3;

    // Keyboard listeners
    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardVisible(true);
            // Shrink logo when keyboard appears
            logoScale.value = withTiming(0.7, { duration: 300 });
            logoTranslateY.value = withTiming(-80, { duration: 300 });
        });

        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false);
            // Restore logo size when keyboard hides
            logoScale.value = withTiming(1, { duration: 300 });
            logoTranslateY.value = withTiming(0, { duration: 300 });
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);
    /* eslint-enable react-hooks/exhaustive-deps */

    // Dropdown data function
    const getDropdownData = () => {
        return branches.map((branch) => ({
            key: branch.branchId,
            value: branch.branchName
        }));
    };

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        // Entrance animations
        cardScale.value = withSpring(1, { damping: 12, stiffness: 100 });
        cardOpacity.value = withTiming(1, { duration: 800 });
        logoTranslateY.value = withSpring(0, { damping: 10, stiffness: 80 });
        logoOpacity.value = withTiming(1, { duration: 1000 });
    }, []);
    /* eslint-enable react-hooks/exhaustive-deps */

    // Menu animation
    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        menuRotate.value = withSpring(menuVisible ? 0.5 : 0);
    }, [menuVisible]);
    /* eslint-enable react-hooks/exhaustive-deps */

    const animatedCardStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: cardScale.value }],
            opacity: cardOpacity.value,
        };
    });

    const animatedLogoStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: logoTranslateY.value }, { scale: logoScale.value }],
            opacity: logoOpacity.value,
        };
    });

    const animatedButtonStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: buttonScale.value }],
        };
    });

    const animatedMenuStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${menuRotate.value * 90}deg` }],
        };
    });

    const getThemeColors = () => {
        if (theme1) return { primary: '#1e4b8f', secondary: '#3b82f6', accent: '#60a5fa' };
        if (theme2) return { primary: '#0f5e5e', secondary: '#14b8a6', accent: '#5eead4' };
        if (theme3) return { primary: '#581c87', secondary: '#8b5cf6', accent: '#c084fc' };
        return { primary: '#1e4b8f', secondary: '#3b82f6', accent: '#60a5fa' };
    };

    const colors = getThemeColors();

    const handleLogin = async () => {
        if (!username) {
            showToast("Enter username", 'warning')
            return;
        }
        if(!password){
             showToast("Enter correct password", 'warning')
            return;
        }
        setIsLoading(true);
        try {
            const formData = {
                userName: username,
                userPassword: password
            };

            const response = await api.post(`Login/branch-list`, formData);
            console.log("branch response", response);
            setBranches(response.data);
        } catch (error) {
            // console.log("Branch error", error.response);
            showToast('Invalid username or password', 'error');

        } finally {
            setIsLoading(false);
        }
    };

    const handleFinalLogin = async (branchId) => {
        if (branchId === null || branchId === undefined || branchId === "") {
            showToast("Please select a branch", "warning");
            return;
        }

        setIsLoading(true);
        try {
            const formData = {
                userName: username,
                userPassword: password,
                branchId: Number.isFinite(Number(branchId)) ? Number(branchId) : branchId,
                browser: deviceData?.type ?? "",
                device: deviceData?.device ?? "",
                os: deviceData?.os ?? ""
            };

            const response = await api.post(`Login/login`, formData);
            //console.log("final Login", response.data);
            setUserId(response?.data?.user.id);
            setLoginBranchId(response.data?.branchId);
            setSessionId(response.data?.sessionId);
            setUserData(response.data?.user?.name);
            const token = response.data?.token;
            const userInfo = response.data;
            await AsyncStorage.setItem('AllBranch', JSON.stringify(branches));
            setAllBranchInfo(branches)
            //console.log("branc", branches);
            if (token) {
                await login(token, userInfo);
                navigation.replace('Dashboard');
            } else {
                Alert.alert("Error", "Invalid response from server");
            }
        } catch (error) {
            console.log("Final Login error", error?.response || error);
            showToast("Login failed. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleMenuOption = (option) => {
        setMenuVisible(false);
        // Add scale animation for theme change
        cardScale.value = withSequence(
            withTiming(0.95, { duration: 200 }),
            withTiming(1, { duration: 300 })
        );

        switch (option) {
            case 'Theme 1':
                setTheme1(true);
                setTheme2(false);
                setTheme3(false);
                break;
            case 'Theme 2':
                setTheme1(false);
                setTheme2(true);
                setTheme3(false);
                break;
            case 'Theme 3':
                setTheme1(false);
                setTheme2(false);
                setTheme3(true);
                break;
            default:
                break;
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ImageBackground
                source={theme1 ? image1 : theme2 ? image2 : image3}
                resizeMode="cover"
                style={tw`flex-1`}
            >
                <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

                {/* Gradient Overlay */}
                <View style={[tw`absolute inset-0`, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />

                {/* Three Dots Menu */}
                <Animated.View style={[tw`absolute top-12 right-4 z-10`, animatedMenuStyle]}>
                    <TouchableOpacity
                        onPress={() => setMenuVisible(!menuVisible)}
                        style={tw`p-2 bg-white/90 rounded-full shadow-lg`}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="more-vert" size={24} color="#333" />
                    </TouchableOpacity>

                    {menuVisible && (
                        <View
                            style={tw`absolute top-12 right-0 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl py-2 w-44 border border-white/50`}
                        >
                            <TouchableOpacity
                                onPress={() => handleMenuOption('Theme 1')}
                                style={tw`px-4 py-3 flex-row items-center ${theme1 ? 'bg-blue-50' : ''}`}
                            >
                                <View style={tw`w-4 h-4 rounded-full bg-blue-600 mr-3`} />
                                <Text style={tw`text-gray-700 font-medium`}>Ocean Theme</Text>
                                {theme1 && <MaterialIcons name="check" size={18} color="#2563eb" style={tw`ml-auto`} />}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => handleMenuOption('Theme 2')}
                                style={tw`px-4 py-3 flex-row items-center ${theme2 ? 'bg-teal-50' : ''}`}
                            >
                                <View style={tw`w-4 h-4 rounded-full bg-teal-600 mr-3`} />
                                <Text style={tw`text-gray-700 font-medium`}>Forest Theme</Text>
                                {theme2 && <MaterialIcons name="check" size={18} color="#0d9488" style={tw`ml-auto`} />}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => handleMenuOption('Theme 3')}
                                style={tw`px-4 py-3 flex-row items-center ${theme3 ? 'bg-purple-50' : ''}`}
                            >
                                <View style={tw`w-4 h-4 rounded-full bg-purple-600 mr-3`} />
                                <Text style={tw`text-gray-700 font-medium`}>Royal Theme</Text>
                                {theme3 && <MaterialIcons name="check" size={18} color="#9333ea" style={tw`ml-auto`} />}
                            </TouchableOpacity>
                        </View>
                    )}
                </Animated.View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={tw`flex-1`}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
                >
                    <ScrollView
                        contentContainerStyle={tw`flex-grow justify-center`}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        bounces={false}
                    >
                        <View style={tw`flex-1 justify-center items-center px-4 py-8`}>
                            {/* Logo/Icon - Animated with keyboard */}
                            <Animated.View style={[tw`mb-3 items-center`, animatedLogoStyle]}>
                                <Animated.View entering={BounceIn.delay(300).springify()}>
                                    <Image
                                        source={loginLogo}
                                        style={[
                                            tw` border-2 border-white h-20 w-50 rounded-md`,
                                            // keyboardVisible ? { height: 64, width: 64 } : { height: 96, width: 96 }
                                        ]}
                                    />
                                </Animated.View>
                            </Animated.View>

                            {/* Login Card */}
                            <Animated.View style={[
                                tw`w-full rounded-3xl overflow-hidden`,
                                animatedCardStyle,
                                { maxWidth: 500 } // Limit max width on tablets
                            ]}>
                                <View style={[
                                    tw`px-6 pt-8 pb-8`,
                                    {
                                        backgroundColor: `rgba(255, 255, 255, 0.1)`,
                                        borderWidth: 1,
                                        borderColor: 'rgba(255, 255, 255, 0.2)',
                                    }
                                ]}>
                                    {/* Username */}
                                    <Animated.View entering={FadeInDown.delay(200).springify()}>
                                        <Text style={tw`text-white/90 mb-2 font-semibold text-base`}>
                                            Username
                                        </Text>
                                    </Animated.View>

                                    <Animated.View entering={SlideInRight.delay(250).springify()}>
                                        <View style={tw`flex-row items-center bg-white/20 border border-white/30 rounded-2xl px-4 mb-5`}>
                                            <FontAwesome5 name="user" size={16} color="rgba(255,255,255,0.8)" style={tw`mr-3`} />
                                            <TextInput
                                                placeholder="Enter your username"
                                                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                                style={tw`flex-1 py-4 text-white text-base`}
                                                value={username}
                                                onChangeText={setUsername}
                                                returnKeyType="next"
                                                blurOnSubmit={false}
                                            />
                                        </View>
                                    </Animated.View>

                                    {/* Password */}
                                    <Animated.View entering={FadeInDown.delay(300).springify()}>
                                        <Text style={tw`text-white/90 mb-2 font-semibold text-base`}>
                                            Password
                                        </Text>
                                    </Animated.View>

                                    <Animated.View entering={SlideInRight.delay(350).springify()}>
                                        <View style={tw`flex-row items-center bg-white/20 border border-white/30 rounded-2xl px-4 mb-5`}>
                                            <FontAwesome5 name="lock" size={16} color="rgba(255,255,255,0.8)" style={tw`mr-3`} />
                                            <TextInput
                                                placeholder="Enter your password"
                                                secureTextEntry={!togglePassword}
                                                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                                style={tw`flex-1 py-4 text-white text-base`}
                                                value={password}
                                                onChangeText={setPassword}
                                                returnKeyType="done"
                                                onSubmitEditing={() => {
                                                    if (branches?.length === 0) {
                                                        handleLogin();
                                                    }
                                                }}
                                            />
                                            <TouchableOpacity onPress={() => setTogglePassword(!togglePassword)}>
                                                <Entypo
                                                    name={togglePassword ? "eye" : "eye-with-line"}
                                                    size={20}
                                                    color="rgba(255, 255, 255, 0.8)"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </Animated.View>

                                    {/* Branch Dropdown */}
                                    {branches?.length > 0 && (
                                        <>
                                            <Animated.View entering={FadeInDown.delay(400).springify()}>
                                                <Text style={tw`text-white/90 mb-2 font-semibold text-base`}>
                                                    Select Branch
                                                </Text>
                                            </Animated.View>

                                            <Animated.View entering={SlideInRight.delay(450).springify()}>
                                                <SelectList
                                                    setSelected={(val) => {
                                                        setSelected(val);
                                                        handleFinalLogin(val);
                                                    }}
                                                    data={getDropdownData()}
                                                    save="key"
                                                    placeholder="Choose your branch"
                                                    boxStyles={{
                                                        borderRadius: 16,
                                                        borderColor: "rgba(255, 255, 255, 0.3)",
                                                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                                                        paddingVertical: 14,
                                                        marginBottom: 25,
                                                        borderWidth: 1,
                                                    }}
                                                    dropdownStyles={{
                                                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                                                        borderRadius: 12,
                                                        borderColor: "rgba(255, 255, 255, 0.3)",
                                                        marginTop: 5,
                                                    }}
                                                    inputStyles={{
                                                        color: "white",
                                                        fontSize: 16,
                                                    }}
                                                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                                />
                                            </Animated.View>
                                        </>
                                    )}

                                    {/* Login Button */}
                                    {branches?.length === 0 && (
                                        <Animated.View style={animatedButtonStyle}>
                                            <TouchableOpacity
                                                onPress={handleLogin}
                                                disabled={isLoading}
                                                activeOpacity={0.8}
                                                style={[
                                                    tw`py-4 rounded-2xl`,
                                                    {
                                                        backgroundColor: 'rgba(2, 37, 87, 0.55)',
                                                        borderWidth: 1,
                                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                                    }
                                                ]}
                                            >
                                                {isLoading ? (
                                                    <View style={tw`flex-row items-center justify-center`}>
                                                        <MaterialIcons name="sync" size={24} color="white" style={tw`mr-2`} />
                                                        <Text style={tw`text-center text-white font-bold text-lg`}>
                                                            Logging in...
                                                        </Text>
                                                    </View>
                                                ) : (
                                                    <Text style={tw`text-center text-white font-bold text-lg`}>
                                                        Login
                                                    </Text>
                                                )}
                                            </TouchableOpacity>
                                        </Animated.View>
                                    )}

                                    {/* Loading indicator when branches are loading */}
                                    {branches?.length > 0 && !selected && (
                                        <View style={tw`mt-2`}>
                                            <Text style={tw`text-white/60 text-center text-sm`}>
                                                Please select a branch to continue
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </Animated.View>

                            {/* Footer - Hide when keyboard is visible */}
                            {!keyboardVisible && (
                                <Animated.View entering={FadeInUp.delay(700)} style={tw`mt-8`}>
                                    <Text style={tw`text-white/60 text-sm`}>
                                        Version 2.0.0 | © 2024 Gravity Web Technology
                                    </Text>
                                </Animated.View>
                            )}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Backdrop for menu */}
                {menuVisible && (
                    <TouchableOpacity
                        style={tw`absolute inset-0`}
                        activeOpacity={1}
                        onPress={() => setMenuVisible(false)}
                    />
                )}
            </ImageBackground>
        </TouchableWithoutFeedback>
    );
}
