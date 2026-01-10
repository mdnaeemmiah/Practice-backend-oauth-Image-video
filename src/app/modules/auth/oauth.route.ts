import express, { Router } from 'express';
import passport from 'passport';
import {
  googleCallback,
  appleCallback,
  getCurrentUser,
  logout,
} from './oauth.controller';

const router: Router = express.Router();

// Google OAuth Routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false,
  }),
  googleCallback
);

// Apple OAuth Routes
// router.get(
//   '/apple',
//   passport.authenticate('apple', {
//     scope: ['name', 'email'],
//   })
// );

// router.get(
//   '/apple/callback',
//   passport.authenticate('apple', {
//     failureRedirect: '/login',
//     session: false,
//   }),
//   appleCallback
// );

// Get Current User
router.get('/me',  getCurrentUser);

// Logout
router.post('/logout', logout);

export default router;
