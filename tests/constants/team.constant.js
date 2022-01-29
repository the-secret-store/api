export const validTeam1 = (userId, isPublic = true) => ({
	team_name: 'Team 1',
	owner: userId,
	visibility: isPublic ? 'public' : 'private'
});
