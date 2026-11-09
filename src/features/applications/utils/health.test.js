import test from 'node:test';
import assert from 'node:assert/strict';

import { summarizeApplicationHealth, getHealthStatusMeta } from './health.js';

test('summarizeApplicationHealth prefers the worst nested health status', () => {
  const app = {
    environments: [
      {
        health: { status: 'UP', latencyMs: 120, checkedAt: '2026-11-09T05:13:53.109Z', message: 'Request succeeded' },
        components: [
          { health: { status: 'UP', latencyMs: 200, message: 'Up' } },
          { health: { status: 'DOWN', code: 'ENOTFOUND', message: 'Host unreachable', latencyMs: 350 } },
        ],
      },
    ],
  };

  const summary = summarizeApplicationHealth(app);

  assert.equal(summary.status, 'DOWN');
  assert.equal(summary.downCount, 1);
  assert.equal(summary.upCount, 2);
  assert.equal(summary.message, 'Host unreachable');
});

test('getHealthStatusMeta maps UP into a user-friendly label', () => {
  const meta = getHealthStatusMeta('UP');

  assert.equal(meta.label, 'Healthy');
  assert.equal(meta.color, 'success');
});
