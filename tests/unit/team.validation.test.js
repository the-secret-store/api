import { validateTeamInvite, validateTeam } from '@validation';
import { validObjectId } from '../constants';

describe('Teams validations', () => {
	const validTeam = {
		team_name: 'Team 1',
		owner: validObjectId,
		visibility: 'private'
	};

	describe('Create team', () => {
		it('should throw error for invite owner id', () => {
			expect(validateTeam({ ...validTeam, owner: 'invalid' })).toHaveProperty('error');
		});

		it('should throw error for invalid visibility', () => {
			expect(validateTeam({ ...validTeam, visibility: 'invalid' })).toHaveProperty('error');
		});

		it('should accept a valid team', () => {
			expect(validateTeam(validTeam)).not.toHaveProperty('error');
		});
	});

	describe('Team invite request', () => {
		const validTeamInvite = {
			teamId: validObjectId,
			user_email: 'test@test.com'
		};
		it('should throw error for invalid teamId', async () => {
			const { error } = await validateTeamInvite({ ...validTeamInvite, teamId: 'funny-id' });
			expect(error).toBeDefined();
		});

		it('should throw error for invalid email', async () => {
			const { error } = await validateTeamInvite({ ...validTeamInvite, user_email: 'funny-email' });
			expect(error).toBeDefined();
		});

		// valid case can't be tested with unit test, involves db query
	});
});
