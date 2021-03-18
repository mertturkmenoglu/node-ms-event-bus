const crypto = require('crypto');

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const eventTypes = require('./eventTypes');

const app = express();
const PORT = process.env.PORT || 9002;
const EVENT_BUS = "http://localhost:9000/events"
let posts = [];

app.use(cors());
app.use(express.json());

app.get('/post', (_req, res) => {
  return res.json(posts);
});

app.get('/post/:id', (req, res) => {
  const id = req.params.id;
  return res.json(posts.filter(p => p.id === id));
});

app.post('/post', (req, res) => {
  const id = crypto.randomBytes(4).toString('hex');
  const postDto = req.body;
  const post = {
    ...postDto,
    id,
  };

  posts.push(post);

  axios
    .post(EVENT_BUS, {
      type: eventTypes.POST_CREATED,
      data: post
    })
    .then(_r => {
      return res.status(201).json(post);
    })
    .catch(e => {
      return res.status(204).send('ERR');
    })
});

app.post('/events', (req, res) => {
  return res.status(204).send('OK');
});

app.listen(PORT, () => {
  console.log(`Post Service Server started listening on port ${PORT}`);
});