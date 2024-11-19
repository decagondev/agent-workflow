import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { logger } from '../utils/logger';

class AuthMiddleware {
  /**
   * Verify JWT token and authenticate user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async authenticateToken(req, res, next) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ 
          error: 'Authentication token required',
          code: 'MISSING_TOKEN' 
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid authentication token',
          code: 'INVALID_TOKEN' 
        });
      }

      if (user.status !== 'ACTIVE') {
        return res.status(403).json({ 
          error: 'Account is not active',
          code: 'ACCOUNT_INACTIVE' 
        });
      }

      req.user = user;
      
      logger.info('User authenticated', { 
        userId: user._id, 
        email: user.email 
      });

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Authentication token expired',
          code: 'TOKEN_EXPIRED' 
        });
      }

      logger.error('Authentication error', { 
        error: error.message,
        stack: error.stack 
      });

      res.status(403).json({ 
        error: 'Failed to authenticate token',
        code: 'AUTH_FAILED' 
      });
    }
  }

  /**
   * Role-based access control middleware
   * @param {string[]} allowedRoles - Roles allowed to access the route
   */
  roleAuthorization(allowedRoles) {
    return (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({ 
            error: 'Authentication required',
            code: 'NOT_AUTHENTICATED' 
          });
        }

        if (!allowedRoles.includes(req.user.role)) {
          logger.warn('Unauthorized access attempt', { 
            userId: req.user._id, 
            requiredRoles: allowedRoles,
            userRole: req.user.role 
          });

          return res.status(403).json({ 
            error: 'Insufficient permissions',
            code: 'FORBIDDEN',
            requiredRoles: allowedRoles 
          });
        }

        next();
      } catch (error) {
        logger.error('Role authorization error', { 
          error: error.message,
          stack: error.stack 
        });

        res.status(500).json({ 
          error: 'Internal server error during authorization',
          code: 'AUTHORIZATION_ERROR' 
        });
      }
    };
  }

  /**
   * Generate JWT token for user
   * @param {Object} user - User object
   * @returns {string} JWT token
   */
  generateToken(user) {
    return jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '24h' 
      }
    );
  }

  /**
   * Refresh authentication token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ 
          error: 'Refresh token required',
          code: 'MISSING_REFRESH_TOKEN' 
        });
      }

      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN' 
        });
      }

      const newAccessToken = this.generateToken(user);

      res.json({ 
        accessToken: newAccessToken,
        expiresIn: '24h' 
      });
    } catch (error) {
      logger.error('Token refresh error', { 
        error: error.message,
        stack: error.stack 
      });

      res.status(401).json({ 
        error: 'Failed to refresh token',
        code: 'REFRESH_TOKEN_ERROR' 
      });
    }
  }
}

export default new AuthMiddleware();
