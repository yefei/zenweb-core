import { initCore } from '../src/index';
import mymod from './mod';

initCore()
.setup(mymod())
.start();
