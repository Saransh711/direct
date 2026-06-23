export function deterministicCreditScore(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }
  const normalized = Math.abs(hash % 451);
  return 350 + normalized;
}

export function deterministicFailure(seed: string): boolean {
  const score = deterministicCreditScore(seed);
  return score % 17 === 0;
}
