import { Router } from 'express';
import { UserController } from '@controllers';

const router = Router();

/**
 * Router for /user
 *
 * Available routes: /register
 */

router.post('/register', UserController.registerUser);

export default router;
