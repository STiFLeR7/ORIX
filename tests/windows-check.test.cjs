'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { check } = require('../check-windows.cjs');
test('Windows helper reports invalid targets and unknown commands in English', { skip: process.platform !== 'win32' }, () => {
  const { spawnSync } = require('node:child_process');
  const input = [JSON.stringify({ id: 1, method: 'read', target: { id: 'invalid', handle: 0, pid: 0, started: '' } }),
    JSON.stringify({ id: 2, method: 'unknown' })].join('\n') + '\n';
  const result = spawnSync('powershell.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-File', require('node:path').resolve(__dirname, '../windows-ai-access.ps1')], { input, encoding: 'utf8', timeout: 20000 });
  assert.equal(result.status, 0, result.stderr);
  const lines = result.stdout.trim().split(/\r?\n/).map(JSON.parse);
  assert.equal(lines[0].result.error, 'The connected window is closed.');
  assert.equal(lines[1].result.error, 'Unknown command.');
});
test('Windows check skips unrelated windows and never prints conversation content', async () => {
  const logs = [], actions = [];
  const worker = { request: async (method, args) => {
    actions.push(method);
    if (method === 'windows') return { ok:true, windows:[{id:'other'},{id:'ai'}] };
    if (args.target.id === 'other') return {ok:false};
    return {ok:true,provider:'chatgpt',contextKey:'context',nodes:[
      {index:0,id:'doc',type:'Document'},
      {index:1,id:'marker',type:'Text',name:'ChatGPT said:'},
      {index:2,id:'answer',type:'Text',name:'PRIVATE CONVERSATION'},
      {index:3,id:'copy',type:'Button',name:'Copy',enabled:true},
      {index:4,id:'input',type:'Edit',automationId:'prompt-textarea',enabled:true}
    ]};
  }};
  assert.deepEqual(await check(worker,line=>logs.push(line)),{identified:1,readable:1});
  assert.equal(logs.join('\n').includes('PRIVATE CONVERSATION'),false);
  assert.match(logs.join('\n'),/invoerveld herkend/);
  assert.deepEqual(actions,['windows','read','read']);
});
test('Windows check rejects worker startup failure', async () => {
  await assert.rejects(check({request:async()=>({ok:false,error:'Startup failure'})},()=>{}),/Startup failure/);
});
