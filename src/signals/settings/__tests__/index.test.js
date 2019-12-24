import React from 'react';
import { mount } from 'enzyme';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import * as auth from 'shared/services/auth/auth';
import * as reactRouterDom from 'react-router-dom';

import { withAppContext, history } from 'test/utils';
import SettingsModule, { SettingsModule as Module } from '..';
import { USER_URL } from '../routes';

jest.mock('react-router-dom', () => ({
  __esModule: true,
  ...jest.requireActual('react-router-dom'),
}));

describe('signals/settings', () => {
  beforeEach(() => {
    jest.spyOn(reactRouterDom, 'useLocation');
  });

  afterEach(() => {
    history.entries = [];
    reactRouterDom.useLocation.mockRestore();
  });

  it('should have props from action creator', () => {
    const tree = mount(withAppContext(<SettingsModule />));

    const containerProps = tree.find(Module).props();

    expect(containerProps.onFetchDepartments).not.toBeUndefined();
    expect(typeof containerProps.onFetchDepartments).toEqual('function');

    expect(containerProps.onFetchPermissions).not.toBeUndefined();
    expect(typeof containerProps.onFetchPermissions).toEqual('function');

    expect(containerProps.onFetchRoles).not.toBeUndefined();
    expect(typeof containerProps.onFetchRoles).toEqual('function');
  });

  it('should initiate fetches on mount', () => {
    const onFetchDepartments = jest.fn();
    const onFetchPermissions = jest.fn();
    const onFetchRoles = jest.fn();

    render(
      withAppContext(
        <Module
          onFetchDepartments={onFetchDepartments}
          onFetchPermissions={onFetchPermissions}
          onFetchRoles={onFetchRoles}
        />
      )
    );

    expect(onFetchDepartments).toHaveBeenCalled();
    expect(onFetchPermissions).toHaveBeenCalled();
    expect(onFetchRoles).toHaveBeenCalled();
  });

  it('should render login page', () => {
    jest.spyOn(auth, 'isAuthenticated').mockImplementationOnce(() => false);

    const { queryByTestId, getByTestId, rerender } = render(
      withAppContext(<SettingsModule />)
    );

    expect(getByTestId('loginPage')).toBeInTheDocument();

    jest.spyOn(auth, 'isAuthenticated').mockImplementationOnce(() => true);

    rerender(withAppContext(<SettingsModule />));

    expect(queryByTestId('loginPage')).toBeNull();
  });

  it('should render a 404', () => {
    jest.spyOn(auth, 'isAuthenticated').mockImplementation(() => true);

    const { getByTestId } = render(withAppContext(<SettingsModule />));

    expect(getByTestId('notFoundPage')).toBeInTheDocument();
  });

  it('should provide pages with a location that has a referrer', async () => {
    jest.spyOn(auth, 'isAuthenticated').mockImplementation(() => true);

    render(withAppContext(<SettingsModule />));

    // After a change in the URL is picked up by the component, we need to wait till all state updates
    // have been completed before we perform any assertions. Using async/await to achieve that.
    await act(async () => history.push(`${USER_URL}/1`));
    await act(async () => history.push(`${USER_URL}/2`));

    const lastUseLocationResult = reactRouterDom.useLocation.mock.results.pop();

    expect(lastUseLocationResult.value.pathname).toEqual(`${USER_URL}/2`);
    expect(lastUseLocationResult.value.referrer).toEqual(`${USER_URL}/1`);
  });
});
