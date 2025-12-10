import { $initCore, SetupFunction } from '../src/index.js';
import mymod from './mod.js';


function mymod2(): SetupFunction {
  return function mymod2(setup) {
    setup.destroy(() => {
      return new Promise((res) => {
        setTimeout(res, 1000);
      })
    });
  }
}

function mymod3(): SetupFunction {
  return function mymod3(setup) {
    setup.destroy(() => {
      return new Promise((res) => {
        setTimeout(res, 1000);
      })
    });
  }
}


$initCore()
.setup(mymod())
.setup(mymod2())
.setup(mymod3(), { order: 101 })
.start();
