import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Substance, ErrorStatus } from '../../types';
import SubstanceItem from '../substance-item/substance-item';
import errorImg from '../../images/loading-error-img.jpg';
import emptyListImg from '../../images/empty-list-img.jpg';

interface Props {
  substanceList: Substance[],
  onEditButtonClick: (substance: Substance) => void,
  onDeleteButtonClick: (substance: Substance) => void,
  onCreateButtonClick: () => void,
  errorStatus: ErrorStatus,
  isSubstancesLoading: boolean,
}

const SubstanceList: React.FC<Props> = (props: Props) => {
  const {
    substanceList,
    onEditButtonClick,
    onDeleteButtonClick,
    onCreateButtonClick,
    errorStatus,
    isSubstancesLoading,
  } = props;

  const loadingErrorMessage = (
    <div className="message-block">
      <h1>
        К сожалению, не удалось подключиться к базе данных.
        <br />
        Обратитесь к Роману как можно быстрее!
      </h1>
      <img src={errorImg} alt="Ошибка загрузки" />
    </div>
  );

  const emptyListMessage = (
    <div className="message-block">
      <h1>К сожалению, ничего не найдено.</h1>
      <img src={emptyListImg} alt="Ничего не найдено" />
    </div>
  );

  const mainContent = (
    <>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Название</th>
            <th scope="col">Количество</th>
            <th scope="col">Лаборатория</th>
            <th scope="col">Место</th>
            <th scope="col">Фирма</th>
            <th scope="col">CAS</th>
            <th scope="col" />
          </tr>
        </thead>
        <tbody>
          {substanceList.map(sub => (
            <SubstanceItem
              onEditButtonClick={onEditButtonClick}
              substance={sub}
              key={sub._id}
              onDeleteButtonClick={onDeleteButtonClick}
            />
          ))}
        </tbody>
      </table>
      <button
        type="button"
        className="btn btn-primary create-button"
        onClick={() => onCreateButtonClick()}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </>
  );

  const loadingBlock = (
    <div className="message-block">
      <h1>Пожалуйста, подождите, идет загрузка списка реагентов.</h1>
      <div className="lds-facebook">
        <div />
        <div />
        <div />
      </div>
    </div>
  );

  if (isSubstancesLoading) {
    return loadingBlock;
  }

  if (errorStatus === ErrorStatus.LOADING_FAILED) {
    return loadingErrorMessage;
  }

  if (substanceList.length === 0) {
    return emptyListMessage;
  }

  return mainContent;
};

export default SubstanceList;
