// otherFile.mjs
import { data } from './data.mjs';

const makeChanges = () => {
    data.array1[1] = 'ppp';
    data.var1 = 52;
}

export {makeChanges}
