import * as React from 'react';
import api from '../../api';
import { Substance, QueryStringData, ErrorStatus } from '../../types';
import SubstanceList from '../substance-list/substance-list';
import CreateWindow from '../create-window/create-window';
import createLocationCollection from '../../utils/createLocationCollection';
import findAndUpdateSubstance from '../../utils/findAndUpdateSubstance';
import DeleteConfirmWindow from '../delete-confirm-window/delete-confirm-window';
import findAndDeleteSubstance from '../../utils/findAndDeleteSubstance';
import SearchBar from '../search-bar/search-bar';
import buildQueryString from '../../utils/buildQueryString';
import FilterBar from '../filter-bar/filter-bar';

interface Props {
}

interface AllSubstancesServerResponse {
  substances: Substance[]
}

interface OneSubstanceServerResponse {
  substance: Substance
}

const initialQueryStringData: QueryStringData = {
  search: {
    type: 'casNumber',
    value: '',
  },
  locations: [],
};

const App: React.FC<Props> = () => {
  const [substanceList, setSubstanceList] = React.useState<Substance[]>([]);
  const [isEditWindowVisible, setEditWindowVisibility] = React.useState<boolean>(false);
  const [isCreateWindowVisible, setCreateWindowVisibility] = React.useState<boolean>(false);
  const [substanceToEdit, setSubstanceToEdit] = React.useState<Substance | null>(null);
  const [isDeleteWindowVisible, setDeleteWindowVisibility] = React.useState<boolean>(false);
  const [
    locationCollection,
    setLocationCollection,
  ] = React.useState<Map<number, Set<string>>>(new Map<number, Set<string>>());
  const [
    queryStringData, setQueryStringData,
  ] = React.useState<QueryStringData>(initialQueryStringData);
  const [errorStatus, setErrorStatus] = React.useState<ErrorStatus>(ErrorStatus.OK);
  const [isSubstancesLoading, setSubstancesLoadingStatus] = React.useState<boolean>(true);

  React.useEffect(() => {
    api.request<AllSubstancesServerResponse>({
      url: '/',
    }).then(response => {
      const { data } = response;
      const { substances } = data;
      setLocationCollection(createLocationCollection(substances));
      setSubstanceList(substances);
      setSubstancesLoadingStatus(false);
    }).catch(() => {
      setErrorStatus(ErrorStatus.LOADING_FAILED);
      setSubstancesLoadingStatus(false);
    });
  }, []);

  React.useEffect(() => {
    if (queryStringData.search.value.length !== 0 || queryStringData.locations.length !== 0) {
      api.request<AllSubstancesServerResponse>({
        method: 'GET',
        url: `?${buildQueryString(queryStringData)}`,
      }).then(response => {
        const { data } = response;
        const { substances } = data;
        setSubstanceList(substances);
      });
    }
    if (queryStringData.search.value.length === 0 && queryStringData.locations.length === 0) {
      api.request<AllSubstancesServerResponse>({
        url: '/',
      }).then(response => {
        const { data } = response;
        const { substances } = data;
        setLocationCollection(createLocationCollection(substances));
        setSubstanceList(substances);
      });
    }
  }, [queryStringData]);

  const handleEditButtonClick = (substance: Substance): void => {
    setSubstanceToEdit(substance);
    setEditWindowVisibility(true);
  };

  const handleCloseButtonClick = () => {
    setEditWindowVisibility(false);
    setDeleteWindowVisibility(false);
    setCreateWindowVisibility(false);
    setSubstanceToEdit(null);
    setErrorStatus(ErrorStatus.OK);
  };

  const handleUpdateButtonClick = (substanceToUpdate: Substance): void => {
    api.request<OneSubstanceServerResponse>({
      method: 'PATCH',
      url: `/${substanceToUpdate._id}`,
      data: substanceToUpdate,
    }).then(response => {
      const { data } = response;
      const { substance } = data;
      setSubstanceList(findAndUpdateSubstance(substanceList, substance));
      setEditWindowVisibility(false);
      setErrorStatus(ErrorStatus.OK);
    }).catch(() => {
      setErrorStatus(ErrorStatus.DUPLICATE_CAS_NUMBER);
    });
  };

  const handleDeleteButtonClick = (substance: Substance): void => {
    setSubstanceToEdit(substance);
    setDeleteWindowVisibility(true);
  };

  const handleDeleteConfirmClick = (substanceToDelete: Substance): void => {
    api.request({
      method: 'DELETE',
      url: `/${substanceToDelete._id}`,
    }).then(() => {
      setSubstanceList(findAndDeleteSubstance(substanceList, substanceToDelete));
      handleCloseButtonClick();
    });
  };

  const handleCreateButtonClick = (): void => {
    setCreateWindowVisibility(true);
  };

  const handleSearchBarChange = (changeableInput: 'select' | 'input', value: string): void => {
    setQueryStringData(prevState => {
      const newSearchData = { ...prevState.search };
      switch (changeableInput) {
        case 'select':
          newSearchData.type = value;
          return {
            ...prevState,
            search: {
              ...newSearchData,
            },
          };
        case 'input':
          newSearchData.value = value;
          return {
            ...prevState,
            search: {
              ...newSearchData,
            },
          };
        default:
          return prevState;
      }
    });
  };

  const handleCreateConfirmClick = (substanceToCreate: Substance): void => {
    api.request<OneSubstanceServerResponse>({
      method: 'POST',
      url: '/',
      data: substanceToCreate,
    }).then(response => {
      const { data } = response;
      const { substance } = data;
      setSubstanceList(prevState => [substance, ...prevState]);
      handleCloseButtonClick();
      setErrorStatus(ErrorStatus.OK);
    }).catch(() => {
      setErrorStatus(ErrorStatus.DUPLICATE_CAS_NUMBER);
    });
  };

  const handleCheckboxChange = (value: number): void => {
    setQueryStringData(prevState => {
      const newLocationsArray = [...prevState.locations];
      const index = queryStringData.locations.findIndex(el => el === value);
      if (index !== -1) {
        newLocationsArray.splice(index, 1);
      } else {
        newLocationsArray.push(value);
      }
      return {
        ...prevState,
        locations: newLocationsArray,
      };
    });
  };

  const renderApp = () => (
    <>
      {isCreateWindowVisible
        ? (
          <CreateWindow
            locationCollection={locationCollection}
            onCloseButtonClick={handleCloseButtonClick}
            substance={null}
            onConfirmClick={handleCreateConfirmClick}
            errorStatus={errorStatus}
          />
        )
        : null}
      {isEditWindowVisible
        ? (
          <CreateWindow
            locationCollection={locationCollection}
            onCloseButtonClick={handleCloseButtonClick}
            substance={substanceToEdit}
            onConfirmClick={handleUpdateButtonClick}
            errorStatus={errorStatus}
          />
        )
        : null}
      {isDeleteWindowVisible
        ? (
          <DeleteConfirmWindow
            substance={substanceToEdit}
            onCloseButtonClick={handleCloseButtonClick}
            onDeleteConfirmClick={handleDeleteConfirmClick}
          />
        )
        : null}
      <SearchBar
        searchSelectValue={queryStringData.search.type}
        searchInputValue={queryStringData.search.value}
        onSearchBarChahge={handleSearchBarChange}
        errorStatus={errorStatus}
        isSubstancesLoading={isSubstancesLoading}
      />
      <FilterBar
        locationCollection={locationCollection}
        onCheckboxChange={handleCheckboxChange}
        checkedLocations={queryStringData.locations}
        errorStatus={errorStatus}
        substanceListLength={substanceList.length}
        isSubstancesLoading={isSubstancesLoading}
      />
      <SubstanceList
        onEditButtonClick={handleEditButtonClick}
        onDeleteButtonClick={handleDeleteButtonClick}
        substanceList={substanceList}
        onCreateButtonClick={handleCreateButtonClick}
        errorStatus={errorStatus}
        isSubstancesLoading={isSubstancesLoading}
      />
    </>
  );

  return renderApp();
};

export default App;
