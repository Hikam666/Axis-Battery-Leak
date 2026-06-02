import { useState, useMemo, Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

import { Robot } from './components/Robot';
import { Laboratory } from './components/Laboratory';
import { SensorTarget } from './components/SensorTarget';
import { LaserHazard } from './components/LaserHazard';

// Structured spawn positions for the grounded layout
function getSpawnPositions(count) {
  const possibleSpawns = [
    // On top of central workstations (Desk height is 2, slightly floating above desk)
    [0, 2.2, 20], [0, 2.2, 0], [0, 2.2, -20],
    // Front of left server racks (Rack base is 0, on the floor or mounted slightly up)
    [-9, 0.2, 30], [-9, 0.2, 15], [-9, 0.2, 0], [-9, 0.2, -15], [-9, 0.2, -30],
    // Front of right server racks
    [9, 0.2, 30], [9, 0.2, 15], [9, 0.2, 0], [9, 0.2, -15], [9, 0.2, -30],
  ];
  const shuffled = [...possibleSpawns].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export default function App() {
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState('menu');
  const [collectedTargets, setCollectedTargets] = useState([]);
  const [battery, setBattery] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [username, setUsername] = useState("");
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [inputName, setInputName] = useState("");
  const audioRef = useRef(null);

  const maxLevel = 10;
  const itemsToFind = level; 

  const targetPositions = useMemo(() => getSpawnPositions(itemsToFind), [level, itemsToFind]);
  
  const hazards = useMemo(() => {
    const arr = [];
    // Start lasers at Level 2. Max 6 lasers.
    const numHazards = Math.max(0, Math.min(level - 1, 6));
    
    // Hardcoded safe spots that do not overlap with the tables at [0,0,20], [0,0,0], and [0,0,-20]
    const safePositions = [
      [0, 0, 10],
      [0, 0, -10],
      [0, 0, 30],
      [0, 0, -30],
      [6, 0, 0],   // Offset to the right
      [-6, 0, -20] // Offset to the left
    ];

    for (let i = 0; i < numHazards; i++) {
       arr.push(safePositions[i]); 
    }
    return arr;
  }, [level]);

  const score = collectedTargets.length;

  // Load from Local Storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('axis_robotics_save');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.username) setUsername(data.username);
        if (data.unlockedLevel) setUnlockedLevel(data.unlockedLevel);
      }
    } catch (e) {
      console.error('Failed to load save data', e);
    }
  }, []);

  // Save to Local Storage when progress changes
  useEffect(() => {
    if (username) {
      localStorage.setItem('axis_robotics_save', JSON.stringify({
        username,
        unlockedLevel
      }));
    }
  }, [username, unlockedLevel]);

  // Initialize Background Music
  useEffect(() => {
    audioRef.current = new Audio('/backsound1.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3; // 30% volume so it doesn't overpower

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Sync mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Drain battery
  useEffect(() => {
    if (gameState === 'playing') {
      const drainIntervalMs = Math.max(200, 1600 - (level * 120)); // Slow at start, fast at high levels
      const interval = setInterval(() => {
        setBattery(b => {
          if (b <= 1) {
            setGameState('game_over_battery');
            return 0;
          }
          return b - 1;
        });
      }, drainIntervalMs); 
      return () => clearInterval(interval);
    }
  }, [gameState, level]);

  const handleCollect = (index) => {
    if (collectedTargets.includes(index)) return;
    
    setCollectedTargets(prev => {
      const newCollected = [...prev, index];
      if (newCollected.length >= itemsToFind) {
        if (level >= maxLevel) {
          if (maxLevel > unlockedLevel) setUnlockedLevel(maxLevel);
          setGameState('game_over');
        } else {
          if (level + 1 > unlockedLevel) {
            setUnlockedLevel(level + 1);
          }
          setGameState('level_complete');
        }
      }
      return newCollected;
    });
    // Heal 25% battery per collection
    setBattery(b => Math.min(100, b + 25));
  };

  const handleLaserHit = () => {
    if (gameState !== 'playing') return;
    setBattery(0);
    setGameState('game_over_laser');
  };

  const nextLevel = () => {
    setLevel(l => l + 1);
    setCollectedTargets([]);
    setBattery(100);
    setGameState('playing');
    setGameKey(k => k + 1);
    if (audioRef.current && audioRef.current.paused) audioRef.current.play().catch(console.error);
  };

  const startGame = (startLevel = 1) => {
    setLevel(startLevel);
    setCollectedTargets([]);
    setBattery(100);
    setGameState('playing');
    setGameKey(k => k + 1);
    if (audioRef.current && audioRef.current.paused) audioRef.current.play().catch(console.error);
  };

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (inputName.trim()) {
      setUsername(inputName.trim());
    }
  };

  const restartCurrentLevel = () => {
    setCollectedTargets([]);
    setBattery(100);
    setGameState('playing');
    setGameKey(k => k + 1);
    if (audioRef.current && audioRef.current.paused) audioRef.current.play().catch(console.error);
  };

  return (
    <>
      <div className="overlay">
        <div className="logo-container">
          <img src="/logo.avif" alt="Axis Robotics Logo" className="logo" />
          <div>
            <h1>AXIS ROBOTICS</h1>
            <p>FACILITY CORRIDOR</p>
          </div>
        </div>
        <div style={{ marginTop: '15px', padding: '10px', border: '1px solid #39FF14', background: 'rgba(57,255,20,0.1)' }}>
          <h2 style={{ margin: '0 0 5px 0' }}>CURRENT OBJECTIVE:</h2>
          <p>Collect data modules before battery dies!</p>
          <p>LEVEL: {level} / {maxLevel}</p>
          <p>SENSORS RECOVERED: {score} / {itemsToFind}</p>
        </div>
        
        {/* Battery UI */}
        <div style={{ marginTop: '15px', padding: '10px', border: '1px solid #ff0000', background: 'rgba(255,0,0,0.1)', width: '250px' }}>
          <h2 style={{ margin: '0 0 5px 0', color: battery > 20 ? '#39FF14' : '#ff3333' }}>BATTERY: {battery}%</h2>
          <div style={{ width: '100%', height: '15px', background: '#333' }}>
            <div style={{ width: `${battery}%`, height: '100%', background: battery > 20 ? '#39FF14' : '#ff3333', transition: 'width 0.2s, background 0.2s' }}></div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <p>Movement: W, A, S, D | Jump: Space</p>
            <p>Look Around: Arrow Keys (Up, Down, Left, Right)</p>
            <p>Interact: 'E'</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', pointerEvents: 'auto' }}>
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              style={{ padding: '8px 15px', background: '#222', color: '#fff', border: '1px solid #39FF14', cursor: 'pointer', fontFamily: 'monospace' }}
            >
              {isMuted ? 'UNMUTE SOUND' : 'MUTE SOUND'}
            </button>
            {gameState === 'playing' && (
              <>
                <button 
                  onClick={restartCurrentLevel} 
                  style={{ padding: '8px 15px', background: '#222', color: '#fff', border: '1px solid #ff3333', cursor: 'pointer', fontFamily: 'monospace' }}
                >
                  RESTART LEVEL
                </button>
                <button 
                  onClick={() => setGameState('menu')} 
                  style={{ padding: '8px 15px', background: '#222', color: '#fff', border: '1px solid #FFB140', cursor: 'pointer', fontFamily: 'monospace' }}
                >
                  RETURN TO MENU
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {gameState === 'menu' && (
        <div className="menu-screen">
          <img src="/logo.avif" alt="Axis Logo" style={{ height: '80px', marginBottom: '20px' }} />
          <h1>AXIS ROBOTICS: BATTERY LEAK</h1>
          
          {!username ? (
            <div style={{ marginTop: '20px', background: 'rgba(0,0,0,0.5)', padding: '20px', border: '1px solid #39FF14' }}>
              <h2>ENTER OPERATOR ID</h2>
              <form onSubmit={handleUsernameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  placeholder="Enter Username..." 
                  value={inputName} 
                  onChange={(e) => setInputName(e.target.value)} 
                  maxLength={15}
                  style={{ padding: '10px', fontSize: '18px', background: '#111', color: '#39FF14', border: '1px solid #39FF14', textAlign: 'center', width: '250px', outline: 'none' }}
                />
                <button type="submit">SUBMIT</button>
              </form>
            </div>
          ) : (
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <h2>Welcome back, Operator {username}</h2>
              <p style={{ maxWidth: '600px', lineHeight: '1.6' }}>
                Your battery is leaking! You must navigate the corridor and collect all data modules to proceed. Beware of the automated security lasers.
              </p>
              
              <button onClick={() => startGame(unlockedLevel)} style={{ fontSize: '20px', padding: '15px 30px' }}>
                CONTINUE (LEVEL {unlockedLevel})
              </button>

              <div style={{ marginTop: '20px', background: 'rgba(0,0,0,0.5)', padding: '20px', border: '1px solid #555', width: '100%' }}>
                <h3>REPLAY PREVIOUS LEVELS</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '400px', margin: '10px auto 0' }}>
                  {Array.from({ length: unlockedLevel }, (_, i) => i + 1).map(lv => (
                    <button 
                      key={lv} 
                      onClick={() => startGame(lv)}
                      style={{ padding: '8px 15px', background: '#111', border: '1px solid #39FF14', color: '#39FF14', cursor: 'pointer', fontSize: '14px' }}
                    >
                      LV {lv}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {gameState === 'level_complete' && (
        <div className="menu-screen">
          <h2>LEVEL {level} COMPLETE</h2>
          <p>Modules secured. Battery recharged.</p>
          <button onClick={nextLevel}>PROCEED TO LEVEL {level + 1}</button>
        </div>
      )}

      {gameState === 'game_over' && (
        <div className="menu-screen">
          <h2>MISSION ACCOMPLISHED</h2>
          <p>You have recovered all sensors across 10 sectors.</p>
          <button onClick={() => setGameState('menu')}>RETURN TO MENU</button>
        </div>
      )}

      {gameState === 'game_over_battery' && (
        <div className="menu-screen">
          <h2 style={{ color: 'red' }}>SYSTEM FAILURE</h2>
          <p>Battery depleted. Robot shut down.</p>
          <button onClick={restartCurrentLevel}>RESTART LEVEL {level}</button>
        </div>
      )}

      {gameState === 'game_over_laser' && (
        <div className="menu-screen">
          <h2 style={{ color: 'red' }}>SECURITY BREACH</h2>
          <p>Robot destroyed by high-energy laser.</p>
          <button onClick={restartCurrentLevel}>RESTART LEVEL {level}</button>
        </div>
      )}
      
      <Canvas camera={{ position: [0, 2, 6], fov: 75 }}>
        <color attach="background" args={['#ffffff']} />
        
        {/* Moody but visible lighting for the dark metal environment */}
        <ambientLight intensity={0.4} color="#ffffff" />
        <directionalLight position={[10, 20, 10]} intensity={1.0} color="#ffffff" />
        <directionalLight position={[-15, -10, -15]} intensity={0.6} color="#ffffff" />
        
        <Suspense fallback={null}>
          <Physics key={gameKey} gravity={[0, -9.81, 0]}>
            {gameState === 'playing' && (
              <Robot 
                level={level}
                position={[0, 2, 35]} 
                targets={targetPositions.filter((_, i) => !collectedTargets.includes(i))} 
                onCollect={(targetIndex) => {
                  let remainingCount = 0;
                  for (let i = 0; i < targetPositions.length; i++) {
                    if (!collectedTargets.includes(i)) {
                      if (remainingCount === targetIndex) {
                        handleCollect(i);
                        break;
                      }
                      remainingCount++;
                    }
                  }
                }}
              />
            )}
            
            <Laboratory />
            
            {gameState === 'playing' && targetPositions.map((pos, index) => (
              <SensorTarget 
                key={`${level}-${index}`} 
                position={pos} 
                collected={collectedTargets.includes(index)}
              />
            ))}

            {gameState === 'playing' && hazards.map((pos, index) => (
              <LaserHazard key={`hazard-${index}`} level={level} position={pos} onHit={handleLaserHit} />
            ))}
          </Physics>
        </Suspense>

        <EffectComposer>
          <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.0} />
        </EffectComposer>
      </Canvas>
    </>
  );
}
