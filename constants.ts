import { Upgrade, Achievement, SecretPerk, TierUpgrade } from './types';

export const UPGRADES: Upgrade[] = [
  { id: 'rolling-pin', name: 'Standard Rolling Pin', description: 'Each click yields +1 more pizza.', basePrice: 15, ppsBonus: 0, ppcBonus: 1, icon: '🥖' },
  { id: 'pizza-stone', name: 'Artisan Pizza Stone', description: 'Bakes 1 pizza every second.', basePrice: 100, ppsBonus: 1, ppcBonus: 0, icon: '🪨' },
  { id: 'brick-oven', name: 'Old World Brick Oven', description: 'Significant heat boost. +5 PPS.', basePrice: 500, ppsBonus: 5, ppcBonus: 0, icon: '🧱' },
  { id: 'delivery-bike', name: 'Turbo Delivery Bike', description: 'Get those pizzas out faster! +20 PPS.', basePrice: 2000, ppsBonus: 20, ppcBonus: 0, icon: '🚲' },
  { id: 'pizzeria', name: 'Downtown Pizzeria', description: 'A dedicated storefront. +80 PPS.', basePrice: 10000, ppsBonus: 80, ppcBonus: 0, icon: '🏪' },
  { id: 'pizza-factory', name: 'Industrial Pizza Plant', description: 'Mass dough production. +400 PPS.', basePrice: 60000, ppsBonus: 400, ppcBonus: 0, icon: '🏭' },
  { id: 'pizza-bank', name: 'The Crust Vault', description: 'Invested dough grows fast. +2,500 PPS.', basePrice: 350000, ppsBonus: 2500, ppcBonus: 0, icon: '🏦' },
  { id: 'pizza-temple', name: 'Ancient Dough Temple', description: 'Divine mozzarella intervention. +15,000 PPS.', basePrice: 2000000, ppsBonus: 15000, ppcBonus: 0, icon: '⛩️' },
  { id: 'pizza-satellite', name: 'Orbiting Topping Beam', description: 'Toppings from above! +100,000 PPS.', basePrice: 15000000, ppsBonus: 100000, ppcBonus: 0, icon: '🛰️' },
  { id: 'pizza-planet', name: 'The Pepperoni Planet', description: 'A world made of meat. +600,000 PPS.', basePrice: 120000000, ppsBonus: 600000, ppcBonus: 0, icon: '🪐' },
  { id: 'dough-hole', name: 'Interstellar Dough Hole', description: 'Pull dough from the void. +4M PPS.', basePrice: 1000000000, ppsBonus: 4000000, ppcBonus: 0, icon: '🕳️' },
  { id: 'pizza-nebula', name: 'Mozzarella Nebula', description: 'Celestial cheese clouds. +25M PPS.', basePrice: 8000000000, ppsBonus: 25000000, ppcBonus: 0, icon: '☁️' },
  { id: 'crust-core', name: 'Galactic Crust Core', description: 'Heat from the galaxy center. +200M PPS.', basePrice: 70000000000, ppsBonus: 200000000, ppcBonus: 0, icon: '🌀' },
  { id: 'quantum-cheese', name: 'Quantum Cheese Strands', description: 'Exists in all states. +1.5B PPS.', basePrice: 600000000000, ppsBonus: 1500000000, ppcBonus: 0, icon: '🧪' },
  { id: 'universal-slicer', name: 'The Universal Slicer', description: 'Slices time itself. +10B PPS.', basePrice: 5000000000000, ppsBonus: 10000000000, ppcBonus: 0, icon: '⚔️' },
  { id: 'dough-dimension', name: 'The Dough Dimension', description: 'Unlimited dough source. +75B PPS.', basePrice: 45000000000000, ppsBonus: 75000000000, ppcBonus: 0, icon: '🌌' },
  { id: 'pizza-god', name: 'The Pepperoni Pantheon', description: 'Gods of the crust bless you. +500B PPS.', basePrice: 300000000000000, ppsBonus: 500000000000, ppcBonus: 0, icon: '🔱' },
  { id: 'time-oven', name: 'Chronos Blast Oven', description: 'Bake pizzas yesterday. +3.5T PPS.', basePrice: 2000000000000000, ppsBonus: 3500000000000, ppcBonus: 0, icon: '⏳' },
  { id: 'cheese-singularity', name: 'Cheesy Singularity', description: 'Density of a trillion pizzas. +25T PPS.', basePrice: 15000000000000000, ppsBonus: 25000000000000, ppcBonus: 0, icon: '🕳️🧀' },
  { id: 'pizzageddon', name: 'The Pizzageddon Device', description: 'Total culinary collapse. +200T PPS.', basePrice: 100000000000000000, ppsBonus: 200000000000000, ppcBonus: 0, icon: '☢️' },
  { id: 'dough-black-hole', name: 'Dough Black Hole', description: 'Even light cannot escape this crust. +1.2Qa PPS.', basePrice: 800000000000000000, ppsBonus: 1200000000000000, ppcBonus: 0, icon: '🌀🕳️' },
  { id: 'infinite-buffet', name: 'The Infinite Buffet', description: 'Endless rows of golden crust. +8Qa PPS.', basePrice: 5000000000000000000, ppsBonus: 8000000000000000, ppcBonus: 0, icon: '🍽️✨' },
  { id: 'dimension-slicer', name: 'Dimension Slicer', description: 'Cut through space-time for toppings. +50Qa PPS.', basePrice: 40000000000000000000, ppsBonus: 50000000000000000, ppcBonus: 0, icon: '🗡️🌌' },
  { id: 'pizza-consciousness', name: 'The Pizza Mind', description: 'The universe is just one big pizza. +400Qa PPS.', basePrice: 300000000000000000000, ppsBonus: 400000000000000000, ppcBonus: 0, icon: '🧠🍕' },
];

