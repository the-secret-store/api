import { Router } from 'express';

import { VerificationController } from '@controllers';
import { authorize } from '@middlewares';

const router = Router();

/**
 * Router for /verify
 *
 * Available routes: /get-otp, /check
 */

router.patch('/get-otp', authorize, VerificationController.sendOTP);
router.put('/check', authorize, VerificationController.verifyAccount);

export default router;
