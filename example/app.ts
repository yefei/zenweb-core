import { createCore } from '../src/index';
import mymod from './mod';

createCore()
.setup(mymod())
.start();
