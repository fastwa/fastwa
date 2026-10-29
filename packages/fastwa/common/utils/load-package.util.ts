/**
 * Loads an optional dependency when a feature that needs it is used, with a
 * clear error when it is not installed
 *
 * @param packageName Package to load
 * @param context Feature that needs the package, shown in the error
 * @param loader Loads the package; a literal `require()` keeps it visible to bundlers
 */
export function loadPackage<T = any>(
  packageName: string,
  context: string,
  loader: () => T
): T {
  try {
    return loader();
  } catch (error) {
    // Only report the package itself, not a missing module it imports
    if (
      error?.code === 'MODULE_NOT_FOUND' &&
      String(error.message).includes(`'${packageName}'`)
    ) {
      throw new Error(
        `The "${packageName}" package is missing. Install it to use ${context}: npm install ${packageName}`
      );
    }

    throw error;
  }
}
