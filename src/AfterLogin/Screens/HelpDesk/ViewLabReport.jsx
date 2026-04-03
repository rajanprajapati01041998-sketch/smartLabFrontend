import { View, Text, ActivityIndicator, TouchableOpacity, Platform, Dimensions } from 'react-native'
import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import axios from 'axios'
import { WebView } from 'react-native-webview'
import RNFetchBlob from 'react-native-blob-util'
import tw from 'twrnc'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import api from '../../../../Authorization/api'

const ViewLabReport = () => {
  const navigation = useNavigation()
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [pdfPath, setPdfPath] = useState('')
  const route = useRoute()
 

  const ptInvstId = route?.params?.patientInvestigationId 

  const branchId = route?.params?.branchId
  console.log("FULL PARAMS:", route.params);
  console.log("id",ptInvstId)
  const getReport = async () => {
    try {
      setLoading(true)
      setError(false)
      const response = await api.get(`ReportPrint/ViewReport?ptInvstId=${ptInvstId}&isHeaderPNG=0&printBy=1&branchId=${branchId}`)
      console.log("report response", response.data)

      if (response.data?.base64Data) {
        setReportData(response.data.base64Data)
        // Save to file for better viewing
        await savePDFToFile(response.data.base64Data)
      } else {
        setError(true)
      }
    } catch (error) {
      console.log("report error", error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const savePDFToFile = async (base64Data) => {
    try {
      const fileName = `report_${Date.now()}.pdf`
      const filePath = `${RNFetchBlob.fs.dirs.DocumentDir}/${fileName}`
      await RNFetchBlob.fs.writeFile(filePath, base64Data, 'base64')
      setPdfPath(filePath)
      console.log('PDF saved to:', filePath)
    } catch (error) {
      console.error('Error saving PDF:', error)
    }
  }

  useFocusEffect(
    useCallback(() => {
      getReport()
      return () => {
        // Cleanup if needed
      }
    }, [ptInvstId, branchId])
  )

  // Generate HTML for WebView PDF viewer
  const generatePDFViewerHTML = (base64Data) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              background: #f5f5f5;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            }
            #toolbar {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              background: white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              padding: 12px 16px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              z-index: 100;
              border-bottom: 1px solid #e5e7eb;
            }
            .toolbar-btn {
              background: #f3f4f6;
              border: none;
              padding: 8px 16px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 500;
              color: #374151;
              cursor: pointer;
              transition: all 0.2s;
            }
            .toolbar-btn:active {
              background: #e5e7eb;
              transform: scale(0.98);
            }
            .toolbar-btn:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
            #page-info {
              font-size: 14px;
              color: #6b7280;
            }
            #container {
              position: absolute;
              top: 60px;
              left: 0;
              right: 0;
              bottom: 0;
              overflow: auto;
              display: flex;
              justify-content: center;
              padding: 20px;
            }
            canvas {
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              background: white;
              border-radius: 8px;
              max-width: 100%;
              height: auto;
            }
            #loading {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              text-align: center;
              z-index: 1000;
              background: white;
              padding: 20px;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .spinner {
              border: 3px solid #f3f3f3;
              border-top: 3px solid #3b82f6;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 0 auto 12px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            #error {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              text-align: center;
              background: white;
              padding: 24px;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
          </style>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
        </head>
        <body>
          <div id="toolbar">
            <button class="toolbar-btn" id="prev" disabled>◀ Previous</button>
            <span id="page-info">Loading...</span>
            <button class="toolbar-btn" id="next" disabled>Next ▶</button>
          </div>
          <div id="container">
            <canvas id="pdf-canvas"></canvas>
          </div>
          <div id="loading">
            <div class="spinner"></div>
            <div>Loading PDF...</div>
          </div>
          
          <script>
            (function() {
              const base64Data = "${base64Data || ''}";
              
              function base64ToUint8Array(base64) {
                const binaryString = atob(base64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                return bytes;
              }
              
              if (!base64Data) {
                document.getElementById('loading').innerHTML = '<div style="color: red;">No PDF data available</div>';
                return;
              }
              
              pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
              
              let pdfDoc = null;
              let currentPage = 1;
              let totalPages = 0;
              let isRendering = false;
              
              const canvas = document.getElementById('pdf-canvas');
              const ctx = canvas.getContext('2d');
              const prevBtn = document.getElementById('prev');
              const nextBtn = document.getElementById('next');
              const pageInfo = document.getElementById('page-info');
              const loadingDiv = document.getElementById('loading');
              
              function renderPage(pageNum) {
                isRendering = true;
                pdfDoc.getPage(pageNum).then(function(page) {
                  const viewport = page.getViewport({ scale: 1.2 });
                  canvas.height = viewport.height;
                  canvas.width = viewport.width;
                  
                  const renderContext = {
                    canvasContext: ctx,
                    viewport: viewport
                  };
                  
                  page.render(renderContext).promise.then(function() {
                    isRendering = false;
                    pageInfo.textContent = 'Page ' + pageNum + ' of ' + totalPages;
                    prevBtn.disabled = (pageNum === 1);
                    nextBtn.disabled = (pageNum === totalPages);
                  });
                }).catch(function(err) {
                  console.error('Render error:', err);
                  loadingDiv.innerHTML = '<div style="color: red;">Error rendering page</div>';
                });
              }
              
              function queueRenderPage(num) {
                if (isRendering) {
                  setTimeout(function() { queueRenderPage(num); }, 100);
                } else {
                  renderPage(num);
                }
              }
              
              try {
                const pdfData = base64ToUint8Array(base64Data);
                pdfjsLib.getDocument({ data: pdfData }).promise.then(function(pdf) {
                  pdfDoc = pdf;
                  totalPages = pdf.numPages;
                  pageInfo.textContent = 'Page 1 of ' + totalPages;
                  loadingDiv.style.display = 'none';
                  renderPage(1);
                }).catch(function(error) {
                  console.error('PDF loading error:', error);
                  loadingDiv.innerHTML = '<div style="color: red;">Failed to load PDF. Please try again.</div>';
                });
              } catch (error) {
                console.error('Error:', error);
                loadingDiv.innerHTML = '<div style="color: red;">Invalid PDF data.</div>';
              }
              
              prevBtn.addEventListener('click', function() {
                if (currentPage > 1) {
                  currentPage--;
                  queueRenderPage(currentPage);
                }
              });
              
              nextBtn.addEventListener('click', function() {
                if (currentPage < totalPages) {
                  currentPage++;
                  queueRenderPage(currentPage);
                }
              });
            })();
          </script>
        </body>
      </html>
    `
  }


  if (loading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-white`}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={tw`mt-4 text-gray-600 font-medium`}>Loading Report...</Text>
        <Text style={tw`mt-1 text-sm text-gray-400`}>Please wait</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-white px-6`}>
        <MaterialCommunityIcons name="file-pdf-box" size={80} color="#ef4444" />
        <Text style={tw`mt-4 text-lg font-semibold text-gray-800`}>
          Unable to Load Report
        </Text>
        <Text style={tw`mt-2 text-sm text-gray-500 text-center`}>
          There was an error loading the report. Please try again.
        </Text>
        <TouchableOpacity
          onPress={getReport}
          style={tw`mt-6 bg-blue-500 px-6 py-3 rounded-xl flex-row items-center`}
        >
          <MaterialCommunityIcons name="refresh" size={20} color="white" />
          <Text style={tw`text-white font-semibold ml-2`}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={tw`flex-1 bg-white`}>
      {/* Header */}


      {/* PDF Viewer */}
      <View style={tw`flex-1`}>
        {reportData ? (
          <WebView
            originWhitelist={['*']}
            source={{ html: generatePDFViewerHTML(reportData) }}
            style={tw`flex-1`}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={tw`absolute inset-0 items-center justify-center bg-white`}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={tw`mt-2 text-gray-600`}>Rendering PDF...</Text>
              </View>
            )}
            onError={(error) => {
              console.error('WebView error:', error)
              setError(true)
            }}
          />
        ) : (
          <View style={tw`flex-1 items-center justify-center`}>
            <MaterialCommunityIcons name="file-pdf-box" size={64} color="#9ca3af" />
            <Text style={tw`mt-2 text-gray-500`}>No report data available</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default ViewLabReport