# Fix SelectBank onPress TypeError: undefined is not a function

## Status: ✅ COMPLETED

**Summary**: Added default empty function props to SelectBank.jsx to ensure onSelectBankItem and onClose are always functions, preventing the error when props missing.

**Changes Made**:
- SelectBank.jsx: `const SelectBank = ({ onSelectBankItem = () => {}, onClose = () => {} }) => {`

**Test Instructions**:
1. Reload Metro cache: `npx react-native start --reset-cache`
2. Restart app/emulator
3. Navigate to PatientRegistration > PaymentInfo > Select Bank for Bank Payment mode
4. Tap any bank - should select without crash

**Verification**: Error stack trace should no longer appear on bank selection.

Files modified: SelectBank.jsx

If issues persist, check console for other errors.