export const TIER_UPGRADES: TierUpgrade[] = [
  { id: 't1-pin', targetUpgradeId: 'rolling-pin', name: 'Obsidian Pin', description: 'Rolling Pins are 2x as efficient.', basePrice: 250, multiplier: 2, icon: '🖤' },
  { id: 't1-stone', targetUpgradeId: 'pizza-stone', name: 'Magma Stone', description: 'Pizza Stones are 2x as efficient.', basePrice: 1500, multiplier: 2, icon: '🔥' },
  { id: 't1-brick', targetUpgradeId: 'brick-oven', name: 'Blast Furnace', description: 'Brick Ovens are 2x as efficient.', basePrice: 8000, multiplier: 2, icon: '🧨' },
  { id: 't1-bike', targetUpgradeId: 'delivery-bike', name: 'Nitro Boosters', description: 'Delivery Bikes are 2x as efficient.', basePrice: 40000, multiplier: 2, icon: '🧪' },
  { id: 't1-pizzeria', targetUpgradeId: 'pizzeria', name: 'Drive-Thru Lane', description: 'Pizzerias are 2x as efficient.', basePrice: 200000, multiplier: 2, icon: '🚗' },
];

export const SECRET_PERKS: SecretPerk[] = [
  { id: 'oven-fortune', name: 'Oven Mitts of Fortune', description: 'Golden pizzas appear 2% more often per level.', basePrice: 50000, icon: '🧤', effectType: 'golden_frequency', power: 0.02 },
  { id: 'rocket-fuel', name: 'Pepperoni Rocket Fuel', description: 'Frenzy mode lasts 1.1x longer per level.', basePrice: 125000, icon: '🚀', effectType: 'frenzy_duration', power: 1.1 },
  { id: 'zesty-sauce', name: 'Ultra-Zesty Sauce', description: 'Frenzy multiplier increased by +2.', basePrice: 300000, icon: '🌶️', effectType: 'frenzy_power', power: 2 },
  { id: 'precision-slice', name: 'Perfect Slice Precision', description: 'Grants a 3% chance for a 5x Critical Click.', basePrice: 800000, icon: '🎯', effectType: 'critical_click', power: 0.03 }
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'slice-1', name: 'First Slice', description: '10 total pizzas.', requirement: (s) => s.totalPizzasEarned >= 10, icon: '🍕', reward: 50 },
  { id: 'slice-2', name: 'Baking Rookie', description: '1,000 total pizzas.', requirement: (s) => s.totalPizzasEarned >= 1000, icon: '🧑‍🍳', reward: 500 },
  { id: 'slice-3', name: 'Dough Professional', description: '10,000 total pizzas.', requirement: (s) => s.totalPizzasEarned >= 10000, icon: '👨‍🍳', reward: 4000 },
  { id: 'secret-access', name: 'Secret Hunter', description: '100,000 total pizzas.', requirement: (s) => s.totalPizzasEarned >= 100000, icon: '🗝️', reward: 25000 },
  { id: 'slice-4', name: 'Pizza Baron', description: '1,000,000 total pizzas.', requirement: (s) => s.totalPizzasEarned >= 1000000, icon: '💰', reward: 200000 },
  { id: 'slice-5', name: 'Crust King', description: '1 Billion total pizzas.', requirement: (s) => s.totalPizzasEarned >= 1000000000, icon: '👑', reward: 50000000 },
  { id: 'slice-6', name: 'Universal Baker', description: '1 Quadrillion total pizzas.', requirement: (s) => s.totalPizzasEarned >= 1e15, icon: '✨', reward: 1e14 },
  { id: 'click-1', name: 'Finger Workout', description: '100 clicks.', requirement: (s) => s.totalClicks >= 100, icon: '👆', reward: 200 },
  { id: 'click-2', name: 'Rapid Tapper', description: '1,000 clicks.', requirement: (s) => s.totalClicks >= 1000, icon: '⚡', reward: 5000 },
  { id: 'click-3', name: 'The Clicker God', description: '10,000 clicks.', requirement: (s) => s.totalClicks >= 10000, icon: '💥', reward: 1000000 },
  { id: 'own-pin-10', name: 'Pin Collector', description: '10 Rolling Pins.', requirement: (s) => (s.upgradesOwned['rolling-pin'] || 0) >= 10, icon: '🥖', reward: 500 },
  { id: 'own-oven-10', name: 'Master Mason', description: '10 Brick Ovens.', requirement: (s) => (s.upgradesOwned['brick-oven'] || 0) >= 10, icon: '🧱', reward: 10000 },
  { id: 'rebirth-1', name: 'New Beginning', description: 'Perform your first rebirth.', requirement: (s) => s.rebirthCount >= 1, icon: '🔄', reward: 1000000 },
  { id: 'rebirth-2', name: 'Persistent Chef', description: 'Perform 5 rebirths.', requirement: (s) => s.rebirthCount >= 5, icon: '🔁', reward: 1e9 },
  { id: 'perk-buy', name: 'Special Recipe', description: 'Buy your first Secret Perk.', requirement: (s) => Object.values(s.perksOwned).some(count => count > 0), icon: '🧉', reward: 50000 },
  { id: 'tier-upgrade', name: 'Research Genius', description: 'Buy your first Research Upgrade.', requirement: (s) => Object.values(s.tierUpgradesOwned).some(count => count > 0), icon: '🔬', reward: 100000 },
];
