import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type EarningEntry = {
  id: string;
  date: string;
  time: string;
  type: "uber99" | "particular" | "gorjeta";
  amount: number;
};

export type KmEntry = {
  id: string;
  date: string;
  time: string;
  km: number;
};

export type HoursEntry = {
  id: string;
  date: string;
  time: string;
  hours: number;
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
  earnings: EarningEntry[];
  expenses: Expense[];
  kmEntries: KmEntry[];
  hoursEntries: HoursEntry[];
  dailyGoal: number;
  driverName: string;
};

type AppContextType = AppData & {
  goalStreak: number;
  earningsPerHour: number;
  goalStatus: "danger" | "warning" | "good" | "great";
  todayEarnings: number;
  todayExpenses: number;
  todayNetProfit: number;
  todayEarningList: EarningEntry[];
  todayExpenseList: Expense[];
  todayKmEntries: KmEntry[];
  todayHoursEntries: HoursEntry[];
  totalKmToday: number;
  hoursOnlineToday: number;
  weeklyData: number[];
  addEarning: (e: Omit<EarningEntry, "id" | "date" | "time">) => void;
  updateEarning: (id: string, e: Partial<Omit<EarningEntry, "id">>) => void;
  removeEarning: (id: string) => void;
  addExpense: (e: Omit<Expense, "id" | "date" | "time">) => void;
  updateExpense: (id: string, e: Partial<Omit<Expense, "id">>) => void;
  removeExpense: (id: string) => void;
  addKmEntry: (km: number) => void;
  updateKmEntry: (id: string, km: number) => void;
  removeKmEntry: (id: string) => void;
  addHoursEntry: (hours: number) => void;
  updateHoursEntry: (id: string, hours: number) => void;
  removeHoursEntry: (id: string) => void;
  setDailyGoal: (goal: number) => void;
  setDriverName: (name: string) => void;
  clearAllData: () => void;
};

const STORAGE_KEY = "@controle_financeiro_v2";

