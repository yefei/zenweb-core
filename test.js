const { Core } = require('./dist/index');

const core = new Core();

core.setup(helper => {
  // helper.checkCoreProperty('aaaa');
  helper.after(() => {
    throw new Error('afdasdasdasd');
  })
});

core.start();



