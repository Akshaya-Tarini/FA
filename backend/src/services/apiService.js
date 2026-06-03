const axios = require('axios');

const BASE_URL = process.env.BASE_URL;


const getToken = async (studentId, password) => {
  const response = await axios.post(`${BASE_URL}/public/token`, {
    studentId,
    password,
    set: process.env.DATASET_SET || 'setA',
  });
  return response.data.token;
};


const fetchDataset = async (token) => {
  const response = await axios.get(`${BASE_URL}/private/data`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data;
};

module.exports = { getToken, fetchDataset };
