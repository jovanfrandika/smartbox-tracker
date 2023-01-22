import axios, { AxiosRequestHeaders, AxiosResponse } from 'axios';
import config from 'react-native-config';

import { setAccessToken, setRefreshToken, getRefreshToken } from './token';

type AxiosCustomRequest = {
  baseUrl: string;
  prepareHeaders: () => AxiosRequestHeaders;
};

axios.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // access token expired
    if (error.response.status === 401) {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        return Promise.reject(error);
      }

      return axios
        .post(`${config.API_URL}/user/refresh`)
        .then((res) => {
          if (res.status === 200) {
            setAccessToken(res.data.accessToken);
            return axios(originalRequest);
          }
        })
        .catch((refreshTokenErr) => {
          // refresh token expired
          if (refreshTokenErr.response.status === 401) {
            // logout
            setAccessToken('');
            setRefreshToken('');
            return Promise.reject(refreshTokenErr);
          }
        });
    }
    return Promise.reject(error);
  },
);

const axiosBaseQuery = ({ baseUrl, prepareHeaders, ...rest }: AxiosCustomRequest) => async ({
  url, method, data, headers,
}: any) => {
  try {
    const result: AxiosResponse = await axios({
      url: config.API_URL + baseUrl + url,
      method,
      data,
      headers: { ...prepareHeaders(), ...headers },
      ...rest,
    });
    return { data: result.data };
  } catch (axiosError: any) {
    const err = axiosError;
    return {
      error: { status: err.response?.status, data: err.response?.data },
    };
  }
};

export default axiosBaseQuery;
