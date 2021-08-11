export const validProject1 = (owner_id, isPublic = true, secrets = {}) => ({
	project_name: 'Project 1',
	owner: owner_id,
	scope: isPublic ? 'public' : 'private',
	secrets: { ...secrets }
});
