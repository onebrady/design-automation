// Streaming Enhancement Delivery - Progressive enhancement with real-time feedback
const { Readable } = require('stream');
const EventEmitter = require('events');

class StreamingEnhancementService extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = {
      chunkSize: 1024, // bytes per chunk
      delayMs: 50, // delay between chunks for smoother streaming
      enableProgressUpdates: true,
      ...options
    };
  }

  // Create a streaming enhancement from CSS code
  async createEnhancementStream(code, tokens = {}, options = {}) {
    const { enhanceCss } = require('../engine');
    
    return new Promise((resolve, reject) => {
      try {
        // Perform the enhancement
        const result = enhanceCss({ 
          code, 
          tokens, 
          filePath: options.filePath || '',
          maxChanges: options.maxChanges || 10
        });

        // Create a readable stream that emits the enhanced code progressively
        const stream = this.createProgressiveStream(result);
        resolve(stream);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Create a stream that delivers content progressively
  createProgressiveStream(enhancementResult) {
    const { code, changes } = enhancementResult;
    let position = 0;
    let changeIndex = 0;
    
    const self = this;
    const stream = new Readable({
      read() {
        // Stream the enhanced code in chunks
        if (position < code.length) {
          const chunk = code.slice(position, position + self.options.chunkSize);
          position += chunk.length;
          
          // Include progress metadata
          const progress = {
            type: 'code_chunk',
            content: chunk,
            position,
            total: code.length,
            progress: Math.round((position / code.length) * 100)
          };

          // Add change information if we've crossed a change boundary
          if (changeIndex < changes.length && position >= self.getChangePosition(changes[changeIndex], code)) {
            progress.change = changes[changeIndex];
            progress.changeIndex = changeIndex;
            changeIndex++;
          }

          setTimeout(() => {
            this.push(JSON.stringify(progress) + '\n');
          }, self.options.delayMs);

        } else if (changeIndex < changes.length) {
          // Send remaining changes
          const change = changes[changeIndex];
          const changeData = {
            type: 'change_info',
            change,
            changeIndex,
            totalChanges: changes.length
          };
          
          changeIndex++;
          setTimeout(() => {
            this.push(JSON.stringify(changeData) + '\n');
          }, self.options.delayMs);

        } else {
          // Stream complete
          const completion = {
            type: 'complete',
            totalChanges: changes.length,
            codeLength: code.length,
            timestamp: new Date().toISOString()
          };
          
          this.push(JSON.stringify(completion) + '\n');
          this.push(null); // End stream
        }
      }
    });

    return stream;
  }

  // Create a stream for multiple file enhancements
  async createBatchEnhancementStream(files, tokens = {}, options = {}) {
    const stream = new Readable({
      read() {} // Will be pushed to externally
    });

    // Process files sequentially with progress updates
    this.processBatchAsync(files, tokens, options, stream);
    
    return stream;
  }

  async processBatchAsync(files, tokens, options, stream) {
    try {
      stream.push(JSON.stringify({
        type: 'batch_start',
        totalFiles: files.length,
        timestamp: new Date().toISOString()
      }) + '\n');

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        stream.push(JSON.stringify({
          type: 'file_start',
          file: file.path,
          index: i,
          progress: Math.round((i / files.length) * 100)
        }) + '\n');

        try {
          const { enhanceCss } = require('../engine');
          const result = enhanceCss({
            code: file.code,
            tokens,
            filePath: file.path,
            maxChanges: options.maxChanges || 5
          });

          // Stream file result
          stream.push(JSON.stringify({
            type: 'file_complete',
            file: file.path,
            changes: result.changes,
            code: result.code,
            index: i
          }) + '\n');

        } catch (error) {
          stream.push(JSON.stringify({
            type: 'file_error',
            file: file.path,
            error: error.message,
            index: i
          }) + '\n');
        }

        // Brief delay between files
        await new Promise(resolve => setTimeout(resolve, this.options.delayMs));
      }

      stream.push(JSON.stringify({
        type: 'batch_complete',
        totalFiles: files.length,
        timestamp: new Date().toISOString()
      }) + '\n');

      stream.push(null); // End stream

    } catch (error) {
      stream.push(JSON.stringify({
        type: 'batch_error',
        error: error.message,
        timestamp: new Date().toISOString()
      }) + '\n');
      stream.push(null);
    }
  }

  // Create a stream that monitors and enhances files in real-time
  createFileWatchStream(watcher, enhanceOptions = {}) {
    const stream = new Readable({
      read() {} // Will be pushed to externally
    });

    // Set up file watcher event handlers
    watcher.on('file:changed', async (fileInfo) => {
      if (fileInfo.needsEnhancement) {
        try {
          const fs = require('fs');
          const code = fs.readFileSync(fileInfo.path, 'utf8');
          
          const enhancementStream = await this.createEnhancementStream(
            code, 
            enhanceOptions.tokens || {}, 
            { ...enhanceOptions, filePath: fileInfo.path }
          );

          stream.push(JSON.stringify({
            type: 'file_enhancement_start',
            file: fileInfo.path,
            reason: fileInfo.reason,
            timestamp: fileInfo.timestamp
          }) + '\n');

          // Pipe enhancement stream data
          enhancementStream.on('data', (chunk) => {
            const data = JSON.parse(chunk.toString());
            stream.push(JSON.stringify({
              type: 'file_enhancement_data',
              file: fileInfo.path,
              ...data
            }) + '\n');
          });

          enhancementStream.on('end', () => {
            stream.push(JSON.stringify({
              type: 'file_enhancement_complete',
              file: fileInfo.path,
              timestamp: new Date().toISOString()
            }) + '\n');
          });

        } catch (error) {
          stream.push(JSON.stringify({
            type: 'file_enhancement_error',
            file: fileInfo.path,
            error: error.message,
            timestamp: new Date().toISOString()
          }) + '\n');
        }
      }
    });

    return stream;
  }

  // Helper to estimate where a change occurs in the code
  getChangePosition(change, code) {
    if (change.before) {
      const index = code.indexOf(change.before);
      return index >= 0 ? index : code.length;
    }
    return 0;
  }

  // Create a real-time preview stream that shows changes as they happen
  createPreviewStream(initialCode, tokens = {}) {
    const stream = new Readable({
      read() {} // Will be pushed to externally
    });

    let currentCode = initialCode;
    
    // Send initial state
    stream.push(JSON.stringify({
      type: 'preview_init',
      code: currentCode,
      timestamp: new Date().toISOString()
    }) + '\n');

    // Return stream with update method
    stream.updateCode = async (newCode, options = {}) => {
      try {
        const { enhanceCss } = require('../engine');
        const result = enhanceCss({
          code: newCode,
          tokens,
          filePath: options.filePath || ''
        });

        // Calculate diff between current and new
        const diff = this.calculateDiff(currentCode, result.code);
        
        stream.push(JSON.stringify({
          type: 'preview_update',
          code: result.code,
          changes: result.changes,
          diff,
          timestamp: new Date().toISOString()
        }) + '\n');

        currentCode = result.code;

      } catch (error) {
        stream.push(JSON.stringify({
          type: 'preview_error',
          error: error.message,
          timestamp: new Date().toISOString()
        }) + '\n');
      }
    };

    return stream;
  }

  // Simple diff calculation for preview updates
  calculateDiff(oldCode, newCode) {
    const oldLines = oldCode.split('\n');
    const newLines = newCode.split('\n');
    const changes = [];

    const maxLines = Math.max(oldLines.length, newLines.length);
    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];

      if (oldLine !== newLine) {
        if (oldLine === undefined) {
          changes.push({ type: 'add', line: i + 1, content: newLine });
        } else if (newLine === undefined) {
          changes.push({ type: 'remove', line: i + 1, content: oldLine });
        } else {
          changes.push({ type: 'modify', line: i + 1, old: oldLine, new: newLine });
        }
      }
    }

    return changes;
  }

  // Get streaming service statistics
  getStats() {
    return {
      options: this.options,
      activeStreams: this.listenerCount('stream:created'),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { StreamingEnhancementService };