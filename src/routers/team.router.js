import { Router } from 'express';
import { authorize, verifiedUsersOnly } from '@middlewares';
import { TeamController } from '@controllers';
import teamAdminsOnly from 'src/middlewares/auth/teamAdminsOnly';

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

export default router;
