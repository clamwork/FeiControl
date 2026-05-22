/**
 * 心情计算单元测试
 */
import { calculateMood } from '../mood-calculator';
import { checkInitiative } from '../initiative-engine';
import { closePersonalityDb } from '../db';

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`FAIL: ${msg}`);
  console.log(`  ✓ ${msg}`);
}

// 1. 平静+任务完成 → 开心
assert(calculateMood('t', [{type:'task_done', timestamp:Date.now()-5000}], 'calm', Date.now()-3600000).mood === 'happy', 'task_done');

// 2. 开心+任务失败 → 困惑
assert(calculateMood('t', [{type:'task_fail', timestamp:Date.now()-5000}], 'happy', Date.now()-3600000).mood === 'confused', 'task_fail');

// 3. 开心+批评 → 困惑
assert(calculateMood('t', [{type:'user_criticism', timestamp:Date.now()-5000}], 'happy', Date.now()-3600000).mood === 'confused', 'criticism');

// 4. 平静+表扬 → 兴奋
assert(calculateMood('t', [{type:'user_praise', timestamp:Date.now()-5000}], 'calm', Date.now()-3600000).mood === 'excited', 'praise');

// 5. 兴奋+空闲 → 平静(衰减)
assert(calculateMood('t', [{type:'long_idle', timestamp:Date.now()-5000}], 'excited', Date.now()-3600000).mood === 'calm', 'idle_decay');

// 6. task_fail(sad) + praise(happy) → happy
assert(calculateMood('t', [
  {type:'task_fail', timestamp:Date.now()-10000},
  {type:'user_praise', timestamp:Date.now()-5000},
], 'calm', Date.now()-3600000).mood === 'happy', 'fail_then_praise');

// 7. 8小时无事件 → 平静
assert(calculateMood('t', [], 'excited', Date.now()-8*3600000).mood === 'calm', 'long_idle');

// 8. 未启用不发起 DB 调用
assert(checkInitiative('nonexistent') === null, 'no_initiative');

console.log('\n=== 心情计算测试通过 ===');
closePersonalityDb();
process.exit(0);
