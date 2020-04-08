import * as React from 'react';
import api from '../../api';
import {
  Substance, QueryStringData, ErrorStatus, AuthorizationStatus, LoginData,
} from '../../types';
import SubstanceList from '../substance-list/substance-list';
import CreateWindow from '../create-window/create-window';
import createLocationCollection from '../../utils/createLocationCollection';
import findAndUpdateSubstance from '../../utils/findAndUpdateSubstance';
import DeleteConfirmWindow from '../delete-confirm-window/delete-confirm-window';
import findAndDeleteSubstance from '../../utils/findAndDeleteSubstance';
import SearchBar from '../search-bar/search-bar';
import buildQueryString from '../../utils/buildQueryString';
import FilterBar from '../filter-bar/filter-bar';
import SignIn from '../sign-in/sign-in';
import getCookie from '../../utils/getCookie';
import { SUBSTANCE_TO_SHOW_AMOUNT } from '../../const';

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
    queryStringData,
    setQueryStringData,
  ] = React.useState<QueryStringData>(initialQueryStringData);
  const [errorStatus, setErrorStatus] = React.useState<ErrorStatus>(ErrorStatus.OK);
  const [isSubstancesLoading, setSubstancesLoadingStatus] = React.useState<boolean>(true);
  const [
    authorizationStatus,
    setAuthorizationStatus,
  ] = React.useState<AuthorizationStatus>(AuthorizationStatus.NO_AUTH);
  const [isSessionChecking, setSessionCheckingStatus] = React.useState<boolean>(true);
  const [
    substanceToShow,
    setSubstanceToShowCount,
  ] = React.useState<number>(SUBSTANCE_TO_SHOW_AMOUNT);
  const [isRequestLoading, setRequestLoadingStatus] = React.useState<boolean>(false);

  React.useEffect(() => {
    api.request({
      url: '/users/login',
    }).then(() => {
      setSessionCheckingStatus(false);
      setAuthorizationStatus(AuthorizationStatus.AUTH);
      api.request<AllSubstancesServerResponse>({
        url: '/substances',
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
    }).catch(() => {
      setSessionCheckingStatus(false);
    });
  }, []);

  React.useEffect(() => {
    setRequestLoadingStatus(false);
    setSubstanceToShowCount(SUBSTANCE_TO_SHOW_AMOUNT);
  }, [substanceList]);

  React.useEffect(() => {
    if (isSubstancesLoading) {
      return;
    }
    if (queryStringData.search.value.length !== 0 || queryStringData.locations.length !== 0) {
      setRequestLoadingStatus(true);
      api.request<AllSubstancesServerResponse>({
        method: 'GET',
        url: `/substances/?${buildQueryString(queryStringData)}`,
      }).then(response => {
        const { data } = response;
        const { substances } = data;
        setSubstanceList(substances);
        // setRequestLoadingStatus(false);
      });
    }
    if (queryStringData.search.value.length === 0 && queryStringData.locations.length === 0) {
      setRequestLoadingStatus(true);
      api.request<AllSubstancesServerResponse>({
        url: '/substances',
      }).then(response => {
        const { data } = response;
        const { substances } = data;
        setLocationCollection(createLocationCollection(substances));
        setSubstanceList(substances);
        // setRequestLoadingStatus(false);
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
      url: `/substances//${substanceToUpdate._id}`,
      headers: { 'X-CSRF-TOKEN': `${getCookie('X-CSRF-TOKEN')}` },
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
      url: `/substances/${substanceToDelete._id}`,
      headers: { 'X-CSRF-TOKEN': `${getCookie('X-CSRF-TOKEN')}` },
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

  const handleLoginButtonClick = (loginData: LoginData): void => {
    api.request({
      method: 'POST',
      url: '/users/login',
      headers: { 'X-CSRF-TOKEN': `${getCookie('X-CSRF-TOKEN')}` },
      data: loginData,
    }).then(() => {
      setAuthorizationStatus(AuthorizationStatus.AUTH);
      setErrorStatus(ErrorStatus.OK);
      api.request<AllSubstancesServerResponse>({
        url: '/substances',
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
    }).catch(() => {
      setErrorStatus(ErrorStatus.WRONG_LOGIN_DATA);
    });
  };

  const handleCreateConfirmClick = (substanceToCreate: Substance): void => {
    api.request<OneSubstanceServerResponse>({
      method: 'POST',
      url: '/substances',
      headers: { 'X-CSRF-TOKEN': `${getCookie('X-CSRF-TOKEN')}` },
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

  const handleShowMoreButtonClick = (): void => {
    setSubstanceToShowCount(prevState => prevState + SUBSTANCE_TO_SHOW_AMOUNT);
  };

  const renderApp = () => {
    if (isSessionChecking) {
      return (
        <div className="message-block">
          <h1>Пожалуйста, подождите, идет процесс аутентификации.</h1>
          <div className="lds-facebook">
            <div />
            <div />
            <div />
          </div>
        </div>
      );
    }

    if (authorizationStatus === AuthorizationStatus.AUTH) {
      return (
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
            isSubstancesLoading={isSubstancesLoading}
          />
          <SubstanceList
            onEditButtonClick={handleEditButtonClick}
            onDeleteButtonClick={handleDeleteButtonClick}
            substanceList={substanceList}
            onCreateButtonClick={handleCreateButtonClick}
            errorStatus={errorStatus}
            isSubstancesLoading={isSubstancesLoading}
            substanceToShow={substanceToShow}
            isRequestLoading={isRequestLoading}
            onShowMoreButtonClick={handleShowMoreButtonClick}
          />
        </>
      );
    }

    if (authorizationStatus === AuthorizationStatus.NO_AUTH) {
      return (
        <SignIn
          onLoginButtonClick={handleLoginButtonClick}
          errorStatus={errorStatus}
        />
      );
    }

    return <p>Что-то пошло не так</p>;
  };

  return renderApp();
};

export default App;