const defaultData: AppData = {
  earnings: [],
  expenses: [],
  kmEntries: [],
  hoursEntries: [],
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
          const parsed = JSON.parse(raw);
          setData({
            ...defaultData,
            ...parsed,
            earnings: parsed.earnings ?? [],
            expenses: parsed.expenses ?? [],
            kmEntries: parsed.kmEntries ?? [],
            hoursEntries: parsed.hoursEntries ?? [],
          });
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

  const addEarning = useCallback((e: Omit<EarningEntry, "id" | "date" | "time">) => {
    setData((prev) => ({
      ...prev,
      earnings: [{ ...e, id: genId(), date: todayStr(), time: nowTimeStr() }, ...prev.earnings],
    }));
  }, []);

  const updateEarning = useCallback((id: string, changes: Partial<Omit<EarningEntry, "id">>) => {
    setData((prev) => ({
      ...prev,
      earnings: prev.earnings.map((e) => (e.id === id ? { ...e, ...changes } : e)),
    }));
  }, []);

  const removeEarning = useCallback((id: string) => {
    setData((prev) => ({ ...prev, earnings: prev.earnings.filter((e) => e.id !== id) }));
  }, []);

  const addExpense = useCallback((e: Omit<Expense, "id" | "date" | "time">) => {
    setData((prev) => ({
      ...prev,
      expenses: [{ ...e, id: genId(), date: todayStr(), time: nowTimeStr() }, ...prev.expenses],
    }));
  }, []);

  const updateExpense = useCallback((id: string, changes: Partial<Omit<Expense, "id">>) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === id ? { ...e, ...changes } : e)),
    }));
  }, []);

  const removeExpense = useCallback((id: string) => {
    setData((prev) => ({ ...prev, expenses: prev.expenses.filter((e) => e.id !== id) }));
  }, []);

  const addKmEntry = useCallback((km: number) => {
    setData((prev) => ({
      ...prev,
      kmEntries: [{ id: genId(), date: todayStr(), time: nowTimeStr(), km }, ...prev.kmEntries],
    }));
  }, []);

  const updateKmEntry = useCallback((id: string, km: number) => {
    setData((prev) => ({
      ...prev,
      kmEntries: prev.kmEntries.map((k) => (k.id === id ? { ...k, km } : k)),
    }));
  }, []);

  const removeKmEntry = useCallback((id: string) => {
    setData((prev) => ({ ...prev, kmEntries: prev.kmEntries.filter((k) => k.id !== id) }));
  }, []);

  const addHoursEntry = useCallback((hours: number) => {
    setData((prev) => ({
      ...prev,
      hoursEntries: [{ id: genId(), date: todayStr(), time: nowTimeStr(), hours }, ...prev.hoursEntries],
    }));
  }, []);

  const updateHoursEntry = useCallback((id: string, hours: number) => {
    setData((prev) => ({
      ...prev,
      hoursEntries: prev.hoursEntries.map((h) => (h.id === id ? { ...h, hours } : h)),
    }));
  }, []);

  const removeHoursEntry = useCallback((id: string) => {
    setData((prev) => ({ ...prev, hoursEntries: prev.hoursEntries.filter((h) => h.id !== id) }));
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
  const todayEarningList = data.earnings.filter((e) => e.date === today);
  const todayExpenseList = data.expenses.filter((e) => e.date === today);
  const todayKmEntries = data.kmEntries.filter((k) => k.date === today);
  const todayHoursEntries = data.hoursEntries.filter((h) => h.date === today);

  const todayEarnings = todayEarningList.reduce((s, e) => s + e.amount, 0);
  const todayExpenses = todayExpenseList.reduce((s, e) => s + e.amount, 0);
  const todayNetProfit = todayEarnings - todayExpenses;
  const totalKmToday = todayKmEntries.reduce((s, k) => s + k.km, 0);
  const hoursOnlineToday = parseFloat(
    todayHoursEntries.reduce((s, h) => s + h.hours, 0).toFixed(1)
  );
  const earningsPerHour =
    hoursOnlineToday > 0 ? Math.round(todayEarnings / hoursOnlineToday) : 0;

  const last7 = getLast7Days();
  const weeklyData = last7.map((day) =>
    data.earnings.filter((e) => e.date === day).reduce((s, e) => s + e.amount, 0)
  );

  const pct = data.dailyGoal > 0 ? (todayNetProfit / data.dailyGoal) * 100 : 0;
  const goalStatus: "danger" | "warning" | "good" | "great" =
    pct >= 100 ? "great" : pct >= 70 ? "good" : pct >= 30 ? "warning" : "danger";

  let goalStreak = 0;
  if (data.dailyGoal > 0) {
    let i = 1;
    while (true) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayEarnings = data.earnings.filter((e) => e.date === dateStr).reduce((s, e) => s + e.amount, 0);
      const dayExpenses = data.expenses.filter((e) => e.date === dateStr).reduce((s, e) => s + e.amount, 0);
      if (dayEarnings - dayExpenses >= data.dailyGoal) {
        goalStreak++;
        i++;
      } else {
        break;
      }
    }
    if (todayNetProfit >= data.dailyGoal) goalStreak++;
  }

  if (!loaded) return null;

  return (
    <AppContext.Provider
      value={{
        ...data,
        goalStreak,
        earningsPerHour,
        goalStatus,
        todayEarnings,
        todayExpenses,
        todayNetProfit,
        todayEarningList,
        todayExpenseList,
        todayKmEntries,
        todayHoursEntries,
        totalKmToday,
        hoursOnlineToday,
        weeklyData,
        addEarning,
        updateEarning,
        removeEarning,
        addExpense,
        updateExpense,
        removeExpense,
        addKmEntry,
        updateKmEntry,
        removeKmEntry,
        addHoursEntry,
        updateHoursEntry,
        removeHoursEntry,
        setDailyGoal,
        setDriverName,
        clearAllData,
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
