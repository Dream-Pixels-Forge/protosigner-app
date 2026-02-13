
import { MCPStatus } from '../types';

type MCPCallback = (status: MCPStatus) => void;

export class MCPClient {
  private static instance: MCPClient;
  private status: MCPStatus = 'disconnected';
  private subscribers: MCPCallback[] = [];
  private retryCount = 0;
  private maxRetries = 5;

  private constructor() {
    this.connect();
  }

  static getInstance(): MCPClient {
    if (!MCPClient.instance) {
      MCPClient.instance = new MCPClient();
    }
    return MCPClient.instance;
  }

  subscribe(callback: MCPCallback) {
    this.subscribers.push(callback);
    callback(this.status);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notify() {
    this.subscribers.forEach(cb => cb(this.status));
  }

  private connect() {
    this.status = 'connecting';
    this.notify();

    // Simulate WebSocket connection delay
    setTimeout(() => {
      // 90% chance of success for demo
      if (Math.random() > 0.1) {
        this.status = 'connected';
        this.retryCount = 0;
        this.notify();
        this.startHeartbeat();
      } else {
        this.handleError();
      }
    }, 1500);
  }

  private handleError() {
    this.status = 'error';
    this.notify();
    
    if (this.retryCount < this.maxRetries) {
      const backoff = Math.min(1000 * Math.pow(2, this.retryCount), 10000);
      this.retryCount++;
      console.log(`MCP Connection failed. Retrying in ${backoff}ms...`);
      setTimeout(() => this.connect(), backoff);
    }
  }

  private startHeartbeat() {
    setInterval(() => {
        if (this.status === 'connected') {
            // Simulate random sync events
            if (Math.random() > 0.8) {
                this.status = 'syncing';
                this.notify();
                setTimeout(() => {
                    this.status = 'connected';
                    this.notify();
                }, 800);
            }
        }
    }, 5000);
  }
}
