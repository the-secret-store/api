import { Router } from 'express';
import { UserController } from '@controllers';
import { authorize } from '@middlewares';

const router = Router();

/**
 * Router for /user
 *
 * Available routes: /register
 */

router.post('/register', UserController.registerUser);
router.put('/changePassword', authorize, UserController.changePassword);

export default router;
