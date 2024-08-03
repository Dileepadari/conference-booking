import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(bodyParser.json());
app.use('/api', routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/api`);
});
