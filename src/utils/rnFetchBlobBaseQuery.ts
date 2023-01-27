import RNFetchBlob from 'rn-fetch-blob';

type CustomRequest = {
  baseUrl: string;
  prepareHeaders: () => Record<string, string>;
  withBaseUrl?: boolean;
};

const rnFetchBlobBaseQuery = ({
  baseUrl,
  prepareHeaders,
  withBaseUrl = false,
}: CustomRequest) => async ({
  url, method, data, headers,
}: any) => {
  try {
    const result = await RNFetchBlob.fetch(
      method,
      url,
      { ...prepareHeaders, ...headers },
      data,
    );
    return { data: result.data };
  } catch (axiosError: any) {
    const err = axiosError;
    return {
      error: { status: err.response?.status, data: err.response?.data },
    };
  }
};

export default rnFetchBlobBaseQuery;
