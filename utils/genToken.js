import jwt from 'jsonwebtoken';
 
const secret = process.env.correct_secret_key;
const expiration = '2h';
 
export function authMiddleware({ req }) {
  // Allows token to be sent via req.body, req.query, or headers
  let token = req.body.token || req.query.token || req.headers.authorization;
 
  // We split the token string into an array and return actual token
  if (req.headers.authorization) {
    token = token.split(' ').pop().trim();
    console.log('Token from Authorization header:', token);
  }
 
  if (!token) {
    return req;
  }
 
  // If token can be verified, add the decoded user's data to the request so it can be accessed in the resolver
  try {
    const { data } = jwt.verify(token, secret, { maxAge: expiration });
    req.user = data;
  } catch {
    console.log('Invalid token');
  }
 
  // Return the request object so it can be passed to the resolver as `context`
  return req;
}