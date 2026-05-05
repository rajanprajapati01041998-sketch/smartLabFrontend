import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import tw from 'twrnc';
import api from '../../../../Authorization/api';
import SelectBank from './SelectBank';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../../Authorization/ThemeContext';
import { getThemeStyles } from '../../../utils/themeStyles';

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

  const { theme } = useTheme();
  const themed = getThemeStyles(theme);

  const cashModeId = useRef(null);

  const { height } = Dimensions.get('window');
  const bankSheetHeight = height * 0.65;

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
    if (paymentModes.length === 0) return;

    const initial = {};

    paymentModes.forEach(mode => {
      const isCash = mode.paymentModeName?.toLowerCase().includes('cash');

      if (isCash) cashModeId.current = mode.paymentModeId;

      initial[mode.paymentModeId] = {
        amount: isCash ? Number(netAmount || 0) : 0,
        bank: null,
        reference: '',
      };
    });

    setPaymentData(initial);
  }, [paymentModes, netAmount]);

  useEffect(() => {
    onPaymentChange?.(paymentData);

    if (cashModeId.current) {
      onReceiptAmountChange?.(
        Number(paymentData[cashModeId.current]?.amount || 0),
      );
    }

    const totalPaid = Object.values(paymentData).reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0,
    );

    const balance = Math.max(Number(netAmount || 0) - totalPaid, 0);
    onBalanceChange?.(balance);
  }, [paymentData, netAmount]);

  const updatePayment = (id, field, value) => {
    setPaymentData(prev => {
      let updated = {
        ...prev,
        [id]: {
          ...prev[id],
          [field]: field === 'amount' ? Number(value || 0) : value,
        },
      };

      if (field === 'amount' && id !== cashModeId.current) {
        let totalOther = 0;

        Object.keys(updated).forEach(key => {
          if (Number(key) !== Number(cashModeId.current)) {
            totalOther += Number(updated[key]?.amount || 0);
          }
        });

        const remainingCash = Math.max(Number(netAmount || 0) - totalOther, 0);

        if (cashModeId.current) {
          updated[cashModeId.current] = {
            ...updated[cashModeId.current],
            amount: remainingCash,
          };
        }
      }

      if (
        Number(updated[id]?.amount || 0) > 0 &&
        id !== cashModeId.current
      ) {
        requestAnimationFrame(() => {
          setExpandedCards(prevExp => ({
            ...prevExp,
            [id]: true,
          }));
        });
      }

      return updated;
    });
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

  return (
    <View style={[themed.childScreen, themed.card, tw`mt-6 mb-4 p-4`]}>
      <View style={tw`mb-4 flex-row justify-between items-center`}>
        <View>
          <Text style={[themed.headerTitle, tw`text-purple-400`]}>Payment Details</Text>
          <View style={tw`h-0.5 w-12 bg-purple-400 rounded-full mt-1`} />
        </View>

        {cashModeId.current && (
          <TouchableOpacity
            onPress={() => setShowAllModes(prev => !prev)}
            style={[
              themed.addButton,
              tw`flex-row items-center px-3 py-2 rounded-lg`,
            ]}
            activeOpacity={0.7}
          >
            <Icon
              name={showAllModes ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={themed.chevronColor}
            />

            <Text style={themed.addButtonText}>
              {showAllModes ? 'Show Less' : 'More Options'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        {paymentModes.map(item => {
          const isCash = item.paymentModeId === cashModeId.current;
          const data = paymentData[item.paymentModeId] || {};
          const paymentColor = getPaymentColor(item.paymentModeName);
          const PaymentIcon = getPaymentIcon(item.paymentModeName);
          const isExpanded =
            expandedCards[item.paymentModeId] &&
            Number(data.amount || 0) > 0;

          if (!showAllModes && !isCash) return null;

          return (
            <View
              key={item.paymentModeId}
              style={[
                themed.childScreen,
                themed.border,
                tw`mb-4 rounded-2xl p-4`,
              ]}
            >
              <View style={tw`flex-row justify-between items-center mb-4`}>
                <View style={tw`flex-row items-center flex-1`}>
                  <View
                    style={[
                      tw`w-8 h-8 rounded-full items-center justify-center mr-3`,
                      { backgroundColor: `${paymentColor}22` },
                    ]}
                  >
                    <Icon name={PaymentIcon} size={20} color={paymentColor} />
                  </View>

                  <View style={tw`flex-1`}>
                    <Text
                      style={[
                        themed.headerTitle,
                        tw``,
                      ]}
                    >
                      {item.paymentModeName}
                    </Text>

                    {isCash && !showAllModes && (
                      <Text style={[themed.mutedText, tw`text-xs mt-1`]}>
                        Current payment method
                      </Text>
                    )}
                  </View>
                </View>

                {!isCash && (
                  <TouchableOpacity
                    onPress={() => {
                      if (Number(data.amount || 0) > 0) {
                        setExpandedCards(prev => ({
                          ...prev,
                          [item.paymentModeId]: !prev[item.paymentModeId],
                        }));
                      }
                    }}
                  >
                    <Icon
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={24}
                      color={themed.chevronColor}
                    />
                  </TouchableOpacity>
                )}
              </View>

              <View style={tw`mb-3`}>
                <Text style={[themed.labelText, tw`text-xs mb-2 ml-1`]}>
                  Amount
                </Text>
                <TextInput
                  value={
                    data.amount === 0 || data.amount === null
                      ? ''
                      : String(data.amount || '')
                  }
                  keyboardType="numeric"
                  placeholder="  ₹ 0.00"
                  placeholderTextColor={themed.inputPlaceholder}
                  onChangeText={txt => {
                    const amount = parseMoney(txt);
                    updatePayment(item.paymentModeId, 'amount', amount);
                  }}
                  style={[themed.inputText, themed.inputBox]}
                />

              </View>

              {!isCash && isExpanded && (
                <View style={[themed.borderTop, tw`mt-3 pt-3 border-t`]}>
                  <View style={tw`flex-row gap-3`}>
                    {item.payModeType === 'Bank Payment' && (
                      <View style={tw`flex-1`}>
                        <Text style={[themed.labelText, tw`text-xs mb-2 ml-1`]}>
                          Select Bank
                        </Text>

                        <TouchableOpacity
                          onPress={() => {
                            setSelectedPaymentId(item.paymentModeId);
                            setBankModal(true);
                          }}
                          style={[
                            themed.inputBox,
                            themed.border,
                            tw`flex-row items-center justify-between rounded-xl px-3 py-3`,
                          ]}
                        >
                          <Text
                            numberOfLines={1}
                            style={[themed.inputText, tw`flex-1 text-base`]}
                          >
                            {data.bank?.bankName || 'Choose Bank'}
                          </Text>

                          <Icon
                            name="chevron-down"
                            size={22}
                            color={themed.chevronColor}
                          />
                        </TouchableOpacity>
                      </View>
                    )}

                    <View style={tw`flex-1`}>
                      <Text style={[themed.labelText, tw`text-xs mb-2 ml-1`]}>
                        Reference / Transaction ID
                      </Text>
                      <TextInput
                        value={data.reference || ''}
                        onChangeText={txt =>
                          updatePayment(
                            item.paymentModeId,
                            'reference',
                            txt,
                          )
                        }
                        placeholder="Enter reference"
                        placeholderTextColor={themed.inputPlaceholder}
                        style={[themed.inputText, themed.inputBox]}
                      />
                    </View>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <Modal
        visible={bankModal}
        transparent
        animationType="slide"
        statusBarTranslucent={false}
        onRequestClose={() => setBankModal(false)}
      >
        <View style={tw`flex-1 bg-black/50`}>

          {/* outside click close */}
          <TouchableWithoutFeedback onPress={() => setBankModal(false)}>
            <View style={tw`flex-1`} />
          </TouchableWithoutFeedback>

          {/* bottom half modal */}
          <View
            style={[
              themed.childScreen,
              themed.border,
              tw`absolute bottom-0 left-0 right-0 rounded-t-3xl overflow-hidden`,
              {
                height: bankSheetHeight,
              },
            ]}
          >
            <View style={tw`px-4 py-4 flex-row justify-between items-center`}>
              <Text style={[themed.inputText, tw`font-bold text-lg`]}>
                Select Bank
              </Text>

              <TouchableOpacity onPress={() => setBankModal(false)}>
                <Icon name="close" size={26} color={themed.chevronColor} />
              </TouchableOpacity>
            </View>

            <View style={[themed.border, tw`h-[0.5px]`]} />

            <View style={tw`flex-1 min-h-0`}>
              <SelectBank
                onSelectBankItem={bank => {
                  if (!selectedPaymentId) return;

                  updatePayment(selectedPaymentId, 'bank', bank);
                  setBankModal(false);
                }}
                onClose={() => setBankModal(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PaymentInfo;