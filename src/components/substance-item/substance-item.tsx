import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Substance } from '../../types';
import { EMPTY_FIELD_VALUE } from '../../const';

interface Props {
  substance: Substance,
  onEditButtonClick: (substance: Substance) => void,
  onDeleteButtonClick: (substance: Substance) => void,
}

const SubstanceItem: React.FC<Props> = (props: Props) => {
  const { substance, onEditButtonClick, onDeleteButtonClick } = props;
  return (
    <tr>
      <th className="align-middle" scope="row">{substance.number}</th>
      <td className="align-middle">{substance.name}</td>
      <td className="align-middle">{substance.amount ? substance.amount : EMPTY_FIELD_VALUE}</td>
      <td className="align-middle">{substance.location}</td>
      <td className="align-middle">{substance.place}</td>
      <td className="align-middle">{substance.company ? substance.company : EMPTY_FIELD_VALUE}</td>
      <td className="align-middle">{substance.casNumber ? substance.casNumber : EMPTY_FIELD_VALUE}</td>
      <td className="d-flex flex-column justify-content-center align-items-center">
        <button
          type="button"
          className="btn btn-primary mb-1"
          onClick={() => onEditButtonClick(substance)}
        >
          <FontAwesomeIcon icon={faPen} />
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => onDeleteButtonClick(substance)}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </td>
    </tr>
  );
};

export default SubstanceItem;
