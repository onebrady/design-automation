/**
 * Screenshot Engine with Playwright
 *
 * Robust screenshot capture with automatic cleanup and error handling.
 * Addresses common Playwright issues and provides lifecycle management.
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const Logger = require('../../apps/server/utils/logger');

class ScreenshotEngine {
  constructor(options = {}) {
    this.options = {
      // Default viewport settings
      viewport: { width: 1200, height: 800 },
      // Screenshot quality and format
      screenshotOptions: {
        type: 'png',
        fullPage: true,
      },
      // Browser launch options for stability
      launchOptions: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
        ],
      },
      // Timeout settings
      timeouts: {
        navigation: 10000,
        networkIdle: 5000,
        capture: 30000,
      },
      // Cleanup settings
      cleanup: {
        autoCleanup: true,
        maxAge: 5 * 60 * 1000, // 5 minutes
        maxFiles: 50,
      },
      ...options,
    };

    // Screenshot storage directory
    this.screenshotDir = path.join(process.cwd(), 'temp', 'screenshots');
    this.ensureScreenshotDirectory();

    // Track active browser instances for cleanup
    this.activeBrowsers = new Set();

    // Setup cleanup on process exit
    this.setupCleanupHandlers();

    Logger.info('ScreenshotEngine initialized', {
      screenshotDir: this.screenshotDir,
      viewport: this.options.viewport,
      autoCleanup: this.options.cleanup.autoCleanup,
    });
  }

  /**
   * Capture screenshot from HTML code
   */
  async capture(htmlCode, options = {}) {
    const startTime = Date.now();
    const screenshotId = `screenshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let browser = null;
    let page = null;

    try {
      Logger.info('Starting screenshot capture', { screenshotId });

      // Launch browser with stability options
      browser = await chromium.launch(this.options.launchOptions);
      this.activeBrowsers.add(browser);

      // Create page with proper viewport
      const viewport = options.viewport || this.options.viewport;
      page = await browser.newPage({ viewport });

      // Set timeouts
      page.setDefaultTimeout(this.options.timeouts.capture);
      page.setDefaultNavigationTimeout(this.options.timeouts.navigation);

      // Enhanced HTML with base styles for consistent rendering
      const enhancedHtml = this.enhanceHtmlForScreenshot(htmlCode);

      Logger.debug('Setting page content', { screenshotId, htmlLength: enhancedHtml.length });

      // Set content and wait for stability
      await page.setContent(enhancedHtml, {
        waitUntil: 'networkidle',
        timeout: this.options.timeouts.networkIdle,
      });

      // Additional wait for dynamic content
      await page.waitForTimeout(1000);

      // Capture screenshot
      const screenshotOptions = {
        ...this.options.screenshotOptions,
        ...options.screenshotOptions,
      };

      Logger.debug('Capturing screenshot', { screenshotId, options: screenshotOptions });

      const screenshotBuffer = await page.screenshot(screenshotOptions);

      // Save to disk with metadata
      const filepath = await this.saveScreenshot(screenshotBuffer, screenshotId, {
        htmlLength: htmlCode.length,
        viewport,
        timestamp: new Date().toISOString(),
        options: screenshotOptions,
      });

      const duration = Date.now() - startTime;

      Logger.info('Screenshot captured successfully', {
        screenshotId,
        filepath,
        duration: `${duration}ms`,
        size: `${Math.round(screenshotBuffer.length / 1024)}KB`,
      });

      // Schedule cleanup if auto-cleanup is enabled
      if (this.options.cleanup.autoCleanup) {
        this.scheduleCleanup(filepath, this.options.cleanup.maxAge);
      }

      return {
        success: true,
        screenshotId,
        filepath,
        base64: screenshotBuffer.toString('base64'),
        metadata: {
          duration,
          size: screenshotBuffer.length,
          viewport,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      Logger.error('Screenshot capture failed', {
        screenshotId,
        error: error.message,
        stack: error.stack,
        duration: Date.now() - startTime,
      });

      return {
        success: false,
        screenshotId,
        error: error.message,
        code: 'SCREENSHOT_FAILED',
      };
    } finally {
      // Cleanup resources
      try {
        if (page) await page.close();
        if (browser) {
          await browser.close();
          this.activeBrowsers.delete(browser);
        }
      } catch (cleanupError) {
        Logger.warn('Error during screenshot cleanup', {
          screenshotId,
          error: cleanupError.message,
        });
      }
    }
  }

  /**
   * Enhance HTML for consistent screenshot rendering
   */
  enhanceHtmlForScreenshot(htmlCode) {
    // Check if it's a full HTML document
    const isFullDocument =
      htmlCode.trim().toLowerCase().startsWith('<!doctype') ||
      htmlCode.trim().toLowerCase().startsWith('<html');

    if (isFullDocument) {
      return htmlCode;
    }

    // Wrap fragment in full HTML document
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Screenshot Preview</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      font-size: 16px;
      line-height: 1.5;
      color: #333;
      background: #fff;
      padding: 20px;
    }
    
    /* Ensure elements are visible and have proper spacing */
    .container, .wrapper, .content {
      width: 100%;
      max-width: none;
    }
    
    /* Common design tokens for consistent rendering */
    :root {
      --color-primary: #1B3668;
      --color-secondary: #2A4F8F;
      --color-surface: #F8FAFC;
      --color-text: #212529;
      --spacing-sm: 8px;
      --spacing-md: 16px;
      --spacing-lg: 24px;
      --spacing-xl: 32px;
    }
  </style>
</head>
<body>
${htmlCode}
</body>
</html>`;
  }

  /**
   * Save screenshot to disk with metadata
   */
  async saveScreenshot(buffer, screenshotId, metadata) {
    const filename = `${screenshotId}.png`;
    const filepath = path.join(this.screenshotDir, filename);
    const metadataPath = path.join(this.screenshotDir, `${screenshotId}.meta.json`);

    // Save screenshot
    await fs.promises.writeFile(filepath, buffer);

    // Save metadata
    await fs.promises.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    return filepath;
  }

  /**
   * Schedule screenshot cleanup after specified time
   */
  scheduleCleanup(filepath, maxAge) {
    setTimeout(() => {
      this.cleanupScreenshot(filepath).catch((error) => {
        Logger.warn('Scheduled cleanup failed', {
          filepath,
          error: error.message,
        });
      });
    }, maxAge);
  }

  /**
   * Clean up specific screenshot files
   */
  async cleanupScreenshot(filepath) {
    try {
      const screenshotId = path.basename(filepath, '.png');
      const metadataPath = path.join(path.dirname(filepath), `${screenshotId}.meta.json`);

      // Remove files if they exist
      const filesToRemove = [filepath, metadataPath];

      for (const file of filesToRemove) {
        try {
          await fs.promises.unlink(file);
          Logger.debug('Screenshot file cleaned up', { file });
        } catch (error) {
          if (error.code !== 'ENOENT') {
            Logger.warn('Failed to cleanup screenshot file', {
              file,
              error: error.message,
            });
          }
        }
      }
    } catch (error) {
      Logger.error('Screenshot cleanup error', {
        filepath,
        error: error.message,
      });
    }
  }

  /**
   * Clean up old screenshots based on age and count limits
   */
  async performMaintenanceCleanup() {
    try {
      const files = await fs.promises.readdir(this.screenshotDir);
      const screenshots = files.filter((file) => file.endsWith('.png'));

      Logger.info('Starting maintenance cleanup', {
        totalFiles: screenshots.length,
        maxFiles: this.options.cleanup.maxFiles,
        maxAge: this.options.cleanup.maxAge,
      });

      // Sort by creation time (newest first)
      const fileStats = await Promise.all(
        screenshots.map(async (file) => {
          const filepath = path.join(this.screenshotDir, file);
          const stat = await fs.promises.stat(filepath);
          return { file, filepath, mtime: stat.mtime };
        })
      );

      fileStats.sort((a, b) => b.mtime - a.mtime);

      let cleanedCount = 0;
      const now = Date.now();

      // Remove files based on age and count limits
      for (let i = 0; i < fileStats.length; i++) {
        const { filepath, mtime } = fileStats[i];
        const age = now - mtime.getTime();

        // Remove if too old or exceeds max file count
        if (age > this.options.cleanup.maxAge || i >= this.options.cleanup.maxFiles) {
          await this.cleanupScreenshot(filepath);
          cleanedCount++;
        }
      }

      Logger.info('Maintenance cleanup completed', {
        cleanedCount,
        remainingFiles: fileStats.length - cleanedCount,
      });

      return { cleanedCount, remainingFiles: fileStats.length - cleanedCount };
    } catch (error) {
      Logger.error('Maintenance cleanup failed', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Ensure screenshot directory exists
   */
  ensureScreenshotDirectory() {
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
      Logger.info('Created screenshot directory', { path: this.screenshotDir });
    }
  }

  /**
   * Setup cleanup handlers for graceful shutdown
   */
  setupCleanupHandlers() {
    const cleanup = async () => {
      Logger.info('Shutting down ScreenshotEngine');

      // Close any active browsers
      for (const browser of this.activeBrowsers) {
        try {
          await browser.close();
        } catch (error) {
          Logger.warn('Error closing browser during shutdown', {
            error: error.message,
          });
        }
      }

      this.activeBrowsers.clear();
      Logger.info('ScreenshotEngine shutdown complete');
    };

    // Handle various exit signals
    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);
    process.on('beforeExit', cleanup);

    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
      Logger.error('Uncaught exception in ScreenshotEngine', {
        error: error.message,
        stack: error.stack,
      });
      await cleanup();
      process.exit(1);
    });
  }

  /**
   * Get screenshot statistics
   */
  async getStats() {
    try {
      const files = await fs.promises.readdir(this.screenshotDir);
      const screenshots = files.filter((file) => file.endsWith('.png'));

      let totalSize = 0;
      for (const file of screenshots) {
        const filepath = path.join(this.screenshotDir, file);
        const stat = await fs.promises.stat(filepath);
        totalSize += stat.size;
      }

      return {
        count: screenshots.length,
        totalSize,
        directory: this.screenshotDir,
        averageSize: screenshots.length > 0 ? totalSize / screenshots.length : 0,
      };
    } catch (error) {
      Logger.error('Failed to get screenshot stats', { error: error.message });
      return { error: error.message };
    }
  }
}

module.exports = { ScreenshotEngine };
