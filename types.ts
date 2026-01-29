
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  ppsBonus: number; // Pizzas Per Second
  ppcBonus: number; // Pizzas Per Click
  icon: string;
}

export interface TierUpgrade {
  id: string;
  targetUpgradeId: string;
  name: string;
  description: string;
  basePrice: number;
  multiplier: number;
  icon: string;
}

export interface SecretPerk {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  icon: string;
  effectType: 'frenzy_duration' | 'frenzy_power' | 'golden_frequency' | 'critical_click';
  power: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement: (state: GameState) => boolean;
  icon: string;
  reward: number;
}

export interface GameState {
  pizzas: number;
  totalPizzasEarned: number;
  totalClicks: number;
  multiplier: number;
  upgradesOwned: Record<string, number>;
  perksOwned: Record<string, number>;
  tierUpgradesOwned: Record<string, number>;
  lastSaved: number;
  achievementsUnlocked: string[];
  achievementsClaimed: string[];
  goldenDough: number;
  rebirthCount: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  value: string;
}
