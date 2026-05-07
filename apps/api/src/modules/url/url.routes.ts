import { Router } from 'express';
import * as urlController from './url.controller';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.middleware';
import { rateLimit } from '../../middleware/rateLimit.middleware';

const router = Router();

// POST /api/urls — shorten (auth optional, rate-limited)
router.post(
  '/',
  optionalAuthenticate,
  rateLimit(),
  urlController.shorten
);

// GET /api/urls — list user's URLs (auth required)
router.get('/', authenticate, urlController.listMyUrls);

// PATCH /api/urls/:shortCode — update alias/expiry
router.patch('/:shortCode', authenticate, urlController.updateUrl);

// DELETE /api/urls/:shortCode — soft-delete
router.delete('/:shortCode', authenticate, urlController.deleteUrl);

export default router;
