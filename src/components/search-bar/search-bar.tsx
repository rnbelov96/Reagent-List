import * as React from 'react';
import { CombinedActionTypes } from '../../reducer/rootReducer/types';
import { substanceActionCreators } from '../../reducer/substance/substanceReducer';
import { ErrorStatus } from '../../const';

type Props = {
  searchSelectValue: string;
  searchInputValue: string;
  errorStatus: ErrorStatus;
  dispatch: React.Dispatch<CombinedActionTypes>;
};

const SearchBar: React.FC<Props> = React.memo((props: Props) => {
  const { searchSelectValue, searchInputValue, errorStatus, dispatch } = props;

  const handleSearchBarChange = React.useCallback(
    (changeableInput: 'select' | 'input', value: string): void => {
      const newSearchData = {
        type: searchSelectValue,
        value: searchInputValue,
      };
      switch (changeableInput) {
        case 'select':
          newSearchData.type = value;
          break;
        case 'input':
          newSearchData.value = value;
          break;
        default:
          return;
      }
      dispatch(substanceActionCreators.setQuerySearchData(newSearchData));
    },
    [searchSelectValue, searchInputValue],
  );

  const setSelectSearchValue = React.useCallback(
    (selectSearchValue: string) => {
      switch (selectSearchValue) {
        case 'casNumber':
          return 'CAS RN';

        case 'name':
          return 'Название';

        case 'number':
          return 'Номер';

        default:
          return 'CAS RN';
      }
    },
    [],
  );

  const transformSelectValue = React.useCallback((value: string) => {
    switch (value) {
      case 'CAS RN':
        return 'casNumber';

      case 'Название':
        return 'name';

      case 'Номер':
        return 'number';

      default:
        return 'casNumber';
    }
  }, []);

  return (
    <nav className="navbar navbar-light bg-light">
      <span className="navbar-brand font-weight-bold">
        Лаборатория СМАРТ-НАНОСИСТЕМ
      </span>
      <form
        className="form-inline"
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
      >
        <select
          style={{ marginRight: '20px' }}
          required
          disabled={errorStatus === ErrorStatus.LOADING_FAILED}
          value={setSelectSearchValue(searchSelectValue)}
          className="form-control"
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const value = transformSelectValue(e.target.value);
            handleSearchBarChange('select', value);
          }}
        >
          <option>CAS RN</option>
          <option>Название</option>
          <option>Номер</option>
        </select>
        <input
          className="form-control mr-sm-2"
          type="search"
          style={{ width: '400px' }}
          placeholder="Поиск"
          aria-label="Search"
          disabled={errorStatus === ErrorStatus.LOADING_FAILED}
          value={searchInputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handleSearchBarChange('input', e.target.value);
          }}
        />
      </form>
    </nav>
  );
});

export default SearchBar;
