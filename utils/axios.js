import axios from 'axios';

export const getTodos = () => {
  axios
    .get('http://127.0.0.1:8000/api/')
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};
