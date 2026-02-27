import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import tw from 'twrnc';
import { useTheme } from '../../Authorization/ThemeContext';
import { generateColorCodes } from '../ColorCodeGenerator/ColorCodeCreater'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ScrollView } from 'react-native-gesture-handler';
import GoBackHandler from '../GobakHandler';

const ColorMaster = () => {

    const {
        setHeaderBackground,
        setPageBackground,
        pageBackground,
        setSaveButtonBackground
    } = useTheme();

    // Default colors
    const DEFAULT_HEADER_COLOR = '#2563EB';
    const DEFAULT_PAGE_COLOR = '#FFFFFF';
    const DEFAULT_BUTTON_COLOR = '#2563EB';

    // Separate states
    const [headerColors, setHeaderColors] = useState([]);
    const [buttonColors, setButtonColors] = useState([]);
    const [pageColors, setPageColors] = useState([]);

    // Apply functions
    const applyHeaderColor = (color) => {
        setHeaderBackground(color);
    };

    const applyPageColor = (color) => {
        setPageBackground(color);
    };

    const ApplySaveBtnBgColor = (color) => {
        setSaveButtonBackground(color);
    };

    // Reset functions
    const resetHeaderColor = () => {
        setHeaderColors(generateColorCodes(20));
        setHeaderBackground(DEFAULT_HEADER_COLOR);
    };

    const resetPageColor = () => {
        setPageColors(generateColorCodes(20));
        setPageBackground(DEFAULT_PAGE_COLOR);
    };

    const resetButtonColor = () => {
        setButtonColors(generateColorCodes(20));
        setSaveButtonBackground(DEFAULT_BUTTON_COLOR);
    };

    // Initial load
    useEffect(() => {
        setHeaderColors(generateColorCodes(20));
        setButtonColors(generateColorCodes(20));
        setPageColors(generateColorCodes(20));
    }, []);

    // Reusable component
    const ColorSection = ({
        title,
        colors,
        onColorPress,
        onResetPress
    }) => (

        <View style={tw`mt-4 p-4 rounded-lg border border-gray-300`}>
            {/* Header */}
            <View style={tw`flex-row items-center justify-between`}>

                <Text style={tw`text-black font-semibold`}>
                    {title}
                </Text>

                <View style={tw`flex-row items-center`}>

                    <TouchableOpacity onPress={onResetPress}>
                        <Text style={tw`text-blue-500 font-semibold mr-4 border border-blue-500 px-2 py-1 rounded`}>
                            Reset
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onResetPress}>
                        <Ionicons
                            name="refresh-circle-sharp"
                            size={22}
                        />
                    </TouchableOpacity>

                </View>

            </View>

            {/* Colors */}
            <View style={tw`flex-row flex-wrap mt-3`}>

                {colors.map((color, index) => (

                    <TouchableOpacity
                        key={index}
                        onPress={() => onColorPress(color)}
                        style={{
                            width: 18,
                            height: 18,
                            backgroundColor: color,
                            borderRadius: 10,
                            margin: 6
                        }}
                    />

                ))}

            </View>

        </View>
    );

    return (

        <ScrollView
            style={[
                tw`flex-1 p-2`,
                { backgroundColor: pageBackground }
            ]}
        >
            <GoBackHandler style={tw`mb-2`} />

            <ColorSection
                title="Select Header Background Color"
                colors={headerColors}
                onColorPress={applyHeaderColor}
                onResetPress={resetHeaderColor}
            />

            <ColorSection
                title="Select Save Button Color"
                colors={buttonColors}
                onColorPress={ApplySaveBtnBgColor}
                onResetPress={resetButtonColor}
            />

            <ColorSection
                title="Select Page Background Color"
                colors={pageColors}
                onColorPress={applyPageColor}
                onResetPress={resetPageColor}
            />

        </ScrollView>

    );
};

export default ColorMaster;
