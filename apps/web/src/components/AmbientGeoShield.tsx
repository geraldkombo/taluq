/* Work Product of Gerald Kombo. Trading as Gerald Kombo (Digital Services). Intellectual Property Rights Reserved. */
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Shield, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const LOCATIONS = [
  // Nairobi
  {
    name: "Times Tower (Treasury/SHIF)",
    lat: -1.2912,
    lng: 36.8233,
    alert: "Sovereign Settlement Layer Active: Times Tower Hub. Treasury and SHIF compliance verified.",
    triggerId: "times_tower"
  },
  {
    name: "Expressway Mlolongo",
    lat: -1.3934,
    lng: 36.9312,
    alert: "Sovereign Settlement Layer Active: Expressway Infrastructure secured.",
    triggerId: "expressway_mlolongo"
  },
  {
    name: "Mombasa Road (EPRA)",
    lat: -1.3321,
    lng: 36.8645,
    alert: "Sovereign Settlement Layer Active: Mombasa Road EPRA node. Logistics settlement enabled.",
    triggerId: "mombasa_road_epra"
  },
  // Mombasa
  {
    name: "Port of Mombasa (Kilindini)",
    lat: -4.0531,
    lng: 39.6548,
    alert: "Sovereign Settlement Layer Active: Port of Mombasa Gateway. Maritime trade secured.",
    triggerId: "mombasa_port"
  },
  {
    name: "Treasury Square Mombasa",
    lat: -4.0664,
    lng: 39.6753,
    alert: "Sovereign Settlement Layer Active: Treasury Square Fiscal Hub.",
    triggerId: "mombasa_treasury"
  },
  // Kisumu
  {
    name: "Kisumu Port",
    lat: -0.1014,
    lng: 34.7478,
    alert: "Sovereign Settlement Layer Active: Kisumu Port Regional Hub.",
    triggerId: "kisumu_port"
  },
  {
    name: "Kisumu CBD",
    lat: -0.1022,
    lng: 34.7516,
    alert: "Sovereign Settlement Layer Active: Kisumu Regional Treasury.",
    triggerId: "kisumu_cbd"
  },
  // Nakuru & Eldoret
  {
    name: "Nakuru CBD",
    lat: -0.2827,
    lng: 36.0711,
    alert: "Sovereign Settlement Layer Active: Nakuru Economic Hub.",
    triggerId: "nakuru_cbd"
  },
  {
    name: "Eldoret CBD",
    lat: 0.5143,
    lng: 35.2697,
    alert: "Sovereign Settlement Layer Active: Eldoret North-Rift Hub.",
    triggerId: "eldoret_cbd"
  }
];

export function AmbientGeoShield() {
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const [triggeredIds, setTriggeredIds] = useState<Set<string>>(new Set());
  const [isSimulating, setIsSimulating] = useState(false);

  const triggerVoice = useCallback(async (text: string, triggerId: string) => {
    if (triggeredIds.has(triggerId)) return;
    
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return;
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
      
      setTriggeredIds(prev => new Set(prev).add(triggerId));
    } catch (err) {
      console.error("Voice alert failed", err);
    }
  }, [triggeredIds]);

  const checkProximity = useCallback((lat: number, lng: number) => {
    for (const loc of LOCATIONS) {
      const dist = Math.sqrt(Math.pow(lat - loc.lat, 2) + Math.pow(lng - loc.lng, 2));
      if (dist < 0.005) { // Roughly 500m
        if (activeAlert !== loc.name) {
          setActiveAlert(loc.name);
          triggerVoice(loc.alert, loc.triggerId);
        }
        return;
      }
    }
    setActiveAlert(null);
  }, [activeAlert, triggerVoice]);

  useEffect(() => {
    if (isSimulating) {
      let step = 0;
      const interval = setInterval(() => {
        const loc = LOCATIONS[step % LOCATIONS.length];
        checkProximity(loc.lat, loc.lng);
        step++;
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isSimulating, checkProximity]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.div 
        className={`p-4 rounded-xl border-2 ${activeAlert ? 'bg-orange-500/20 border-orange-500' : 'bg-black/80 border-zinc-800'} backdrop-blur-md shadow-2xl`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${activeAlert ? 'bg-orange-500 animate-pulse' : 'bg-zinc-800'}`}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-[180px]">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Pan-Kenyan Geo-Shield</h3>
            <p className="text-sm font-medium text-white truncate">
              {activeAlert ? `Active: ${activeAlert}` : 'Scanning Republic Grid...'}
            </p>
          </div>
          <button 
            onClick={() => setIsSimulating(!isSimulating)}
            className="ml-2 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
            title={isSimulating ? "Stop Simulation" : "Start Simulation"}
          >
            <MapPin className={`w-4 h-4 ${isSimulating ? 'text-orange-500' : 'text-zinc-400'}`} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
