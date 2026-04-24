import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../../../Authorization/ThemeContext';
import { getThemeStyles } from '../../../utils/themeStyles';

const AllClientList = ({
  BranchData = [],
  onClose,
  onSelect,
  selectedItems = [],
}) => {
  const { theme } = useTheme();
  const themed = getThemeStyles(theme);

  const normalizedData = useMemo(() => {
    if (!Array.isArray(BranchData)) return [];
    return BranchData.map(item => ({
      ...item,
      BranchId: item?.BranchId ?? item?.branchId,
      BranchCode: item?.BranchCode ?? item?.branchCode,
      BranchName: item?.BranchName ?? item?.branchName,
    }));
  }, [BranchData]);

  const [selectedClient, setSelectedClient] = useState([]);

  useEffect(() => {
    if (Array.isArray(selectedItems) && selectedItems.length > 0) {
      setSelectedClient(
        selectedItems.map(item => ({
          ...item,
          BranchId: item?.BranchId ?? item?.branchId,
          BranchCode: item?.BranchCode ?? item?.branchCode,
          BranchName: item?.BranchName ?? item?.branchName,
        }))
      );
      return;
    }

    setSelectedClient(normalizedData);
  }, [normalizedData, selectedItems]);

  const isAllSelected =
    normalizedData.length > 0 && selectedClient.length === normalizedData.length;

  const isSelected = item =>
    selectedClient.some(x => String(x.BranchId) === String(item.BranchId));

  const handleToggleItem = item => {
    setSelectedClient(prev => {
      const exists = prev.some(x => String(x.BranchId) === String(item.BranchId));

      if (exists) {
        return prev.filter(x => String(x.BranchId) !== String(item.BranchId));
      }

      return [...prev, item];
    });
  };

  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelectedClient([]);
    } else {
      setSelectedClient(normalizedData);
    }
  };

  const handleDone = () => {
    onSelect?.(selectedClient);
    onClose?.();
  };

  const renderCheckbox = checked => (
    <View
      style={[
        tw`w-6 h-6 rounded items-center justify-center`,
        checked ? tw`bg-blue-500` : tw`border border-gray-400`,
      ]}
    >
      {checked && <MaterialIcons name="check" size={18} color="#111827" />}
    </View>
  );

  const renderItem = ({ item }) => {
    const checked = isSelected(item);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleToggleItem(item)}
        style={[
          tw`flex-row items-center justify-between py-4`,
          themed.borderBottom,
        ]}
      >
        <Text style={[themed.listItemText, tw`flex-1 text-lg font-medium pr-3`]}>
          {(item?.BranchCode || '') + ' - ' + (item?.BranchName || '')}
        </Text>

        {renderCheckbox(checked)}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[tw`flex-1`, themed.childScreen]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleToggleAll}
        style={[tw`flex-row items-center justify-between py-4`, themed.borderBottom]}
      >
        <Text style={[themed.listItemText, tw`text-lg font-medium`]}>
          {isAllSelected ? 'Deselect All' : 'Select All'}
        </Text>
        {renderCheckbox(isAllSelected)}
      </TouchableOpacity>

      <FlatList
        data={normalizedData}
        keyExtractor={(item, index) =>
          String(item?.BranchId ?? item?.branchId ?? index)
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={tw`text-center text-gray-500 mt-5`}>No Clients Found</Text>
        }
      />

      <TouchableOpacity
        onPress={handleDone}
        activeOpacity={0.8}
        style={[themed.searchButton, tw`mt-3 mb-1 rounded-2xl py-4`]}
      >
        <Text style={[themed.searchButtonText, tw`text-lg font-bold`]}>
          Done ({selectedClient.length})
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AllClientList;