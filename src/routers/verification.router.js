import { Router } from 'express';
import { VerificationController } from '@controllers';
import { authorize } from '@middlewares';

const router = Router();

/**
 * Router for /verify
 *
 * Available routes: /get-otp
 */

router.get('/get-otp', authorize, VerificationController.sendOTP);

export default router;
