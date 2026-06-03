const axios = require('axios');

const BASE_URL = process.env.BASE_URL;


const getToken = async (studentId, password) => {
  const response = await axios.post(`${BASE_URL}/public/token`, {
    studentId,
    password,
    set: process.env.DATASET_SET || 'setA',
  });
  return { token: response.data.token, dataUrl: response.data.dataUrl };
};


const fetchDataset = async (token, dataUrl) => {
  const response = await axios.get(`${BASE_URL}${dataUrl}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data;
};

module.exports = { getToken, fetchDataset };
