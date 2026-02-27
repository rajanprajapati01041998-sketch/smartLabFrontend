// AddTestDetails.jsx
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, FlatList, useWindowDimensions, Alert } from 'react-native';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import tw from 'twrnc';
import { SelectList } from 'react-native-dropdown-select-list';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomStyles from '../../../../Custom.styles';

const AddTestDetails = ({ data, onDataChange }) => {
  const { width, height } = useWindowDimensions();
  const [isTablet, setIsTablet] = useState(width >= 768);
  const [isLandscape, setIsLandscape] = useState(width > height);
  
  // Use ref to track latest state values
  const latestState = useRef({});
  const notifyTimeoutRef = useRef(null);
  const isUpdatingFromCalculation = useRef(false);

  useEffect(() => {
    setIsTablet(width >= 768);
    setIsLandscape(width > height);
  }, [width, height]);

  // Initialize states with provided data or defaults
  const [searchText, setSearchText] = useState(data?.searchText || '');
  const [selectedDoctor, setSelectedDoctor] = useState(data?.selectedDoctor || 'Dr. SRIRANJAN MUKHAERJEE (Consultant ...)');
  const [grossBillAmount, setGrossBillAmount] = useState(data?.grossBillAmount || '1610');
  const [billDisc, setBillDisc] = useState(data?.billDisc || '0');
  const [roundOff, setRoundOff] = useState(data?.roundOff || '0');
  const [netAmount, setNetAmount] = useState(data?.netAmount || '1610');
  const [discountApprovedBy, setDiscountApprovedBy] = useState(data?.discountApprovedBy || '');
  const [discountReason, setDiscountReason] = useState(data?.discountReason || '');
  const [balanceAmount, setBalanceAmount] = useState(data?.balanceAmount || '0');
  const [remark, setRemark] = useState(data?.remark || '');
  const [selctedDoctor, setSelctedDoctor] = useState(data?.selctedDoctor || '');
  
  // Payment states
  const [paymentMode, setPaymentMode] = useState(data?.paymentMode || 'Cash');
  const [amount, setAmount] = useState(data?.amount || '1610');
  const [bank, setBank] = useState(data?.bank || '');
  const [refNo, setRefNo] = useState(data?.refNo || '');
  const [debitCard, setDebitCard] = useState(data?.debitCard || '');
  const [cheque, setCheque] = useState(data?.cheque || '');
  const [neftRtgs, setNeftRtgs] = useState(data?.neftRtgs || '');
  const [paytm, setPaytm] = useState(data?.paytm || '0');
  const [phonePay, setPhonePay] = useState(data?.phonePay || '0');

  // Test data
  const [testItems, setTestItems] = useState(data?.testItems || [
    {
      id: '1',
      serviceCode: '1.1',
      serviceName: 'CBC - (COMPLETE BLOOD COUNT)',
      qty: 1,
      mrp: 400,
      rate: 60,
      netAmt: 60.00,
      urgent: false,
    },
    {
      id: '2',
      serviceCode: 'LDIMM1452',
      serviceName: 'Rheumatic Fever Panel',
      qty: 1,
      mrp: 1550,
      rate: 1550,
      netAmt: 1550.00,
      urgent: false,
    },
  ]);

  const doctorData = [    
    { key: '1', value: 'Dr. SRIRANJAN MUKHAERJEE (Consultant ...)' },
    { key: '2', value: 'Dr. ANOTHER DOCTOR ' },
  ]

  const paymentModes = [
    { key: '1', value: 'Cash' },
    { key: '2', value: 'Card' },
    { key: '3', value: 'Cheque' },
    { key: '4', value: 'NEFT/RTGS' },
    { key: '5', value: 'UPI' },
  ];

  const discountApprovers = [
    { key: '1', value: 'Manager' },
    { key: '2', value: 'Admin' },
    { key: '3', value: 'Doctor' },
  ];

  // Calculate net amount based on gross, discount, and round off
  const calculateNetAmount = useCallback((gross, disc, round) => {
    const grossNum = parseFloat(gross) || 0;
    const discNum = parseFloat(disc) || 0;
    const roundNum = parseFloat(round) || 0;
    
    // Calculate discount amount
    const discountAmount = (grossNum * discNum) / 100;
    // Calculate amount after discount
    const afterDiscount = grossNum - discountAmount;
    // Add round off
    const net = afterDiscount + roundNum;
    
    return net.toFixed(2);
  }, []);

  // Calculate discount percentage based on gross, net, and round off
  const calculateDiscountPercent = useCallback((gross, net, round) => {
    const grossNum = parseFloat(gross) || 0;
    const netNum = parseFloat(net) || 0;
    const roundNum = parseFloat(round) || 0;
    
    if (grossNum === 0) return '0';
    
    // Subtract round off from net to get amount after discount
    const afterDiscount = netNum - roundNum;
    // Calculate discount amount
    const discountAmount = grossNum - afterDiscount;
    // Calculate discount percentage
    const discountPercent = (discountAmount / grossNum) * 100;
    
    return discountPercent.toFixed(2);
  }, []);

  // Calculate round off based on gross, discount, and net
  const calculateRoundOff = useCallback((gross, disc, net) => {
    const grossNum = parseFloat(gross) || 0;
    const discNum = parseFloat(disc) || 0;
    const netNum = parseFloat(net) || 0;
    
    // Calculate discount amount
    const discountAmount = (grossNum * discNum) / 100;
    // Calculate expected net after discount
    const afterDiscount = grossNum - discountAmount;
    // Calculate round off (net - afterDiscount)
    const round = netNum - afterDiscount;
    
    return round.toFixed(2);
  }, []);

  // Handle gross bill amount change
  const handleGrossBillChange = (text) => {
    setGrossBillAmount(text);
    
    // Calculate net amount based on current discount and round off
    if (!isUpdatingFromCalculation.current) {
      const newNet = calculateNetAmount(text, billDisc, roundOff);
      setNetAmount(newNet);
    }
  };

  // Handle discount percentage change
  const handleBillDiscChange = (text) => {
    setBillDisc(text);
    
    // Calculate net amount based on current gross and round off
    if (!isUpdatingFromCalculation.current) {
      const newNet = calculateNetAmount(grossBillAmount, text, roundOff);
      setNetAmount(newNet);
    }
  };

  // Handle round off change
  const handleRoundOffChange = (text) => {
    setRoundOff(text);
    
    // Calculate net amount based on current gross and discount
    if (!isUpdatingFromCalculation.current) {
      const newNet = calculateNetAmount(grossBillAmount, billDisc, text);
      setNetAmount(newNet);
    }
  };

  // Handle net amount change (calculate discount or round off)
  const handleNetAmountChange = (text) => {
    setNetAmount(text);
    
    if (!isUpdatingFromCalculation.current) {
      isUpdatingFromCalculation.current = true;
      
      // Try to calculate discount percentage first
      const newDisc = calculateDiscountPercent(grossBillAmount, text, roundOff);
      
      // Check if discount percentage is valid (between 0 and 100)
      if (parseFloat(newDisc) >= 0 && parseFloat(newDisc) <= 100) {
        setBillDisc(newDisc);
      } else {
        // If discount is invalid, calculate round off instead
        const newRound = calculateRoundOff(grossBillAmount, billDisc, text);
        setRoundOff(newRound);
      }
      
      isUpdatingFromCalculation.current = false;
    }
  };

  // Update ref whenever state changes
  useEffect(() => {
    latestState.current = {
      searchText,
      selectedDoctor,
      selctedDoctor,
      grossBillAmount,
      billDisc,
      roundOff,
      netAmount,
      discountApprovedBy,
      discountReason,
      balanceAmount,
      remark,
      paymentMode,
      amount,
      bank,
      refNo,
      debitCard,
      cheque,
      neftRtgs,
      paytm,
      phonePay,
      testItems
    };
  }, [
    searchText, selectedDoctor, selctedDoctor, grossBillAmount, billDisc, 
    roundOff, netAmount, discountApprovedBy, discountReason, balanceAmount, 
    remark, paymentMode, amount, bank, refNo, debitCard, cheque, neftRtgs, 
    paytm, phonePay, testItems
  ]);

  // Notify parent with latest state from ref
  const notifyParent = useCallback(() => {
    if (onDataChange) {
      onDataChange(latestState.current);
    }
  }, [onDataChange]);

  // Debounced notify function
  const debouncedNotify = useCallback(() => {
    if (notifyTimeoutRef.current) {
      clearTimeout(notifyTimeoutRef.current);
    }
    
    notifyTimeoutRef.current = setTimeout(() => {
      notifyParent();
    }, 500);
  }, [notifyParent]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (notifyTimeoutRef.current) {
        clearTimeout(notifyTimeoutRef.current);
      }
    };
  }, []);

  // Update local state when data prop changes
  useEffect(() => {
    if (data) {
      setSearchText(data.searchText || '');
      setSelectedDoctor(data.selectedDoctor || 'Dr. SRIRANJAN MUKHAERJEE (Consultant ...)');
      setGrossBillAmount(data.grossBillAmount || '1610');
      setBillDisc(data.billDisc || '0');
      setRoundOff(data.roundOff || '0');
      setNetAmount(data.netAmount || '1610');
      setDiscountApprovedBy(data.discountApprovedBy || '');
      setDiscountReason(data.discountReason || '');
      setBalanceAmount(data.balanceAmount || '0');
      setRemark(data.remark || '');
      setSelctedDoctor(data.selctedDoctor || '');
      setPaymentMode(data.paymentMode || 'Cash');
      setAmount(data.amount || '1610');
      setBank(data.bank || '');
      setRefNo(data.refNo || '');
      setDebitCard(data.debitCard || '');
      setCheque(data.cheque || '');
      setNeftRtgs(data.neftRtgs || '');
      setPaytm(data.paytm || '0');
      setPhonePay(data.phonePay || '0');
      
      if (data.testItems) {
        setTestItems(data.testItems);
      }
    }
  }, [data]);

  // Simple direct state updates without setTimeout
  const updateSearchText = (text) => {
    setSearchText(text);
    debouncedNotify();
  };

  const updateDiscountApprovedBy = (value) => {
    setDiscountApprovedBy(value);
    debouncedNotify();
  };

  const updateDiscountReason = (text) => {
    setDiscountReason(text);
    debouncedNotify();
  };

  const updateBalanceAmount = (text) => {
    setBalanceAmount(text);
    debouncedNotify();
  };

  const updateRemark = (text) => {
    setRemark(text);
    debouncedNotify();
  };

  const updateSelctedDoctor = (value) => {
    setSelctedDoctor(value);
    debouncedNotify();
  };

  const updatePaymentMode = (value) => {
    setPaymentMode(value);
    debouncedNotify();
  };

  const updateAmount = (text) => {
    setAmount(text);
    debouncedNotify();
  };

  const updateBank = (text) => {
    setBank(text);
    debouncedNotify();
  };

  const updateRefNo = (text) => {
    setRefNo(text);
    debouncedNotify();
  };

  const updateDebitCard = (value) => {
    setDebitCard(value);
    debouncedNotify();
  };

  const updateCheque = (value) => {
    setCheque(value);
    debouncedNotify();
  };

  const updateNeftRtgs = (value) => {
    setNeftRtgs(value);
    debouncedNotify();
  };

  const updatePaytm = (text) => {
    setPaytm(text);
    debouncedNotify();
  };

  const updatePhonePay = (text) => {
    setPhonePay(text);
    debouncedNotify();
  };

  // Update test items with functional update
  const updateTestItems = (updater) => {
    setTestItems(prevItems => {
      const newItems = typeof updater === 'function' ? updater(prevItems) : updater;
      
      // Recalculate total amounts from test items
      const total = newItems.reduce((sum, item) => sum + item.netAmt, 0);
      
      // Update bill amounts
      if (!isUpdatingFromCalculation.current) {
        isUpdatingFromCalculation.current = true;
        setGrossBillAmount(total.toString());
        
        // Recalculate net amount based on new gross
        const newNet = calculateNetAmount(total.toString(), billDisc, roundOff);
        setNetAmount(newNet);
        isUpdatingFromCalculation.current = false;
      }
      
      return newItems;
    });
    debouncedNotify();
  };

  // Calculate responsive widths for table columns
  const getTableColumnWidths = () => {
    if (isTablet) {
      return {
        delete: 20,
        serial: 40,
        service: 200,
        qty: 70,
        mrp: 80,
        rate: 80,
        netAmt: 90,
        urgent: 70,
        view: 70,
      };
    } else {
      return {
        delete: 45,
        serial: 35,
        service: 150,
        qty: 60,
        mrp: 70,
        rate: 70,
        netAmt: 80,
        urgent: 65,
        view: 65,
      };
    }
  };

  const colWidths = getTableColumnWidths();

  const renderTestItem = ({ item, index }) => (
    <View style={tw`flex-row border-b border-gray-200 py-2 items-center`}>
      {/* Delete */}
      <View style={[{ width: colWidths.delete }, tw`px-1`]}>
        <TouchableOpacity 
          style={tw` rounded p-1 items-center justify-center`}
          onPress={() => {
            Alert.alert(
              'Remove Item',
              'Are you sure you want to remove this test?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Remove',
                  style: 'destructive',
                  onPress: () => {
                    updateTestItems((prevItems) => {
                      const updatedItems = prevItems.filter((_, i) => i !== index);
                      return updatedItems;
                    });
                  }
                }
              ]
            );
          }}
        >
          <Icon name="delete" size={isTablet ? 18 : 16} color="red" />
        </TouchableOpacity>
      </View>
      
      {/* S.No */}
      <View style={[{ width: colWidths.serial }, tw`px-1`]}>
        <Text style={tw`text-center ${isTablet ? 'text-sm' : 'text-xs'}`}>{index + 1}</Text>
      </View>
      
      {/* Service Name with Code */}
      <View style={[{ width: colWidths.service }, tw`px-2`]}>
        <Text style={tw`${isTablet ? 'text-sm' : 'text-xs'}`} numberOfLines={2}>
          <Text style={tw`font-bold`}>{item.serviceCode}:</Text> {item.serviceName}
        </Text>
      </View>
      
      {/* QTY */}
      <View style={[{ width: colWidths.qty }, tw`px-1`]}>
        <TextInput
          style={tw`border border-gray-300 rounded px-1 py-1 text-center ${isTablet ? 'text-sm' : 'text-xs'}`}
          value={item.qty.toString()}
          keyboardType="numeric"
          editable={false}
        />
      </View>
      
      {/* MRP */}
      <View style={[{ width: colWidths.mrp }, tw`px-1`]}>
        <TextInput
          style={tw`border border-gray-300 rounded px-1 py-1 text-right ${isTablet ? 'text-sm' : 'text-xs'}`}
          value={item.mrp.toString()}
          keyboardType="numeric"
          editable={false}
        />
      </View>
      
      {/* Rate */}
      <View style={[{ width: colWidths.rate }, tw`px-1`]}>
        <TextInput
          style={tw`border border-gray-300 rounded px-1 py-1 text-right bg-blue-50 ${isTablet ? 'text-sm' : 'text-xs'}`}
          value={item.rate.toString()}
          keyboardType="numeric"
          onChangeText={(text) => {
            updateTestItems((prevItems) => {
              const updatedItems = [...prevItems];
              updatedItems[index].rate = parseFloat(text) || 0;
              updatedItems[index].netAmt = updatedItems[index].rate * updatedItems[index].qty;
              return updatedItems;
            });
          }}
        />
      </View>
      
      {/* Net Amt */}
      <View style={[{ width: colWidths.netAmt }, tw`px-1`]}>
        <TextInput
          style={tw`border border-gray-300 rounded px-1 py-1 text-right bg-gray-100 ${isTablet ? 'text-sm' : 'text-xs'}`}
          value={item.netAmt.toFixed(2)}
          editable={false}
        />
      </View>
      
      {/* Urgent */}
      <View style={[{ width: colWidths.urgent }, tw`px-1`]}>
        <TouchableOpacity 
          style={tw`border border-gray-300 rounded p-1 items-center ${item.urgent ? 'bg-red-100' : ''}`}
          onPress={() => {
            updateTestItems((prevItems) => {
              const updatedItems = [...prevItems];
              updatedItems[index].urgent = !updatedItems[index].urgent;
              return updatedItems;
            });
          }}
        >
          <Text style={tw`${isTablet ? 'text-xs' : 'text-[10px]'}`}>
            {item.urgent ? 'Urgent' : 'Normal'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* View */}
      <View style={[{ width: colWidths.view }, tw`px-1`]}>
        <TouchableOpacity 
          style={tw`bg-blue-500 rounded p-1 items-center justify-center`}
          onPress={() => {
            Alert.alert('Test Details', `Viewing ${item.serviceName}`);
          }}
        >
          <Icon name="visibility" size={isTablet ? 18 : 16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTableHeader = () => (
    <View style={tw`flex-row bg-gray-100 py-2 border-b border-gray-300`}>
      <View style={[{ width: colWidths.delete }, tw`px-1`]}>
        <Text style={tw`font-bold ${isTablet ? 'text-xs' : 'text-[10px]'}`}>Delete</Text>
      </View>
      <View style={[{ width: colWidths.serial }, tw`px-1`]}>
        <Text style={tw`font-bold ${isTablet ? 'text-xs' : 'text-[10px]'}`}>#</Text>
      </View>
      <View style={[{ width: colWidths.service }, tw`px-2`]}>
        <Text style={tw`font-bold ${isTablet ? 'text-xs' : 'text-[10px]'}`}>Service Name</Text>
      </View>
      <View style={[{ width: colWidths.qty }, tw`px-1`]}>
        <Text style={tw`font-bold ${isTablet ? 'text-xs' : 'text-[10px]'} text-center`}>QTY</Text>
      </View>
      <View style={[{ width: colWidths.mrp }, tw`px-1`]}>
        <Text style={tw`font-bold ${isTablet ? 'text-xs' : 'text-[10px]'} text-right`}>MRP</Text>
      </View>
      <View style={[{ width: colWidths.rate }, tw`px-1`]}>
        <Text style={tw`font-bold ${isTablet ? 'text-xs' : 'text-[10px]'} text-right`}>Rate</Text>
      </View>
      <View style={[{ width: colWidths.netAmt }, tw`px-1`]}>
        <Text style={tw`font-bold ${isTablet ? 'text-xs' : 'text-[10px]'} text-right`}>Net Amt</Text>
      </View>
      <View style={[{ width: colWidths.urgent }, tw`px-1`]}>
        <Text style={tw`font-bold ${isTablet ? 'text-xs' : 'text-[10px]'} text-center`}>Urgent</Text>
      </View>
      <View style={[{ width: colWidths.view }, tw`px-1`]}>
        <Text style={tw`font-bold ${isTablet ? 'text-xs' : 'text-[10px]'} text-center`}>View</Text>
      </View>
    </View>
  );

  // Render mobile view with stacked layout
  const renderMobileBillingSection = () => (
    <View style={tw``}>
      {/* Bill Details */}
      <View style={tw` rounded-lg mb-4`}>
        <Text style={tw`font-bold text-lg mb-3`}>Bill Details</Text>
        
        <View style={tw`mb-3`}>
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={tw`text-gray-600 flex-1`}>Gross Bill Amount</Text>
            <TextInput
              style={tw`border border-gray-300 rounded px-3 py-2 w-32 text-right`}
              value={grossBillAmount}
              onChangeText={handleGrossBillChange}
              keyboardType="numeric"
            />
          </View>

          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={tw`text-gray-600 flex-1`}>Bill Disc(%)</Text>
            <TextInput
              style={tw`border border-gray-300 rounded px-3 py-2 w-32 text-right`}
              value={billDisc}
              onChangeText={handleBillDiscChange}
              keyboardType="numeric"
            />
          </View>

          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={tw`text-gray-600 flex-1`}>Round Off</Text>
            <TextInput
              style={tw`border border-gray-300 rounded px-3 py-2 w-32 text-right`}
              value={roundOff}
              onChangeText={handleRoundOffChange}
              keyboardType="numeric"
            />
          </View>

          <View style={tw`flex-row justify-between items-center mb-3 border-t border-gray-200 pt-2`}>
            <Text style={tw`font-bold flex-1`}>Net Amount</Text>
            <TextInput
              style={tw`border border-gray-300 rounded px-3 py-2 w-32 text-right font-bold bg-blue-50`}
              value={netAmount}
              onChangeText={handleNetAmountChange}
              keyboardType="numeric"
            />
          </View>

          <View style={tw`mb-3`}>
            <Text style={tw`text-gray-600 mb-1`}>Discount Approved By</Text>
            <SelectList
              setSelected={updateDiscountApprovedBy}
              data={discountApprovers}
              save="value"
              placeholder="--Select--"
              boxStyles={tw`border border-gray-300 rounded-md`}
              dropdownStyles={tw`border border-gray-300`}
            />
          </View>

          <View style={tw`mb-3`}>
            <Text style={tw`text-gray-600 mb-1`}>Discount Reason</Text>
            <TextInput
              style={tw`border border-gray-300 rounded-md px-3 py-2`}
              placeholder="Discount Reason"
              value={discountReason}
              onChangeText={updateDiscountReason}
            />
          </View>

          <View style={tw`flex-row justify-between items-center mb-3`}>
            <Text style={tw`text-gray-600 flex-1`}>Balance Amount</Text>
            <TextInput
              style={tw`border border-gray-300 rounded px-3 py-2 w-32 text-right bg-gray-100`}
              value={balanceAmount}
              onChangeText={updateBalanceAmount}
              keyboardType="numeric"
              editable={false}
            />
          </View>

          <View style={tw`mb-3`}>
            <Text style={tw`text-gray-600 mb-1`}>Remark</Text>
            <TextInput
              style={tw`border border-gray-300 rounded-md px-3 py-2`}
              placeholder="Remark"
              value={remark}
              onChangeText={updateRemark}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
      </View>

      {/* Payment Details */}
      <View style={tw` rounded-lg`}>
        <Text style={tw`font-bold text-lg mb-3`}>Payment Details</Text>

        <View style={tw`mb-3`}>
          <Text style={tw`text-gray-600 mb-1`}>Payment Mode</Text>
          <SelectList
            setSelected={updatePaymentMode}
            data={paymentModes}
            save="value"
            defaultOption={{ key: '1', value: paymentMode }}
            boxStyles={tw`border border-gray-300 rounded-md`}
            dropdownStyles={tw`border border-gray-300`}
          />
        </View>

        <View style={tw`flex-row justify-between items-center mb-3`}>
          <Text style={tw`text-gray-600 flex-1`}>Amount</Text>
          <TextInput
            style={tw`border border-gray-300 rounded px-3 py-2 w-32 text-right`}
            value={amount}
            onChangeText={updateAmount}
            keyboardType="numeric"
          />
        </View>

        <View style={tw`mb-3`}>
          <Text style={tw`text-gray-600 mb-1`}>Bank</Text>
          <TextInput
            style={CustomStyles.input}
            placeholder="Bank"
            value={bank}
            onChangeText={updateBank}
          />
        </View>

        <View style={tw`mb-3`}>
          <Text style={tw`text-gray-600 mb-1`}>Ref. No.</Text>
          <TextInput
           style={CustomStyles.input}
            placeholder="Ref. No."
            value={refNo}
            onChangeText={updateRefNo}
          />
        </View>

        <View style={tw`mb-3`}>
          <Text style={tw`text-gray-600 mb-1`}>Debit Card</Text>
          <SelectList
            setSelected={updateDebitCard}
            data={[{ key: '1', value: '--Select--' }]}
            save="value"
            placeholder="--Select--"
            boxStyles={tw`border border-gray-300 rounded-md`}
            dropdownStyles={tw`border border-gray-300`}
          />
        </View>

        <View style={tw`mb-3`}>
          <Text style={tw`text-gray-600 mb-1`}>Cheque</Text>
          <SelectList
            setSelected={updateCheque}
            data={[{ key: '1', value: '--Select--' }]}
            save="value"
            placeholder="--Select--"
            boxStyles={tw`border border-gray-300 rounded-md`}
            dropdownStyles={tw`border border-gray-300`}
          />
        </View>

        <View style={tw`mb-3`}>
          <Text style={tw`text-gray-600 mb-1`}>NEFT/RTGS</Text>
          <SelectList
            setSelected={updateNeftRtgs}
            data={[{ key: '1', value: '--Select--' }]}
            save="value"
            placeholder="--Select--"
            boxStyles={tw`border border-gray-300 rounded-md`}
            dropdownStyles={tw`border border-gray-300`}
          />
        </View>

        <View style={tw`flex-row justify-between items-center mb-3`}>
          <Text style={tw`text-gray-600 flex-1`}>Paytm</Text>
          <TextInput
            style={tw`border border-gray-300 rounded px-3 py-2 w-32 text-right`}
            value={paytm}
            onChangeText={updatePaytm}
            keyboardType="numeric"
          />
        </View>

        <View style={tw`flex-row justify-between items-center mb-3`}>
          <Text style={tw`text-gray-600 flex-1`}>Phone Pay</Text>
          <TextInput
            style={tw`border border-gray-300 rounded px-3 py-2 w-32 text-right`}
            value={phonePay}
            onChangeText={updatePhonePay}
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={tw`flex-1 bg-white mt-6`}>
      {/* Doctor Section */}
      <View style={tw` border-b border-gray-200`}>
        <Text style={tw`mb-2`}>Select Doctor</Text>
         <SelectList
              setSelected={updateSelctedDoctor}
              data={doctorData}
              save="value"
              placeholder="--Select--"
              boxStyles={tw`border border-gray-300 rounded-md`}
              dropdownStyles={tw`border border-gray-300`}
            />
        <View style={tw`mt-2 bg-blue-50 p-3 rounded-md`}>
          <Text style={tw`text-blue-800 font-semibold ${isTablet ? 'text-base' : 'text-sm'}`} numberOfLines={2}>
            {selctedDoctor}
          </Text>
        </View>
      </View>

      {/* Search Investigation */}
      <View style={tw` py-2 border-b border-gray-200`}>
        <Text style={tw`text-gray-700 font-semibold mb-1 ${isTablet ? 'text-base' : 'text-sm'}`}>
          Search Investigation
        </Text>
        <TextInput
          style={tw`border border-gray-300 rounded-md px-3 py-2 ${isTablet ? 'text-base' : 'text-sm'}`}
          placeholder="Type to Search Investigation..."
          value={searchText}
          onChangeText={updateSearchText}
        />
      </View>

      {/* Test Items Table - Horizontal Scroll for all devices */}
      <View style={tw` py-2`}>
        <Text style={tw`text-gray-700 font-semibold mb-2 ${isTablet ? 'text-base' : 'text-sm'}`}>
          Selected Investigations
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={true} style={tw`border border-gray-200 rounded-lg`}>
          <View>
            {renderTableHeader()}
            <FlatList
              data={testItems}
              renderItem={renderTestItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>
        </ScrollView>
      </View>

      {/* Billing Section - Responsive Layout */}
      {isTablet ? (
        // Tablet/Landscape View - Side by side
        <View style={tw`flex-row p-4 border-t border-gray-200`}>
          {/* Left Section - Bill Details */}
          <View style={tw`flex-1 pr-2`}>
            <View style={tw`bg-gray-50 p-4 rounded-lg`}>
              <Text style={tw`font-bold text-lg mb-3`}>Bill Details</Text>
              
              <View style={tw`mb-3`}>
                <View style={tw`flex-row justify-between items-center mb-2`}>
                  <Text style={tw`text-gray-600`}>Gross Bill Amount</Text>
                  <TextInput
                    style={tw`border border-gray-300 rounded px-3 py-2 w-32 text-right`}
                    value={grossBillAmount}
                    onChangeText={handleGrossBillChange}
                    keyboardType="numeric"
                  />
                </View>

                <View style={tw`flex-row justify-between items-center mb-2`}>
                  <Text style={tw`text-gray-600`}>Bill Disc(%)</Text>
                  <TextInput
                    style={tw`border border-gray-300 rounded px-3 py-2 w-32 text-right`}
                    value={billDisc}
                    onChangeText={handleBillDiscChange}
                    keyboardType="numeric"
                  />
                </View>

                <View style={tw`flex-row justify-between items-center mb-2`}>
                  <Text style={tw`text-gray-600`}>Round Off</Text>
                  <TextInput
                    style={tw`border border-gray-300 rounded px-3 py-2 w-32 text-right`}
                    value={roundOff}
                    onChangeText={handleRoundOffChange}
                    keyboardType="numeric"
                  />
                </View>

                <View style={tw`flex-row justify-between items-center mb-3 border-t border-gray-200 pt-2`}>
                  <Text style={tw`font-bold`}>Net Amount</Text>
                  <TextInput
                    style={tw`border border-gray-300 rounded px-3 py-2 w-32 text-right font-bold bg-blue-50`}
                    value={netAmount}
                    onChangeText={handleNetAmountChange}
                    keyboardType="numeric"
                  />
                </View>

                <View style={tw`mb-3`}>
                  <Text style={tw`text-gray-600 mb-1`}>Discount Approved By</Text>
                  <SelectList
                    setSelected={updateDiscountApprovedBy}
                    data={discountApprovers}
                    save="value"
                    placeholder="--Select--"
                    boxStyles={tw`border border-gray-300 rounded-md`}
                    dropdownStyles={tw`border border-gray-300`}
                  />
                </View>

                <View style={tw`mb-3`}>
                  <Text style={tw`text-gray-600 mb-1`}>Discount Reason</Text>
                  <TextInput
                   style={CustomStyles.input}
                    placeholder="Discount Reason"
                    value={discountReason}
                    onChangeText={updateDiscountReason}
                  />
                </View>

                <View style={tw`flex-row justify-between items-center mb-3`}>
                  <Text style={tw`text-gray-600`}>Balance Amount</Text>
                  <TextInput
                    style={tw`border border-gray-300 rounded px-3 py-2 w-32 text-right bg-gray-100`}
                    value={balanceAmount}
                    onChangeText={updateBalanceAmount}
                    keyboardType="numeric"
                    editable={false}
                  />
                </View>

                <View style={tw`mb-3`}>
                  <Text style={tw`text-gray-600 mb-1`}>Remark</Text>
                  <TextInput
                   style={CustomStyles.input}
                    placeholder="Remark"
                    value={remark}
                    onChangeText={updateRemark}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Right Section - Payment Details */}
          <View style={tw`flex-1 pl-2`}>
            <View style={tw`bg-gray-50 p-4 rounded-lg`}>
              <Text style={tw`font-bold text-lg mb-3`}>Payment Details</Text>

              <View style={tw`mb-3`}>
                <Text style={tw`text-gray-600 mb-1`}>Payment Mode</Text>
                <SelectList
                  setSelected={updatePaymentMode}
                  data={paymentModes}
                  save="value"
                  defaultOption={{ key: '1', value: paymentMode }}
                  boxStyles={tw`border border-gray-300 rounded-md`}
                  dropdownStyles={tw`border border-gray-300`}
                />
              </View>

              <View style={tw`flex-row justify-between items-center mb-3`}>
                <Text style={tw`text-gray-600`}>Amount</Text>
                <TextInput
                  style={tw`border border-gray-300 rounded px-3 py-2 w-32 text-right`}
                  value={amount}
                  onChangeText={updateAmount}
                  keyboardType="numeric"
                />
              </View>

              <View style={tw`mb-3`}>
                <Text style={tw`text-gray-600 mb-1`}>Bank</Text>
                <TextInput
                 style={CustomStyles.input}
                  placeholder="Bank"
                  value={bank}
                  onChangeText={updateBank}
                />
              </View>

              <View style={tw`mb-3`}>
                <Text style={tw`text-gray-600 mb-1`}>Ref. No.</Text>
                <TextInput
                 style={CustomStyles.input}
                  placeholder="Ref. No."
                  value={refNo}
                  onChangeText={updateRefNo}
                />
              </View>

              <View style={tw`mb-3`}>
                <Text style={tw`text-gray-600 mb-1`}>Debit Card</Text>
                <SelectList
                  setSelected={updateDebitCard}
                  data={[{ key: '1', value: '--Select--' }]}
                  save="value"
                  placeholder="--Select--"
                  boxStyles={tw`border border-gray-300 rounded-md`}
                  dropdownStyles={tw`border border-gray-300`}
                />
              </View>

              <View style={tw`mb-3`}>
                <Text style={tw`text-gray-600 mb-1`}>Cheque</Text>
                <SelectList
                  setSelected={updateCheque}
                  data={[{ key: '1', value: '--Select--' }]}
                  save="value"
                  placeholder="--Select--"
                  boxStyles={tw`border border-gray-300 rounded-md`}
                  dropdownStyles={tw`border border-gray-300`}
                />
              </View>

              <View style={tw`mb-3`}>
                <Text style={tw`text-gray-600 mb-1`}>NEFT/RTGS</Text>
                <SelectList
                  setSelected={updateNeftRtgs}
                  data={[{ key: '1', value: '--Select--' }]}
                  save="value"
                  placeholder="--Select--"
                  boxStyles={tw`border border-gray-300 rounded-md`}
                  dropdownStyles={tw`border border-gray-300`}
                />
              </View>

              <View style={tw`flex-row justify-between items-center mb-3`}>
                <Text style={tw`text-gray-600`}>Paytm</Text>
                <TextInput
                  style={tw`border border-gray-300 rounded px-3 py-2 w-32 text-right`}
                  value={paytm}
                  onChangeText={updatePaytm}
                  keyboardType="numeric"
                />
              </View>

              <View style={tw`flex-row justify-between items-center mb-3`}>
                <Text style={tw`text-gray-600`}>Phone Pay</Text>
                <TextInput
                  style={tw`border border-gray-300 rounded px-3 py-2 w-32 text-right`}
                  value={phonePay}
                  onChangeText={updatePhonePay}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>
      ) : (
        // Mobile/Portrait View - Stacked
        renderMobileBillingSection()
      )}
    </View>
  );
};

export default AddTestDetails;