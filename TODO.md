# PaymentInfo Separation Task

## Steps (1/7 completed)

### 1. Create PaymentInfo.jsx [✅ COMPLETED]
New screen: src/AfterLogin/Screens/PatientRegistration/PaymentInfo.jsx created successfully. Fixed JSX syntax errors.

### 2. Update Registration.jsx - Remove payment code [PENDING]
New screen: /src/AfterLogin/Screens/PatientRegistration/PaymentInfo.jsx
- Collect payments per mode (cash, debit, credit, cheque, neft, phonepe, paytm)
- Each non-cash: amount + bank + ref
- Display netAmount prop, calc total paid/balance
- Button to save & return data

### 2. Update Registration.jsx - Remove payment code [PENDING]
- Delete all payment states (cash, debitCardAmt, etc., selectedBank, refs, bankModal)
- Delete Payment Info card UI
- Delete bankModal JSX
- Update handleSavePatient(): Use paymentData.payments for payload

### 3. Update Registration.jsx - Add navigation to PaymentInfo [PENDING]
- After billing: Button "Proceed to Payments"
- Navigate to PaymentInfo (pass netAmount)
- useFocusEffect: Load paymentData from nav params or context
- Display payment summary if data exists
- Update balance useEffect with paymentData

### 4. Update SelectBank.jsx [PENDING]
- Accept mode prop (e.g., 'debitCard') for context

### 5. Test navigation flow [PENDING]
- Registration -> services -> billing -> PaymentInfo -> back -> save

### 6. Verify payload includes payments [PENDING]
- Log payload, check API call

### 7. Cleanup & finalize [PENDING]
- Remove unused imports
- Style consistency

**Next step: Create PaymentInfo.jsx**

