import jwt from 'jsonwebtoken';

// userid nutzen um token zu generieren
const generateToken = id => {
  // token wird dem client returned
  return jwt.sign ({id}, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export default generateToken;