import { Router } from 'express';
import { authorize, verifiedUsersOnly } from '@middlewares';
import { InvitationController } from '@controllers';

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
