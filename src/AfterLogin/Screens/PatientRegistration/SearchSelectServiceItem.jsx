import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Pressable,
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

  const { setServiceItem, selectedDoctor, corporateId, loginBranchId } = useAuth();
  const { theme } = useTheme();
  const themed = getThemeStyles(theme);

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
            })
          )
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

        console.log("barcode service",formatted)
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

  const toggleUrgent = useCallback((index) => {
    setDetailsList(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        urgent: !updated[index].urgent,
      };
      return updated;
    });
    onDirtyChange?.(true);
  }, [onDirtyChange]);

  const updateRate = useCallback((index, txt) => {
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
  }, [onDirtyChange]);

  const handleDeleteLocal = useCallback((item) => {
    setDetailsList(prev =>
      prev.filter(i => i.serviceItemId !== item.serviceItemId)
    );

    onDelete?.(item);
    onDirtyChange?.(true);
  }, [onDelete, onDirtyChange]);

  const createPayload = () => {
    setServiceItem(prev => {
      const existingServices = Array.isArray(prev?.Services) ? prev.Services : [];
      const existingById = new Map(
        existingServices.map(service => [service.ServiceItemId, service])
      );

      const newServices = detailsList.map(item => {
        const existing = existingById.get(item.serviceItemId);
        const sampleTypes = Array.isArray(item?.sampleTypes) ? item.sampleTypes : [];
        const defaultSampleTypeObj =
          sampleTypes.find(st => Number(st?.sampleTypeId) === Number(item?.defaultSampleTypeId)) ||
          sampleTypes[0] ||
          null;

        const nextSampleTypeId =
          existing?.SampleTypeId ??
          existing?.sampleTypeId ??
          item?.defaultSampleTypeId ??
          defaultSampleTypeObj?.sampleTypeId ??
          null;

        const nextSampleType =
          existing?.SampleType ??
          existing?.sampleType ??
          (defaultSampleTypeObj?.sampleType || item?.sampleType || '');

        return {
          ServiceItemId: item.serviceItemId,
          SubSubCategoryId: item.subSubCategoryId,
          ServiceName: item.serviceName,
          Amount: item.rate,
          qty: item.qty,
          isUrgent: item.urgent ? 1 : 0,
          Barcode: existing?.Barcode ?? existing?.barcode ?? '',
          TestRemark: existing?.TestRemark ?? existing?.testRemark ?? '',
          SampleTypes: sampleTypes,
          SampleTypeId: nextSampleTypeId ? Number(nextSampleTypeId) : null,
          SampleType: nextSampleType,
        };
      });

      const mergedMap = new Map(
        existingServices.map(service => [service.ServiceItemId, service])
      );

      newServices.forEach(service => {
        mergedMap.set(service.ServiceItemId, service);
      });

      return {
        ...(prev || {}),
        Services: Array.from(mergedMap.values()),
        Investigations: {
          ...(prev?.Investigations || {}),
          isUrgent: 0,
          ReportingBranchId: loginBranchId,
        },
      };
    });

    onDirtyChange?.(false);
    onSaved?.();
  };

  const handleViewRange = useCallback((item) => {
    setSelectedServiceItemName(item?.serviceName);
    setSelectedServiceItemId(item.serviceItemId);
    setRangeModalVisible(true);
  }, []);

  const renderItem = ({ item, index }) => {
    const colorCode = getColorCode(item?.containerColor);

    return (
      <View style={[themed.childScreen ,themed.border,tw` rounded-xl p-3 mb-3 `]}>
        <View style={tw`flex-row justify-between items-center`}>
          <View style={tw`flex-row items-center flex-1`}>
            <View
              style={[
                tw`w-3 h-3 rounded-full mr-2`,
                { backgroundColor: colorCode || '#ccc' },
              ]}
            />
            <Text style={[themed.inputText, tw` flex-1`]}>
              {item.serviceName}
            </Text>
          </View>

          <TouchableOpacity onPress={() => handleDeleteLocal(item)}>
            <MaterialIcons name="delete" size={22} color="red" />
          </TouchableOpacity>
        </View>

        <View style={[themed.border,tw`h-[0.5px]  my-2`]} />

        <View style={tw`flex-row justify-between items-center`}>
          <View>
            <Text style={tw`text-[10px] text-gray-400`}>MRP</Text>
            <Text style={[themed.inputText, tw`text-xs`]}>₹ {item.mrp}</Text>
          </View>

          <View>
            <Text style={tw`text-[10px] text-gray-400`}>Rate</Text>
            {item.isRateEditable === false ? (
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
              <Text style={[themed.inputText, tw`text-xs`]}>{item.sampleVolume}</Text>
            </View>
          ) : null}

          {/* ✅ urgent area fixed for smooth scroll */}
          <Pressable
            onPress={() => toggleUrgent(index)}
            android_ripple={null}
            style={tw`flex-row items-center px-1 py-1`}
            hitSlop={6}
          >
            <View pointerEvents="none" style={tw`flex-row items-center`}>
              <Checkbox status={item.urgent ? 'checked' : 'unchecked'} />
              <Text style={[themed.inputText, tw`text-[10px] `]}>Urgent</Text>
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
    <View style={tw`flex-1 min-h-0 `}>
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
                paddingBottom: isDirty && detailsList.length > 0 ? 110 : 20,
                flexGrow: detailsList.length === 0 ? 1 : 0,
              }}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              nestedScrollEnabled={true}
              scrollEventThrottle={16}
              removeClippedSubviews={false}
              initialNumToRender={12}
              maxToRenderPerBatch={12}
              windowSize={15}
            />
          </View>

          {isDirty && detailsList.length > 0 && (
            <View style={[themed.borderTop,tw`absolute bottom-0 left-0 right-0 px-3 pt-2 pb-3  border-t `]}>
              <TouchableOpacity
                onPress={createPayload}
                style={tw`bg-blue-500 p-3 rounded-lg`}
              >
                <Text style={tw`text-white text-center font-bold`}>
                  Add ({detailsList.length}) Tests
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
