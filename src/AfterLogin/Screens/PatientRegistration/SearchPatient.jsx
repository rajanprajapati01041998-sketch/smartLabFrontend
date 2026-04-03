import { View, Text, TextInput, TouchableOpacity, Platform, KeyboardAvoidingView, ScrollView, Keyboard } from 'react-native'
import React, { useMemo, useState } from 'react'
import tw from 'twrnc'
import { useNavigation } from '@react-navigation/native'
import { useAuth } from '../../../../Authorization/AuthContext'

const SearchPatient = () => {
  const navigation = useNavigation()
  const { loginBranchId, user } = useAuth()

  const currentDate = useMemo(() => new Date(), [])
  const defaultFromDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d
  }, [])

  const [form, setForm] = useState({
    uhid: '',
    labNo: '',
    barCode: '',
    fromDate: defaultFromDate.toISOString().split('T')[0],
    toDate: currentDate.toISOString().split('T')[0],
    patientName: '',
  })

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSearch = () => {
    Keyboard.dismiss()

    const roleId = Array.isArray(user?.roles) ? user.roles.join(',') : ''
    const branchId = loginBranchId ? String(loginBranchId) : '1'

    const payload = {
      branchId,
      typeId: '0',
      uhid: form.uhid,
      ipdNo: '',
      labNo: form.labNo,
      fromDate: form.fromDate,
      toDate: form.toDate,
      barCode: form.barCode,
      subCategoryId: '1',
      subSubCategoryId: '0',
      investigationName: '',
      patientName: form.patientName,
      branchIdList: branchId,
      corporateId: '',
      roleId,
      filter: null,
    }

    navigation.navigate('HelpDesk', {
      screen: 'ListHelpDeskPatient',
      params: { payload },
    })
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={tw`flex-1 bg-white`}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={tw`p-4`}
      >
        <Text style={tw`text-lg font-bold mb-4 text-center`}>Search Patient</Text>

        <Text style={tw`mb-1 font-semibold`}>UHID</Text>
        <TextInput
          value={form.uhid}
          onChangeText={(v) => handleChange('uhid', v)}
          placeholder="Enter UHID"
          style={tw`border border-gray-300 rounded-md px-3 py-3 mb-3`}
          returnKeyType="next"
        />

        <Text style={tw`mb-1 font-semibold`}>Patient Name</Text>
        <TextInput
          value={form.patientName}
          onChangeText={(v) => handleChange('patientName', v)}
          placeholder="Enter Patient Name"
          style={tw`border border-gray-300 rounded-md px-3 py-3 mb-3`}
          returnKeyType="next"
        />

        <Text style={tw`mb-1 font-semibold`}>Lab No</Text>
        <TextInput
          value={form.labNo}
          onChangeText={(v) => handleChange('labNo', v)}
          placeholder="Enter Lab No"
          style={tw`border border-gray-300 rounded-md px-3 py-3 mb-3`}
          returnKeyType="next"
        />

        <Text style={tw`mb-1 font-semibold`}>Barcode</Text>
        <TextInput
          value={form.barCode}
          onChangeText={(v) => handleChange('barCode', v)}
          placeholder="Enter Barcode"
          style={tw`border border-gray-300 rounded-md px-3 py-3 mb-4`}
          returnKeyType="done"
        />

        <TouchableOpacity
          onPress={handleSearch}
          style={tw`bg-cyan-600 rounded-md py-3`}
        >
          <Text style={tw`text-white font-semibold text-center`}>Search</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default SearchPatient
