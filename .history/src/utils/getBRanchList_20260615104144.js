import api from "../../Authorization/api";

export const getAllBranchList = async (branchId) => {
  try {
    const { data } = await api.get(`Branch/branch-user-list?branchId={branch}&userId=1`);

    return data;
  } catch (error) {
    throw error?.response?.data || error.message;
  }
};
