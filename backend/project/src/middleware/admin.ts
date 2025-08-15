import { Request, Response, NextFunction } from 'express';

// Example admin middleware — customize based on your auth logic
export  function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Assuming you store user info in req.user after authentication
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized: No user logged in' });
  }

  if (!user.isAdmin) {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }

  next();
}