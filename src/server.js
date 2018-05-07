import express from 'express';
import bodyParser from 'body-parser';

import { graphiqlExpress, graphqlExpress } from 'apollo-server-express';

import { makeExecutableSchema } from 'graphql-tools';

import typeDefs from './schemas';
import resolvers from './resolvers';
import mongoose from 'mongoose';
import config from './config/config';
import { formatError } from 'apollo-errors';
import isAuthenticated from './middleware/isAuthenticated';

mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${process.env.MONGODB_LOGIN}:${process.env.MONGODB_PASSWORD}@ds261969.mlab.com:61969/graphql-advanced-notes`);


const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
      return res.status(200).json({});
  }
  next();
});

app.use(isAuthenticated);

app.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress(req => ({
    schema,
    formatError,
    context: {
      user: req.user
    }
  }))
);

app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});