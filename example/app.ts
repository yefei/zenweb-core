import { Core } from '../src/index';
import mymod from './mod';

const core = new Core();

core.setup(mymod());
core.start();
