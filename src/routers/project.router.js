import { Router } from 'express';
import { ProjectController } from '@controllers';
import { acceptSATs, authorize, privilegedUsersOnly, verifiedUsersOnly } from '@middlewares';

/**
 * Router for /projects
 *
 * Available routes: /create, /:id/post, /:id/fetch, /:id/addSAT
 */

const router = Router();

router.post('/create', authorize, verifiedUsersOnly, ProjectController.createProject);

router.put(
	'/:projectIdOrAppId/post',
	authorize,
	verifiedUsersOnly,
	privilegedUsersOnly,
	ProjectController.postSecrets
);

router.get(
	'/:projectIdOrAppId/fetch',
	acceptSATs,
	authorize,
	verifiedUsersOnly,
	privilegedUsersOnly,
	ProjectController.fetchSecrets
);

router.patch(
	'/:projectIdOrAppId/addSat',
	authorize,
	verifiedUsersOnly,
	privilegedUsersOnly,
	ProjectController.addSpecialAccessToken
);

export default router;
