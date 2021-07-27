import { Router } from 'express';
import { authorize, verifiedUsersOnly } from '@middlewares';
import { TeamController } from '@controllers';

/**
 * Router for /team
 *
 * Available routes: /create, :id/invite, :id/remove, :id/leave, :id/list, /:id
 */

const router = Router();

router.post('/create', authorize, verifiedUsersOnly, TeamController.createTeam);

export default router;
