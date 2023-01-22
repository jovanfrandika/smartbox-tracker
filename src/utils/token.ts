import AsyncStorage from '@react-native-async-storage/async-storage';

const accessTokenKey = 'accessToken';
const refreshTokenKey = 'refreshToken';

let accessToken = '';
let refreshToken = '';

export const setAccessToken = async (value: string) => {
  try {
    await AsyncStorage.setItem(accessTokenKey, value);
    accessToken = value;
  } catch (e) {
    console.error(e);
  }
};

export const setRefreshToken = async (value: string) => {
  try {
    await AsyncStorage.setItem(refreshTokenKey, value);
    refreshToken = value;
  } catch (e) {
    console.error(e);
  }
};

export const initToken = async () => {
  try {
    let value = await AsyncStorage.getItem(accessTokenKey);
    if (value === null) {
      throw new Error('Access token not found');
    }
    accessToken = value;

    value = await AsyncStorage.getItem(refreshTokenKey);
    if (value === null) {
      throw new Error('Refresh token Not found');
    }
    refreshToken = value;
    return accessToken;
  } catch (e) {
    console.error(e);
  }
};

export const getAccessToken = (): string => accessToken;

export const getRefreshToken = (): string => refreshToken;
