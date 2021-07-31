import { validateProject, validateProjectPostRequest } from '@validation';
import { validObjectId } from '../constants';

describe('Project validations', () => {
	describe('Create project', () => {
		const validProject = {
			project_name: 'Project Pluto',
			owner: validObjectId,
			scope: 'public'
		};

		it('should throw error for invalid owner', () => {
			const invalidProject = { ...validProject, owner: 'invalidOwner' };
			expect(validateProject(invalidProject)).toHaveProperty('error');
		});

		it('should throw error for invalid scope', () => {
			const invalidProject = { ...validProject, scope: 'invalid' };
			expect(validateProject(invalidProject)).toHaveProperty('error');
		});

		it('go crazy w/ obj proj_name - throw error', () => {
			const invalidProject = { ...validProject, project_name: { lol: 'this is funny' } };
			expect(validateProject(invalidProject)).toHaveProperty('error');
		});

		it('should accept a valid project', () => {
			expect(validateProject(validProject)).not.toHaveProperty('error');
			expect(validateProject({ ...validProject, scope: 'private' })).not.toHaveProperty('error');
		});
	});

	describe('Post secrets', () => {
		const projectId = validObjectId;
		const appId = 'this-is-project';
		const secrets = { key: 'value' };

		it('should throw error for invalid projectId | appId', () => {
			const { error } = validateProjectPostRequest('invalidId', secrets);
			expect(error).toBeDefined();
		});

		it('should throw error if any of the fields are missing', () => {
			const { error } = validateProjectPostRequest(projectId);
			expect(error).toBeDefined();

			const { error: err2 } = validateProjectPostRequest(undefined, secrets);
			expect(err2).toBeDefined();
		});

		it('test w/ appId', () => {
			const { error } = validateProjectPostRequest(appId, secrets);
			expect(error).toBeUndefined();
		});

		it('test w/ projectId', () => {
			const { error } = validateProjectPostRequest(projectId, secrets);
			expect(error).toBeUndefined();
		});
	});
});
