// CustomInput.styles.js
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    margin: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    height: 50,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: "#f5f5f5",
    color: "#000",
  },
  inputFocused: {
    borderColor: "#6200EE",
    shadowColor: "#6200EE",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
  },
  filterButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButton: {
    borderWidth: 1,
    borderColor: "gray",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 5

  },
  cancleButton: {
    borderWidth: 1,
    backgroundColor: '#343a40',
    borderColor: "gray",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 5,

  },
  deleteAccountButton: {
    borderWidth: 1,
    borderColor: 'red',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius:8
  }

});
