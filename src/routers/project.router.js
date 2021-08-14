import { Router } from 'express';
import { ProjectController } from '@controllers';
import { authorize, privilegedUsersOnly, verifiedUsersOnly } from '@middlewares';

/**
 * Router for /projects
 *
 * Available routes: /create, /:id/post, /:id/fetch, /:id/addSAT
 */

const router = Router();

router.post('/create', authorize, verifiedUsersOnly, ProjectController.createProject);

router.post(
	'/:projectIdOrAppId/post',
	authorize,
	verifiedUsersOnly,
	privilegedUsersOnly,
	ProjectController.postSecrets
);

router.get(
	'/:projectIdOrAppId/fetch',
	authorize,
	verifiedUsersOnly,
	privilegedUsersOnly,
	ProjectController.fetchSecrets
);

router.post(
	'/:projectIdOrAppId/addSat',
	authorize,
	verifiedUsersOnly,
	privilegedUsersOnly,
	ProjectController.addSpecialAccessToken
);

export default router;
