import { Router } from 'express';

import { TeamController } from '@controllers';
import { authorize, teamAdminsOnly, verifiedUsersOnly } from '@middlewares';

/**
 * Router for /team
 *
 * Available routes: /create, :id/invite, :id/remove, :id/leave, :id/list, /:id
 */

const router = Router();

router.post('/create', authorize, verifiedUsersOnly, TeamController.createTeam);
router.post(
	'/:teamId/invite',
	authorize,
	verifiedUsersOnly,
	teamAdminsOnly,
	TeamController.inviteUser
);
router.delete(
	'/:teamId/delete',
	authorize,
	verifiedUsersOnly,
	teamAdminsOnly,
	TeamController.deleteTeam
);

export default router;
