import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
} from "react-native";
import tw from "twrnc";
import { useTheme } from "../../Authorization/ThemeContext";

const BottomModal = ({ visible, onClose, children }) => {
  const { colors } = useTheme();

  return (
    <Modal transparent visible={visible} animationType="slide">
      
      {/* BACKDROP CLICK AREA */}
      <Pressable
        style={tw`flex-1 bg-black/40 justify-end`}
        onPress={onClose}
      >
        
        {/* PREVENT CLOSE WHEN CLICKING INSIDE */}
        <Pressable onPress={() => {}}>
          <View
            style={[
              tw`rounded-t-3xl p-5 shadow-lg`,
              { backgroundColor: colors?.surface ?? "#fff" },
            ]}
          >
            
            {/* Drag Indicator */}
            <View style={tw`w-12 h-1 bg-gray-300 self-center mb-3 rounded-full`} />

            {children}

            <TouchableOpacity
              onPress={onClose}
              style={tw`mt-4 bg-red-500 py-3 rounded-xl`}
            >
              <Text style={tw`text-white text-center font-semibold`}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>

      </Pressable>
    </Modal>
  );
};

export default BottomModal;
