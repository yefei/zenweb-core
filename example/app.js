import { Core } from '../index.js';

const app = new Core();
app.setup('@zenweb/api');
app.koa.use(ctx => {
  ctx.success({ test: 'ok' });
});
app.start();
