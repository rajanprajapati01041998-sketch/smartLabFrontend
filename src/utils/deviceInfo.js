import DeviceInfo from 'react-native-device-info';

export const getDeviceInfo = async () => {
  try {
    const deviceName = await DeviceInfo.getDeviceName();
    const systemName = DeviceInfo.getSystemName();
    const systemVersion = DeviceInfo.getSystemVersion();
    const deviceType = DeviceInfo.getDeviceType();

    return {
      device: deviceName,
      os: `${systemName} ${systemVersion}`,
      type: deviceType,
      browser: 'React Native App',
    };
  } catch (error) {
    console.log('Device Info Error:', error);
    return null;
  }
};