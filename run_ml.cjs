/**
 * Cross-platform launcher for SENTRY Python ML microservice
 */
const { spawn } = require('child_process');

const candidates = [
  { cmd: 'py', args: ['-3.12', 'ml_service.py'] },
  { cmd: 'python3', args: ['ml_service.py'] },
  { cmd: 'python', args: ['ml_service.py'] },
];

function tryCandidate(index) {
  if (index >= candidates.length) {
    console.error('[ML Engine] Could not locate a working Python executable (tried py, python3, python).');
    process.exit(1);
  }

  const { cmd, args } = candidates[index];
  const proc = spawn(cmd, args, { stdio: 'inherit', shell: true });

  proc.on('error', () => {
    tryCandidate(index + 1);
  });

  proc.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.warn(`[ML Engine] Candidate ${cmd} exited with code ${code}. Trying next...`);
      tryCandidate(index + 1);
    }
  });
}

tryCandidate(0);
