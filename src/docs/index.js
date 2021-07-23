import authDocs from './auth.docs';
import pingDocs from './ping.docs';
import userDocs from './user.docs';
import verifyDocs from './verify.docs';

export default { ...authDocs, ...pingDocs, ...userDocs, ...verifyDocs };
