import api from "../../Authorization/api";

export const getBillReceiptReprint = async (
  branchIdList,
  uhid,
  name,
  type,
  billNo,
  receiptNo,
  fromDate,
  toDate
) => {
  try {
    const payload = {
      branchIdList,
      uhid,
      name,
      type,
      billNo,
      receiptNo,
      fromDate,
      toDate,
    };

    const response = await api.post(
      "BillReceiptReprint/get-bill-receipt-reprint",
      payload
    );

    return response.data;
  } catch (error) {
    throw error?.response?.data || error.message;
  }
};