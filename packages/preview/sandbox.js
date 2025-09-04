const { VM } = require('vm2');
const { JSDOM } = require('jsdom');

class PreviewSandbox {
  constructor(options = {}) {
    this.options = {
      timeout: options.timeout || 5000,
      maxMemory: options.maxMemory || 32 * 1024 * 1024, // 32MB
      allowAsync: options.allowAsync || false,
      allowedModules: options.allowedModules || [],
      consoleOutput: options.consoleOutput || false
    };
    
    this.activeSandboxes = new Map();
  }

  // Create secure sandbox for component execution
  createSandbox(code, context = {}) {
    const sandboxId = this.generateSandboxId();
    
    try {
      // Create JSDOM environment
      const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
        resources: 'usable',
        runScripts: 'dangerously',
        pretendToBeVisual: true,
        beforeParse: (window) => {
          this.setupWindowSecurity(window);
        }
      });

      // Create VM sandbox
      const vm = new VM({
        timeout: this.options.timeout,
        sandbox: {
          window: dom.window,
          document: dom.window.document,
          console: this.createSecureConsole(sandboxId),
          React: context.React,
          ReactDOM: context.ReactDOM,
          Vue: context.Vue,
          ...this.createSecureGlobals(dom.window),
          ...context.globals
        },
        eval: false,
        wasm: false
      });

      const sandbox = {
        id: sandboxId,
        vm,
        dom,
        window: dom.window,
        document: dom.window.document,
        created: Date.now(),
        lastAccess: Date.now()
      };

      this.activeSandboxes.set(sandboxId, sandbox);
      
