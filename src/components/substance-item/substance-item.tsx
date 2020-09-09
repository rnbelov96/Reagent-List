import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faRedoAlt } from '@fortawesome/free-solid-svg-icons';
import { SubstanceType } from '../../types';
import {
  EMPTY_FIELD_VALUE,
  ModalWindowStatus,
  StructureStatus,
} from '../../const';
import context from '../../context';
import { substanceActionCreators } from '../../reducer/substance/substanceReducer';
import { appStatusActionCreators } from '../../reducer/appStatus/appStatusReducer';
import getInchi from '../../utils/getInchi';

type Props = {
  substance: SubstanceType;
};

const SubstanceItem: React.FC<Props> = React.memo(
  (props: Props) => {
    const { substance } = props;
    const dispatch = React.useContext(context);

    const imgEl = React.useRef<HTMLImageElement>(null);

    const [structureStatus, setStructureStatus] = React.useState<
      StructureStatus
    >(StructureStatus.LOADING);

    const onEditButtonClick = React.useCallback(
      (substanceToEdit: SubstanceType) => {
        dispatch(substanceActionCreators.setSubstanceToEdit(substanceToEdit));
        dispatch(
          appStatusActionCreators.setModalWindowStatus(ModalWindowStatus.EDIT),
        );
      },
      [],
    );

    const onDeleteButtonClick = React.useCallback(
      (substanceToDelete: SubstanceType) => {
        dispatch(substanceActionCreators.setSubstanceToEdit(substanceToDelete));
        dispatch(
          appStatusActionCreators.setModalWindowStatus(
            ModalWindowStatus.DELETE,
          ),
        );
      },
      [],
    );

    const loadStructure = React.useCallback(async () => {
      const inChiKey = await getInchi(substance.casNumber);
      if (!inChiKey) {
        setStructureStatus(StructureStatus.INCHIKEY_LOADING_FAILED);
        return;
      }
      try {
        const responce = await fetch(
          `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/inchikey/${inChiKey}/PNG`,
        );
        if (!responce.ok) {
          throw new Error();
        }
        const blob = await responce.blob();
        const img = URL.createObjectURL(blob);
        setStructureStatus(StructureStatus.LOADED);
        if (imgEl.current) {
          imgEl.current.setAttribute('src', img);
        }
      } catch (error) {
        setStructureStatus(StructureStatus.LOADING_FAILED);
      }
    }, [substance]);

    const structureLoadingBlock = React.useMemo(
      () => (
        <div className="lds-ring mx-auto d-block">
          <div />
          <div />
          <div />
          <div />
        </div>
      ),
      [],
    );

    const structureLoadingFailedBlock = React.useMemo(
      () => (
        <div>
          <p className="structure-block__text">
            Не удалось загрузить структуру
          </p>
          <button
            className="structure-block__btn"
            type="button"
            onClick={() => {
              setStructureStatus(StructureStatus.LOADING);
              loadStructure();
            }}
          >
            <FontAwesomeIcon size="3x" icon={faRedoAlt} />
          </button>
        </div>
      ),
      [loadStructure],
    );

    const inChiKeyLoadingFailedBlock = React.useMemo(
      () => (
        <div className="structure-block__info">
          <p className="structure-block__text">Не удалось получить InChiKey</p>
          <button
            className="structure-block__btn"
            type="button"
            onClick={() => {
              setStructureStatus(StructureStatus.LOADING);
              loadStructure();
            }}
          >
            <FontAwesomeIcon size="3x" icon={faRedoAlt} />
          </button>
        </div>
      ),
      [loadStructure],
    );

    React.useEffect(() => {
      loadStructure();
    }, []);

    return (
      <tr>
        <th className="align-middle" scope="row">
          {substance.number}
        </th>
        <td className="align-middle">{substance.name}</td>
        <td className="align-middle">
          <div className="structure-block">
            {
              {
                [StructureStatus.LOADING]: structureLoadingBlock,
                [StructureStatus.LOADED]: (
                  <img
                    alt="Cтруктура соединения"
                    ref={imgEl}
                    className="structure-block__img"
                  />
                ),
                [StructureStatus.INCHIKEY_LOADING_FAILED]: inChiKeyLoadingFailedBlock,
                [StructureStatus.LOADING_FAILED]: structureLoadingFailedBlock,
              }[structureStatus]
            }
          </div>
        </td>
        <td className="align-middle">{substance.location}</td>
        <td className="align-middle">{substance.place}</td>
        <td className="align-middle">
          {substance.casNumber ? substance.casNumber : EMPTY_FIELD_VALUE}
        </td>
        <td className="align-middle">
          <div className="d-flex flex-column justify-content-center align-items-center">
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
          </div>
        </td>
      </tr>
    );
  },
  (prev, next) => {
    const prevValues = Object.values(prev.substance);
    const nextValues = Object.values(next.substance);
    for (let i = 0; i < prevValues.length; i += 1) {
      if (prevValues[i] !== nextValues[i]) {
        return false;
      }
    }
    return true;
  },
);

export default SubstanceItem;
