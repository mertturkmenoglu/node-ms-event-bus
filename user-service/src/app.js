const crypto = require('crypto');

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const eventTypes = require('./eventTypes');

const app = express();
const PORT = process.env.PORT || 9001;
const EVENT_BUS = "http://localhost:9000/events"
let users = [];

app.use(cors());
app.use(express.json());

app.get('/user', (_req, res) => {
  return res.json(users);
});

app.get('/user/:id', (req, res) => {
  const id = req.params.id;
  return res.json(users.filter(u => u.id === id));
});

app.post('/user', (req, res) => {
  const id = crypto.randomBytes(4).toString('hex');
  const userDto = req.body;
  const user = {
    ...userDto,
    posts: [],
    id,
  };

  users.push(user);

  axios.post(EVENT_BUS, {
    type: eventTypes.USER_CREATED,
    data: user
  }).then(_data => {
    return res.status(201).json(user);
  }).catch(err => {
    console.error(err);
    return res.status(400);
  });
});

app.post('/events', (req, res) => {
  const event = req.body;

  if (event.type === eventTypes.POST_CREATED) {
    const post = event.data;
    const user = users.filter(u => u.id === post.userId)[0];
    if (!user || !user.posts) return res.status(400).send('ERR');
    user.posts.push(post);
    users = [...(users.filter(u => u.id !== post.userId)), user];
    return res.status(201).send('OK');
  }

  return res.status(204).send('OK');
});

app.listen(PORT, () => {
  console.log(`User Service Server started listening on port ${PORT}`);
});