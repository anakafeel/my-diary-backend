require('dotenv').config({ path: './deploy.env' });

const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

connectToMongo();

app.use(cors());
app.use(express.json());

/* ALL ROUTES GO HERE: */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

app.listen(port, () => {
  console.log(`My-Diary listening on port: ${port}`);
});
