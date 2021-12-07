import { Core } from '../index.js';

const app = new Core();
app.setup('@zenweb/api');
app.use(function test(ctx) {
  ctx.success({ test: 'ok' });
});
app.start();
