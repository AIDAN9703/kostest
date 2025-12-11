export function getUserInitials(firstName?: string | null, lastName?: string | null): string {
	const firstInitial = (firstName && firstName.trim().charAt(0)) || '';
	const lastInitial = (lastName && lastName.trim().charAt(0)) || '';
	const initials = `${firstInitial}${lastInitial}`.toUpperCase();
	return initials || 'U';
}

export function getUserInitialsFromName(name?: string | null, email?: string | null): string {
	if (name && name.trim().length > 0) {
		const parts = name.trim().split(/\s+/);
		if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
		const first = parts[0].charAt(0);
		const last = parts[parts.length - 1].charAt(0);
		return `${first}${last}`.toUpperCase();
	}
	return email?.charAt(0).toUpperCase() ?? 'U';
}