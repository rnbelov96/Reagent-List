import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Substance, ErrorStatus } from '../../types';

interface Props {
  substance: Substance | null,
  onCloseButtonClick: () => void,
  locationCollection: Map<number, Set<string>>,
  setLocationCollection: React.Dispatch<React.SetStateAction<Map<number, Set<string>>>>,
  onConfirmClick: (substance: Substance) => void,
  errorStatus: ErrorStatus
}

const CreateWindow: React.FC<Props> = (props: Props) => {
  const {
    substance,
    onCloseButtonClick,
    locationCollection,
    setLocationCollection,
    onConfirmClick,
    errorStatus,
  } = props;

  const [isNewPlace, setNewPlaceStatus] = React.useState<boolean>(false);
  const [
    chosenLocation,
    setChosenLocation,
  ] = React.useState<number>(substance ? substance.location : 111);

  const numberInputEl = React.useRef<HTMLInputElement>(null);
  const nameInputEl = React.useRef<HTMLInputElement>(null);
  const amountInputEl = React.useRef<HTMLInputElement>(null);
  const locationInputEl = React.useRef<HTMLSelectElement>(null);
  const placeSelectInputEl = React.useRef<HTMLSelectElement>(null);
  const placeTextInputEl = React.useRef<HTMLInputElement>(null);
  const casNumberInputEl = React.useRef<HTMLInputElement>(null);
  const companyInputEl = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (placeTextInputEl.current) {
      placeTextInputEl.current.focus();
    }
  }, [isNewPlace]);

  return (
    <div className="edit-field">
      <form
        className="edit-field__form"
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          if (isNewPlace) {
            const newLocationCollection = new Map(locationCollection);
            const places = newLocationCollection.get(chosenLocation);
            if (places) {
              places.add(placeTextInputEl.current?.value as string);
            }
            setLocationCollection(newLocationCollection);
          }
          const substanceData: Substance = {
            name: nameInputEl.current?.value as string,
            number: Number(numberInputEl.current?.value) as number,
            location: Number(locationInputEl.current?.value) as number,
            place: isNewPlace ? placeTextInputEl.current?.value as string
              : placeSelectInputEl.current?.value as string,
            amount: amountInputEl.current?.value,
            casNumber: casNumberInputEl.current?.value,
            company: companyInputEl.current?.value,
          };
          if (substance?._id) {
            substanceData._id = substance?._id;
          }
          onConfirmClick(substanceData);
        }}
      >
        <div className="form-group">
          <label htmlFor="number">Номер</label>
          <input
            ref={numberInputEl}
            defaultValue={substance ? substance.number : ''}
            required
            type="number"
            className="form-control"
            id="number"
            placeholder="Введите номер"
          />
        </div>
        <div className="form-group">
          <label htmlFor="name">Название</label>
          <input
            ref={nameInputEl}
            defaultValue={substance ? substance.name : ''}
            required
            type="text"
            className="form-control"
            id="name"
            placeholder="Введите название"
          />
        </div>
        <div className="form-group">
          <label htmlFor="amount">Количество</label>
          <input
            ref={amountInputEl}
            defaultValue={substance ? substance.amount : ''}
            type="text"
            className="form-control"
            id="amount"
            placeholder="Введите количество"
          />
        </div>
        <div className="form-group">
          <label htmlFor="location">Лаборатория</label>
          <select
            ref={locationInputEl}
            defaultValue={substance ? substance.location : ''}
            required
            className="form-control"
            id="location"
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setChosenLocation(Number(e.target.value));
            }}
          >
            {[...locationCollection.keys()].map((location, i) => <option key={`${i + 1}-${location}`}>{location}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="place">Место</label>
          <div className="d-flex">
            {isNewPlace ? (
              <input
                ref={placeTextInputEl}
                className="form-control mr-3"
                placeholder="Введите название нового места"
                type="text"
                required
                id="place"
              />
            ) : (
              <select
                ref={placeSelectInputEl}
                defaultValue={substance ? substance.place : ''}
                required
                className="form-control mr-3"
                id="place"
              >
                {[...locationCollection.get(chosenLocation)].map((place, i) => <option key={`${i + 1}-${place}`}>{place}</option>)}
              </select>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setNewPlaceStatus(prevState => !prevState)}
            >
              <FontAwesomeIcon icon={isNewPlace ? faTimes : faPlus} />
            </button>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="company">Фирма</label>
          <input
            ref={companyInputEl}
            defaultValue={substance ? substance.company : ''}
            type="text"
            className="form-control"
            id="company"
            placeholder="Введите фирму"
          />
        </div>
        <div className="form-group">
          <label htmlFor="cas-number">CAS RN</label>
          <input
            ref={casNumberInputEl}
            defaultValue={substance ? substance.casNumber : ''}
            type="text"
            className="form-control"
            id="cas-number"
            placeholder="Введите CAS-номер"
          />
        </div>
        <div
          className="alert alert-danger"
          role="alert"
          style={{ display: errorStatus === ErrorStatus.DUPLICATE_CAS_NUMBER ? 'block' : 'none' }}
        >
          Соединение с таким CAS-номером уже существует в базе.
        </div>
        <button
          type="submit"
          className="btn btn-primary"
        >
          Принять
        </button>
        <FontAwesomeIcon
          onClick={() => onCloseButtonClick()}
          icon={faTimes}
          className="edit-field__close"
        />
      </form>
    </div>
  );
};

export default CreateWindow;
