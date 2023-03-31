export function timer(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
