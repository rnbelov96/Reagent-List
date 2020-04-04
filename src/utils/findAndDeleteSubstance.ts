import { Substance } from '../types';

export default (substanceList: Substance[], substance: Substance) => {
  const index = substanceList.findIndex(sub => sub._id === substance._id);

  const newSubstanceList = [...substanceList];
  newSubstanceList.splice(index, 1);
  return newSubstanceList;
};
