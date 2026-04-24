import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../../../../Authorization/ThemeContext';
import { getThemeStyles } from '../../../utils/themeStyles';
import tw from 'twrnc';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../../../../Authorization/api';
import { useToast } from '../../../../Authorization/ToastContext';
import { Checkbox } from 'react-native-paper';
import { getColorCode } from '../../../utils/colorUtils';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../../../Authorization/AuthContext';
import ViewTestRangeDetails from './ViewTestRangeDetails';

const resolveServiceItemId = (item) => {
  return (
    item?.serviceItemId ??
    item?.ServiceItemId ??
    item?.itemId ??
    item?.InvestigationId ??
    item?.id ??
    0
  );
};

const SearchServiceUpdate = ({ onClose, onSaveTests, initialSelectedTests }) => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const themed = getThemeStyles(theme);
  const { corporateId } = useAuth();
  const [rangeModalVisible, setRangeModalVisible] = useState(false);
  const [selectedServiceItemId, setSelectedServiceItemId] = useState(null);
  const [selectedServiceItemName, setSelectedServiceItemName] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [testList, setTestList] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const debounceRef = useRef(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    if (Array.isArray(initialSelectedTests)) {
      setSelectedTests(initialSelectedTests);
    }
    hydratedRef.current = true;
  }, [initialSelectedTests]);

  const totalAmount = useMemo(() => {
    return selectedTests.reduce((sum, item) => {
      const amount = Number(item?.amount) || 0;
      const qty = Number(item?.qty) || 1;
      return sum + amount * qty;
    }, 0);
  }, [selectedTests]);

  useEffect(() => {
    if (selectedTests.length === 0) {
      setDetailModalVisible(false);
    }
  }, [selectedTests]);

  const searchTest = useCallback(
    async (searchText) => {
      try {
        if (!searchText?.trim()) {
          setTestList([]);
          return;
        }

        setLoading(true);

        const response = await api.get(
          `Investigation/SearchInvestigation?searchText=${encodeURIComponent(
            searchText.trim()
          )}`
        );

        if (response?.data?.success || response?.data?.status) {
          setTestList(response?.data?.data || response?.data || []);
        } else if (Array.isArray(response?.data)) {
          setTestList(response?.data);
        } else {
          setTestList([]);
        }
      } catch (error) {
        console.log('search test error', error?.response?.data || error?.message);
        setTestList([]);
        showToast(
          error?.response?.data?.message || 'Unable to search test',
          'error'
        );
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!search.trim()) {
      setTestList([]);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      searchTest(search);
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search, searchTest]);

  const openServiceDetailModal = async (item) => {
    const serviceItemId = resolveServiceItemId(item);
    const categoryId = item?.categoryId || item?.CategoryId || 0;
    const subCategoryId = item?.subCategoryId || item?.SubCategoryId || 0;
    const subSubCategoryId = item?.subSubCategoryId || item?.SubSubCategoryId || 0;

    if (!serviceItemId) {
      showToast('Service item id not found', 'error');
      return;
    }

    try {
      setDetailsLoading(true);

      const response = await api.get(
        `ServiceAllDetailsForOPDBilling/GetServiceDetails?corporateId=${corporateId}&serviceItemId=${serviceItemId}&categoryId=${categoryId}&subCategoryId=${subCategoryId}&subSubCategoryId=${subSubCategoryId}&bedTypeId=0`
      );

      const rawData = response?.data?.data ?? response?.data;
      const detailItem = Array.isArray(rawData) ? rawData?.[0] || null : rawData || null;

      const existing = selectedTests.find(
        (x) => Number(x.serviceItemId) === Number(serviceItemId)
      );

      const preparedItem = {
        serviceItemId,
        categoryId,
        subCategoryId,
        subSubCategoryId,
        serviceName:
          existing?.serviceName ||
          detailItem?.ServiceName ||
          detailItem?.name ||
          item?.name ||
          item?.ServiceName ||
          '',
        amount:
          existing?.amount ??
          detailItem?.Rate ??
          detailItem?.rate ??
          detailItem?.Amount ??
          0,
        qty: existing?.qty ?? 1,
        isUrgent: existing?.isUrgent ?? 0,
        barcode: existing?.barcode ?? '',
        testRemark: existing?.testRemark ?? '',
        mrp:
          detailItem?.MRP ??
          detailItem?.Mrp ??
          detailItem?.mrp ??
          detailItem?.Rate ??
          0,
        sampleVolume:
          existing?.sampleVolume ||
          detailItem?.SampleVolume ||
          detailItem?.sampleVolume ||
          detailItem?.Volume ||
          detailItem?.SampleQty ||
          detailItem?.sampleQty ||
          '',
        containerColor:
          existing?.containerColor ||
          detailItem?.ContainerColor ||
          detailItem?.containerColor ||
          detailItem?.ColorCode ||
          detailItem?.colorCode ||
          '',
        isRateEditable:
          existing?.isRateEditable ??
          detailItem?.isRateEditable ??
          detailItem?.IsRateEditable ??
          false,
      };

      setSelectedTests((prev) => {
        const exists = prev.some(
          (x) => Number(x.serviceItemId) === Number(serviceItemId)
        );

        if (exists) {
          return prev.map((x) =>
            Number(x.serviceItemId) === Number(serviceItemId)
              ? { ...x, ...preparedItem }
              : x
          );
        }

        return [...prev, preparedItem];
      });

      setDetailModalVisible(true);
    } catch (error) {
      console.log('service details error', error?.response?.data || error?.message);
      showToast(
        error?.response?.data?.message || 'Unable to fetch service details',
        'error'
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const updateSelectedTestField = (serviceItemId, key, value) => {
    setSelectedTests((prev) =>
      prev.map((item) =>
        Number(item.serviceItemId) === Number(serviceItemId)
          ? { ...item, [key]: value }
          : item
      )
    );
  };

  const removeSelectedTest = (serviceItemId) => {
    setSelectedTests((prev) =>
      prev.filter((item) => Number(item.serviceItemId) !== Number(serviceItemId))
    );
  };

  const toggleUrgent = (serviceItemId) => {
    setSelectedTests((prev) =>
      prev.map((item) =>
        Number(item.serviceItemId) === Number(serviceItemId)
          ? { ...item, isUrgent: item?.isUrgent === 1 ? 0 : 1 }
          : item
      )
    );
  };

  const handleViewRange = (item) => {
    console.log("view", item)
    setSelectedServiceItemId(item?.serviceItemId)
    setSelectedServiceItemName(item?.serviceName)
    setRangeModalVisible(true)
  };

  const handleSaveAllTests = () => {
    if (!selectedTests.length) {
      showToast('Please select at least one test', 'error');
      return;
    }

    const payload = {
      services: selectedTests.map((item) => ({
        serviceItemId: Number(item.serviceItemId) || 0,
        subSubCategoryId: Number(item.subSubCategoryId) || 0,
        serviceName: item.serviceName || '',
        amount: Number(item.amount) || 0,
        qty: Number(item.qty) || 1,
        isUrgent: Number(item.isUrgent) || 0,
        barcode: item.barcode || '',
        testRemark: item.testRemark || '',
      })),
    };

    if (onSaveTests) {
      onSaveTests(payload);
    }

    setDetailModalVisible(false);

    if (onClose) {
      onClose();
    }
  };

  const renderSearchItem = ({ item }) => {
    const serviceItemId = resolveServiceItemId(item);

    const alreadyAdded = selectedTests.some(
      (x) => Number(x.serviceItemId) === Number(serviceItemId)
    );

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => openServiceDetailModal(item)}
        style={[
          themed.globalCard,
          themed.border,
          tw`mt-3 p-3 rounded-xl border`,
        ]}
      >
        <View style={tw`flex-row justify-between items-start`}>
          <View style={tw`flex-1 pr-2`}>
            <Text style={[themed.inputText, tw`font-semibold text-sm`]}>
              {item?.name || item?.ServiceName}
            </Text>
          </View>

          {alreadyAdded ? (
            <View style={tw`px-2 py-1 rounded-full bg-green-600`}>
              <Text style={tw`text-white text-xs font-medium`}>Added</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSelectedTestCard = (item) => {
    const colorCode = getColorCode(item?.containerColor);

    return (
      <View
        key={String(item?.serviceItemId)}
        style={[
          themed.childScreen,
          themed.border,
          tw`rounded-xl p-4 mb-4 border`,
        ]}
      >
        <View style={tw`flex-row justify-between items-center`}>
          <View style={tw`flex-row items-center flex-1 pr-3`}>
            <View
              style={[
                tw`w-3 h-3 rounded-full mr-3`,
                { backgroundColor: colorCode || '#ccc' },
              ]}
            />
            <Text
              numberOfLines={2}
              style={[themed.inputText, tw`flex-1 text-base font-medium`]}
            >
              {item.serviceName}
            </Text>
          </View>

          <TouchableOpacity onPress={() => removeSelectedTest(item.serviceItemId)}>
            <MaterialIcons name="delete" size={24} color="red" />
          </TouchableOpacity>
        </View>

        <View style={[themed.border, tw`h-[0.5px] my-3`]} />

        <View style={tw`flex-row justify-between items-center`}>
          <View style={tw`min-w-[60px]`}>
            <Text style={tw`text-[11px] text-gray-400`}>MRP</Text>
            <Text style={[themed.inputText, tw`text-sm`]}>₹ {item.mrp}</Text>
          </View>

          <View style={tw`min-w-[70px]`}>
            <Text style={tw`text-[11px] text-gray-400`}>Rate</Text>

            {item.isRateEditable === true ? (
              <View style={tw`flex-row items-center`}>
                <Text style={tw`text-green-600 font-bold mr-1`}>₹</Text>
                <TextInput
                  value={
                    item.amount === '' ||
                      item.amount === null ||
                      item.amount === undefined
                      ? ''
                      : String(item.amount)
                  }
                  onChangeText={(txt) =>
                    updateSelectedTestField(item.serviceItemId, 'amount', txt)
                  }
                  keyboardType="numeric"
                  style={tw`min-w-[70px] px-2 py-1 border border-green-200 rounded-lg text-green-700 font-bold`}
                  placeholder="0"
                  placeholderTextColor={themed.inputPlaceholder}
                />
              </View>
            ) : (
              <Text style={tw`text-sm font-bold text-green-600`}>
                ₹ {item.amount || 0}
              </Text>
            )}
          </View>

          {item.sampleVolume ? (
            <View style={tw`min-w-[60px]`}>
              <Text style={tw`text-[11px] text-gray-400`}>Volume</Text>
              <Text style={[themed.inputText, tw`text-sm`]}>
                {item.sampleVolume}
              </Text>
            </View>
          ) : (
            <View style={tw`min-w-[60px]`} />
          )}

          <Pressable
            onPress={() => toggleUrgent(item.serviceItemId)}
            style={tw`flex-row items-center`}
            hitSlop={8}
          >
            <Checkbox
              status={item.isUrgent === 1 ? 'checked' : 'unchecked'}
              onPress={() => toggleUrgent(item.serviceItemId)}
            />
            <Text style={[themed.inputText, tw`text-sm`]}>Urgent</Text>
          </Pressable>

          <TouchableOpacity
            onPress={() => handleViewRange(item)}
            style={tw`ml-2`}
          >
            <MaterialIcons name="visibility" size={22} color="#4b5563" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={tw`flex-1`}>
      <Text style={[themed.labelText, tw`mb-2`]}>Search Test</Text>

      <View
        style={[
          themed.globalCard,
          themed.border,
          tw`flex-row items-center px-4 py-3 rounded-xl border border-gray-600`,
        ]}
      >
        <Ionicons
          name="search-outline"
          size={20}
          color={themed.chevronColor}
        />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by test name...."
          placeholderTextColor={themed.inputPlaceholder}
          style={[tw`flex-1 ml-3 py-1`, themed.inputText, { fontSize: 14 }]}
        />

        {loading ? (
          <ActivityIndicator size="small" color={themed.chevronColor} />
        ) : search ? (
          <TouchableOpacity
            onPress={() => {
              setSearch('');
              setTestList([]);
            }}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={themed.chevronColor}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {detailsLoading ? (
        <View style={tw`mt-4 items-center`}>
          <ActivityIndicator size="large" color={themed.chevronColor} />
        </View>
      ) : null}

      <FlatList
        data={testList}
        keyExtractor={(item, index) =>
          String(item?.ServiceItemId || item?.InvestigationId || item?.itemId || index)
        }
        renderItem={renderSearchItem}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-6`}
        ListEmptyComponent={
          search.trim() && !loading ? (
            <Text style={[themed.labelText, tw`text-center mt-4`]}>
              No test found
            </Text>
          ) : null
        }
      />

      <Modal
        visible={detailModalVisible && selectedTests.length > 0}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={tw`flex-1 bg-black/50 justify-end`}>
          <View
            style={[
              themed.modalCard,
              tw`rounded-t-3xl p-4 h-[90%]`,
            ]}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={tw`pb-6`}
            >
              {selectedTests.map((item) => renderSelectedTestCard(item))}

              {selectedTests.length > 0 ? (
                <View>
                  <View
                    style={[
                      tw`my-4`,
                      { borderBottomWidth: 1, borderBottomColor: '#334155' },
                    ]}
                  />

                  <View
                    style={[
                      tw`my-1`,
                    ]}
                  >
                    <Text style={[themed.labelText, tw`text-right mb-1`]}>
                      Total Amount
                    </Text>
                    <Text
                      style={[
                        themed.inputText,
                        tw`text-right text-lg font-bold text-green-600`,
                      ]}
                    >
                      ₹ {totalAmount}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={handleSaveAllTests}
                    style={[themed.searchButton, tw`mb-4`]}
                  >
                    <Text style={[themed.searchButtonText, tw`text-center`]}>
                      Add ({selectedTests.length}) Tests
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setDetailModalVisible(false);
                    }}
                    style={[
                      tw`py-2.5 rounded-xl`,
                      { backgroundColor: '#93c5fd' },
                    ]}
                  >
                    <Text style={[tw`text-center`, { color: '#1d4ed8' }]}>
                      Select Another
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={rangeModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        presentationStyle="overFullScreen"
        onRequestClose={() => setRangeModalVisible(false)}
      >
        <View style={themed.modalOverlay}>
          <Pressable
            style={tw`absolute inset-0`}
            onPress={() => setRangeModalVisible(false)}
          />

          <SafeAreaView edges={['bottom']} style={tw`w-full`}>
            <View
              style={[
                themed.modalContainer,
                tw`w-full rounded-t-2xl rounded-b-none overflow-hidden`,
                { height: '85%' },
              ]}
            >
              <ViewTestRangeDetails
                serviceItemName={selectedServiceItemName}
                serviceItemId={selectedServiceItemId}
                onClose={() => setRangeModalVisible(false)}
              />
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

export default SearchServiceUpdate;