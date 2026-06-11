import AsyncStorage from '@react-native-async-storage/async-storage';

const REMEMBERED_CREDENTIALS_KEY = 'rememberedLoginCredentials';

export const saveRememberedCredentials = async (username, password, rememberMe) => {
  if (!rememberMe) {
    await AsyncStorage.removeItem(REMEMBERED_CREDENTIALS_KEY);
    return null;
  }

  const payload = {
    username: username || '',
    password: password || '',
    rememberMe: true,
  };

  await AsyncStorage.setItem(
    REMEMBERED_CREDENTIALS_KEY,
    JSON.stringify(payload),
  );

  return payload;
};

export const loadRememberedCredentials = async () => {
  try {
    const stored = await AsyncStorage.getItem(REMEMBERED_CREDENTIALS_KEY);

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);

    if (!parsed?.rememberMe) {
      await AsyncStorage.removeItem(REMEMBERED_CREDENTIALS_KEY);
      return null;
    }

    return {
      username: parsed.username || '',
      password: parsed.password || '',
      rememberMe: true,
    };
  } catch (error) {
    console.log('Error loading remembered credentials:', error);
    return null;
  }
};

export const clearRememberedCredentials = async () => {
  await AsyncStorage.removeItem(REMEMBERED_CREDENTIALS_KEY);
};
