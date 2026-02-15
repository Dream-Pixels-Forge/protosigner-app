import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  source?: string;
}

interface ConsoleLogContextType {
  logs: LogEntry[];
  addLog: (message: string, level?: LogEntry['level'], source?: string) => void;
  clearLogs: () => void;
  getRecentLogs: (count?: number) => LogEntry[];
}

const ConsoleLogContext = createContext<ConsoleLogContextType | undefined>(undefined);

export const ConsoleLogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const maxLogs = 100;

  const addLog = useCallback((message: string, level: LogEntry['level'] = 'log', source?: string) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      level,
      message: String(message).substring(0, 200), // Limit length
      source
    };
    
    setLogs(prev => {
      const updated = [newLog, ...prev];
      return updated.slice(0, maxLogs);
    });
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const getRecentLogs = useCallback((count = 1) => {
    return logs.slice(0, count);
  }, [logs]);

  // Override console methods to capture logs
  useEffect(() => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;

    console.log = (...args) => {
      addLog(args.join(' '), 'log');
      originalLog.apply(console, args);
    };

    console.warn = (...args) => {
      addLog(args.join(' '), 'warn');
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      addLog(args.join(' '), 'error');
      originalError.apply(console, args);
    };

    console.info = (...args) => {
      addLog(args.join(' '), 'info');
      originalInfo.apply(console, args);
    };

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      console.info = originalInfo;
    };
  }, [addLog]);

  return (
    <ConsoleLogContext.Provider value={{ logs, addLog, clearLogs, getRecentLogs }}>
      {children}
    </ConsoleLogContext.Provider>
  );
};

export const useConsoleLog = () => {
  const context = useContext(ConsoleLogContext);
  if (!context) {
    throw new Error('useConsoleLog must be used within ConsoleLogProvider');
  }
  return context;
};
