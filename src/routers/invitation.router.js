import { Router } from 'express';
import { InvitationController } from '@controllers';
import { authorize, verifiedUsersOnly } from '@middlewares';

/**
 * Router for /invitation routes
 *
 * Available routes: /:invitationId/accept
 */

const router = Router();

router.get(
	'/:invitationId/accept',
	authorize,
	verifiedUsersOnly,
	InvitationController.acceptInvitation
);

export default router;
