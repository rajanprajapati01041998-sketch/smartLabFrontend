import api from "../../Authorization/api";

export const getAllBranchList = async (branchId,userId) => {
  try {
    const { data } = await api.get(`Branch/branch-user-list?branchId={branchId}&userId={userId}`);

    return data;
  } catch (error) {
    throw error?.response?.data || error.message;
  }
};
