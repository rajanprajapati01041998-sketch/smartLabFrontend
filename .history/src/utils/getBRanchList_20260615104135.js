import api from "../../Authorization/api";

export const getAllBranchList = async (branchId) => {
  try {
    const { data } = await api.get(`Branch/branch-user-list?branchId=1&userId=1`);

    return data;
  } catch (error) {
    throw error?.response?.data || error.message;
  }
};
