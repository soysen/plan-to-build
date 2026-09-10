const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { assertPhase } = require('./assert-phase');

function createTempWorkspace() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'p2b-assert-test-'));
  return {
    tmpDir,
    cleanup: () => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  };
}

test('assertPhase rejects invalid phase numbers', () => {
  const r1 = assertPhase(0);
  assert.strictEqual(r1.pass, false);
  assert.ok(r1.errors.some(e => e.includes('無效的 Phase 編號')));

  const r2 = assertPhase('abc');
  assert.strictEqual(r2.pass, false);
  assert.ok(r2.errors.some(e => e.includes('無效的 Phase 編號')));

  const r3 = assertPhase(4);
  assert.strictEqual(r3.pass, false);
});

test('assertPhase Phase 1: detects missing REQUIREMENTS.md', () => {
  const { tmpDir, cleanup } = createTempWorkspace();
  try {
    const report = assertPhase(1, { workspaceRoot: tmpDir });
    assert.strictEqual(report.phase, 1);
    assert.strictEqual(report.pass, false);
    assert.ok(report.missingSections.includes('## User Stories'));
    assert.ok(report.missingSections.includes('## Acceptance Criteria'));
    assert.ok(report.errors.some(e => e.includes('檔案不存在')));
  } finally {
    cleanup();
  }
});

test('assertPhase Phase 1: detects missing sections in REQUIREMENTS.md', () => {
  const { tmpDir, cleanup } = createTempWorkspace();
  try {
    fs.mkdirSync(path.join(tmpDir, 'docs'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'docs/REQUIREMENTS.md'), '# Requirements\n\nSome text', 'utf-8');

    const report = assertPhase(1, { workspaceRoot: tmpDir });
    assert.strictEqual(report.pass, false);
    assert.ok(report.missingSections.includes('## User Stories'));
    assert.ok(report.missingSections.includes('## Acceptance Criteria'));
  } finally {
    cleanup();
  }
});

test('assertPhase Phase 1: detects insufficient acceptance criteria (< 3)', () => {
  const { tmpDir, cleanup } = createTempWorkspace();
  try {
    fs.mkdirSync(path.join(tmpDir, 'docs'), { recursive: true });
    const content = `
# Requirements
## User Stories
- As a user, I want feature X.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
`;
    fs.writeFileSync(path.join(tmpDir, 'docs/REQUIREMENTS.md'), content, 'utf-8');

    const report = assertPhase(1, { workspaceRoot: tmpDir });
    assert.strictEqual(report.pass, false);
    assert.strictEqual(report.missingSections.length, 0);
    assert.ok(report.errors.some(e => e.includes('不足 3 條')));
  } finally {
    cleanup();
  }
});

test('assertPhase Phase 1: passes with valid REQUIREMENTS.md and >= 3 criteria', () => {
  const { tmpDir, cleanup } = createTempWorkspace();
  try {
    fs.mkdirSync(path.join(tmpDir, 'docs'), { recursive: true });
    const content = `
# Requirements
## User Stories
- As a user, I want feature X so that Y.

## Acceptance Criteria
- [ ] Criterion 1: User can register
- [x] Criterion 2: User can login
- [ ] Criterion 3: User receives verification email
`;
    fs.writeFileSync(path.join(tmpDir, 'docs/REQUIREMENTS.md'), content, 'utf-8');

    const report = assertPhase(1, { workspaceRoot: tmpDir });
    assert.strictEqual(report.pass, true);
    assert.strictEqual(report.missingSections.length, 0);
    assert.strictEqual(report.errors.length, 0);
  } finally {
    cleanup();
  }
});

test('assertPhase Phase 2: detects missing TECHNICAL_SPEC.md and schema.prisma', () => {
  const { tmpDir, cleanup } = createTempWorkspace();
  try {
    const report = assertPhase(2, { workspaceRoot: tmpDir });
    assert.strictEqual(report.phase, 2);
    assert.strictEqual(report.pass, false);
    assert.ok(report.missingSections.includes('## Data Models'));
    assert.ok(report.missingSections.includes('## API Specifications'));
    assert.ok(report.errors.some(e => e.includes('TECHNICAL_SPEC.md')));
    assert.ok(report.errors.some(e => e.includes('schema.prisma')));
  } finally {
    cleanup();
  }
});

test('assertPhase Phase 2: detects missing sections when TECHNICAL_SPEC.md exists', () => {
  const { tmpDir, cleanup } = createTempWorkspace();
  try {
    fs.mkdirSync(path.join(tmpDir, 'docs'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'docs/TECHNICAL_SPEC.md'), '# Spec\n## Data Models\nUser model', 'utf-8');

    const report = assertPhase(2, { workspaceRoot: tmpDir });
    assert.strictEqual(report.pass, false);
    assert.strictEqual(report.missingSections.includes('## Data Models'), false);
    assert.ok(report.missingSections.includes('## API Specifications'));
  } finally {
    cleanup();
  }
});

test('assertPhase Phase 3: detects missing page.tsx', () => {
  const { tmpDir, cleanup } = createTempWorkspace();
  try {
    const report = assertPhase(3, { workspaceRoot: tmpDir });
    assert.strictEqual(report.pass, false);
    assert.ok(report.errors.some(e => e.includes('page.tsx')));
  } finally {
    cleanup();
  }
});

test('assertPhase Phase 3: detects missing export default in page.tsx', () => {
  const { tmpDir, cleanup } = createTempWorkspace();
  try {
    fs.mkdirSync(path.join(tmpDir, 'src/app'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'src/app/page.tsx'), 'export const Home = () => <div>Hello</div>;', 'utf-8');

    const report = assertPhase(3, { workspaceRoot: tmpDir });
    assert.strictEqual(report.pass, false);
    assert.ok(report.errors.some(e => e.includes('缺少 export default')));
  } finally {
    cleanup();
  }
});

test('assertPhase Phase 3: detects syntax error in page.tsx', () => {
  const { tmpDir, cleanup } = createTempWorkspace();
  try {
    fs.mkdirSync(path.join(tmpDir, 'src/app'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, 'src/app/page.tsx'),
      'export default function Page() { return <div>Unclosed; }',
      'utf-8'
    );

    const report = assertPhase(3, { workspaceRoot: tmpDir });
    assert.strictEqual(report.pass, false);
    assert.ok(report.errors.some(e => e.includes('語法錯誤')));
  } finally {
    cleanup();
  }
});

test('assertPhase Phase 3: passes with valid TSX page with export default', () => {
  const { tmpDir, cleanup } = createTempWorkspace();
  try {
    fs.mkdirSync(path.join(tmpDir, 'src/app'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, 'src/app/page.tsx'),
      'export default function HomePage() { return <div>Hello World</div>; }\n',
      'utf-8'
    );

    const report = assertPhase(3, { workspaceRoot: tmpDir });
    assert.strictEqual(report.pass, true);
    assert.strictEqual(report.errors.length, 0);
  } finally {
    cleanup();
  }
});
