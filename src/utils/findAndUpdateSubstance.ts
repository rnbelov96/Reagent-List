import { Substance } from '../types';

export default (
  substanceList: Substance[],
  substance: Substance,
) => substanceList.map(sub => (sub._id === substance._id ? substance : sub));
