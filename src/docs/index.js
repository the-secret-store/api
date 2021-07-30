import authDocs from './auth.docs';
import projectDocs from './project.docs';
import userDocs from './user.docs';
import verifyDocs from './verify.docs';

export default { ...authDocs, ...userDocs, ...verifyDocs, ...projectDocs };
