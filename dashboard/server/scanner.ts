import fg from 'fast-glob';
import chokidar, { FSWatcher } from 'chokidar';
import path from 'path';
import fs from 'fs';
import { parseProjectWorkflow } from './parser.js';
import { ProjectWorkflow } from '../src/types/workflow.js';

export type ChangeCallback = (workflows: ProjectWorkflow[]) => void;

export class WorkflowScanner {
  private baseDir: string;
  private statusFiles: Set<string> = new Set();
  private watcher: FSWatcher | null = null;
  private callbacks: Set<ChangeCallback> = new Set();

  constructor(baseDir: string = '/Users/i_nelsonchung/projects') {
    this.baseDir = baseDir;
  }

  public async init(): Promise<ProjectWorkflow[]> {
    try {
      // Find all agent-status.md files under ~/projects/, ignoring symlinked agent dirs
      const pattern = '**/.github/worklog/agent-status.md';
      const matches = await fg(pattern, {
        cwd: this.baseDir,
        absolute: true,
        deep: 6,
        ignore: [
          '**/node_modules/**', 
          '**/.git/**', 
          '**/dist/**', 
          '**/build/**',
          '**/.agent/**',
          '**/.claude/**'
        ]
      });

      // Deduplicate real paths
      const uniqueFiles = new Set<string>();
      for (const m of matches) {
        try {
          const real = fs.realpathSync(m);
          uniqueFiles.add(real);
        } catch {
          uniqueFiles.add(m);
        }
      }

      this.statusFiles = uniqueFiles;
      this.startWatching();

      return this.getAllWorkflows();
    } catch (err) {
      console.error('Error during scanner init:', err);
      return [];
    }
  }

  public getAllWorkflows(): ProjectWorkflow[] {
    const workflows: ProjectWorkflow[] = [];
    const seenProjects = new Set<string>();

    for (const filePath of this.statusFiles) {
      const parsed = parseProjectWorkflow(filePath);
      if (parsed && !seenProjects.has(parsed.projectPath)) {
        seenProjects.add(parsed.projectPath);
        workflows.push(parsed);
      }
    }
    // Sort by status priority: 進行中 / 阻塞 / 需補充輸入 first, then idle/completed
    return workflows.sort((a, b) => {
      const getPriority = (status: string) => {
        if (status === '進行中') return 1;
        if (status === '阻塞' || status === '需補充輸入') return 2;
        if (status === '暫停') return 3;
        return 4;
      };
      return getPriority(a.activeTask.status) - getPriority(b.activeTask.status);
    });
  }

  public subscribe(cb: ChangeCallback): () => void {
    this.callbacks.add(cb);
    return () => this.callbacks.delete(cb);
  }

  private notifyAll(): void {
    const data = this.getAllWorkflows();
    for (const cb of this.callbacks) {
      try {
        cb(data);
      } catch (err) {
        console.error('Error in scanner callback:', err);
      }
    }
  }

  private startWatching(): void {
    if (this.watcher) {
      this.watcher.close();
    }

    const filesToWatch = Array.from(this.statusFiles);
    // Watch status files + build-plan directory files
    const planPatterns = Array.from(this.statusFiles).map(f => {
      const projDir = path.resolve(f, '../../..');
      return path.join(projDir, '.github', 'harness', 'plan', '*.md');
    });

    this.watcher = chokidar.watch([...filesToWatch, ...planPatterns], {
      ignoreInitial: true,
      persistent: true
    });

    this.watcher.on('change', (changedPath) => {
      console.log(`[Scanner] File changed: ${changedPath}`);
      if (changedPath.endsWith('agent-status.md')) {
        this.statusFiles.add(changedPath);
      }
      this.notifyAll();
    });

    this.watcher.on('add', (addedPath) => {
      if (addedPath.endsWith('agent-status.md')) {
        console.log(`[Scanner] New status file added: ${addedPath}`);
        this.statusFiles.add(addedPath);
        this.notifyAll();
      }
    });

    this.watcher.on('unlink', (removedPath) => {
      if (this.statusFiles.has(removedPath)) {
        console.log(`[Scanner] Status file removed: ${removedPath}`);
        this.statusFiles.delete(removedPath);
        this.notifyAll();
      }
    });
  }

  public close(): void {
    if (this.watcher) {
      this.watcher.close();
    }
  }
}
