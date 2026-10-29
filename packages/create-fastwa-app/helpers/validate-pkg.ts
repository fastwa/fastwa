/**
 * A subset of npm's package name rules, enough for a new project name
 */
export function validateNpmName(name: string) {
  const problems: string[] = [];

  if (!name.length) {
    problems.push('name cannot be empty');
  }

  if (name.length > 214) {
    problems.push('name cannot contain more than 214 characters');
  }

  if (name !== name.toLowerCase()) {
    problems.push('name can no longer contain capital letters');
  }

  if (/^[._]/.test(name)) {
    problems.push('name cannot start with a period or an underscore');
  }

  if (name.trim() !== name) {
    problems.push('name cannot contain leading or trailing spaces');
  }

  if (
    !/^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(name)
  ) {
    problems.push('name can only contain URL-friendly characters');
  }

  if (['node_modules', 'favicon.ico'].includes(name)) {
    problems.push(`${name} is not a valid package name`);
  }

  return { valid: problems.length === 0, problems };
}
