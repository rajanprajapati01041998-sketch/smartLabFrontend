import tw from 'twrnc';


const styles = {
    patientInfoText:tw`mb-2 text-md text-gray-700 underline font-semibold text-purple-400 `,
    insideDropDownText: tw`
    text-gray-700
    text-base
  `,
  
    buttonText: tw`text-white text-center`,
    inputBox: tw`
    border 
    border-gray-200 
    px-4 
    py-3 
    rounded-xl 
    text-base 
    bg-white 
    shadow-sm
    focus:border-blue-400
    focus:ring-2
    focus:ring-blue-100
    transition-all
    duration-200
  `,
    labelText: tw`
    text-gray-700 
    text-sm 
    font-semibold 
    mb-1.5
    tracking-wide
  `,
    saveButton: tw`bg-green-600 py-4 mb-6 mt-2 rounded`,
    saveButtonText:tw`text-white text-center font-semibold`,
    dropDownButton: tw`
    border 
    border-gray-200 
    px-4 
    py-3 
    rounded-xl 
    bg-white 
    shadow-sm
    active:bg-gray-50
    transition-all
    duration-200
  `,
    searchInput:tw`border border-gray-300 px-2 py-3 rounded-xl text-md bg-white`,
    cardShadow:tw`shadow-md px-4 py-2 bg-white rounded-lg my-2 border border-gray-200`,
    errorInput: tw`
    border-red-400
    bg-red-50
    border
    px-4
    py-3
    rounded-xl
    text-base
  `,
  errorText: tw`
    text-red-500
    text-xs
    mt-1
    ml-1
  `,
  successInput: tw`
    border-green-400
    bg-green-50
    border
    px-4
    py-3
    rounded-xl
    text-base
  `,
  focusedInput: tw`
    border-blue-400
    ring-2
    ring-blue-100
    border
    px-4
    py-3
    rounded-xl
    text-base
    bg-white
  `,
  disabledInput: tw`
    border-gray-200
    bg-gray-50
    px-4
    py-3
    rounded-xl
    text-base
    text-gray-400
  `,
  searchButton: tw`
    bg-blue-500
    py-3
    rounded-xl
    shadow-md
    active:bg-blue-600
    transition-all
    duration-200
  `,
  searchButtonText: tw`
    text-white
    text-center
    font-bold
    text-base
    tracking-wide
  `,
  card: tw`
    bg-white
    rounded-2xl
    shadow-md
    border
    border-gray-100
    overflow-hidden
  `,
  cardHeader: tw`
    p-4
    border-b
    border-gray-100
    bg-gray-50
  `,
  sectionTitle: tw`
    text-lg
    font-bold
    text-gray-800
    mb-2
  `,
  sectionSubtitle: tw`
    text-sm
    text-gray-500
    mb-3
  `,
  // Badge style
  badge: tw`
    px-2
    py-1
    rounded-full
    text-xs
    font-medium
  `,
  
  // Status badge - success
  badgeSuccess: tw`
    bg-green-100
    text-green-700
    px-2
    py-1
    rounded-full
    text-xs
    font-medium
  `,
  
  // Status badge - warning
  badgeWarning: tw`
    bg-yellow-100
    text-yellow-700
    px-2
    py-1
    rounded-full
    text-xs
    font-medium
  `,
  
  // Status badge - error
  badgeError: tw`
    bg-red-100
    text-red-700
    px-2
    py-1
    rounded-full
    text-xs
    font-medium
  `,
  
  // Status badge - info
  badgeInfo: tw`
    bg-blue-100
    text-blue-700
    px-2
    py-1
    rounded-full
    text-xs
    font-medium
  `,


  
  
};

export default styles;