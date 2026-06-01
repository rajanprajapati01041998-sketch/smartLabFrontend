import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Platform,
    Modal,
    TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { Popup } from '@sekizlipenguen/react-native-popup-confirm-toast';
import tw from 'twrnc';
import { getThemeStyles } from '../../../utils/themeStyles';
import api from '../../../../Authorization/api';
import { useAuth } from '../../../../Authorization/AuthContext';
import { useToast } from '../../../../Authorization/ToastContext';
import { useTheme } from '../../../../Authorization/ThemeContext';

const DashBoardPaymentDownload = ({ selectedBranches = [], fromDate, toDate }) => {
    const { theme } = useTheme();
    const themed = getThemeStyles(theme);
    const { userId } = useAuth();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(false);
    const [printModal, setPrintModal] = useState(false);

    const arrayBufferToBase64 = buffer => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const chunkSize = 0x8000;

        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);
            binary += String.fromCharCode.apply(null, chunk);
        }

        return global.btoa(binary);
    };

    const handleDownload = async colorPrint => {
        try {
            setPrintModal(false);

            if (!selectedBranches?.length) {
                showToast('Please Select Branch', 'warning');
                return;
            }

            if (!fromDate || !toDate) {
                showToast('Please Select FromDate and ToDate', 'warning');
                return;
            }

            setLoading(true);

            const clientIdList = selectedBranches
                .map(item => item?.BranchId || item?.branchId || item)
                .join(',');

            const fileName = `Dashboard_Report_Payment_${Date.now()}.pdf`;

            const filePath =
                Platform.OS === 'android'
                    ? `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${fileName}`
                    : `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${fileName}`;

            const response = await api.get('Dashboard/download-bill-advance-pdf', {
                params: {
                    clientIdList,
                    fromDate,
                    toDate,
                    UserId: userId,
                    colorPrint,
                },
                responseType: 'arraybuffer',
                headers: {
                    Accept: 'application/pdf',
                },
            });

            const base64Data = arrayBufferToBase64(response.data);
            await ReactNativeBlobUtil.fs.writeFile(filePath, base64Data, 'base64');

            if (Platform.OS === 'android') {
                ReactNativeBlobUtil.android.addCompleteDownload({
                    title: fileName,
                    description: 'Dashboard Report downloaded successfully',
                    mime: 'application/pdf',
                    path: filePath,
                    showNotification: true,
                });
            }

            Popup.show({
                type: 'success',
                title: 'Success!',
                textBody: 'Document downloaded successfully',
                buttonText: 'OK',
                backgroundColor:'#1da1f2',
                callback: () => Popup.hide(),
            });
        } catch (error) {
            console.log('Download Error => ', error);
            showToast('Unable to download PDF', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View>
            <TouchableOpacity
                disabled={loading}
                onPress={() => setPrintModal(true)}
                style={[themed.downloadButton, loading && { opacity: 0.6 }]}>
                <Icon name="download" size={20} color="white" />
                <Text style={themed.downloadButtonText}>
                    {loading ? 'Downloading...' : 'Download'}
                </Text>
            </TouchableOpacity>

            <Modal
                visible={printModal}
                transparent
                animationType="fade"
                onRequestClose={() => setPrintModal(false)}>

                <TouchableWithoutFeedback
                    onPress={() => setPrintModal(false)}>

                    <View
                        style={[
                            tw`flex-1 justify-center items-center px-6 bg-black/90`,
                          
                        ]}>

                        {/* Prevent closing when clicking inside dialog */}
                        <TouchableWithoutFeedback>
                            <View
                                style={[tw`w-full rounded-3xl p-5 `,themed.childScreen2,themed.border]}>

                                <View style={tw`items-center`}>
                                    <Icon name="print" size={38} color="#2563eb" />
                                    <Text
                                        style={[themed.modalHeaderTitle]}>
                                        Select Print Type
                                    </Text>
                                    <Text
                                        style={[ themed.modalHeaderSubTitle ]}>
                                        Please choose how you want to download PDF.
                                    </Text>
                                </View>

                                <View
                                    style={tw`flex-row justify-between items-center mt-4`}>

                                    <TouchableOpacity
                                        onPress={() => handleDownload(true)}
                                        style={[themed.searchButton, tw`w-[48%]`]}>
                                        <Text style={themed.searchButtonText}>
                                            Color Print
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => handleDownload(false)}
                                        style={[
                                            themed.searchButton,
                                            tw`w-[48%] bg-black`,
                                        ]}>
                                        <Text style={themed.searchButtonText}>
                                            Black & White
                                        </Text>
                                    </TouchableOpacity>

                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

export default DashBoardPaymentDownload;