import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import tw from 'twrnc'
import { Searchbar } from 'react-native-paper';

const SearchPatient = ({ selectedPatientData }) => {

    const [searchQuery, setSearchQuery] = useState('');

    const [patientList, setPatientList] = useState([
        {
            id: 1,
            name: "kamlesh kumar",
            age: "26",
            mobileNumber: "7460033752"
        },
        {
            id: 2,
            name: "Rahul Sharma",
            age: "30",
            mobileNumber: "9876543210"
        }
    ]);

    const handleSelectPatient = (patient) => {

        // local state (optional)
        // setSelectedPatients(patient);

        // ✅ send data to parent
        selectedPatientData(patient);

    };

    return (

        <View style={tw`flex-1 bg-white`}>

            <Searchbar
                style={tw`bg-white border border-gray-300 rounded-md`}
                placeholder="Search Patient"
                onChangeText={setSearchQuery}
                value={searchQuery}
            />

            {
                patientList.length > 0 ? (
                    patientList.map((p, i) => (
                        <TouchableOpacity
                            key={i}
                            style={tw`p-3 border-b border-gray-200`}
                            onPress={() => handleSelectPatient(p)}
                        >

                            <Text style={tw`text-base font-semibold`}>
                                {p.name}
                            </Text>

                            <Text style={tw`text-gray-500`}>
                                Age: {p.age} | Mobile: {p.mobileNumber}
                            </Text>

                        </TouchableOpacity>

                    ))

                ) : (

                    <View style={tw`flex-1 justify-center items-center`}>
                        <Text>Nothing here yet</Text>
                    </View>

                )
            }

        </View>

    )
}

export default SearchPatient;