const express = require('express');
const usersRouter = require('./routes/users');

const app = express();
app.use(express.json());

// Mount the users router under /api/users
app.use('/api/users', usersRouter);

app.listen(3000, () => console.log('Server running on http://localhost:3000'));