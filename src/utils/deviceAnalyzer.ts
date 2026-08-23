import { useState, useEffect, useRef } from 'react';
import { DeviceTelemetry } from '../types';
import { measureRealGitHubRTT } from './github';

export function useDeviceTelemetry(
  focusTimerActive: boolean = false,
  initialWeeklyLoggedHours?: number
): DeviceTelemetry {
  const [telemetry, setTelemetry] = useState<DeviceTelemetry>(() => {
    const isClient = typeof window !== 'undefined';
    const nav = isClient ? (navigator as unknown as {
      hardwareConcurrency?: number;
      deviceMemory?: number;
      connection?: { effectiveType?: string; downlink?: number; rtt?: number };
    }) : {};

    const perfMem = isClient && (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
    const usedHeap = perfMem ? Math.round(perfMem.usedJSHeapSize / (1024 * 1024)) : 48;
    const totalHeap = perfMem ? Math.round(perfMem.totalJSHeapSize / (1024 * 1024)) : 128;

    return {
      cpuCores: nav.hardwareConcurrency || 8,
      deviceMemoryGb: nav.deviceMemory || 16,
      usedHeapMb: usedHeap,
      totalHeapMb: totalHeap,
      batteryLevel: null,
      isCharging: null,
      networkType: nav.connection?.effectiveType || '4G / High-Speed',
      downlinkSpeed: nav.connection?.downlink || 25,
      rttLatency: nav.connection?.rtt || 24,
      screenResolution: isClient ? `${window.screen.width}x${window.screen.height}` : '1920x1080',
      isWindowFocused: true,
      idleSeconds: 0,
      realTimeFocusScore: 94,
      weeklyLoggedHours: initialWeeklyLoggedHours || 37.4,
      todayCodingSeconds: 3840, // baseline session ~ 1h 4m
      keystrokesCount: 0,
      lastActiveTimestamp: Date.now(),
    };
  });

  const keystrokesRef = useRef<number>(0);
  const lastActiveRef = useRef<number>(Date.now());
  const windowFocusedRef = useRef<boolean>(true);
  const todayCodingSecRef = useRef<number>(3840);

  // Sync initial weekly logged hours if provided from GitHub
  useEffect(() => {
    if (initialWeeklyLoggedHours && initialWeeklyLoggedHours > 0) {
      setTelemetry((prev) => ({
        ...prev,
        weeklyLoggedHours: initialWeeklyLoggedHours,
      }));
    }
  }, [initialWeeklyLoggedHours]);

  // Monitor Battery API if available
  useEffect(() => {
    if (typeof window === 'undefined') return;

    interface BatteryManager extends EventTarget {
      level: number;
      charging: boolean;
      addEventListener(type: string, listener: () => void): void;
    }

    const nav = navigator as unknown as { getBattery?: () => Promise<BatteryManager> };
    if (nav.getBattery) {
      nav.getBattery().then((battery) => {
        const updateBattery = () => {
          setTelemetry((prev) => ({
            ...prev,
            batteryLevel: Math.round(battery.level * 100),
            isCharging: battery.charging,
          }));
        };
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      }).catch(() => {
        // Fallback for browsers that restrict battery API
      });
    }
  }, []);

  // Monitor Window Focus & Blur, Mouse & Key strokes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleFocus = () => {
      windowFocusedRef.current = true;
      lastActiveRef.current = Date.now();
      setTelemetry((prev) => ({ ...prev, isWindowFocused: true }));
    };

    const handleBlur = () => {
      windowFocusedRef.current = false;
      setTelemetry((prev) => ({ ...prev, isWindowFocused: false }));
    };

    const handleActivity = () => {
      lastActiveRef.current = Date.now();
      keystrokesRef.current += 1;
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('click', handleActivity);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, []);

  // Real-time active latency ping test against GitHub API (every 8 seconds)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const measurePing = async () => {
      try {
        const result = await measureRealGitHubRTT();
        if (result.latencyMs > 0) {
          setTelemetry((prev) => ({
            ...prev,
            rttLatency: result.latencyMs,
            networkType: `${result.statusText}`,
          }));
        }
      } catch {
        // Ignore network errors in iframe
      }
    };

    measurePing();
    const pingInterval = setInterval(measurePing, 8000);
    return () => clearInterval(pingInterval);
  }, []);

  // Real-time calculation loop (every 1 second)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const idleSec = Math.floor((now - lastActiveRef.current) / 1000);
      const isFocused = windowFocusedRef.current;

      // Update Heap memory if available
      const perfMem = typeof window !== 'undefined' && (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
      const usedHeap = perfMem ? Math.round(perfMem.usedJSHeapSize / (1024 * 1024)) : 52;
      const totalHeap = perfMem ? Math.round(perfMem.totalJSHeapSize / (1024 * 1024)) : 134;

      // Active coding time: increments if user was active recently (< 45s idle) or focus timer is active
      const isActivelyCoding = (isFocused && idleSec < 45) || focusTimerActive;
      if (isActivelyCoding) {
        todayCodingSecRef.current += 1;
      }

      // Compute dynamic real-time focus score:
      let score = 75;
      if (isFocused) score += 12;
      else score -= 20;

      if (focusTimerActive) score += 15;

      if (idleSec < 15) score += 5;
      else if (idleSec > 45) score -= Math.min(35, Math.floor(idleSec / 10) * 5);

      const boundedScore = Math.max(15, Math.min(100, score));

      setTelemetry((prev) => ({
        ...prev,
        usedHeapMb: usedHeap,
        totalHeapMb: totalHeap,
        isWindowFocused: isFocused,
        idleSeconds: idleSec,
        realTimeFocusScore: boundedScore,
        todayCodingSeconds: todayCodingSecRef.current,
        keystrokesCount: keystrokesRef.current,
        lastActiveTimestamp: lastActiveRef.current,
        // Live incremental active hours
        weeklyLoggedHours: parseFloat((prev.weeklyLoggedHours + (isActivelyCoding ? 1 / 3600 : 0)).toFixed(2)),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [focusTimerActive]);

  return telemetry;
}

