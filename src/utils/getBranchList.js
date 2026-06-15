import api from "../../Authorization/api";

export const getAllBranchList = async (loginBranchId,userId) => {
  try {
    const response = await api.get(`Branch/branch-user-list?branchId=${loginBranchId}&userId=${userId}`);
    return response;
  } catch (error) {
    throw error?.response?.data || error.message;
  }
};
