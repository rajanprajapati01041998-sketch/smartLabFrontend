import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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

const toNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const getDetailId = item =>
  Number(item?.serviceItemId ?? item?.ServiceItemId ?? item?.itemId ?? item?.id ?? 0);

const getDetailName = item =>
  String(item?.serviceName ?? item?.ServiceName ?? item?.name ?? '').trim();

const SearchSelectServiceItem = ({
  data,
  onDelete,
  isDirty,
  onDirtyChange,
  onSaved,
}) => {
  const flatListRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [detailsList, setDetailsList] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);
  const [listVersion, setListVersion] = useState(0);

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

  const visibleDetailsList = useMemo(() => {
    return detailsList.filter(
      item => getDetailId(item) > 0 && getDetailName(item).length > 0,
    );
  }, [detailsList]);

  const totalAmount = useMemo(() => {
    return visibleDetailsList.reduce((sum, item) => {
      return sum + Number(item?.rate || 0) * Number(item?.qty || 1);
    }, 0);
  }, [visibleDetailsList]);

  const markDirty = useCallback(() => {
    requestAnimationFrame(() => {
      onDirtyChange?.(true);
    });
  }, [onDirtyChange]);

  const markClean = useCallback(() => {
    requestAnimationFrame(() => {
      onDirtyChange?.(false);
    });
  }, [onDirtyChange]);

  const scrollTop = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToOffset?.({
        offset: 0,
        animated: false,
      });
    }, 100);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const safeData = Array.isArray(data) ? data : [];

      const filteredData = safeData.filter(item => {
        const id = Number(item?.itemId ?? item?.serviceItemId ?? item?.id ?? 0);
        return id > 0 && !deletedIds.includes(id);
      });

      if (filteredData.length === 0) {
        setDetailsList([]);
        setListVersion(v => v + 1);
        return;
      }

      const selectedIdSet = new Set(
        filteredData
          .map(item => Number(item?.itemId ?? item?.serviceItemId ?? item?.id ?? 0))
          .filter(id => id > 0),
      );

      const currentList = detailsList.filter(item =>
        selectedIdSet.has(Number(item?.serviceItemId)),
      );

      const existingIdSet = new Set(
        currentList.map(item => Number(item?.serviceItemId)),
      );

      const missingItems = filteredData.filter(item => {
        const id = Number(item?.itemId ?? item?.serviceItemId ?? item?.id ?? 0);
        return id > 0 && !existingIdSet.has(id);
      });

      setDetailsList(currentList);

      if (missingItems.length === 0) {
        setListVersion(v => v + 1);
        scrollTop();
        return;
      }

      setLoading(true);

      try {
        const responses = await Promise.all(
          missingItems.map(item =>
            SearchGetInvestigationListDetails({
              corporateId: corporateId ?? 1,
              doctorId: selectedDoctor ?? 1,
              serviceItemId: Number(item?.itemId ?? item?.serviceItemId ?? item?.id ?? 0),
              categoryId: item.categoryId,
              subCategoryId: item.subCategoryId,
              subSubCategoryId: item.subSubCategoryId,
              bedTypeId: 0,
            }),
          ),
        );

        if (cancelled) return;

        const formatted = responses
          .map((res, idx) => {
            const selected = missingItems[idx] || {};
            const details = res?.data ?? {};

            if (!res?.success) return null;

            const serviceItemId = toNumber(
              details?.serviceItemId,
              toNumber(selected?.itemId),
            );

            return {
              ...details,
              serviceItemId,
              serviceName: details?.serviceName || selected?.name || '',
              categoryId: toNumber(details?.categoryId, toNumber(selected?.categoryId)),
              subCategoryId: toNumber(details?.subCategoryId, toNumber(selected?.subCategoryId)),
              subSubCategoryId: toNumber(details?.subSubCategoryId, toNumber(selected?.subSubCategoryId)),
              qty: 1,
              urgent: false,
              rate: toNumber(details?.rate),
            };
          })
          .filter(Boolean);

        setDetailsList(prev => {
          const map = new Map();

          prev.forEach(item => {
            const id = Number(item?.serviceItemId);
            if (selectedIdSet.has(id) && !deletedIds.includes(id)) {
              map.set(id, item);
            }
          });

          formatted.forEach(item => {
            const id = Number(item?.serviceItemId);
            if (selectedIdSet.has(id) && !deletedIds.includes(id)) {
              map.set(id, item);
            }
          });

          return Array.from(map.values());
        });

        setListVersion(v => v + 1);
        scrollTop();
      } catch (error) {
        if (!cancelled) console.log('Error:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [data, corporateId, selectedDoctor, deletedIds]);

  const toggleUrgent = useCallback(
    item => {
      const id = getDetailId(item);

      setDetailsList(prev =>
        prev.map(row =>
          getDetailId(row) === id ? { ...row, urgent: !row.urgent } : row,
        ),
      );

      markDirty();
    },
    [markDirty],
  );

  const updateRate = useCallback(
    (item, txt) => {
      const id = getDetailId(item);
      const cleaned = String(txt).replace(/[^0-9.]/g, '');
      const next = cleaned === '' ? '' : Number(cleaned);

      setDetailsList(prev =>
        prev.map(row =>
          getDetailId(row) === id ? { ...row, rate: next } : row,
        ),
      );

      markDirty();
    },
    [markDirty],
  );

  const handleDeleteLocal = useCallback(
    item => {
      const deleteId = getDetailId(item);

      setDeletedIds(prev =>
        prev.includes(deleteId) ? prev : [...prev, deleteId],
      );

      setDetailsList(prev =>
        prev.filter(i => getDetailId(i) !== deleteId),
      );

      onDelete?.(item);
      markDirty();

      setListVersion(v => v + 1);
      scrollTop();
    },
    [onDelete, markDirty, scrollTop],
  );

  const makeKey = service => {
    const serviceItemId = Number(service?.serviceItemId ?? service?.ServiceItemId ?? 0);
    const packageId = Number(service?.packageId ?? service?.PackageId ?? 0);
    const isUnderPackage = Number(service?.isUnderPackage ?? service?.IsUnderPackage ?? 0);

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
        SampleTypeId: item?.defaultSampleTypeId ? Number(item.defaultSampleTypeId) : 0,
        sampleTypeId: item?.defaultSampleTypeId ? Number(item.defaultSampleTypeId) : 0,
        SampleType: item?.sampleTypeList ?? '',
        sampleType: item?.sampleTypeList ?? '',
        IsNonPayable: 0,
        isNonPayable: 0,
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
    if (visibleDetailsList.length === 0) return;

    setLoading(true);

    try {
      const invalidItem = visibleDetailsList.find(
        item => !item.rate || Number(item.rate) <= 0,
      );

      if (invalidItem) {
        Alert.alert('Validation', 'Rate cannot be less than or equal to 0');
        return;
      }

      const existingServices = Array.isArray(serviceItem?.Services)
        ? serviceItem.Services
        : [];

      const existingMap = new Map(
        existingServices.map(service => [makeKey(service), service]),
      );

      const finalServices = [];

      for (const item of visibleDetailsList) {
        const sampleTypes = Array.isArray(item?.sampleTypes)
          ? item.sampleTypes
          : [];

        const defaultSampleTypeObj =
          sampleTypes.find(
            st => Number(st?.sampleTypeId) === Number(item?.defaultSampleTypeId),
          ) ||
          sampleTypes[0] ||
          null;

        const baseKey = `${Number(item.serviceItemId)}_0_`;
        const existing =
          existingMap.get(`${baseKey}0`) || existingMap.get(`${baseKey}1`);

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

        finalServices.push({
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
        });

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

      setServiceItem(prev => ({
        ...(prev || {}),
        Services: Array.from(mergedMap.values()),
        Investigations: {
          ...(prev?.Investigations || {}),
          isUrgent: 0,
          ReportingBranchId: loginBranchId,
        },
      }));

      markClean();
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

  const renderItem = ({ item }) => {
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
                {getDetailName(item)}
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
                  onChangeText={txt => updateRate(item, txt)}
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
            onPress={() => toggleUrgent(item)}
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
    <View style={tw`flex-1 justify-center items-center py-10`}>
      <Text style={tw`text-gray-500`}>No tests found</Text>
    </View>
  );

  return (
    <View style={tw`flex-1 min-h-0 relative`}>
      {loading ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <>
          <FlatList
            key={`service-list-${listVersion}-${visibleDetailsList
              .map(i => getDetailId(i))
              .join('_')}`}
            ref={flatListRef}
            data={visibleDetailsList}
            extraData={`${listVersion}-${visibleDetailsList.length}-${totalAmount}`}
            keyExtractor={item => String(getDetailId(item))}
            renderItem={renderItem}
            ListEmptyComponent={renderEmpty}
            style={tw`flex-1`}
            contentContainerStyle={{
              paddingTop: 12,
              paddingBottom: visibleDetailsList.length > 0 ? 130 : 20,
              flexGrow: visibleDetailsList.length === 0 ? 1 : 0,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            nestedScrollEnabled
            removeClippedSubviews={false}
            initialScrollIndex={0}
          />

          {visibleDetailsList.length > 0 && isDirty && (
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

              <TouchableOpacity
                onPress={createPayload}
                style={tw`bg-blue-500 p-3 rounded-lg`}
              >
                <Text style={tw`text-white text-center font-bold`}>
                  Add ({visibleDetailsList.length}) Tests
                </Text>
              </TouchableOpacity>
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