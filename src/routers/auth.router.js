import { Router } from 'express';

import { AuthController } from '@controllers';
import { authorize } from '@middlewares';

const router = Router();

/**
 * Router for /auth
 *
 * Available routes: /login, /check
 */

router.post('/login', AuthController.login);
router.get('/check', authorize, AuthController.checkAuth);
router.put('/refresh', AuthController.getNewTokenPair);

export default router;
