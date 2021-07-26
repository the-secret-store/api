import { Router } from 'express';
import { ProjectController } from '@controllers';
import { authorize, privilegedUsersOnly, verifiedUsersOnly } from '@middlewares';

/**
 * Router for /projects
 *
 * Available routes: /create, /:id/post
 */

const router = Router();

router.post('/create', authorize, verifiedUsersOnly, ProjectController.createProject);

router.post(
	'/:projectId/post',
	authorize,
	verifiedUsersOnly,
	privilegedUsersOnly,
	ProjectController.postSecrets
);

export default router;
