import jwt from 'jsonwebtoken';

export const isAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }
  
  const token = authHeader.split(' ')[1]; 
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if(!decoded.isAdmin) {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
    req.user = decoded;
    next(); 
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

export const isUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(' ')[1]; 

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if(decoded.isAdmin) {
        return res.status(403).json({ message: "Access denied. Users only." });
    }
    req.user = decoded; 
    next(); 
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};