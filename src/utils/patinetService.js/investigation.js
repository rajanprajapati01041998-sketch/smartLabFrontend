import api from "../../../Authorization/api";

export const getPatientInvestigation = async (params) => {
  try {
    const response = await api.get('Patient/get-patient-investigation', {
      params,
    });

    return response?.data;
  } catch (error) {
    throw error?.response?.data || error?.message;
  }
};