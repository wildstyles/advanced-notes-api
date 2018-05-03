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


app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});