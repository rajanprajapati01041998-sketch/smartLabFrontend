import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  ScrollView
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import tw from 'twrnc';
import styles from '../../../utils/InputStyle';
import api from '../../../../Authorization/api';
import SelectBank from './SelectBank';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../../Authorization/ThemeContext';

const PaymentInfo = ({
  parseMoney,
  onPaymentChange,
  netAmount,
  onBalanceChange,
  onReceiptAmountChange,
}) => {
  const [paymentModes, setPaymentModes] = useState([]);
  const [paymentData, setPaymentData] = useState({});
  const [bankModal, setBankModal] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [showAllModes, setShowAllModes] = useState(false);
  const { colors } = useTheme();

  const animations = useRef({});
  const cashModeId = useRef(null);

  useEffect(() => {
    getPaymentModes();
  }, []);

  const getPaymentModes = async () => {
    try {
      const res = await api.get('PaymentMode/GetPaymentModes');
      setPaymentModes(res.data || []);
    } catch (error) {
      console.log('Payment mode error', error);
    }
  };

  useEffect(() => {
    if (paymentModes.length > 0) {
      const initial = {};

      paymentModes.forEach(mode => {
        const isCash = mode.paymentModeName?.toLowerCase().includes('cash');

        if (isCash) cashModeId.current = mode.paymentModeId;

        initial[mode.paymentModeId] = {
          amount: isCash ? netAmount || 0 : 0,
          bank: null,
          reference: '',
        };

        animations.current[mode.paymentModeId] = new Animated.Value(0);
      });

      setPaymentData(initial);

      onPaymentChange && onPaymentChange(initial);

      // ✅ ReceiptAmount = Cash amount only
      if (cashModeId.current) {
        onReceiptAmountChange &&
          onReceiptAmountChange(Number(initial[cashModeId.current]?.amount || 0));
      }
    }
  }, [paymentModes, netAmount]);

  const updatePayment = (id, field, value) => {
    setPaymentData(prev => {
      let updated = {
        ...prev,
        [id]: {
          ...prev[id],
          [field]: field === 'amount' ? value ?? 0 : value,
        },
      };

      if (field === 'amount' && id !== cashModeId.current) {
        let totalOther = 0;

        Object.keys(updated).forEach(key => {
          if (Number(key) !== cashModeId.current) {
            totalOther += Number(updated[key].amount || 0);
          }
        });

        const remainingCash = Math.max((netAmount || 0) - totalOther, 0);

        if (cashModeId.current) {
          updated[cashModeId.current] = {
            ...updated[cashModeId.current],
            amount: remainingCash,
          };
        }
      }

      const amount = updated[id]?.amount || 0;

      if (amount > 0 && !expandedCards[id] && id !== cashModeId.current) {
        setExpandedCards(prev => ({ ...prev, [id]: true }));
        animateCard(id, true);
      }

      onPaymentChange && onPaymentChange(updated);

      // ✅ Send remaining cash/cash amount to Registration page
      if (cashModeId.current) {
        onReceiptAmountChange &&
          onReceiptAmountChange(Number(updated[cashModeId.current]?.amount || 0));
      }

      return updated;
    });
  };

  const animateCard = (id, show) => {
    if (!animations.current[id]) {
      animations.current[id] = new Animated.Value(0);
    }

    Animated.timing(animations.current[id], {
      toValue: show ? 1 : 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  };

  const getPaymentIcon = modeName => {
    const name = modeName?.toLowerCase() || '';
    if (name.includes('cash')) return 'cash';
    if (name.includes('card')) return 'credit-card';
    if (name.includes('upi')) return 'qrcode-scan';
    if (name.includes('bank')) return 'bank';
    if (name.includes('wallet')) return 'wallet';
    return 'credit-card';
  };

  const getPaymentColor = modeName => {
    const name = modeName?.toLowerCase() || '';
    if (name.includes('cash')) return '#10B981';
    if (name.includes('card')) return '#3B82F6';
    if (name.includes('upi')) return '#8B5CF6';
    if (name.includes('bank')) return '#F59E0B';
    if (name.includes('wallet')) return '#EF4444';
    return '#6B7280';
  };

  const toggleAllModes = () => {
    setShowAllModes(!showAllModes);
  };

  useEffect(() => {
    const totalPaid = Object.values(paymentData).reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );

    const balance = Math.max((netAmount || 0) - totalPaid, 0);
    onBalanceChange && onBalanceChange(balance);
  }, [paymentData, netAmount]);

  return (
    <View style={tw`mt-6 mb-4`}>
      <View style={tw`mb-4 flex-row justify-between items-center`}>
        <View>
          <Text style={[styles.patientInfoText]}>Payment Details</Text>
          <View style={tw`h-0.5 w-12 bg-purple-400 rounded-full mt-1`} />
        </View>

        {cashModeId.current && (
          <TouchableOpacity
            onPress={toggleAllModes}
            style={tw`flex-row items-center px-3 py-2 rounded-lg bg-gray-100`}
            activeOpacity={0.7}
          >
            <Icon
              name={showAllModes ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#6B7280"
            />
            <Text style={tw`text-sm text-gray-600 ml-1`}>
              {showAllModes ? 'Show Less' : 'More Options'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {paymentModes.map(item => {
          const isCash = item.paymentModeId === cashModeId.current;
          const data = paymentData[item.paymentModeId] || {};
          const paymentColor = getPaymentColor(item.paymentModeName);
          const PaymentIcon = getPaymentIcon(item.paymentModeName);

          if (!showAllModes && !isCash) return null;

          return (
            <Animated.View key={item.paymentModeId}>
              <View style={[tw``, styles.cardShadow]}>
                <View style={tw`flex-row justify-between items-center mb-3`}>
                  <View style={tw`flex-row items-center flex-1`}>
                    <View
                      style={[
                        tw`w-10 h-10 rounded-full items-center justify-center mr-3`,
                        { backgroundColor: `${paymentColor}15` },
                      ]}
                    >
                      <Icon name={PaymentIcon} size={22} color={paymentColor} />
                    </View>

                    <View style={tw`flex-1`}>
                      <Text style={[tw`text-base font-semibold`]}>
                        {item.paymentModeName}
                      </Text>

                      {isCash && !showAllModes && (
                        <Text style={tw`text-xs text-gray-400 mt-0.5`}>
                          Current payment method
                        </Text>
                      )}
                    </View>
                  </View>

                  {!isCash && (
                    <TouchableOpacity
                      onPress={() => {
                        if (data.amount > 0) {
                          setExpandedCards(prev => {
                            const newValue = !prev[item.paymentModeId];
                            animateCard(item.paymentModeId, newValue);
                            return {
                              ...prev,
                              [item.paymentModeId]: newValue,
                            };
                          });
                        }
                      }}
                    >
                      <Icon
                        name={
                          expandedCards[item.paymentModeId] && data.amount > 0
                            ? 'chevron-up'
                            : 'chevron-down'
                        }
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={tw`mb-3`}>
                  <Text style={tw`text-xs text-gray-500 mb-1 ml-1`}>
                    Amount
                  </Text>

                  <View
                    style={[
                      tw`flex-row items-center border rounded-xl px-3`,
                      {
                        borderColor: '#E5E7EB',
                        backgroundColor: '#F9FAFB',
                      },
                    ]}
                  >
                    <Text style={tw`text-gray-400 mr-2 font-semibold`}>₹</Text>

                    <TextInput
                      value={data.amount ? String(data.amount) : ''}
                      keyboardType="numeric"
                      placeholder="0.00"
                      placeholderTextColor="#9CA3AF"
                      onChangeText={txt => {
                        const amount = parseMoney(txt);
                        updatePayment(item.paymentModeId, 'amount', amount);
                      }}
                      style={[tw`flex-1 py-2 text-base text-gray-500`]}
                    />
                  </View>
                </View>

                {!isCash && expandedCards[item.paymentModeId] && data.amount > 0 && (
                  <Animated.View
                    style={[
                      tw`mt-2 pt-2 border-t`,
                      {
                        borderColor: '#F3F4F6',
                        opacity: animations.current[item.paymentModeId],
                        maxHeight: animations.current[
                          item.paymentModeId
                        ].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 200],
                        }),
                      },
                    ]}
                  >
                    <View style={tw`flex flex-row gap-2`}>
                      {item.payModeType === 'Bank Payment' && (
                        <View style={tw`mb-3 flex-1`}>
                          <Text style={tw`text-xs text-gray-500 mb-1 ml-1`}>
                            Select Bank
                          </Text>

                          <TouchableOpacity
                            onPress={() => {
                              setSelectedPaymentId(item.paymentModeId);
                              setBankModal(true);
                            }}
                            style={[
                              tw`flex-row items-center justify-between border rounded-xl px-3 py-2`,
                              {
                                borderColor: '#E5E7EB',
                                backgroundColor: '#F9FAFB',
                              },
                            ]}
                          >
                            <Text numberOfLines={1} style={[tw`flex-1 text-base`]}>
                              {data.bank?.bankName || 'Choose Bank'}
                            </Text>

                            <Icon name="chevron-down" size={20} color="#9CA3AF" />
                          </TouchableOpacity>
                        </View>
                      )}

                      <View style={tw`flex-1`}>
                        <Text style={tw`text-xs text-gray-500 mb-1 ml-1`}>
                          Reference / Transaction ID
                        </Text>

                        <View
                          style={[
                            tw`flex-row items-center border rounded-xl px-3`,
                            {
                              borderColor: '#E5E7EB',
                              backgroundColor: '#F9FAFB',
                            },
                          ]}
                        >
                          <Icon name="receipt" size={18} color="#9CA3AF" />

                          <TextInput
                            value={data.reference || ''}
                            onChangeText={txt =>
                              updatePayment(item.paymentModeId, 'reference', txt)
                            }
                            placeholder="Enter reference number"
                            placeholderTextColor="#9CA3AF"
                            style={[tw`flex-1 py-2 ml-2 text-base`]}
                          />
                        </View>
                      </View>
                    </View>
                  </Animated.View>
                )}
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>

      <Modal visible={bankModal} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setBankModal(false)}>
          <View style={tw`flex-1 justify-end bg-black/50`}>
            <View style={tw`bg-white rounded-t-3xl`}>
              <View style={tw`p-4 flex-row justify-between items-center`}>
                <Text style={tw`text-lg font-semibold text-gray-800`}>
                  Select Bank
                </Text>

                <TouchableOpacity onPress={() => setBankModal(false)}>
                  <Icon name="close" size={24} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <View style={tw`min-h-[60%]`}>
                <SelectBank
                  onSelectBankItem={bank => {
                    if (!selectedPaymentId) return;
                    updatePayment(selectedPaymentId, 'bank', bank);
                    setBankModal(false);
                  }}
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default PaymentInfo;