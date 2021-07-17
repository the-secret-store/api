import { Router } from 'express';
import { AuthController } from '@controllers';

const router = Router();

/**
 * Router for /auth
 *
 * Available routes: /login
 */

router.post('/login', AuthController.login);

export default router;
