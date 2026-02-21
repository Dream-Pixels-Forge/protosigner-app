import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ConsoleLogProvider, useConsoleLog } from './ConsoleLogContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ConsoleLogProvider>{children}</ConsoleLogProvider>
);

describe('ConsoleLogContext', () => {
  it('should provide console log functionality', () => {
    const { result } = renderHook(() => useConsoleLog(), { wrapper });
    
    expect(result.current.logs).toEqual([]);
    expect(result.current.addLog).toBeDefined();
    expect(result.current.clearLogs).toBeDefined();
    expect(result.current.getRecentLogs).toBeDefined();
  });

  it('should add logs', () => {
    const { result } = renderHook(() => useConsoleLog(), { wrapper });
    
    act(() => {
      result.current.addLog('Test message', 'info', 'TestSource');
    });
    
    expect(result.current.logs).toHaveLength(1);
    expect(result.current.logs[0].message).toBe('Test message');
    expect(result.current.logs[0].level).toBe('info');
    expect(result.current.logs[0].source).toBe('TestSource');
  });

  it('should limit logs to maxLogs', () => {
    const { result } = renderHook(() => useConsoleLog(), { wrapper });
    
    act(() => {
      // Add more than 100 logs
      for (let i = 0; i < 150; i++) {
        result.current.addLog(`Log ${i}`);
      }
    });
    
    expect(result.current.logs.length).toBeLessThanOrEqual(100);
  });

  it('should clear logs', () => {
    const { result } = renderHook(() => useConsoleLog(), { wrapper });
    
    act(() => {
      result.current.addLog('Test message');
      result.current.clearLogs();
    });
    
    expect(result.current.logs).toHaveLength(0);
  });

  it('should get recent logs', () => {
    const { result } = renderHook(() => useConsoleLog(), { wrapper });
    
    act(() => {
      result.current.addLog('Log 1');
      result.current.addLog('Log 2');
      result.current.addLog('Log 3');
    });
    
    const recent = result.current.getRecentLogs(2);
    expect(recent).toHaveLength(2);
    expect(recent[0].message).toBe('Log 3'); // Most recent first
    expect(recent[1].message).toBe('Log 2');
  });

  it('should handle different log levels', () => {
    const { result } = renderHook(() => useConsoleLog(), { wrapper });

    act(() => {
      result.current.addLog('Debug', 'log');
      result.current.addLog('Warning', 'warn');
      result.current.addLog('Error', 'error');
      result.current.addLog('Info', 'info');
    });

    const logs = result.current.logs;
    // Logs are sorted with most recent first, and info was added last
    expect(logs.map(l => l.level)).toEqual(['info', 'error', 'warn', 'log']);
  });

  it('should truncate long messages', () => {
    const { result } = renderHook(() => useConsoleLog(), { wrapper });
    
    const longMessage = 'a'.repeat(300);
    act(() => {
      result.current.addLog(longMessage);
    });
    
    expect(result.current.logs[0].message.length).toBeLessThanOrEqual(200);
  });
});
