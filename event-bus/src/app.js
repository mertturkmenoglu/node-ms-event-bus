const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 9000;
const services = [
  "http://localhost:9001/events",
  "http://localhost:9002/events",
];

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  return res.send('EVENT BUS')
})

app.post('/events', (req, res) => {
  Promise.all(services.map(s => axios.post(s, req.body)))
    .then(_r => {
      return res.status(200).send('OK');
    })
    .catch(e => {
      return res.status(204).send('ERR');
    });
});

app.listen(PORT, () => {
  console.log(`Event Bus Server started listening on port ${PORT}`);
});