      return sandbox;
    } catch (error) {
      throw new Error(`Sandbox creation failed: ${error.message}`);
    }
  }

  // Execute code in sandbox with safety checks
  async executeInSandbox(sandboxId, code, options = {}) {
    const sandbox = this.activeSandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error('Sandbox not found');
    }

    sandbox.lastAccess = Date.now();

    try {
      // Pre-execution validation
      this.validateCode(code);
      
      // Execute code with timeout
      const result = await Promise.race([
        this.runCodeSafely(sandbox.vm, code, options),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Execution timeout')), this.options.timeout)
        )
      ]);

      // Post-execution cleanup
      this.cleanupExecution(sandbox);
      
      return {
        success: true,
        result,
        output: this.getConsoleOutput(sandboxId),
        metrics: this.getSandboxMetrics(sandbox)
      };
    } catch (error) {
      this.cleanupExecution(sandbox);
      return {
        success: false,
        error: error.message,
        output: this.getConsoleOutput(sandboxId)
      };
    }
  }

  // Run code with additional safety measures
  async runCodeSafely(vm, code, options) {
    // Wrap code in try-catch for better error handling
    const wrappedCode = `
      try {
        ${code}
      } catch (sandboxError) {
        throw new Error('Component execution error: ' + sandboxError.message);
      }
    `;

    return vm.run(wrappedCode);
  }

  // Validate code for dangerous patterns
  validateCode(code) {
    const dangerousPatterns = [
      /eval\s*\(/,
      /Function\s*\(/,
      /import\s*\(/,
      /require\s*\(/,
      /process\./,
      /global\./,
      /window\.location/,
      /document\.location/,
      /fetch\s*\(/,
      /XMLHttpRequest/,
      /WebSocket/,
      /setTimeout.*eval/,
      /setInterval.*eval/
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        throw new Error(`Dangerous code pattern detected: ${pattern.source}`);
      }
    }

    // Check code length
    if (code.length > 100000) {
      throw new Error('Code too large');
    }
  }

  // Setup window security restrictions
  setupWindowSecurity(window) {
    // Remove dangerous globals
    delete window.fetch;
    delete window.XMLHttpRequest;
    delete window.WebSocket;
    delete window.EventSource;
    delete window.importScripts;
    
    // Restrict location access
    const originalLocation = window.location;
    
    // Check if location property can be redefined
    const locationDescriptor = Object.getOwnPropertyDescriptor(window, 'location');
    if (!locationDescriptor || locationDescriptor.configurable !== false) {
      try {
        Object.defineProperty(window, 'location', {
          get: () => ({
            href: originalLocation.href,
            origin: originalLocation.origin,
            protocol: originalLocation.protocol,
            host: originalLocation.host,
            hostname: originalLocation.hostname,
            port: originalLocation.port,
            pathname: '/sandbox',
            search: '',
            hash: ''
          }),
          set: () => {
            throw new Error('Cannot modify location in sandbox');
          },
          configurable: false
        });
      } catch (error) {
        // Fallback: if defineProperty fails, create a proxy wrapper
        console.warn('Could not redefine location property, using proxy fallback:', error.message);
        window.location = new Proxy(originalLocation, {
          get: (target, prop) => {
            if (prop === 'pathname') return '/sandbox';
            if (prop === 'search') return '';
            if (prop === 'hash') return '';
            return target[prop];
          },
          set: () => {
            throw new Error('Cannot modify location in sandbox');
          }
        });
      }
    }

    // Restrict navigation
    window.history = {
      length: 1,
      pushState: () => {},
      replaceState: () => {},
      back: () => {},
      forward: () => {},
      go: () => {}
    };

    // Secure storage
    window.localStorage = this.createSecureStorage();
    window.sessionStorage = this.createSecureStorage();
  }

  // Create secure storage implementation
  createSecureStorage() {
    const storage = new Map();
    return {
      getItem: (key) => storage.get(key) || null,
      setItem: (key, value) => {
        if (storage.size > 50) {
          throw new Error('Storage quota exceeded');
        }
        storage.set(key, String(value));
      },
      removeItem: (key) => storage.delete(key),
      clear: () => storage.clear(),
      get length() { return storage.size; },
      key: (index) => Array.from(storage.keys())[index] || null
    };
  }

  // Create secure console implementation
  createSecureConsole(sandboxId) {
    const output = [];
    
    const logMethod = (level) => (...args) => {
      if (this.options.consoleOutput) {
        output.push({
          level,
          message: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '),
          timestamp: Date.now()
        });
        
        // Limit output size
        if (output.length > 100) {
          output.shift();
        }
      }
    };

    // Store output for retrieval
    this.consoleOutputs = this.consoleOutputs || new Map();
    this.consoleOutputs.set(sandboxId, output);

    return {
      log: logMethod('log'),
      info: logMethod('info'),
      warn: logMethod('warn'),
      error: logMethod('error'),
      debug: logMethod('debug'),
      trace: logMethod('trace'),
      group: logMethod('group'),
      groupEnd: logMethod('groupEnd'),
      table: logMethod('table'),
      time: () => {},
      timeEnd: () => {},
      assert: (condition, ...args) => {
        if (!condition) {
          logMethod('error')('Assertion failed:', ...args);
        }
      }
    };
  }

  // Create secure global objects
  createSecureGlobals(window) {
    return {
      // Secure setTimeout/setInterval
      setTimeout: (callback, delay, ...args) => {
        if (typeof callback !== 'function') {
          throw new Error('setTimeout callback must be a function');
        }
        if (delay > 10000) { // Max 10 seconds
          throw new Error('setTimeout delay too long');
        }
        return window.setTimeout(callback, delay, ...args);
      },
      
      setInterval: (callback, delay, ...args) => {
        if (typeof callback !== 'function') {
          throw new Error('setInterval callback must be a function');
        }
        if (delay < 100 || delay > 10000) {
          throw new Error('setInterval delay out of bounds');
        }
        return window.setInterval(callback, delay, ...args);
      },
      
      clearTimeout: window.clearTimeout.bind(window),
      clearInterval: window.clearInterval.bind(window),
      
      // Secure JSON
      JSON: {
        parse: (text) => {
          try {
            return JSON.parse(text);
          } catch (error) {
            throw new Error('JSON parse error: ' + error.message);
          }
        },
        stringify: JSON.stringify
      },
      
      // Math object (safe)
      Math: window.Math,
      
      // Date object (safe)
      Date: window.Date,
      
      // Array and Object constructors
      Array: window.Array,
      Object: window.Object,
      
      // Type checking
      typeof: (value) => typeof value,
      instanceof: (obj, constructor) => obj instanceof constructor
    };
  }

  // Get console output for sandbox
  getConsoleOutput(sandboxId) {
    return this.consoleOutputs?.get(sandboxId) || [];
  }

  // Get sandbox performance metrics
  getSandboxMetrics(sandbox) {
    const now = Date.now();
    return {
      uptime: now - sandbox.created,
      lastAccess: now - sandbox.lastAccess,
      domElements: sandbox.document.querySelectorAll('*').length,
      memoryEstimate: this.estimateMemoryUsage(sandbox)
    };
  }

  // Estimate memory usage (basic heuristic)
  estimateMemoryUsage(sandbox) {
    try {
      const domSize = sandbox.document.documentElement.outerHTML.length;
      const elements = sandbox.document.querySelectorAll('*').length;
      return {
        dom: domSize,
        elements: elements * 100, // Rough estimate
        total: domSize + (elements * 100)
      };
    } catch {
      return { dom: 0, elements: 0, total: 0 };
    }
  }

  // Cleanup after code execution
  cleanupExecution(sandbox) {
    try {
      // Clear any pending timeouts/intervals
      const window = sandbox.window;
      
      // Force garbage collection (if available)
      if (global.gc) {
        global.gc();
      }
      
      // Reset some DOM state
      const scripts = sandbox.document.querySelectorAll('script[data-dynamic]');
      scripts.forEach(script => script.remove());
      
    } catch (error) {
      console.warn('Sandbox cleanup warning:', error.message);
    }
  }

  // Generate unique sandbox ID
  generateSandboxId() {
    return `sandbox_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Destroy sandbox and cleanup resources
  destroySandbox(sandboxId) {
    const sandbox = this.activeSandboxes.get(sandboxId);
    if (!sandbox) {
      return false;
    }

    try {
      // Close JSDOM window
      sandbox.window.close();
      
      // Clear console output
      if (this.consoleOutputs) {
        this.consoleOutputs.delete(sandboxId);
      }
      
      // Remove from active sandboxes
      this.activeSandboxes.delete(sandboxId);
      
      return true;
    } catch (error) {
      console.warn('Sandbox destruction warning:', error.message);
      return false;
    }
  }

  // Cleanup old sandboxes
  cleanupOldSandboxes(maxAge = 5 * 60 * 1000) { // 5 minutes
    const now = Date.now();
    const toDestroy = [];
    
    for (const [id, sandbox] of this.activeSandboxes) {
      if (now - sandbox.lastAccess > maxAge) {
        toDestroy.push(id);
      }
    }
    
    let cleaned = 0;
    for (const id of toDestroy) {
      if (this.destroySandbox(id)) {
        cleaned++;
      }
    }
    
    return cleaned;
  }

  // Get sandbox statistics
  getStats() {
    const sandboxes = Array.from(this.activeSandboxes.values());
    const now = Date.now();
    
    return {
      total: sandboxes.length,
      active: sandboxes.filter(s => now - s.lastAccess < 60000).length,
      averageUptime: sandboxes.length > 0 
        ? sandboxes.reduce((sum, s) => sum + (now - s.created), 0) / sandboxes.length 
        : 0,
      totalMemory: sandboxes.reduce((sum, s) => {
        const metrics = this.getSandboxMetrics(s);
        return sum + metrics.memoryEstimate.total;
      }, 0)
    };
  }
}

module.exports = { PreviewSandbox };