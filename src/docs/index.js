import authDocs from './auth.docs';
import invitationDocs from './invitation.docs';
import projectDocs from './project.docs';
import teamDocs from './team.docs';
import userDocs from './user.docs';
import verifyDocs from './verify.docs';

export default {
	...authDocs,
	...userDocs,
	...verifyDocs,
	...projectDocs,
	...teamDocs,
	...invitationDocs
};
