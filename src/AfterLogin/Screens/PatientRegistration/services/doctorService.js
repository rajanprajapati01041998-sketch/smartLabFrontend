import axios from 'axios';
import api from '../../../../../Authorization/api';


export const getDoctorList = async (branchId) => {
    try {
        const response = await api.get('Doctor/GetDoctorList', {
            params: { branchId },
        });
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const referDoctorList = async () => {
    try {
        const response = await api.get('ReferDoctor/GetReferDoctorList');
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

export const referLabList = async () => {
    try {
        const response = await api.get('OutSourceLab/GetOutSourceLabList?activeStatus=1');
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

export const searchInvestigation = async (query) => {
    try {
        const response = await api.get(`Investigation/SearchInvestigation?searchText=${query}`);
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}


export const SearchGetInvestigationListDetails = async ({
    corporateId,
    doctorId,
    serviceItemId,
    categoryId,
    subCategoryId,
    subSubCategoryId,
    bedTypeId,
}) => {
    try {
        const response = await api.get(
            '/ServiceAllDetailsForOPDBilling/GetServiceDetails',
            {
                params: {
                    corporateId,
                    doctorId,
                    serviceItemId,
                    categoryId,
                    subCategoryId,
                    subSubCategoryId,
                    bedTypeId,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const fetchFieldBoy = async () => {
    try {
        const response = await api.get(`FieldBoy/GetFieldBoyList`);
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}


export const allBankList = async () => {
    try {
        const reaponse = await api.get(`PaymentMode/GetBankList`)
        return reaponse.data;
    } catch (error) {
        throw error
    }
}