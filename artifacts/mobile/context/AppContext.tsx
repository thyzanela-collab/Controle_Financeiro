import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Ride = {
  id: string;
  date: string;
  time: string;
  value: number;
  km: number;
  durationMin: number;
};

export type Expense = {
  id: string;
  date: string;
  time: string;
  label: string;
  amount: number;
  category: "fuel" | "maintenance" | "other";
};

type AppData = {
  rides: Ride[];
  expenses: Expense[];
  dailyGoal: number;
  driverName: string;
};

type AppContextType = AppData & {
  goalStreak: number;
  earningsPerHour: number;
  goalStatus: "danger" | "warning" | "good" | "great";
  clearAllData: () => void;
  addRide: (r: Omit<Ride, "id" | "date" | "time">) => void;
  updateRide: (id: string, r: Partial<Omit<Ride, "id">>) => void;
  removeRide: (id: string) => void;
  addExpense: (e: Omit<Expense, "id" | "date" | "time">) => void;
  updateExpense: (id: string, e: Partial<Omit<Expense, "id">>) => void;
  removeExpense: (id: string) => void;
  setDailyGoal: (goal: number) => void;
  setDriverName: (name: string) => void;
  todayEarnings: number;
  todayExpenses: number;
  todayNetProfit: number;
  todayRides: Ride[];
  todayExpenseList: Expense[];
  weeklyData: number[];
  totalKmToday: number;
  avgPerRide: number;
  hoursOnlineToday: number;
};

const STORAGE_KEY = "@controle_financeiro_data";

const defaultData: AppData = {
  rides: [],
  expenses: [],
  dailyGoal: 600,
  driverName: "Motorista",
};

const AppContext = createContext<AppContextType | null>(null);

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function nowTimeStr() {
  return new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function genId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 7);
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(defaultData);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setData(JSON.parse(raw));
        } catch {
          setData(defaultData);
        }
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, loaded]);

  const addRide = useCallback(
    (r: Omit<Ride, "id" | "date" | "time">) => {
      const newRide: Ride = {
        ...r,
        id: genId(),
        date: todayStr(),
        time: nowTimeStr(),
      };
      setData((prev) => ({ ...prev, rides: [newRide, ...prev.rides] }));
    },
    []
  );

  const updateRide = useCallback((id: string, changes: Partial<Omit<Ride, "id">>) => {
    setData((prev) => ({
      ...prev,
      rides: prev.rides.map((r) => (r.id === id ? { ...r, ...changes } : r)),
    }));
  }, []);

  const removeRide = useCallback((id: string) => {
    setData((prev) => ({ ...prev, rides: prev.rides.filter((r) => r.id !== id) }));
  }, []);

  const addExpense = useCallback(
    (e: Omit<Expense, "id" | "date" | "time">) => {
      const newExp: Expense = {
        ...e,
        id: genId(),
        date: todayStr(),
        time: nowTimeStr(),
      };
      setData((prev) => ({ ...prev, expenses: [newExp, ...prev.expenses] }));
    },
    []
  );

  const updateExpense = useCallback((id: string, changes: Partial<Omit<Expense, "id">>) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === id ? { ...e, ...changes } : e)),
    }));
  }, []);

  const removeExpense = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  }, []);

  const setDailyGoal = useCallback((goal: number) => {
    setData((prev) => ({ ...prev, dailyGoal: goal }));
  }, []);

  const setDriverName = useCallback((name: string) => {
    setData((prev) => ({ ...prev, driverName: name }));
  }, []);

  const clearAllData = useCallback(() => {
    setData((prev) => ({
      ...defaultData,
      dailyGoal: prev.dailyGoal,
      driverName: prev.driverName,
    }));
  }, []);

  const today = todayStr();
  const todayRides = data.rides.filter((r) => r.date === today);
  const todayExpenseList = data.expenses.filter((e) => e.date === today);
  const todayEarnings = todayRides.reduce((s, r) => s + r.value, 0);
  const todayExpenses = todayExpenseList.reduce((s, e) => s + e.amount, 0);
  const todayNetProfit = todayEarnings - todayExpenses;
  const totalKmToday = todayRides.reduce((s, r) => s + r.km, 0);
  const avgPerRide =
    todayRides.length > 0 ? Math.round(todayEarnings / todayRides.length) : 0;
  const hoursOnlineToday = parseFloat(
    (todayRides.reduce((s, r) => s + r.durationMin, 0) / 60).toFixed(1)
  );

  const last7 = getLast7Days();
  const weeklyData = last7.map((day) =>
    data.rides.filter((r) => r.date === day).reduce((s, r) => s + r.value, 0)
  );

  const earningsPerHour =
    hoursOnlineToday > 0
      ? Math.round(todayEarnings / hoursOnlineToday)
      : 0;

  const pct = data.dailyGoal > 0 ? (todayNetProfit / data.dailyGoal) * 100 : 0;
  const goalStatus: "danger" | "warning" | "good" | "great" =
    pct >= 100 ? "great" : pct >= 70 ? "good" : pct >= 30 ? "warning" : "danger";

  // Count consecutive days (backwards from yesterday) where net profit >= goal
  let goalStreak = 0;
  if (data.dailyGoal > 0) {
    let i = 1;
    while (true) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayRides = data.rides.filter((r) => r.date === dateStr);
      const dayExp = data.expenses.filter((e) => e.date === dateStr);
      const dayProfit =
        dayRides.reduce((s, r) => s + r.value, 0) -
        dayExp.reduce((s, e) => s + e.amount, 0);
      if (dayProfit >= data.dailyGoal) {
        goalStreak++;
        i++;
      } else {
        break;
      }
    }
    // Also count today if goal met
    if (todayNetProfit >= data.dailyGoal) goalStreak++;
  }

  if (!loaded) return null;

  return (
    <AppContext.Provider
      value={{
        ...data,
        addRide,
        updateRide,
        removeRide,
        addExpense,
        updateExpense,
        removeExpense,
        setDailyGoal,
        setDriverName,
        clearAllData,
        earningsPerHour,
        goalStatus,
        goalStreak,
        todayEarnings,
        todayExpenses,
        todayNetProfit,
        todayRides,
        todayExpenseList,
        weeklyData,
        totalKmToday,
        avgPerRide,
        hoursOnlineToday,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
