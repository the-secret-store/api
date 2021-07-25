import { Router } from 'express';
import { ProjectController } from '@controllers';
import { authorize, verifiedUsersOnly } from '@middlewares';

/**
 * Router for /projects
 *
 * Available routes: /create
 */

const router = Router();

router.post('/create', authorize, verifiedUsersOnly, ProjectController.createProject);

export default router;
