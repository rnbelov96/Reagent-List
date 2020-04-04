import * as React from 'react';
import { Substance } from '../../types';

interface Props {
  substance: Substance | null,
  onCloseButtonClick: () => void,
  onDeleteConfirmClick: (substance: Substance) => void,
}

const DeleteConfirmWindow: React.FC<Props> = (props: Props) => {
  const { substance, onCloseButtonClick, onDeleteConfirmClick } = props;
  return (
    <div className="delete-confirm-field">
      <div className="delete-confirm-field__modal">
        <h2 className="delete-confirm-field__text">Вы уверены, что хотите удалить этот реактив из базы данных?</h2>
        <div className="delete-confirm-field__buttons">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onDeleteConfirmClick(substance as Substance)}
          >
            Да
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onCloseButtonClick()}
          >
            Нет
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmWindow;
