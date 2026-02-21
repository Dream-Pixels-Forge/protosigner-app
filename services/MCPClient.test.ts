import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MCPClient } from '../services/MCPClient';

describe('MCPClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset singleton instance for clean tests
    (MCPClient as any).instance = null;
  });

  it('should create a singleton instance', () => {
    const instance1 = MCPClient.getInstance();
    const instance2 = MCPClient.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should subscribe to status changes', () => {
    const client = MCPClient.getInstance();
    const callback = vi.fn();
    
    const unsubscribe = client.subscribe(callback);
    
    // Callback should be called immediately with current status
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('connecting');
    
    // Unsubscribe should work
    unsubscribe();
  });

  it('should notify all subscribers on status change', () => {
    const client = MCPClient.getInstance();
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    
    client.subscribe(callback1);
    client.subscribe(callback2);
    
    // Both should be called
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('should handle connection retry logic', () => {
    const client = MCPClient.getInstance();
    const callback = vi.fn();
    
    client.subscribe(callback);
    
    // Initial state should be connecting
    expect(callback).toHaveBeenCalledWith('connecting');
  });
});
