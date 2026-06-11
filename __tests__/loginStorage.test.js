import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearRememberedCredentials,
  loadRememberedCredentials,
  saveRememberedCredentials,
} from '../src/utils/loginStorage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('loginStorage helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saves and loads remembered credentials when enabled', async () => {
    AsyncStorage.setItem.mockResolvedValue();
    AsyncStorage.getItem.mockResolvedValue(
      JSON.stringify({ username: 'demo', password: 'pass', rememberMe: true }),
    );

    await saveRememberedCredentials('demo', 'pass', true);
    const loaded = await loadRememberedCredentials();

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'rememberedLoginCredentials',
      expect.stringContaining('"username":"demo"'),
    );
    expect(loaded).toEqual({
      username: 'demo',
      password: 'pass',
      rememberMe: true,
    });
  });

  it('clears stored credentials when remember me is disabled', async () => {
    AsyncStorage.removeItem.mockResolvedValue();

    await clearRememberedCredentials();

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('rememberedLoginCredentials');
  });
});
