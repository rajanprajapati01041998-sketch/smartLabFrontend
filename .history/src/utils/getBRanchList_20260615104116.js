import api from "../../Authorization/api";

export const getAllBranchList = async (branchId) => {
  try {
    const { data } = await api.get(`PageMasterApp/get-page-setting`,
      {
        params: {
          branchId,
        },
      }
    );

    return data;
  } catch (error) {
    throw error?.response?.data || error.message;
  }
};
