export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private maxTokens: number;
  private refillInterval: number;
  private queue: Array<() => void> = [];

  constructor(maxTokens: number, refillInterval: number) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
    this.refillInterval = refillInterval;
  }

  private refill() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = Math.floor(timePassed / this.refillInterval) * this.maxTokens;
    
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }

  async acquire(): Promise<void> {
    this.refill();

    if (this.tokens > 0) {
      this.tokens--;
      return Promise.resolve();
    }

    // If no tokens available, wait for refill
    return new Promise((resolve) => {
      this.queue.push(resolve);
      
      // Set timeout to check again after refill interval
      setTimeout(() => {
        this.refill();
        if (this.tokens > 0) {
          this.tokens--;
          const nextResolve = this.queue.shift();
          if (nextResolve) nextResolve();
        }
      }, this.refillInterval);
    });
  }
}