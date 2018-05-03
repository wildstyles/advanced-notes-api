import jwt from 'jsonwebtoken';

export default async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    await jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (!err || decoded) {
        req.user = decoded;
      }
      next();
    });
  } catch (err) {
    throw new Error(err);
  }
};