import { createError } from 'apollo-errors';

export const AuthorizationError = createError('AuthorizationError', {
  message: 'you are not authorized!'
});

export const PasswordError = createError('PasswordError', {
  message: 'password is not correct!'
});

export const TestError = createError('TestError', {
  message: 'test'
});

export const EmailError = createError('EmailError', {
  message: 'there are no user with provided email!'
});

export const DeleteUserError = createError('DeleteUserError', {
  message: 'there are no user with provided credentials!'
});