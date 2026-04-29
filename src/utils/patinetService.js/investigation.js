import api from "../../../Authorization/api";

export const getPatientInvestigation = async (params) => {
  console.log("pincode",params)
  try {
    const response = await api.get(`Country/GetFullLocationByPincode?pincode=${params}`);
    return response?.data;
  } catch (error) {
    throw error?.response?.data || error?.message;
  }
};