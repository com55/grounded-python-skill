#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILL_NAME = 'grounded-python';
const targetDir = path.join(os.homedir(), '.claude', 'skills', SKILL_NAME);
const evalsDir = path.join(targetDir, 'evals');

fs.mkdirSync(evalsDir, { recursive: true });

fs.copyFileSync(
  path.join(__dirname, 'SKILL.md'),
  path.join(targetDir, 'SKILL.md')
);

const evalsSrc = path.join(__dirname, 'evals', 'evals.json');
if (fs.existsSync(evalsSrc)) {
  fs.copyFileSync(evalsSrc, path.join(evalsDir, 'evals.json'));
}

console.log(`installed: ${targetDir}`);
console.log('start a new Claude Code session to activate grounded-python');
