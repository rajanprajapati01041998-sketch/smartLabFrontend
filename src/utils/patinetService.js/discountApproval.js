import api from "../../../Authorization/api";

export const getApprovalByBranchId = async (bracnchId) => {
  try {
    const response = await api.get(`Branch/discount-approval-list?discountType=OPD&branchId=1`);
    return response?.data;
  } catch (error) {
    throw error?.response?.data || error?.message;
  }
};