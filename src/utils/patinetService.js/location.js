import api from "../../../Authorization/api";

export const getFullLocation = async (pincode) => {
  try {
    if (!pincode) {
      throw new Error("Pincode is required");
    }
    const response = await api.get(
      `/Country/GetFullLocationByPincode`,
      {
        params: { pincode: pincode }
      }
    );
    return response?.data;
  } catch (error) {
    throw error?.response?.data?.message || error?.message || "Something went wrong";
  }
};