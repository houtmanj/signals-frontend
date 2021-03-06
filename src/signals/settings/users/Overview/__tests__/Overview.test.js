import React from 'react';
import {
  render,
  fireEvent,
  wait,
  waitForElement,
  within,
  act,
  cleanup,
} from '@testing-library/react';
import { history as memoryHistory, withCustomAppContext } from 'test/utils';

import usersJSON from 'utils/__tests__/fixtures/users.json';
import inputRolesSelectorJSON from 'utils/__tests__/fixtures/inputRolesSelector.json';
import { USER_URL } from 'signals/settings/routes';
import configuration from 'shared/services/configuration/configuration';
import * as constants from 'containers/App/constants';
import * as reactRouter from 'react-router-dom';
import * as appSelectors from 'containers/App/selectors';
import { setUserFilters } from 'signals/settings/actions';
import SettingsContext from 'signals/settings/context';
import * as rolesSelectors from 'models/roles/selectors';

import UsersOverview from '..';

jest.mock('containers/App/constants', () => ({
  __esModule: true,
  ...jest.requireActual('containers/App/constants'),
}));

jest.mock('signals/settings/actions', () => ({
  __esModule: true,
  ...jest.requireActual('signals/settings/actions'),
}));

jest.mock('react-router-dom', () => ({
  __esModule: true,
  ...jest.requireActual('react-router-dom'),
}));

constants.PAGE_SIZE = 50;

const state = {
  users: {
    filters: {},
  },
};

const dispatch = jest.fn();

let testContext = {};
const usersOverviewWithAppContext = (
  overrideProps = {},
  overrideCfg = {},
  stateCfg = state
) => {
  const { history } = testContext;
  const props = {
    ...overrideProps,
  };

  return withCustomAppContext(
    <SettingsContext.Provider value={{ state: stateCfg, dispatch }}>
      <UsersOverview {...props} />
    </SettingsContext.Provider>
  )({
    routerCfg: { history },
    ...overrideCfg,
  });
};
const resolveAfterMs = timeMs =>
  new Promise(resolve => setTimeout(resolve, timeMs));

