import api from "../../../Authorization/api";

export const dashboardWallet = async (ids) => {
    try {
        const response = await api.get(`Dashboard/wallet?clientIds=${ids}`);
        return response
    } catch (error) {
        console.log('Logout Error:', error?.response?.data || error.message);
        return error?.response
    }
};