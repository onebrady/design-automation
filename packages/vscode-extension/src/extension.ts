// VS Code Extension - Agentic Design Assistant with real-time enhancement suggestions
import * as vscode from 'vscode';
import * as WebSocket from 'ws';

interface EnhancementResult {
  code: string;
  changes: Array<{
    type: string;
    before: string;
    after: string;
    location: string;
  }>;
  cacheHit?: boolean;
}

interface ProjectContext {
  brandPack: {
    id: string;
    version: string;
    source: string;
  } | null;
  projectId: string | null;
  degraded: boolean;
  mongoAvailable: boolean;
}

class AgenticExtension {
  private context: vscode.ExtensionContext;
  private statusBarItem: vscode.StatusBarItem;
  private diagnosticCollection: vscode.DiagnosticCollection;
  private websocket: WebSocket | null = null;
  private decorationType: vscode.TextEditorDecorationType;
  private projectContext: ProjectContext | null = null;
  private autoEnhancementEnabled: boolean = false;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('agentic');
    
    // Create decoration type for enhancement hints
    this.decorationType = vscode.window.createTextEditorDecorationType({
      after: {
        margin: '0 0 0 1rem',
        textDecoration: 'none'
      },
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
    });

    this.initialize();
  }

  private async initialize() {
    // Register commands
    this.context.subscriptions.push(
      vscode.commands.registerCommand('agentic.enhanceFile', () => this.enhanceCurrentFile()),
      vscode.commands.registerCommand('agentic.previewEnhancement', () => this.previewEnhancement()),
      vscode.commands.registerCommand('agentic.toggleAutoEnhancement', () => this.toggleAutoEnhancement()),
      vscode.commands.registerCommand('agentic.showProjectContext', () => this.showProjectContext())
    );

    // Set up event listeners
    vscode.workspace.onDidSaveTextDocument(this.onDocumentSave, this, this.context.subscriptions);
    vscode.workspace.onDidChangeTextDocument(this.onDocumentChange, this, this.context.subscriptions);
    vscode.window.onDidChangeActiveTextEditor(this.onActiveEditorChange, this, this.context.subscriptions);

    // Initialize project context and WebSocket connection
    await this.refreshProjectContext();
    this.connectWebSocket();
    this.updateStatusBar();

    // Show inline hints for supported files
    if (this.getConfig('showInlineHints')) {
      this.showEnhancementHints();
    }
  }

  private async refreshProjectContext() {
    try {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) return;

      const serverUrl = this.getConfig('serverUrl');
      const response = await this.makeHttpRequest(`${serverUrl}/api/context`, {
        method: 'POST',
        body: JSON.stringify({ projectPath: workspaceFolder.uri.fsPath })
      });

      this.projectContext = response;
      
    } catch (error) {
      console.error('Failed to get project context:', error);
      this.projectContext = {
        brandPack: null,
        projectId: null,
        degraded: true,
        mongoAvailable: false
      };
    }
  }

  private connectWebSocket() {
    const websocketUrl = this.getConfig('websocketUrl');
    
    try {
      this.websocket = new WebSocket(websocketUrl);

      this.websocket.on('open', () => {
        console.log('Connected to Agentic WebSocket server');
        this.updateStatusBar('Connected');

        // Join project room for file updates
        this.websocket?.send(JSON.stringify({
          type: 'room:join',
          room: `project:${this.projectContext?.projectId || 'default'}`,
          metadata: { vsCode: true, version: vscode.version }
        }));
      });

      this.websocket.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      });

      this.websocket.on('close', () => {
        console.log('Disconnected from Agentic WebSocket server');
        this.updateStatusBar('Disconnected');
        
        // Attempt reconnection after 5 seconds
        setTimeout(() => this.connectWebSocket(), 5000);
      });

      this.websocket.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.updateStatusBar('Error');
      });

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.updateStatusBar('Failed');
    }
  }

  private handleWebSocketMessage(message: any) {
    switch (message.type) {
      case 'file:changed':
        this.handleFileChanged(message);
        break;
      
      case 'enhancement:auto_data':
        this.handleEnhancementData(message);
        break;
      
      case 'enhancement:suggestion':
        this.showEnhancementSuggestion(message);
        break;
    }
  }

  private async enhanceCurrentFile() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor');
      return;
    }

    const document = editor.document;
    if (!this.isSupportedFile(document)) {
      vscode.window.showWarningMessage('File type not supported for enhancement');
      return;
    }

    try {
      const code = document.getText();
      const serverUrl = this.getConfig('serverUrl');
      
      const response = await this.makeHttpRequest(`${serverUrl}/api/design/enhance`, {
        method: 'POST',
        body: JSON.stringify({
          code,
          filePath: document.fileName,
          maxChanges: this.getConfig('maxChanges')
        })
      });

      const result: EnhancementResult = response;

      if (result.changes.length === 0) {
        vscode.window.showInformationMessage('No enhancements found');
        return;
      }

      // Show changes and apply if user confirms
      const apply = await this.showEnhancementPreview(result);
      if (apply) {
        await this.applyEnhancement(editor, result);
        vscode.window.showInformationMessage(`Applied ${result.changes.length} enhancements`);
      }

    } catch (error: any) {
      vscode.window.showErrorMessage(`Enhancement failed: ${error.message}`);
    }
  }

  private async previewEnhancement() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const document = editor.document;
    if (!this.isSupportedFile(document)) return;

    try {
      const code = document.getText();
      const serverUrl = this.getConfig('serverUrl');
      
      // Send preview request via WebSocket for real-time streaming
      if (this.websocket?.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({
          type: 'enhancement:request',
          code,
          filePath: document.fileName,
          options: { preview: true },
          requestId: this.generateId()
        }));
      }

    } catch (error: any) {
      vscode.window.showErrorMessage(`Preview failed: ${error.message}`);
    }
  }

  private async showEnhancementPreview(result: EnhancementResult): Promise<boolean> {
    const items = result.changes.map(change => ({
      label: `${change.type}: ${change.location}`,
      description: `${change.before} → ${change.after}`,
      detail: change.location
    }));

    const selection = await vscode.window.showQuickPick(
      [
        { label: '✅ Apply All Changes', action: 'apply' },
        { label: '❌ Cancel', action: 'cancel' },
        ...items.map(item => ({ ...item, action: 'view' }))
      ],
      {
        title: `${result.changes.length} Enhancement(s) Found`,
        placeHolder: 'Choose an action'
      }
    );

    return selection?.action === 'apply';
  }

  private async applyEnhancement(editor: vscode.TextEditor, result: EnhancementResult) {
    const edit = new vscode.WorkspaceEdit();
    const document = editor.document;

    // Replace entire document content with enhanced version
    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(document.getText().length)
    );

    edit.replace(document.uri, fullRange, result.code);
    await vscode.workspace.applyEdit(edit);
  }

  private async toggleAutoEnhancement() {
    this.autoEnhancementEnabled = !this.autoEnhancementEnabled;
    
    const config = vscode.workspace.getConfiguration('agentic');
    await config.update('autoEnhancement', this.autoEnhancementEnabled);
    
    vscode.window.showInformationMessage(
      `Auto enhancement ${this.autoEnhancementEnabled ? 'enabled' : 'disabled'}`
    );
    
    this.updateStatusBar();
  }

  private async showProjectContext() {
    if (!this.projectContext) {
      await this.refreshProjectContext();
    }

    const info = [
      `Brand Pack: ${this.projectContext?.brandPack?.id || 'None'}`,
      `Version: ${this.projectContext?.brandPack?.version || 'N/A'}`,
      `Source: ${this.projectContext?.brandPack?.source || 'N/A'}`,
      `MongoDB: ${this.projectContext?.mongoAvailable ? 'Available' : 'Unavailable'}`,
      `Status: ${this.projectContext?.degraded ? 'Degraded' : 'Normal'}`
    ].join('\\n');

    vscode.window.showInformationMessage(info, { modal: true });
  }

  private async onDocumentSave(document: vscode.TextDocument) {
    if (this.autoEnhancementEnabled && this.isSupportedFile(document)) {
      const code = document.getText();
      
      // Send enhancement request via WebSocket
      if (this.websocket?.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({
          type: 'enhancement:request',
          code,
          filePath: document.fileName,
          options: { autoApply: true },
          requestId: this.generateId()
        }));
      }
    }
  }

  private onDocumentChange(event: vscode.TextDocumentChangeEvent) {
    if (!this.getConfig('showInlineHints')) return;
    if (!this.isSupportedFile(event.document)) return;

    // Debounced hint updates
    clearTimeout((this as any).hintTimeout);
    (this as any).hintTimeout = setTimeout(() => {
      this.showEnhancementHints();
    }, this.getConfig('debounceMs'));
  }

  private onActiveEditorChange(editor?: vscode.TextEditor) {
    if (editor && this.isSupportedFile(editor.document) && this.getConfig('showInlineHints')) {
      this.showEnhancementHints();
    }
  }

  private async showEnhancementHints() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !this.isSupportedFile(editor.document)) return;

    const document = editor.document;
    const code = document.getText();
    
    // Quick analysis for hint candidates
    const hints = this.findEnhancementHints(code);
    const decorations: vscode.DecorationOptions[] = [];

    for (const hint of hints) {
      const position = document.positionAt(hint.offset);
      const range = new vscode.Range(position, position);
      
      decorations.push({
        range,
        renderOptions: {
          after: {
            contentText: ` → ${hint.suggestion}`,
            color: new vscode.ThemeColor('agentic.enhancementHint'),
            fontStyle: 'italic'
          }
        }
      });
    }

    editor.setDecorations(this.decorationType, decorations);
  }

  private findEnhancementHints(code: string) {
    const hints: Array<{ offset: number; suggestion: string }> = [];
    
    // Look for common tokenizable patterns
    const colorRegex = /#([0-9a-fA-F]{6})/g;
    let match;
    
    while ((match = colorRegex.exec(code)) !== null) {
      hints.push({
        offset: match.index,
        suggestion: 'var(--color-primary)'
      });
    }

    const spacingRegex = /(margin|padding):\s*(\d+px)/g;
    while ((match = spacingRegex.exec(code)) !== null) {
      hints.push({
        offset: match.index + match[0].indexOf(match[2]),
        suggestion: 'var(--spacing-md)'
      });
    }

    return hints.slice(0, 10); // Limit hints to avoid clutter
  }

  private handleFileChanged(message: any) {
    if (message.needsEnhancement) {
      vscode.window.showInformationMessage(
        `File changed: ${message.file} - Enhancement available`,
        'Enhance Now'
      ).then(selection => {
        if (selection === 'Enhance Now') {
          this.enhanceCurrentFile();
        }
      });
    }
  }

  private handleEnhancementData(message: any) {
    // Handle streaming enhancement data
    if (message.type === 'complete') {
      vscode.window.showInformationMessage(
        `Auto enhancement complete: ${message.totalChanges} changes applied`
      );
    }
  }

  private showEnhancementSuggestion(message: any) {
    const suggestion = message.suggestion;
    vscode.window.showInformationMessage(
      `Enhancement suggestion: ${suggestion.description}`,
      'Apply',
      'Dismiss'
    ).then(selection => {
      if (selection === 'Apply') {
        // Apply the suggested enhancement
        this.applySuggestion(suggestion);
      }
    });
  }

  private async applySuggestion(suggestion: any) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    try {
      const edit = new vscode.WorkspaceEdit();
      const document = editor.document;
      
      // Apply suggestion based on type
      if (suggestion.range) {
        const range = new vscode.Range(
          document.positionAt(suggestion.range.start),
          document.positionAt(suggestion.range.end)
        );
        edit.replace(document.uri, range, suggestion.replacement);
        await vscode.workspace.applyEdit(edit);
      }

    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to apply suggestion: ${error.message}`);
    }
  }

  private updateStatusBar(connectionStatus?: string) {
    const enabled = this.getConfig('enabled');
    const auto = this.autoEnhancementEnabled;
    const brand = this.projectContext?.brandPack?.id || 'None';
    
    let status = enabled ? '🎨' : '⏸️';
    if (auto) status += ' 🔄';
    if (connectionStatus) status += ` (${connectionStatus})`;
    
    this.statusBarItem.text = `${status} Agentic`;
    this.statusBarItem.tooltip = `Brand Pack: ${brand}\\nAuto Enhancement: ${auto ? 'On' : 'Off'}\\nConnection: ${connectionStatus || 'Unknown'}`;
    this.statusBarItem.command = 'agentic.showProjectContext';
    this.statusBarItem.show();
  }

  private isSupportedFile(document: vscode.TextDocument): boolean {
    const supportedLanguages = ['css', 'html', 'javascript', 'typescript', 'javascriptreact', 'typescriptreact'];
    return supportedLanguages.includes(document.languageId);
  }

  private getConfig(key: string): any {
    return vscode.workspace.getConfiguration('agentic').get(key);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private async makeHttpRequest(url: string, options: any = {}): Promise<any> {
    const https = await import('https');
    const http = await import('http');
    const urlModule = await import('url');
    
    return new Promise((resolve, reject) => {
      const parsedUrl = new urlModule.URL(url);
      const isHttps = parsedUrl.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const requestOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      };

      const req = client.request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error(`Invalid JSON response: ${data}`));
          }
        });
      });

      req.on('error', reject);
      
      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  }

  dispose() {
    this.statusBarItem.dispose();
    this.diagnosticCollection.dispose();
    this.decorationType.dispose();
    if (this.websocket) {
      this.websocket.close();
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  const extension = new AgenticExtension(context);
  context.subscriptions.push(extension);
}

export function deactivate() {
  // Extension deactivation cleanup handled by dispose methods
}