import {GetUserQuery, GetUserQueryVariables, User} from '../API';
import {graphql, GeneratedQuery} from '../graphql';
import {createUser} from '../graphql/mutations';

const getUser = `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
      email
  }
` as GeneratedQuery<GetUserQueryVariables, GetUserQuery>;

export const find = async (id: string) => {
  const response = await graphql({
    query: getUser,
    variables: {id},
  });

  const user = response.data?.getUser as User | undefined;

  if (!user) {
    return null;
  }

  return user;
};

export const create = async () => {
  const response = await graphql({
    query: createUser,
    variables: {
      input: {
        username: 'cbonif',
        email: 'christopher.bonifacio@gmail.com',
      },
    },
  });

  const user = response.data.createUser as User | undefined;

  if (!user) {
    return null;
  }

  return user;
};
