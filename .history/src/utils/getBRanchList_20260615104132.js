import api from "../../Authorization/api";

export const getAllBranchList = async (branchId) => {
  try {
    const { data } = await api.get(`);

    return data;
  } catch (error) {
    throw error?.response?.data || error.message;
  }
};
