import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { UPGRADES, ACHIEVEMENTS, SECRET_PERKS, TIER_UPGRADES } from './constants';
import { GameState, Upgrade, Particle, Achievement, SecretPerk, TierUpgrade } from './types';
import { formatNumber, getUpgradePrice } from './utils';

const SAVE_KEY = 'pizza_clicker_save_v3';
const SECRET_THRESHOLD = 100000;
const BASE_REBIRTH_THRESHOLD = 100000000; 

type MenuTab = 'achievements' | 'rebirth' | 'secret' | null;

interface HoverInfo {
  name: string;
  description: string;
  value: string;
  price: number;
  canAfford: boolean;
  icon?: string;
}

const App: React.FC = () => {
  // --- Game State ---
  const [pizzas, setPizzas] = useState<number>(0);
  const [totalPizzasEarned, setTotalPizzasEarned] = useState<number>(0);
  const [totalClicks, setTotalClicks] = useState<number>(0);
  const [upgradesOwned, setUpgradesOwned] = useState<Record<string, number>>({});
  const [tierUpgradesOwned, setTierUpgradesOwned] = useState<Record<string, number>>({});
  const [perksOwned, setPerksOwned] = useState<Record<string, number>>({});
  const [particles, setParticles] = useState<Particle[]>([]);
  const [goldenPizza, setGoldenPizza] = useState<{ x: number, y: number } | null>(null);
  const [activeBonus, setActiveBonus] = useState<number>(0);
  const [lastFrenzyEndTime, setLastFrenzyEndTime] = useState<number>(0);
  const [isPopping, setIsPopping] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<MenuTab>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [claimedAchievements, setClaimedAchievements] = useState<string[]>([]);
  const [rebirthCount, setRebirthCount] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Tooltip tracking
  const [hoveredItem, setHoveredItem] = useState<HoverInfo | null>(null);
  const [mouseY, setMouseY] = useState(0);

  const lastUpdateRef = useRef<number>(Date.now());
  const requestRef = useRef<number>(null);

  // --- Persistence Refs ---
  const stateRef = useRef({
    pizzas, totalPizzasEarned, totalClicks, upgradesOwned, perksOwned,
    unlockedAchievements, claimedAchievements, rebirthCount, tierUpgradesOwned
  });

  useEffect(() => {
    stateRef.current = {
      pizzas, totalPizzasEarned, totalClicks, upgradesOwned, perksOwned,
      unlockedAchievements, claimedAchievements, rebirthCount, tierUpgradesOwned
    };
  }, [pizzas, totalPizzasEarned, totalClicks, upgradesOwned, perksOwned, unlockedAchievements, claimedAchievements, rebirthCount, tierUpgradesOwned]);

  // Handle Loading Data
  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const savedState: GameState = JSON.parse(saved);
        setPizzas(savedState.pizzas ?? 0);
        setTotalPizzasEarned(savedState.totalPizzasEarned ?? 0);
        setTotalClicks(savedState.totalClicks ?? 0);
        setUpgradesOwned(savedState.upgradesOwned ?? {});
        setTierUpgradesOwned(savedState.tierUpgradesOwned ?? {});
        setPerksOwned(savedState.perksOwned ?? {});
        setUnlockedAchievements(savedState.achievementsUnlocked ?? []);
        setClaimedAchievements(savedState.achievementsClaimed ?? []);
        setRebirthCount(savedState.rebirthCount ?? 0);
      } catch (e) {
        console.error("Failed to load save", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveToDisk = useCallback(() => {
    if (!isLoaded) return;
    const s = stateRef.current;
    const stateToSave = {
      ...s, 
      lastSaved: Date.now(),
      achievementsUnlocked: s.unlockedAchievements, 
      achievementsClaimed: s.claimedAchievements
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    const saveInterval = setInterval(saveToDisk, 5000);
    return () => clearInterval(saveInterval);
  }, [isLoaded, saveToDisk]);

  // --- Multipliers ---
  const getPerkLevel = (id: string) => perksOwned[id] || 0;
  const frenzyDuration = useMemo(() => 30 * Math.pow(1.1, getPerkLevel('rocket-fuel')), [perksOwned]);
  const frenzyPower = useMemo(() => 7 + (getPerkLevel('zesty-sauce') * 2), [perksOwned]);
  const goldenChance = useMemo(() => Math.min(0.5, 0.05 + (getPerkLevel('oven-fortune') * 0.02)), [perksOwned]);
  const critChance = useMemo(() => getPerkLevel('precision-slice') * 0.03, [perksOwned]);
  
  // BALANCING: Critical hits are now 5x instead of 15x to be less OP
  const critMultiplier = 5;

  const goldenDoughMultiplier = useMemo(() => 1 + (rebirthCount * 0.5), [rebirthCount]);

  // BALANCING: Rebirth goal scaling changed from x10 to x100 per level
  const currentRebirthGoal = useMemo(() => BASE_REBIRTH_THRESHOLD * Math.pow(100, rebirthCount), [rebirthCount]);
  const rebirthProgress = useMemo(() => Math.min(100, (totalPizzasEarned / currentRebirthGoal) * 100), [totalPizzasEarned, currentRebirthGoal]);

  // --- Derived Stats ---
  const pps = useMemo(() => {
    const totalPPS = UPGRADES.reduce((acc, u) => {
      const count = upgradesOwned[u.id] || 0;
      if (count === 0) return acc;
      const tierMulti = TIER_UPGRADES
        .filter(tu => tu.targetUpgradeId === u.id)
        .reduce((m, tu) => m * Math.pow(tu.multiplier, tierUpgradesOwned[tu.id] || 0), 1);
      return acc + (u.ppsBonus * count * tierMulti);
    }, 0);
    return totalPPS * goldenDoughMultiplier * (activeBonus > 0 ? frenzyPower : 1);
  }, [upgradesOwned, tierUpgradesOwned, activeBonus, frenzyPower, goldenDoughMultiplier]);

  const ppcBase = useMemo(() => {
    const basePPC = 1 + UPGRADES.reduce((acc, u) => {
      const count = upgradesOwned[u.id] || 0;
      const tierMulti = TIER_UPGRADES
        .filter(tu => tu.targetUpgradeId === u.id)
        .reduce((m, tu) => m * Math.pow(tu.multiplier, tierUpgradesOwned[tu.id] || 0), 1);
      return acc + (u.ppcBonus * count * tierMulti);
    }, 0);
    return basePPC * goldenDoughMultiplier;
  }, [upgradesOwned, tierUpgradesOwned, goldenDoughMultiplier]);

  const tick = useCallback(() => {
    const now = Date.now();
    const dt = (now - lastUpdateRef.current) / 1000;
    lastUpdateRef.current = now;

    if (pps > 0) {
      const gain = pps * dt;
      setPizzas(prev => prev + gain);
      setTotalPizzasEarned(prev => prev + gain);
    }

    if (activeBonus > 0) {
      const nextBonus = Math.max(0, activeBonus - dt);
      if (nextBonus === 0 && activeBonus > 0) setLastFrenzyEndTime(Date.now());
      setActiveBonus(nextBonus);
    }

    ACHIEVEMENTS.forEach(achievement => {
      if (!unlockedAchievements.includes(achievement.id)) {
        const s = stateRef.current;
        const fakeState: any = { ...s, achievementsUnlocked: unlockedAchievements, achievementsClaimed: claimedAchievements };
        if (achievement.requirement(fakeState)) setUnlockedAchievements(prev => [...prev, achievement.id]);
      }
    });

    requestRef.current = requestAnimationFrame(tick);
  }, [pps, activeBonus, unlockedAchievements, claimedAchievements]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(tick);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [tick]);

  const handleGlobalMouseMove = (e: React.MouseEvent) => {
    setMouseY(e.clientY);
  };

  const handleClick = (e: React.MouseEvent) => {
    let multiplier = activeBonus > 0 ? frenzyPower : 1;
    let isCrit = false;
    if (Math.random() < critChance) { multiplier *= critMultiplier; isCrit = true; }

    const gain = ppcBase * multiplier;
    setPizzas(prev => prev + gain);
    setTotalPizzasEarned(prev => prev + gain);
    setTotalClicks(prev => prev + 1);

    setIsPopping(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setIsPopping(true)));

    const newParticle: Particle = { id: Date.now() + Math.random(), x: e.clientX, y: e.clientY, value: (isCrit ? `CRIT! x${critMultiplier} ` : '') + `+${formatNumber(gain)}` };
    setParticles(prev => [...prev.slice(-15), newParticle]);
    setTimeout(() => setParticles(prev => prev.filter(p => p.id !== newParticle.id)), 800);
  };

  const buyUpgrade = (u: Upgrade) => {
    const price = getUpgradePrice(u.basePrice, upgradesOwned[u.id] || 0);
    if (pizzas >= price) {
      setPizzas(prev => prev - price);
      setUpgradesOwned(prev => ({ ...prev, [u.id]: (prev[u.id] || 0) + 1 }));
    }
  };

  const buyTierUpgrade = (tu: TierUpgrade) => {
    const price = tu.basePrice;
    if (pizzas >= price) {
      setPizzas(prev => prev - price);
      setTierUpgradesOwned(prev => ({ ...prev, [tu.id]: 1 }));
      setHoveredItem(null);
    }
  };

  const buyPerk = (p: SecretPerk) => {
    const price = getUpgradePrice(p.basePrice, perksOwned[p.id] || 0);
    if (pizzas >= price) {
      setPizzas(prev => prev - price);
      setPerksOwned(prev => ({ ...prev, [p.id]: (prev[p.id] || 0) + 1 }));
    }
  };

  const claimAchievement = (id: string) => {
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (ach && !claimedAchievements.includes(id)) {
      setPizzas(prev => prev + ach.reward);
      setTotalPizzasEarned(prev => prev + ach.reward);
      setClaimedAchievements(prev => [...prev, id]);
    }
  };

  const handleRebirth = () => {
    if (totalPizzasEarned < currentRebirthGoal) return;
    setRebirthCount(prev => prev + 1);
    setPizzas(0);
    setUpgradesOwned({});
    setTierUpgradesOwned({});
    setActiveBonus(0);
    setLastFrenzyEndTime(0);
    setActiveTab(null);
  };

  const spawnGoldenPizza = useCallback(() => {
    setGoldenPizza({ x: Math.random() * (window.innerWidth - 100), y: Math.random() * (window.innerHeight - 100) });
    setTimeout(() => setGoldenPizza(null), 8000);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const canSpawn = activeBonus === 0 && (now - lastFrenzyEndTime) > 30000 && !goldenPizza;
      if (canSpawn && Math.random() < goldenChance) spawnGoldenPizza();
    }, 15000);
    return () => clearInterval(timer);
  }, [spawnGoldenPizza, goldenChance, activeBonus, lastFrenzyEndTime, goldenPizza]);

  const isSecretUnlocked = totalPizzasEarned >= SECRET_THRESHOLD;
  const isRebirthUnlocked = totalPizzasEarned >= currentRebirthGoal;
  const unclaimedCount = unlockedAchievements.filter(id => !claimedAchievements.includes(id)).length;

  if (!isLoaded) {
    return <div className="h-screen w-full bg-[#121212] flex items-center justify-center font-bungee text-white text-4xl">Heating Ovens...</div>;
  }

  return (
    <div 
      className="flex flex-col md:flex-row h-screen w-full bg-[#121212] text-white select-none overflow-hidden relative"
      onMouseMove={handleGlobalMouseMove}
    >
      {/* Tooltip Anchor */}
      <div 
        className="fixed z-[500] w-64 pointer-events-none transition-all duration-75"
        style={{ 
          right: '360px', 
          top: Math.max(20, Math.min(mouseY - 80, window.innerHeight - 180)),
          opacity: hoveredItem ? 1 : 0,
          visibility: hoveredItem ? 'visible' : 'hidden',
        }}
      >
        {hoveredItem && (
          <div className="w-full bg-[#1a1a1a]/95 backdrop-blur-md border-4 border-[#ef4444] rounded-2xl p-4 shadow-[0_10px_50px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl">{hoveredItem.canAfford ? (hoveredItem.icon || '📜') : '🔒'}</span>
              <h4 className="font-bungee text-sm text-yellow-400 leading-tight">{hoveredItem.name}</h4>
            </div>
            <p className="text-[10px] text-gray-400 italic mb-2 leading-tight">
              {hoveredItem.canAfford ? hoveredItem.description : '??? ??? ???'}
            </p>
            <div className="space-y-1 pt-1 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black text-gray-500 uppercase">Cost</span>
                <span className={`font-bungee text-xs ${hoveredItem.canAfford ? 'text-yellow-400' : 'text-red-500'}`}>🪙 {formatNumber(hoveredItem.price)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black text-gray-500 uppercase">Yield</span>
                <span className={`font-bungee text-xs ${hoveredItem.canAfford ? 'text-green-400' : 'text-gray-600'}`}>
                  {hoveredItem.canAfford ? hoveredItem.value : '???'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-4 items-center">
        <button 
          onClick={() => setActiveTab('achievements')}
          className="bg-[#ef4444] text-white w-20 h-20 rounded-full hover:bg-red-500 transition-all transform hover:scale-110 active:scale-95 shadow-[0_8px_0_#991b1b] border-4 border-red-300 flex items-center justify-center text-4xl relative group"
        >
          🏛️
          {unclaimedCount > 0 && <span className="absolute -top-1 -right-1 bg-yellow-400 text-black w-8 h-8 rounded-full flex items-center justify-center border-2 border-white text-sm font-black shadow-lg animate-bounce">{unclaimedCount}</span>}
          <span className="absolute -top-10 scale-0 group-hover:scale-100 bg-red-600 text-white text-[10px] py-1 px-2 rounded font-bungee transition-all">THE HUB</span>
        </button>
      </div>

      {/* Main Game Column */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-4 border-r-8 border-[#ef4444] z-10">
        <div className="text-center mb-8 z-20">
          <div className="chalkboard px-8 py-6 rounded-2xl border-white/20 shadow-2xl overflow-hidden w-[400px] md:w-[420px] flex flex-col items-center">
            <span className="text-[12px] text-yellow-500 font-bungee uppercase tracking-[0.2em] opacity-80">Banked Dough</span>
            <h1 className="text-5xl md:text-6xl font-bungee text-white drop-shadow-[0_4px_0_#ef4444] leading-none tabular-nums">{formatNumber(pizzas)}</h1>
            <div className="flex justify-between w-full border-t border-white/10 pt-4 mt-4">
              <div className="flex flex-col items-center flex-1">
                <span className="text-[9px] text-gray-500 uppercase font-black mb-1">Per Second</span>
                <p className="text-red-400 font-bungee text-xl leading-none">{formatNumber(pps)}</p>
              </div>
              <div className="w-[1px] bg-white/10 h-10 self-center mx-4" />
              <div className="flex flex-col items-center flex-1">
                <span className="text-[9px] text-gray-500 uppercase font-black mb-1">Per Click</span>
                <p className="text-orange-400 font-bungee text-xl leading-none">{formatNumber(ppcBase * (activeBonus > 0 ? frenzyPower : 1))}</p>
              </div>
            </div>
          </div>
        </div>

        <div onClick={handleClick} className={`relative cursor-pointer transition-transform duration-75 active:scale-90 ${isPopping ? 'animate-pop' : ''}`}>
          <svg viewBox="0 0 100 100" className="w-64 h-64 md:w-80 md:h-80 filter drop-shadow(0 30px 60px rgba(0,0,0,0.8))">
            <circle cx="50" cy="50" r="48" fill="#D97706" /><circle cx="50" cy="50" r="44" fill="#FBBF24" /><circle cx="50" cy="50" r="40" fill="#EF4444" />
            <circle cx="50" cy="50" r="38" fill="#FEF3C7" /><circle cx="35" cy="35" r="6" fill="#B91C1C" /><circle cx="65" cy="30" r="7" fill="#B91C1C" />
            <circle cx="50" cy="55" r="8" fill="#B91C1C" /><circle cx="30" cy="65" r="6" fill="#B91C1C" /><circle cx="70" cy="60" r="5" fill="#B91C1C" />
          </svg>
          {activeBonus > 0 && <div className="absolute inset-0 rounded-full bg-yellow-400/40 animate-pulse ring-[12px] ring-yellow-400/50 shadow-[0_0_100px_#fbbf24]" />}
        </div>
        {activeBonus > 0 && <div className="mt-8 bg-red-600 text-white px-10 py-3 rounded-2xl font-bungee animate-bounce shadow-2xl border-4 border-yellow-400">🔥 {frenzyPower}x FRENZY!</div>}
        {particles.map(p => <div key={p.id} className="particle font-bungee text-4xl text-yellow-400 z-50" style={{ left: p.x, top: p.y }}>{p.value}</div>)}
        {goldenPizza && <div className="golden-pizza absolute z-[100] text-6xl" style={{ left: goldenPizza.x, top: goldenPizza.y }} onClick={(e) => { e.stopPropagation(); setGoldenPizza(null); setActiveBonus(frenzyDuration); }}>🍕✨</div>}
      </div>

      {/* Right Column: Upgrades */}
      <div className="w-full md:w-[350px] bg-[#2a2a2a] overflow-y-auto flex flex-col shadow-inner z-20 border-l-4 border-white/10 relative">
        <div className="p-4 bg-white sticky top-0 z-20 shadow-lg border-b-4 border-red-500">
          <h2 className="text-2xl font-bungee text-black text-center">Kitchen</h2>
          <div className="text-center mt-2 px-4 py-2 bg-gradient-to-b from-yellow-50 to-orange-50 rounded-2xl border-2 border-orange-200 shadow-sm">
            <span className="text-[10px] text-orange-800 font-black uppercase tracking-widest block opacity-70">Lifetime Bake</span>
            <p className="text-orange-600 font-bungee text-lg tabular-nums">🍕 {formatNumber(totalPizzasEarned)}</p>
          </div>
        </div>
        
        <div className="p-4 bg-black/40 border-b border-white/5">
          <h3 className="text-[10px] font-bungee text-gray-500 uppercase tracking-widest mb-3">Research Lab</h3>
          <div className="grid grid-cols-4 gap-2">
            {TIER_UPGRADES.filter(tu => (tierUpgradesOwned[tu.id] || 0) === 0).map(tu => {
              const price = tu.basePrice; 
              const canAfford = pizzas >= price;
              if ((upgradesOwned[tu.targetUpgradeId] || 0) === 0) return null;
              return (
                <button 
                  key={tu.id} 
                  onClick={() => buyTierUpgrade(tu)} 
                  onMouseEnter={() => setHoveredItem({ name: tu.name, description: tu.description, value: `x${tu.multiplier} Efficiency`, icon: tu.icon, price, canAfford })}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl border-b-4 transition-all relative ${canAfford ? 'bg-gray-750 border-gray-900 hover:bg-gray-700 shadow-lg' : 'bg-black/50 opacity-50 grayscale cursor-pointer'}`}
                >
                  <span className="text-2xl">{tu.icon}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="p-3 space-y-3">
          <h3 className="text-[10px] font-bungee text-gray-500 uppercase tracking-widest px-1">Buildings</h3>
          {UPGRADES.map(u => {
            const owned = upgradesOwned[u.id] || 0;
            const price = getUpgradePrice(u.basePrice, owned);
            const canAfford = pizzas >= price;
            const tierMulti = TIER_UPGRADES.filter(tu => tu.targetUpgradeId === u.id).reduce((m, tu) => m * Math.pow(tu.multiplier, tierUpgradesOwned[tu.id] || 0), 1);
            const ppsValue = u.ppsBonus * tierMulti;
            const ppcValue = u.ppcBonus * tierMulti;
            const displayValue = ppsValue > 0 ? `+${formatNumber(ppsValue)} PPS` : `+${formatNumber(ppcValue)} PPC`;
            return (
              <button 
                key={u.id} 
                onClick={() => buyUpgrade(u)} 
                onMouseEnter={() => setHoveredItem({ name: u.name, description: u.description, value: displayValue, icon: u.icon, price, canAfford })}
                onMouseLeave={() => setHoveredItem(null)}
                className={`w-full flex items-center p-3 rounded-xl border-b-4 transition-all transform active:scale-95 cursor-pointer ${canAfford ? 'bg-gray-800 border-gray-900 hover:bg-gray-750' : 'bg-black/50 grayscale opacity-70'}`}
              >
                <div className="text-3xl mr-3">{u.icon}</div>
                <div className="flex-1 text-left overflow-hidden">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bungee text-[11px] text-white truncate max-w-[150px]">{u.name}</h3>
                    <span className="text-red-500 font-bungee text-[10px] whitespace-nowrap ml-2">LV {owned}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`font-bungee text-xs ${canAfford ? 'text-yellow-400' : 'text-red-600 opacity-60'}`}>🪙 {formatNumber(price)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hub Modal */}
      {activeTab && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#1a1a1a] w-full max-w-4xl max-h-[90vh] rounded-[40px] border-8 border-red-600 flex flex-col shadow-[0_0_100px_rgba(239,68,68,0.3)] relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="sticky top-0 z-[210] flex bg-[#050505] border-b-8 border-red-600 overflow-x-auto no-scrollbar shrink-0">
              <button onClick={() => setActiveTab('achievements')} className={`flex-1 min-w-[120px] py-8 font-bungee text-sm md:text-xl transition-all ${activeTab === 'achievements' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>🏆 Trophies</button>
              <button onClick={() => setActiveTab('rebirth')} className={`flex-1 min-w-[120px] py-8 font-bungee text-sm md:text-xl transition-all ${activeTab === 'rebirth' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>🔄 Rebirth</button>
              <button onClick={() => setActiveTab('secret')} disabled={!isSecretUnlocked} className={`flex-1 min-w-[120px] py-8 font-bungee text-sm md:text-xl transition-all ${activeTab === 'secret' ? 'bg-yellow-500 text-black' : isSecretUnlocked ? 'text-gray-500 hover:text-white' : 'opacity-20'}`}>✨ Secret</button>
              <button onClick={() => setActiveTab(null)} className="bg-red-950 text-white w-24 text-4xl hover:bg-red-800 transition-colors shrink-0 flex items-center justify-center">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
              {activeTab === 'achievements' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-end border-b-4 border-yellow-400/20 pb-4">
                    <h3 className="text-5xl font-bungee text-yellow-400">Trophy Case</h3>
                    <div className="bg-black/40 px-6 py-2 rounded-2xl border-2 border-white/10 font-bungee text-2xl text-white">
                      {unlockedAchievements.length} / {ACHIEVEMENTS.length}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {ACHIEVEMENTS.map(a => {
                      const isUnlocked = unlockedAchievements.includes(a.id);
                      const isClaimed = claimedAchievements.includes(a.id);
                      return (
                        <div key={a.id} className={`flex items-center p-8 rounded-[40px] border-4 transition-all ${isUnlocked ? 'bg-gray-800 border-yellow-400/40 shadow-xl' : 'bg-black/40 opacity-40 border-white/5'}`}>
                          <div className="text-7xl mr-8">{isUnlocked ? a.icon : '❓'}</div>
                          <div className="flex-1">
                            <h4 className="font-bungee text-3xl mb-1">{a.name}</h4>
                            <p className="text-base text-gray-400 italic font-medium">{a.description}</p>
                          </div>
                          {isUnlocked && !isClaimed && <button onClick={() => claimAchievement(a.id)} className="bg-red-600 px-10 py-4 rounded-2xl font-bungee text-xl shadow-lg animate-pulse hover:scale-105 transition-all">CLAIM 🍕{formatNumber(a.reward)}</button>}
                          {isClaimed && <span className="text-yellow-400 font-bungee text-2xl pr-4 uppercase tracking-wider">Claimed</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {activeTab === 'rebirth' && (
                <div className="flex flex-col items-center max-w-2xl mx-auto py-8">
                  <h3 className="text-6xl font-bungee text-white mb-4 text-center">REBIRTH #{rebirthCount + 1}</h3>
                  <p className="text-gray-400 text-center mb-10 font-marker text-xl italic text-yellow-500">Sacrifice your shop for a PERMANENT +0.5x Multiplier boost!</p>
                  <div className="w-full mb-12 bg-black/60 p-10 rounded-[50px] border-4 border-white/10 shadow-2xl relative">
                    <div className="flex justify-between items-end mb-4 px-4">
                      <span className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Goal to Rebirth</span>
                      <span className="text-4xl font-bungee text-green-400">{Math.floor(rebirthProgress)}%</span>
                    </div>
                    <div className="h-28 bg-gray-950 rounded-[35px] overflow-hidden border-4 border-white/5 p-2 relative shadow-inner">
                      <div className="h-full bg-gradient-to-r from-green-700 via-green-400 to-green-700 rounded-[28px] transition-all duration-1000" style={{ width: `${rebirthProgress}%` }} />
                      <div className="absolute inset-0 flex items-center justify-center font-bungee text-2xl md:text-3xl text-white pointer-events-none drop-shadow-md text-center">{formatNumber(totalPizzasEarned)} / {formatNumber(currentRebirthGoal)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8 w-full mb-12">
                    <div className="bg-gray-800/50 p-8 rounded-[35px] border-4 border-white/10 text-center shadow-lg">
                      <span className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Current Multiplier</span>
                      <p className="text-4xl font-bungee text-yellow-400">{goldenDoughMultiplier.toFixed(1)}x</p>
                    </div>
                    <div className="bg-gray-800/50 p-8 rounded-[35px] border-4 border-green-500/30 text-center shadow-lg">
                      <span className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Next Multiplier</span>
                      <p className="text-4xl font-bungee text-green-400">{(goldenDoughMultiplier + 0.5).toFixed(1)}x</p>
                    </div>
                  </div>
                  <button onClick={handleRebirth} disabled={!isRebirthUnlocked} className={`w-full font-bungee text-5xl py-14 rounded-[60px] shadow-[0_20px_0_#991b1b] active:translate-y-4 active:shadow-none transition-all ${isRebirthUnlocked ? 'bg-green-600 hover:bg-green-500 text-white animate-pulse' : 'bg-gray-800 text-gray-600 grayscale cursor-not-allowed opacity-50'}`}>{isRebirthUnlocked ? 'REBIRTH NOW' : 'LOCKED'}</button>
                </div>
              )}
              {activeTab === 'secret' && (
                <div className="space-y-12">
                  <div className="flex justify-between items-center border-b-4 border-yellow-400/20 pb-6">
                    <h3 className="text-5xl font-bungee text-yellow-400">Forbidden Vault</h3>
                    <div className="bg-yellow-400 text-black px-8 py-4 rounded-[30px] border-4 border-yellow-600 shadow-xl flex flex-col items-center justify-center">
                      <span className="text-[10px] font-black uppercase tracking-tighter opacity-60">Chef Balance</span>
                      <span className="font-bungee text-3xl truncate max-w-[200px]">🍕 {formatNumber(pizzas)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {SECRET_PERKS.map(p => {
                      const owned = perksOwned[p.id] || 0;
                      const price = getUpgradePrice(p.basePrice, owned);
                      const canAfford = pizzas >= price;
                      return (
                        <button key={p.id} onClick={() => buyPerk(p)} 
                          onMouseEnter={() => setHoveredItem({ name: p.name, description: p.description, value: `Perk Upgrade`, icon: p.icon, price, canAfford })}
                          onMouseLeave={() => setHoveredItem(null)}
                          className={`flex items-start p-10 rounded-[50px] border-4 transition-all transform hover:translate-y-[-4px] active:translate-y-0 ${canAfford ? 'bg-yellow-900/10 border-yellow-600/40 shadow-lg' : 'bg-black/60 opacity-30 border-transparent grayscale cursor-not-allowed'}`}>
                          <div className="text-6xl mr-8">{p.icon}</div>
                          <div className="flex-1 text-left">
                            <div className="flex justify-between items-center mb-2"><h4 className="font-bungee text-2xl text-yellow-400">{p.name}</h4><span className="bg-yellow-400 text-black text-sm px-3 py-1 rounded-lg font-black">LV {owned}</span></div>
                            <p className="font-bungee text-2xl text-white">🪙 {formatNumber(price)}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