describe('signals/settings/users/containers/Overview', () => {
  beforeEach(() => {
    dispatch.mockReset();

    jest
      .spyOn(reactRouter, 'useParams')
      .mockImplementation(() => ({ pageNum: 1 }));

    const push = jest.fn();
    const scrollTo = jest.fn();
    const apiHeaders = { headers: { Accept: 'application/json' } };

    const history = { ...memoryHistory, push };

    jest.useRealTimers();
    fetch.resetMocks();
    dispatch.mockReset();

    fetch.mockResponse(JSON.stringify(usersJSON));
    global.window.scrollTo = scrollTo;

    testContext = {
      apiHeaders,
      history,
      push,
      scrollTo,
    };
  });

  it('should render "add user" button', async () => {
    jest
      .spyOn(appSelectors, 'makeSelectUserCan')
      .mockImplementation(() => () => true);

    const { queryByText, rerender } = render(usersOverviewWithAppContext());

    await wait();

    expect(queryByText('Gebruiker toevoegen')).toBeInTheDocument();

    jest
      .spyOn(appSelectors, 'makeSelectUserCan')
      .mockImplementation(() => () => true);

    cleanup();

    rerender(usersOverviewWithAppContext());

    await wait();

    expect(queryByText('Gebruiker toevoegen')).not.toBeInTheDocument();
  });

  it('should request users from API on mount', async () => {
    const { apiHeaders } = testContext;

    render(usersOverviewWithAppContext());

    await wait();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(configuration.USERS_ENDPOINT),
      expect.objectContaining(apiHeaders)
    );
  });

  it('should render title, data view with headers only and loading indicator when loading', async () => {
    jest.useFakeTimers();
    fetch.mockResponse(
      () =>
        new Promise(resolve => {
          setTimeout(() => resolve({ body: JSON.stringify(usersJSON) }), 50);
        })
    );

    const { getByText, queryByTestId } = render(usersOverviewWithAppContext());

    await wait(() => queryByTestId('loadingIndicator'));

    expect(getByText('Gebruikers')).toBeInTheDocument();
    expect(queryByTestId('dataViewHeadersRow')).toBeInTheDocument();
    expect(queryByTestId('loadingIndicator')).toBeInTheDocument();

    jest.advanceTimersByTime(25);

    await wait();

    expect(getByText('Gebruikers')).toBeInTheDocument();
    expect(queryByTestId('dataViewHeadersRow')).toBeInTheDocument();
    expect(queryByTestId('loadingIndicator')).toBeInTheDocument();

    jest.advanceTimersByTime(25);

    await wait();

    expect(getByText(`Gebruikers (${usersJSON.count})`)).toBeInTheDocument();
    expect(queryByTestId('dataViewHeadersRow')).toBeInTheDocument();
    expect(queryByTestId('loadingIndicator')).toBeNull();

    jest.runAllTimers();
  });

  it('should render title and data view with headers only when no data', async () => {
    fetch.mockResponse(JSON.stringify({}));

    const { getByText, queryByTestId, queryAllByTestId } = render(
      usersOverviewWithAppContext()
    );

    await wait();

    expect(getByText('Gebruikers')).toBeInTheDocument();
    expect(queryByTestId('dataViewHeadersRow')).toBeInTheDocument();
    expect(queryAllByTestId('dataViewBodyRow')).toHaveLength(0);
  });

  it('should render data view with no data when loading', async () => {
    jest.useFakeTimers();
    fetch.mockResponse(
      () =>
        new Promise(resolve => {
          setTimeout(
            () =>
              resolve({
                body: JSON.stringify(usersJSON),
              }),
            50
          );
        })
    );

    const { queryByTestId, queryAllByTestId } = render(
      usersOverviewWithAppContext()
    );

    await wait(() => queryByTestId('loadingIndicator'));

    expect(queryAllByTestId('dataViewBodyRow')).toHaveLength(0);

    jest.advanceTimersByTime(25);

    await wait();

    expect(queryAllByTestId('dataViewBodyRow')).toHaveLength(0);

    jest.advanceTimersByTime(25);

    await wait();

    expect(queryByTestId('loadingIndicator')).toBeNull();
    expect(queryAllByTestId('dataViewBodyRow')).toHaveLength(usersJSON.count);

    jest.runAllTimers();
  });

  it('should data view when data', async () => {
    const { queryAllByTestId } = render(usersOverviewWithAppContext());

    await wait();

    expect(queryAllByTestId('dataViewBodyRow')).toHaveLength(usersJSON.count);
  });

  it('should render pagination controls', async () => {
    const { rerender, queryByTestId } = render(usersOverviewWithAppContext());

    await wait();

    expect(queryByTestId('pagination')).toBeInTheDocument();
    expect(
      within(queryByTestId('pagination')).queryByText('2')
    ).toBeInTheDocument();

    expect(
      within(queryByTestId('pagination')).queryByText('2').nodeName
    ).toEqual('BUTTON');

    jest
      .spyOn(reactRouter, 'useParams')
      .mockImplementation(() => ({ pageNum: 2 }));

    rerender(usersOverviewWithAppContext());

    await wait();

    expect(
      within(queryByTestId('pagination')).queryByText('2').nodeName
    ).not.toEqual('BUTTON');

    constants.PAGE_SIZE = usersJSON.count;

    rerender(usersOverviewWithAppContext({ pageSize: usersJSON.count }));

    await wait();

    expect(queryByTestId('pagination')).not.toBeInTheDocument();
  });

  it('should push to the history stack and scroll to top on pagination item click', async () => {
    constants.PAGE_SIZE = 50;
    const { push, scrollTo } = testContext;
    const { getByText } = render(usersOverviewWithAppContext());

    await wait(() => getByText('2'));

    act(() => {
      fireEvent.click(getByText('2'));
    });

    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    expect(push).toHaveBeenCalled();
  });

  it('should push on list item with an itemId click', async () => {
    const { push } = testContext;
    const { container } = render(usersOverviewWithAppContext());
    const itemId = 666;

    const row = await waitForElement(
      () => container.querySelector('tbody tr:nth-child(42)'),
      { container }
    );
    const username = row.querySelector('td:first-of-type');

    // Explicitly set an 'itemId' so that we can easily test against its value.
    row.dataset.itemId = itemId;

    expect(push).toHaveBeenCalledTimes(0);

    act(() => {
      fireEvent.click(username);
    });

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith(`${USER_URL}/${itemId}`);

    // Remove 'itemId' and fire click event again.
    delete row.dataset.itemId;

    act(() => {
      fireEvent.click(username);
    });

    expect(push).toHaveBeenCalledTimes(1);

    // Set 'itemId' again and fire click event once more.
    row.dataset.itemId = itemId;

    act(() => {
      fireEvent.click(username);
    });

    expect(push).toHaveBeenCalledTimes(2);
  });

  it('should not push on list item click when permissions are insufficient', async () => {
    jest
      .spyOn(appSelectors, 'makeSelectUserCan')
      .mockImplementation(() => () => false);

    const { push } = testContext;
    const { container } = render(usersOverviewWithAppContext());

    const row = await waitForElement(
      () => container.querySelector('tbody tr:nth-child(42)'),
      { container }
    );

    // Explicitly set an 'itemId'.
    row.dataset.itemId = 666;

    act(() => {
      fireEvent.click(row.querySelector('td:first-of-type'));
    });

    expect(push).not.toHaveBeenCalled();
  });

  it('should render a username filter', async () => {
    const { getByTestId } = render(usersOverviewWithAppContext());

    await wait();

    expect(getByTestId('filterUsersByUsername')).toBeInTheDocument();
  });

  it('should dispatch filter values only after 250ms since last input change', async () => {
    const { getByTestId } = render(usersOverviewWithAppContext());

    await wait();

    const filterByUserName = getByTestId('filterUsersByUsername');
    const filterByUserNameInput = filterByUserName.querySelector('input');
    const filterValue = 'test1';

    act(() => {
      fireEvent.change(filterByUserNameInput, { target: { value: filterValue } });
    });

    await wait(() => resolveAfterMs(50));

    expect(dispatch).not.toHaveBeenCalled();

    await wait(() => resolveAfterMs(200));

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(setUserFilters({ username: filterValue }));
  });

  it('should not dispatch filter values when input value has not changed', async () => {
    const username = 'foo bar baz';
    const stateCfg = { users: { filters: { username } } };

    const { getByTestId, rerender } = render(usersOverviewWithAppContext());

    await wait();

    expect(dispatch).not.toHaveBeenCalled();

    const filterByUserName = getByTestId('filterUsersByUsername');
    const filterByUserNameInput = filterByUserName.querySelector('input');

    act(() => {
      fireEvent.input(filterByUserNameInput, {
        target: { value: username },
      });
    });

    await wait(() => resolveAfterMs(250));

    expect(dispatch).toHaveBeenCalledTimes(1);

    rerender(usersOverviewWithAppContext({}, {}, stateCfg));

    await wait();

    act(() => {
      fireEvent.input(filterByUserNameInput, {
        target: { value: username },
      });
    });

    await wait(() => resolveAfterMs(250));

    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('should render a role filter', async () => {
    const { getByTestId } = render(usersOverviewWithAppContext());

    await wait();

    expect(getByTestId('roleSelect')).toBeInTheDocument();
  });

  it('should select the right option when role filter changes', async () => {
    jest
      .spyOn(appSelectors, 'makeSelectUserCan')
      .mockImplementation(() => () => true);

    jest
      .spyOn(rolesSelectors, 'inputRolesSelector')
      .mockImplementation(() => inputRolesSelectorJSON);

    const { getByTestId } = render(usersOverviewWithAppContext());

    await wait();

    const filterByRoleSelect = getByTestId('roleSelect');

    // check if the default value has been set
    expect(filterByRoleSelect.value).toBe('*');

    const filterValue = 'Regievoerder';

    expect(dispatch).toHaveBeenCalledTimes(0);

    act(() => {
      fireEvent.change(filterByRoleSelect, { target: { value: filterValue } });
    });

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(setUserFilters({ role: filterValue }));

    expect(filterByRoleSelect.value).toBe(filterValue);

    const activeOption = filterByRoleSelect.querySelector('select option:nth-child(8)');

    expect(activeOption.value).toBe(filterValue);
  });

  it('should render a user active (status) filter', async () => {
    const { getByTestId } = render(usersOverviewWithAppContext());

    await wait();

    expect(getByTestId('userActiveSelect')).toBeInTheDocument();
  });

  it('should select the right option when user active (status) filter changes', async () => {
    const { getByTestId } = render(usersOverviewWithAppContext());

    await wait();

    const filterByUserActiveSelect = getByTestId('userActiveSelect');

    // check if the default value has been set
    expect(filterByUserActiveSelect.value).toBe('*');

    const filterValue = 'true';

    act(() => {
      fireEvent.change(filterByUserActiveSelect, { target: { value: filterValue } });
    });

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(setUserFilters({ is_active: filterValue }));

    expect(filterByUserActiveSelect.value).toBe(filterValue);
  });

  it('should keep the state of all filters in context', async () => {
    const { getByTestId } = render(usersOverviewWithAppContext());

    await wait();

    const filterByUserActiveSelect = getByTestId('userActiveSelect');
    const filterByRoleSelect = getByTestId('roleSelect');

    // check if the default values have been set
    expect(filterByUserActiveSelect.value).toBe('*');
    expect(filterByRoleSelect.value).toBe('*');

    const userActiveFilterValue = 'true';
    const roleFilterValue = 'Regievoerder';

    act(() => {
      fireEvent.change(filterByUserActiveSelect, { target: { value: userActiveFilterValue } });
      fireEvent.change(filterByRoleSelect, { target: { value: roleFilterValue } });
    });

    expect(dispatch).toHaveBeenCalledTimes(2);

    expect(dispatch).toHaveBeenCalledWith(setUserFilters({ is_active: userActiveFilterValue }));
    expect(dispatch).toHaveBeenCalledWith(setUserFilters({ role: roleFilterValue }));

    expect(filterByUserActiveSelect.value).toBe(userActiveFilterValue);
    expect(filterByRoleSelect.value).toBe(roleFilterValue);
  });

  it('should check if default filter values have been set', async () => {
    jest
      .spyOn(rolesSelectors, 'inputRolesSelector')
      .mockImplementation(() => inputRolesSelectorJSON);

    const { getByTestId } = render(usersOverviewWithAppContext());

    await wait();

    const filterByRoleSelect = getByTestId('roleSelect');
    const filterByUserActiveSelect = getByTestId('userActiveSelect');

    expect(filterByRoleSelect.value).toBe('*');
    expect(filterByUserActiveSelect.value).toBe('*');
  });

  it('should select "Behandelaar" as filter and dispatch a fetch action', async () => {
    jest
      .spyOn(rolesSelectors, 'inputRolesSelector')
      .mockImplementation(() => inputRolesSelectorJSON);

    const mockedState = { users: { filters: { role: 'Behandelaar' } } };
    const { getByTestId } = render(usersOverviewWithAppContext({}, {}, mockedState));

    await wait();

    const filterByRoleSelect = getByTestId('roleSelect');

    expect(dispatch).toHaveBeenCalledTimes(0);

    act(() => { fireEvent.change(filterByRoleSelect, { target: { value: 'Behandelaar' } }); });

    expect(dispatch).toHaveBeenCalledTimes(1);

    expect(filterByRoleSelect.value).toBe('Behandelaar');

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('role=Behandelaar'),
      expect.objectContaining(testContext.apiHeaders)
    );
  });

  it('should select "Actief" as filter and dispatch a fetch action', async () => {
    const mockedState = { users: { filters: { is_active: true } } };
    const { getByTestId } = render(usersOverviewWithAppContext({}, {}, mockedState));

    await wait();

    const filterByUserActiveSelect = getByTestId('userActiveSelect');

    expect(dispatch).toHaveBeenCalledTimes(0);

    act(() => { fireEvent.change(filterByUserActiveSelect, { target: { value: true } }); });

    expect(dispatch).toHaveBeenCalledTimes(1);

    expect(filterByUserActiveSelect.value).toBe('true');

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('is_active=true'),
      expect.objectContaining(testContext.apiHeaders)
    );
  });

  it('should select a value in the select filters and dispatch a fetch action', async () => {
    jest
      .spyOn(rolesSelectors, 'inputRolesSelector')
      .mockImplementation(() => inputRolesSelectorJSON);

    const mockedState = { users: { filters: { is_active: true, role: 'Behandelaar' } } };

    const { getByTestId } = render(usersOverviewWithAppContext({}, {}, mockedState));

    await wait();

    const filterByRoleSelect = getByTestId('roleSelect');
    const filterByUserActiveSelect = getByTestId('userActiveSelect');

    expect(dispatch).toHaveBeenCalledTimes(0);

    act(() => {
      fireEvent.change(filterByUserActiveSelect, { target: { value: true } });
      fireEvent.change(filterByRoleSelect, { target: { value: 'Behandelaar' } });
    });

    expect(dispatch).toHaveBeenCalledTimes(2);

    expect(filterByRoleSelect.value).toBe('Behandelaar');
    expect(filterByUserActiveSelect.value).toBe('true');

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/is_active=true|role=Behandelaar/),
      expect.objectContaining(testContext.apiHeaders)
    );
  });
});
