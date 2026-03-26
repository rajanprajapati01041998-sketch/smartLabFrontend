import { StyleSheet } from 'react-native';

const ButtonStyles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 6,

    paddingVertical: 10,
    paddingHorizontal: 16,

    minHeight: 48,

    // Shadow
    elevation: 2, // Android
    shadowColor: '#000', // iOS
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  buttonPressed: {
    backgroundColor: '#F0F0F1',
    transform: [{ translateY: 1 }],
    elevation: 1,
  },

  text: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.85)',
  }
});

export default ButtonStyles;