// Tiny classname joiner (avoids adding a clsx dependency).
export function cn(...args) {
  return args
    .flat()
    .filter(Boolean)
    .join(' ')
    .trim();
}
