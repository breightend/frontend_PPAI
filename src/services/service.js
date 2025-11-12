import axios from "axios";

const API_BASE_URL = "http://localhost:5199";

export const fetchData = async (endpoint) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${endpoint}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data || "";
      throw new Error(`GET ${endpoint} failed ${status} ${message}`);
    }
    if (error.request) {
      throw new Error(`GET ${endpoint} failed: no response from server`);
    }
    throw new Error(`GET ${endpoint} failed: ${error.message}`);
  }
};

export const postData = async (endpoint, data = {}, config = {}) => {
  try {
    // Pass the optional axios config through (for params, headers, etc.)
    const response = await axios.post(
      `${API_BASE_URL}${endpoint}`,
      data,
      config
    );
    return response.data;
  } catch (error) {
    console.error("Error posting data:", error);
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data || "";
      throw new Error(`POST ${endpoint} failed ${status} ${message}`);
    }
    if (error.request) {
      throw new Error(`POST ${endpoint} failed: no response from server`);
    }
    throw new Error(`POST ${endpoint} failed: ${error.message}`);
  }
};
