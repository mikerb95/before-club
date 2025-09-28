const { execSync } = require('child_process');
const fs = require('fs');

// Block commits that add node_modules or files > 95MB
try {
  const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
  const problematic = [];
  for (const file of staged) {
    if (file.startsWith('node_modules/')) problematic.push(file + ' (tracked under node_modules)');
    try {
      const stats = fs.statSync(file);
      if (stats.size > 95 * 1024 * 1024) problematic.push(`${file} (${(stats.size/1024/1024).toFixed(2)} MB)`);
    } catch (e) {
      // ignore missing files (deleted)
    }
  }
  if (problematic.length) {
    console.error('Commit blocked: detected large or node_modules files staged:');
    console.error(problematic.join('\n'));
    process.exit(1);
  }
  process.exit(0);
} catch (e) {
  console.error('Failed to check staged files:', e.message);
  process.exit(1);
}
