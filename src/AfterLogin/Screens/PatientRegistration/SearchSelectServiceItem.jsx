import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import tw from 'twrnc';
import { Checkbox } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../../Authorization/AuthContext';
import { SearchGetInvestigationListDetails } from './services/doctorService';
import { getColorCode } from '../../../utils/colorUtils';
import ViewTestRangeDetails from './ViewTestRangeDetails';
import { useTheme } from '../../../../Authorization/ThemeContext';
import { getThemeStyles } from '../../../utils/themeStyles';
import api from '../../../../Authorization/api';

const SearchSelectServiceItem = ({
  data,
  onDelete,
  isDirty,
  onDirtyChange,
  onSaved,
}) => {
  const [loading, setLoading] = useState(false);
  const [detailsList, setDetailsList] = useState([]);
  const [rangeModalVisible, setRangeModalVisible] = useState(false);
  const [selectedServiceItemId, setSelectedServiceItemId] = useState(null);
  const [selectedServiceItemName, setSelectedServiceItemName] = useState(null);
  const [selectedAllItem, setSelectedAllItem] = useState(null);

  const {
    setServiceItem,
    serviceItem,
    selectedDoctor,
    corporateId,
    loginBranchId,
  } = useAuth();

  const { theme } = useTheme();
  const themed = getThemeStyles(theme);

  const totalAmount = useMemo(() => {
    return detailsList.reduce((sum, item) => {
      return sum + Number(item?.rate || 0) * Number(item?.qty || 1);
    }, 0);
  }, [detailsList]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!data || data.length === 0) return;

      setLoading(true);

      try {
        const responses = await Promise.all(
          data.map(item =>
            SearchGetInvestigationListDetails({
              corporateId: corporateId ?? 1,
              doctorId: selectedDoctor ?? 1,
              serviceItemId: item.itemId,
              categoryId: item.categoryId,
              subCategoryId: item.subCategoryId,
              subSubCategoryId: item.subSubCategoryId,
              bedTypeId: 0,
            }),
          ),
        );

        if (cancelled) return;

        const formatted = responses
          .filter(res => res?.success)
          .map(res => ({
            ...res.data,
            urgent: false,
            qty: 1,
          }));

        setDetailsList(formatted);
      } catch (error) {
        if (!cancelled) console.error('Error:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (data?.length > 0) {
      run();
    } else {
      setDetailsList([]);
    }

    return () => {
      cancelled = true;
    };
  }, [data, corporateId, selectedDoctor]);

  const toggleUrgent = useCallback(
    index => {
      setDetailsList(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          urgent: !updated[index].urgent,
        };
        return updated;
      });

      onDirtyChange?.(true);
    },
    [onDirtyChange],
  );

  const updateRate = useCallback(
    (index, txt) => {
      const cleaned = String(txt).replace(/[^0-9.]/g, '');
      const next = cleaned === '' ? '' : Number(cleaned);

      setDetailsList(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          rate: next === '' ? '' : next,
        };
        return updated;
      });

      onDirtyChange?.(true);
    },
    [onDirtyChange],
  );

  const handleDeleteLocal = useCallback(
    item => {
      setDetailsList(prev =>
        prev.filter(i => i.serviceItemId !== item.serviceItemId),
      );

      onDelete?.(item);
      onDirtyChange?.(true);
    },
    [onDelete, onDirtyChange],
  );

  const makeKey = service => {
    const serviceItemId = Number(
      service?.serviceItemId ?? service?.ServiceItemId ?? 0,
    );
    const packageId = Number(service?.packageId ?? service?.PackageId ?? 0);
    const isUnderPackage = Number(
      service?.isUnderPackage ?? service?.IsUnderPackage ?? 0,
    );

    return `${serviceItemId}_${packageId}_${isUnderPackage}`;
  };

  const fetchPackageServices = async packageItem => {
    try {
      const res = await api.get(
        `ServiceAllDetailsForOPDBilling/GetPackageAllDetails?id=${packageItem.serviceItemId}`,
      );

      const list = res?.data?.data || [];
      const urgentValue = packageItem.urgent ? 1 : 0;

      return list.map(item => ({
        ServiceItemId: item?.packageServiceId ?? 0,
        serviceItemId: item?.packageServiceId ?? 0,

        ServiceName: item?.packageServiceName ?? '',
        serviceName: item?.packageServiceName ?? '',

        Code: item?.packageServiceCode ?? '',
        code: item?.packageServiceCode ?? '',

        CategoryId: item?.packageServiceCategoryId ?? 0,
        categoryId: item?.packageServiceCategoryId ?? 0,

        SubCategoryId: item?.packageServiceSubCategoryId ?? 0,
        subCategoryId: item?.packageServiceSubCategoryId ?? 0,

        SubSubCategoryId: item?.packageServiceSubSubCategoryId ?? 0,
        subSubCategoryId: item?.packageServiceSubSubCategoryId ?? 0,

        CorporateAlias: '',
        corporateAlias: '',

        CorporateCode: '',
        corporateCode: '',

        Qty: Number(item?.qty || 1),
        qty: Number(item?.qty || 1),

        Rate: 0,
        rate: 0,

        Amount: 0,
        amount: 0,

        GrossAmt: 0,
        grossAmt: 0,

        DiscPer: 0,
        discPer: 0,

        DiscAmt: 0,
        discAmt: 0,

        DiscountReason: '',
        discountReason: '',

        NetAmt: 0,
        netAmt: 0,

        DoctorId: selectedDoctor ?? 0,
        doctorId: selectedDoctor ?? 0,

        RateListId: 0,
        rateListId: 0,

        ValidityDays: 0,
        validityDays: 0,

        SampleTypeId: item?.defaultSampleTypeId
          ? Number(item.defaultSampleTypeId)
          : 0,
        sampleTypeId: item?.defaultSampleTypeId
          ? Number(item.defaultSampleTypeId)
          : 0,

        SampleType: item?.sampleTypeList ?? '',
        sampleType: item?.sampleTypeList ?? '',

        IsNonPayable: 0,
        isNonPayable: 0,

        // ✅ CHILD TEST INSIDE PACKAGE
        IsUnderPackage: 1,
        isUnderPackage: 1,

        PackageId: packageItem?.serviceItemId ?? 0,
        packageId: packageItem?.serviceItemId ?? 0,

        IsUrgent: urgentValue,
        isUrgent: urgentValue,

        Barcode: '',
        barcode: '',

        TestRemark: '',
        testRemark: '',
      }));
    } catch (error) {
      console.log('Package fetch error:', error?.response || error);
      return [];
    }
  };

  const createPayload = async () => {
    setLoading(true);

    try {
      const invalidItem = detailsList.find(
        item => !item.rate || Number(item.rate) <= 0,
      );

      if (invalidItem) {
        Alert.alert('Validation', 'Rate cannot be less than or equal to 0');
        setLoading(false);
        return;
      }

      const existingServices = Array.isArray(serviceItem?.Services)
        ? serviceItem.Services
        : [];

      const existingMap = new Map(
        existingServices.map(service => [makeKey(service), service]),
      );

      const finalServices = [];

      for (const item of detailsList) {
        // ✅ IMPORTANT FIX:
        // Package parent/name should be IsUnderPackage = 0
        const desiredIsUnderPackage = 0;

        const baseKey = `${Number(item.serviceItemId)}_0_`;
        const existing =
          existingMap.get(`${baseKey}${desiredIsUnderPackage}`) ||
          existingMap.get(`${baseKey}0`) ||
          existingMap.get(`${baseKey}1`);

        const sampleTypes = Array.isArray(item?.sampleTypes)
          ? item.sampleTypes
          : [];

        const defaultSampleTypeObj =
          sampleTypes.find(
            st => Number(st?.sampleTypeId) === Number(item?.defaultSampleTypeId),
          ) ||
          sampleTypes[0] ||
          null;

        const sampleTypeId =
          existing?.SampleTypeId ??
          existing?.sampleTypeId ??
          item?.defaultSampleTypeId ??
          defaultSampleTypeObj?.sampleTypeId ??
          0;

        const sampleType =
          existing?.SampleType ??
          existing?.sampleType ??
          defaultSampleTypeObj?.sampleType ??
          item?.sampleType ??
          '';

        const qty = Number(item?.qty || 1);
        const rate = Number(item?.rate || 0);
        const gross = rate * qty;
        const isUrgent = item.urgent ? 1 : 0;

        const parentService = {
          ServiceItemId: item.serviceItemId,
          serviceItemId: item.serviceItemId,

          ServiceName: item.serviceName,
          serviceName: item.serviceName,

          Code: item.code || '',
          code: item.code || '',

          CategoryId: item.categoryId,
          categoryId: item.categoryId,

          SubCategoryId: item.subCategoryId,
          subCategoryId: item.subCategoryId,

          SubSubCategoryId: item.subSubCategoryId,
          subSubCategoryId: item.subSubCategoryId,

          CorporateAlias: item.corporateAlias || '',
          corporateAlias: item.corporateAlias || '',

          CorporateCode: item.corporateCode || '',
          corporateCode: item.corporateCode || '',

          Qty: qty,
          qty,

          Rate: rate,
          rate,

          Amount: rate,
          amount: rate,

          GrossAmt: gross,
          grossAmt: gross,

          DiscPer: 0,
          discPer: 0,

          DiscAmt: 0,
          discAmt: 0,

          DiscountReason: '',
          discountReason: '',

          NetAmt: gross,
          netAmt: gross,

          DoctorId: selectedDoctor ?? 0,
          doctorId: selectedDoctor ?? 0,

          RateListId: item.rateListId ?? 0,
          rateListId: item.rateListId ?? 0,

          ValidityDays: item.validityDays ?? 0,
          validityDays: item.validityDays ?? 0,

          SampleTypes: sampleTypes,

          SampleTypeId: sampleTypeId ? Number(sampleTypeId) : 0,
          sampleTypeId: sampleTypeId ? Number(sampleTypeId) : 0,

          SampleType: sampleType,
          sampleType,

          IsNonPayable: item.isNonPayable ?? 0,
          isNonPayable: item.isNonPayable ?? 0,

          // ✅ PACKAGE PARENT / PACKAGE NAME = 0
          IsUnderPackage: 0,
          isUnderPackage: 0,

          PackageId: 0,
          packageId: 0,

          IsUrgent: isUrgent,
          isUrgent,

          Barcode: existing?.Barcode ?? existing?.barcode ?? '',
          barcode: existing?.Barcode ?? existing?.barcode ?? '',

          TestRemark: existing?.TestRemark ?? existing?.testRemark ?? '',
          testRemark: existing?.TestRemark ?? existing?.testRemark ?? '',
        };

        finalServices.push(parentService);

        // ✅ PACKAGE CHILD TESTS = 1
        if (Number(item.categoryId) === 11) {
          const childServices = await fetchPackageServices(item);
          finalServices.push(...childServices);
        }
      }

      const mergedMap = new Map(
        existingServices.map(service => [makeKey(service), service]),
      );

      finalServices.forEach(service => {
        mergedMap.set(makeKey(service), service);
      });

      const finalSelectedServices = Array.from(mergedMap.values());

      console.log(
        'FINAL SELECTED SERVICES 👉',
        JSON.stringify(finalSelectedServices, null, 2),
      );

      setServiceItem(prev => ({
        ...(prev || {}),
        Services: finalSelectedServices,
        Investigations: {
          ...(prev?.Investigations || {}),
          isUrgent: 0,
          ReportingBranchId: loginBranchId,
        },
      }));

      onDirtyChange?.(false);
      onSaved?.();
    } catch (error) {
      console.log('Create package payload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRange = useCallback(item => {
    setSelectedAllItem(item);
    setSelectedServiceItemName(item?.serviceName);
    setSelectedServiceItemId(item.serviceItemId);
    setRangeModalVisible(true);
  }, []);

  const renderItem = ({ item, index }) => {
    const colorCode = getColorCode(item?.containerColor);
    const isPackage = Number(item?.categoryId) === 11;

    return (
      <View style={[themed.childScreen, themed.border, tw`rounded-xl p-3 mb-3`]}>
        <View style={tw`flex-row justify-between items-center`}>
          <View style={tw`flex-row items-center flex-1`}>
            <View
              style={[
                tw`w-3 h-3 rounded-full mr-2`,
                { backgroundColor: colorCode || '#ccc' },
              ]}
            />

            <View style={tw`flex-1`}>
              <Text style={[themed.inputText, tw`flex-1`]}>
                {item.serviceName}
              </Text>

              {isPackage && (
                <Text style={tw`text-[10px] text-purple-600 mt-1 font-bold`}>
                  PACKAGE
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity onPress={() => handleDeleteLocal(item)}>
            <MaterialIcons name="delete" size={22} color="red" />
          </TouchableOpacity>
        </View>

        <View style={[themed.border, tw`h-[0.5px] my-2`]} />

        <View style={tw`flex-row justify-between items-center`}>
          <View>
            <Text style={tw`text-[10px] text-gray-400`}>MRP</Text>
            <Text style={[themed.inputText, tw`text-xs`]}>₹ {item.mrp}</Text>
          </View>

          <View>
            <Text style={tw`text-[10px] text-gray-400`}>Rate</Text>

            {item.isRateEditable === true ? (
              <View style={tw`flex-row items-center`}>
                <Text style={tw`text-green-600 font-bold mr-1`}>₹</Text>
                <TextInput
                  value={
                    item.rate === '' ||
                    item.rate === null ||
                    item.rate === undefined
                      ? ''
                      : String(item.rate)
                  }
                  onChangeText={txt => updateRate(index, txt)}
                  keyboardType="numeric"
                  style={tw`min-w-[70px] px-2 py-1 border border-green-200 rounded-lg text-green-700 font-bold`}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            ) : (
              <Text style={tw`text-sm font-bold text-green-600`}>
                ₹ {item.rate}
              </Text>
            )}
          </View>

          {item.sampleVolume ? (
            <View>
              <Text style={tw`text-[10px] text-gray-400`}>Volume</Text>
              <Text style={[themed.inputText, tw`text-xs`]}>
                {item.sampleVolume}
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={() => toggleUrgent(index)}
            android_ripple={null}
            style={tw`flex-row items-center px-1 py-1`}
            hitSlop={6}
          >
            <View pointerEvents="none" style={tw`flex-row items-center`}>
              <Checkbox status={item.urgent ? 'checked' : 'unchecked'} />
              <Text style={[themed.inputText, tw`text-[10px]`]}>Urgent</Text>
            </View>
          </Pressable>

          <TouchableOpacity
            onPress={() => handleViewRange(item)}
            style={tw`flex-row items-center`}
          >
            <MaterialIcons name="visibility" size={20} color="#4b5563" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={tw`flex-1 justify-center items-center`}>
      <Text style={tw`text-gray-500`}>No tests found</Text>
    </View>
  );

  return (
    <View style={tw`flex-1 min-h-0`}>
      {loading ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <>
          <View style={tw`flex-1 min-h-0`}>
            <FlatList
              data={detailsList}
              keyExtractor={(item, index) =>
                String(item?.serviceItemId ?? index)
              }
              renderItem={renderItem}
              ListEmptyComponent={renderEmpty}
              style={tw`flex-1`}
              contentContainerStyle={{
                paddingTop: 12,
                paddingBottom: detailsList.length > 0 ? 125 : 20,
                flexGrow: detailsList.length === 0 ? 1 : 0,
              }}
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              nestedScrollEnabled
              scrollEventThrottle={16}
              removeClippedSubviews={false}
              initialNumToRender={12}
              maxToRenderPerBatch={12}
              windowSize={15}
            />
          </View>

          {detailsList.length > 0 && (
            <View
              style={[
                themed.borderTop,
                themed.childScreen,
                tw`absolute bottom-0 left-0 right-0 px-3 pt-2 pb-3 border-t`,
              ]}
            >
              <View style={tw`flex-row justify-between items-center mb-2`}>
                <Text style={[themed.inputText, tw`font-semibold`]}>
                  Total Amount
                </Text>
                <Text style={tw`text-lg font-bold text-green-600`}>
                  ₹ {totalAmount}
                </Text>
              </View>

              {isDirty && (
                <TouchableOpacity
                  onPress={createPayload}
                  style={tw`bg-blue-500 p-3 rounded-lg`}
                >
                  <Text style={tw`text-white text-center font-bold`}>
                    Add ({detailsList.length}) Tests
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </>
      )}

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
                AllItem={selectedAllItem}
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

export default SearchSelectServiceItem;