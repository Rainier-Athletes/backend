import HttpErrors from 'http-errors';
import Account from '../../model/account';
import Profile from '../../model/profile';

export default (request, response, next) => {
  if (!request.headers.authorization) return next(new HttpErrors(400, 'AUTH MIDDLEWARE - invalid request', { expose: false }));

  // if i make it past the if statement, I know I have the right headers
  const base64AuthHeader = request.headers.authorization.split(' ')[1];
  if (!base64AuthHeader) return next(new HttpErrors(400, 'AUTH MIDDLEWARE - invalid request', { expose: false }));
  
  const stringAuthHeader = Buffer.from(base64AuthHeader, 'base64').toString();
  // at this point, stringAuthHeader loks like this: username:password

  const [username, password] = stringAuthHeader.split(':');
  if (!username || !password) return next(new HttpErrors(400, 'AUTH, invalid request', { expose: false }));

  console.log('!!!!!! bamw auth header', stringAuthHeader);
  console.log('!!!!!! bamw request.body', request.body);
  let account;
  return Account.findOne({ username })
    .then((result) => {
      if (!result) return next(new HttpErrors(400, 'BASIC AUTH - invalid request', { expose: false }));
      account = result;
      return account.verifyPasswordPromise(password);
    })
    .then((verified) => {
      if (verified) {
        request.account = account;
      } else {
        return next(new HttpErrors(401, 'BASIC AUTH - unable to validate user', { expose: false }));
      }
      return Profile.findOne({ accountId: account._id });
    })
    .then((profile) => {
      request.profile = profile;
      console.log('basic auth router request.account', request.account);
      console.log('basic auth router request.profile', request.profile);
      return next();
    })
    .catch(next);
};
