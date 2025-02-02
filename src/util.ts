import process from 'node:process';

export function getPid() {
  if (typeof process !== 'undefined') {
    return process.pid;
  }

  return null;
}
