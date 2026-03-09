import axiosInstance from "./axiosInstance";

export const postData = async (url, data) => {
  try {
    const isFormData = data instanceof FormData;
    const res = await axiosInstance.post(url, data, {
      headers: isFormData ? {} : { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const putData = async (url, data) => {
  try {
    const isFormData = data instanceof FormData;
    const res = await axiosInstance.put(url, data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const fetchData = async (url) => {
  try {
    const res = await axiosInstance.get(url);
    return res;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteData = async (url, data = {}, config = {}) => {
  try {
    const res = await axiosInstance.delete(url, {
      ...config,
      data,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
