'use client';

import { useState, useEffect, useCallback } from 'react';

const BASE_URL = 'https://countriesnow.space/api/v0.1/countries';

interface ApiResponse<T> {
  error: boolean;
  msg: string;
  data: T;
}

export function useCountries() {
  const [countries, setCountries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetch(`${BASE_URL}/positions`)
      .then(res => res.json())
      .then((data: ApiResponse<{ name: string }[]>) => {
        if (!cancelled && !data.error) {
          const names = data.data
            .map(c => c.name)
            .sort((a, b) => a.localeCompare(b));
          setCountries(names);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, []);

  return { countries, isLoading };
}

export function useStates(country: string) {
  const [states, setStates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!country) {
      setStates([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetch(`${BASE_URL}/states`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country }),
    })
      .then(res => res.json())
      .then((data: ApiResponse<{ states: { name: string }[] }>) => {
        if (!cancelled && !data.error) {
          setStates(data.data.states.map(s => s.name).sort());
        }
      })
      .catch(() => { if (!cancelled) setStates([]); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [country]);

  return { states, isLoading };
}

export function useCities(country: string, state: string) {
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!country || !state) {
      setCities([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetch(`${BASE_URL}/state/cities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country, state }),
    })
      .then(res => res.json())
      .then((data: ApiResponse<string[]>) => {
        if (!cancelled && !data.error) {
          setCities(data.data.sort());
        }
      })
      .catch(() => { if (!cancelled) setCities([]); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [country, state]);

  return { cities, isLoading };
}
