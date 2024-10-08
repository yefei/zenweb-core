import { $initCore } from '../src/index.js';
import mymod from './mod.js';

$initCore()
.setup(mymod())
.start();
