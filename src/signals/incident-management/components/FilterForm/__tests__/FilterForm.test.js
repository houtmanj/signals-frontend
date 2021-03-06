import React from 'react';
import { fireEvent, render, cleanup, act, wait } from '@testing-library/react';
import { withAppContext } from 'test/utils';

import priorityList from 'signals/incident-management/definitions/priorityList';
import statusList from 'signals/incident-management/definitions/statusList';
import stadsdeelList from 'signals/incident-management/definitions/stadsdeelList';

import categories from 'utils/__tests__/fixtures/categories_structured.json';
import * as definitions from 'signals/incident-management/definitions';
import FilterForm from '..';
import {
  SAVE_SUBMIT_BUTTON_LABEL,
  DEFAULT_SUBMIT_BUTTON_LABEL,
} from '../constants';

const dataLists = {
  priority: definitions.priorityList,
  status: definitions.statusList,
  feedback: definitions.feedbackList,
  stadsdeel: definitions.stadsdeelList,
  source: definitions.sourceList,
  contact_details: definitions.contactDetailsList,
};

const formProps = {
  onClearFilter: () => { },
  onSaveFilter: () => { },
  categories,
  onSubmit: () => { },
};

describe('signals/incident-management/components/FilterForm', () => {
  it('should render filter fields', () => {
    const { container } = render(
      withAppContext(<FilterForm {...formProps} dataLists={dataLists} />)
    );

    expect(
      container.querySelectorAll('input[type="text"][name="name"]')
    ).toHaveLength(1);
    expect(
      container.querySelectorAll('input[type="text"][name="address_text"]')
    ).toHaveLength(1);
  });

  it('should render a refresh checkbox', () => {
    const { container } = render(
      withAppContext(
        <FilterForm
          {...formProps}
          filter={{ options: {} }}
          dataLists={dataLists}
        />
      )
    );

    expect(
      container.querySelector('input[type="checkbox"][name="refresh"]')
    ).toBeTruthy();
  });

  it('should handle checking the refresh box', () => {
    const { container } = render(
      withAppContext(
        <FilterForm
          {...formProps}
          filter={{ id: 1234, name: 'FooBar', options: {} }}
          dataLists={dataLists}
        />
      )
    );

    act(() => {
      fireEvent.click(
        container.querySelector('input[type="checkbox"][name="refresh"]')
      );
    });

    expect(
      container.querySelector('input[type="checkbox"][name="refresh"]').checked
    ).toBeTruthy();

    act(() => {
      fireEvent.click(
        container.querySelector('input[type="checkbox"][name="refresh"]')
      );
    });

    expect(
      container.querySelector('input[type="checkbox"][name="refresh"]').checked
    ).toBeFalsy();
  });

  it('should render a hidden id field', () => {
    const { container } = render(
      withAppContext(
        <FilterForm
          {...formProps}
          filter={{ id: 1234, name: 'FooBar', options: {} }}
          dataLists={dataLists}
        />
      )
    );

    expect(
      container.querySelectorAll('input[type="hidden"][name="id"]')
    ).toHaveLength(1);

    expect(
      container.querySelector('input[type="hidden"][name="id"]').value
    ).toEqual('1234');
  });

  it('should render groups of category checkboxes', () => {
    const { getAllByTestId } = render(
      withAppContext(<FilterForm {...formProps} dataLists={dataLists} />)
    );

    getAllByTestId('checkboxList').forEach(element => {
      expect(element).toBeInTheDocument();
    });
  });

  it('should render a list of priority options', () => {
    const dataListsWithEmptyPriorityList = { ...dataLists };
    dataListsWithEmptyPriorityList.priority = [];

    const { container, rerender, queryByTestId } = render(
      withAppContext(
        <FilterForm {...formProps} dataLists={dataListsWithEmptyPriorityList} />
      )
    );

    expect(queryByTestId('priorityCheckboxGroup')).toBeNull();

    expect(
      container.querySelectorAll('input[type="checkbox"][name="priority"]')
    ).toHaveLength(0);

    cleanup();

    rerender(
      withAppContext(<FilterForm {...formProps} dataLists={dataLists} />)
    );

    expect(
      container.querySelectorAll('input[type="checkbox"][name="priority"]')
    ).toHaveLength(priorityList.length);
  });

  it('should render a list of status options', () => {
    const dataListsWithEmptyStatusList = { ...dataLists };
    dataListsWithEmptyStatusList.status = [];

    const { container, rerender, queryByTestId } = render(
      withAppContext(
        <FilterForm {...formProps} dataLists={dataListsWithEmptyStatusList} />
      )
    );

    expect(queryByTestId('statusFilterGroup')).toBeNull();

    expect(
      container.querySelectorAll('input[type="checkbox"][name="status"]')
    ).toHaveLength(0);

    cleanup();

    rerender(
      withAppContext(<FilterForm {...formProps} dataLists={dataLists} />)
    );

    expect(
      container.querySelectorAll('input[type="checkbox"][name="status"]')
    ).toHaveLength(statusList.length);
  });

  it('should render a list of stadsdeel options', () => {
    const dataListsWithEmptyStadsdeelList = { ...dataLists };
    dataListsWithEmptyStadsdeelList.stadsdeel = [];

    const { container, rerender, queryByTestId } = render(
      withAppContext(
        <FilterForm
          {...formProps}
          dataLists={dataListsWithEmptyStadsdeelList}
        />
      )
    );

    expect(queryByTestId('stadsdeelFilterGroup')).toBeNull();

    expect(
      container.querySelectorAll('input[type="checkbox"][name="stadsdeel"]')
    ).toHaveLength(0);

    cleanup();

    rerender(
      withAppContext(<FilterForm {...formProps} dataLists={dataLists} />)
    );

    expect(
      container.querySelectorAll('input[type="checkbox"][name="stadsdeel"]')
    ).toHaveLength(stadsdeelList.length);
  });

  it('should render a list of contact options', () => {
    const { container } = render(
      withAppContext(<FilterForm {...formProps} dataLists={dataLists} />)
    );

    expect(
      container.querySelectorAll('input[type="checkbox"][name="contact_details"]')
    ).toHaveLength(dataLists.contact_details.length);
  });

  it('should render a list of feedback options', () => {
    const { container } = render(
      withAppContext(<FilterForm {...formProps} dataLists={dataLists} />)
    );

    expect(
      container.querySelectorAll('input[type="radio"][name="feedback"]')
    ).toHaveLength(dataLists.feedback.length + 1); // by default, a radio button with an empty value is rendered
  });

  it('should render a list of source options', () => {
    const { container } = render(
      withAppContext(<FilterForm {...formProps} dataLists={dataLists} />)
    );

    expect(
      container.querySelectorAll('input[type="checkbox"][name="source"]')
    ).toHaveLength(dataLists.source.length);
  });

  it('should render datepickers', () => {
    render(withAppContext(<FilterForm {...formProps} dataLists={dataLists} />));

    expect(
      document.getElementById('filter_created_before')
    ).toBeInTheDocument();
    expect(document.getElementById('filter_created_after')).toBeInTheDocument();
  });

  it('should update the state on created before date select', () => {
    render(withAppContext(<FilterForm {...formProps} dataLists={dataLists} />));

    const value = '18-12-2018';
    const inputElement = document.getElementById('filter_created_before');

    // selecting a date from the datepicker will render a hidden input
    expect(
      document.querySelector('input[name=created_before]')
    ).not.toBeInTheDocument();

    act(() => {
      fireEvent.change(inputElement, { target: { value } });
    });

    expect(
      document.querySelector('input[name=created_before]')
    ).toBeInTheDocument();
  });

  it('should update the state on created after date select', () => {
    render(withAppContext(<FilterForm {...formProps} dataLists={dataLists} />));

    const value = '23-12-2018';
    const inputElement = document.getElementById('filter_created_after');

    // selecting a date from the datepicker will render a hidden input
    expect(
      document.querySelector('input[name=created_after]')
    ).not.toBeInTheDocument();

    act(() => {
      fireEvent.change(inputElement, { target: { value } });
    });

    expect(
      document.querySelector('input[name=created_after]')
    ).toBeInTheDocument();
  });

  // Note that jsdom has a bug where `submit` and `reset` handlers are not called when those handlers
  // are defined as callback attributes on the form element. Instead, handlers are invoked when the
  // corresponding buttons are clicked.
  it('should handle reset', () => {
    const onClearFilter = jest.fn();
    const { container } = render(
      withAppContext(
        <FilterForm
          {...formProps}
          onClearFilter={onClearFilter}
          dataLists={dataLists}
        />
      )
    );

    const nameField = container.querySelector(
      'input[type="text"][name="name"]'
    );
    const dateField = container.querySelector(
      'input[id="filter_created_before"]'
    );
    const addressField = container.querySelector(
      'input[type="text"][name="address_text"]'
    );
    const afvalToggle = container.querySelector(
      'input[type="checkbox"][value="afval"]'
    );

    act(() => {
      fireEvent.change(nameField, { target: { value: 'My filter' } });
    });
    act(() => {
      fireEvent.change(dateField, { target: { value: '1970-01-01' } });
    });
    act(() => {
      fireEvent.change(addressField, {
        target: { value: 'Weesperstraat 113' },
      });
    });
    act(() => {
      fireEvent.click(afvalToggle, new MouseEvent({ bubbles: true }));
    });

    wait(() => {
      expect(nameField.value).toEqual('My filter');
      expect(dateField.value).toEqual('1970-01-01');
      expect(addressField.value).not.toBeFalsy();
      expect(afvalToggle.checked).toEqual(true);
      expect(
        container.querySelectorAll('input[type"checkbox"]:checked').length
      ).toBeGreaterThan(1);
    });

    act(() => {
      fireEvent.click(container.querySelector('button[type="reset"]'));
    });

    wait(() => {
      expect(onClearFilter).toHaveBeenCalled();

      expect(nameField.value).toEqual('');
      expect(dateField.value).toEqual('');
      expect(addressField.value).toEqual('');
      expect(afvalToggle.checked).toEqual(false);
      expect(
        container.querySelectorAll('input[type"checkbox"]:checked').length
      ).toEqual(0);
    });
  });

  it('should handle cancel', () => {
    const onCancel = jest.fn();
    const { getByTestId } = render(
      withAppContext(
        <FilterForm {...formProps} onCancel={onCancel} dataLists={dataLists} />
      )
    );

    fireEvent.click(
      getByTestId('cancelBtn'),
      new MouseEvent({ bubbles: true })
    );

    expect(onCancel).toHaveBeenCalled();
  });

  it('should watch for changes in name field value', () => {
    const { container } = render(
      withAppContext(
        <FilterForm
          {...formProps}
          filter={{ name: 'My saved filter', options: {} }}
          dataLists={dataLists}
        />
      )
    );

    const submitButton = container.querySelector('button[type="submit"]');
    const nameField = container.querySelector(
      'input[type="text"][name="name"]'
    );

    expect(submitButton.textContent).toEqual(DEFAULT_SUBMIT_BUTTON_LABEL);

    act(() => {
      fireEvent.change(nameField, { target: { value: 'My filter' } });
    });

    expect(submitButton.textContent).toEqual(SAVE_SUBMIT_BUTTON_LABEL);

    act(() => {
      fireEvent.change(nameField, { target: { value: '' } });
    });

    expect(submitButton.textContent).toEqual(SAVE_SUBMIT_BUTTON_LABEL);
  });

  it('should watch for changes in address_text field value', async () => {
    const { container } = render(
      withAppContext(
        <FilterForm
          {...formProps}
          filter={{
            name: 'My saved filter',
            options: { address_text: 'Weesperstraat 113' },
          }}
          dataLists={dataLists}
        />
      )
    );

    const addressField = container.querySelector(
      'input[type="text"][name="address_text"]'
    );

    act(() => {
      fireEvent.change(addressField, {
        target: { value: 'Weesperstraat 113/117' },
      });
      fireEvent.blur(addressField);
    });

    await wait();

    expect(
      container.querySelector('input[type="text"][name="address_text"]').value
    ).toEqual('Weesperstraat 113/117');
  });

  it('should watch for changes in radio button lists', async () => {
    const { container } = render(
      withAppContext(<FilterForm {...formProps} dataLists={dataLists} />)
    );

    const priorityRadioButtons = container.querySelectorAll(
      'input[type="radio"][name="feedback"]'
    );
    const buttonInList = priorityRadioButtons[1];

    act(() => {
      fireEvent.click(buttonInList);
    });

    await wait();

    expect(buttonInList.checked).toEqual(true);
  });

  it('should watch for changes in checkbox lists', async () => {
    const { container } = render(
      withAppContext(<FilterForm {...formProps} dataLists={dataLists} />)
    );

    const sourceCheckboxes = container.querySelectorAll(
      'input[type="checkbox"][name="source"]'
    );
    const boxInList = sourceCheckboxes[1];

    act(() => {
      fireEvent.click(boxInList);
    });

    await wait();

    expect(boxInList.checked).toEqual(true);
  });

  it('should watch for changes on checkbox list toggle', async () => {
    const { container, getByTestId } = render(
      withAppContext(<FilterForm {...formProps} dataLists={dataLists} />)
    );

    const toggle = getByTestId('sourceCheckboxGroup').querySelector('label')
      .firstChild;

    await wait();

    container
      .querySelectorAll('input[type="checkbox"][name="source"]')
      .forEach(element => {
        expect(element.checked).toEqual(false);
      });

    act(() => {
      fireEvent.click(toggle);
    });

    await wait();

    container
      .querySelectorAll('input[type="checkbox"][name="source"]')
      .forEach(element => {
        expect(element.checked).toEqual(true);
      });

    act(() => {
      fireEvent.click(toggle);
    });

    await wait();

    container
      .querySelectorAll('input[type="checkbox"][name="source"]')
      .forEach(element => {
        expect(element.checked).toEqual(false);
      });
  });

  it('should watch for changes in category checkbox lists', async () => {
    const { container } = render(
      withAppContext(<FilterForm {...formProps} dataLists={dataLists} />)
    );

    const mainCategorySlug = 'afval';
    const checkboxes = container.querySelectorAll(`input[name="${mainCategorySlug}_category_slug"]`);

    expect(Array.from(checkboxes).every(element => !element.checked)).toEqual(true);

    act(() => {
      fireEvent.click(checkboxes[3]);
    });

    await wait();

    expect(Array.from(checkboxes).every(element => !element.checked)).toEqual(false);
    expect(checkboxes[3].checked).toEqual(true);
  });

  describe('submit', () => {
    let emit;

    beforeAll(() => {
      ({ emit } = window._virtualConsole);
    });

    beforeEach(() => {
      window._virtualConsole.emit = jest.fn();
    });

    afterAll(() => {
      window._virtualConsole.emit = emit;
    });

    it('should handle submit for new filter', () => {
      const handlers = {
        onSubmit: jest.fn(),
        onSaveFilter: jest.fn(),
      };

      const { container } = render(
        withAppContext(
          <FilterForm
            {...{ ...formProps, ...handlers }}
            filter={{
              name: '',
              options: { incident_date: '1970-01-01' },
            }}
            dataLists={dataLists}
          />
        )
      );

      expect(handlers.onSaveFilter).not.toHaveBeenCalled();
      expect(handlers.onSubmit).not.toHaveBeenCalled();

      const nameField = container.querySelector(
        'input[type="text"][name="name"]'
      );

      act(() => {
        fireEvent.click(container.querySelector('button[type="submit"]'));
      });

      expect(handlers.onSubmit).toHaveBeenCalled();
      expect(handlers.onSaveFilter).not.toHaveBeenCalled(); // name field is empty

      act(() => {
        fireEvent.change(nameField, { target: { value: 'New name' } });
      });

      act(() => {
        fireEvent.click(container.querySelector('button[type="submit"]'));
      });

      expect(handlers.onSaveFilter).toHaveBeenCalledTimes(1);
    });

    it('should handle submit for existing filter', () => {
      jest.spyOn(window, 'alert').mockImplementation(() => { });
      const handlers = {
        onUpdateFilter: jest.fn(),
        onSubmit: jest.fn(),
      };

      const { container } = render(
        withAppContext(
          <FilterForm
            {...{ ...formProps, ...handlers }}
            filter={{
              name: 'My filter',
              options: {
                incident_date_start: '1970-01-01',
              },
            }}
            dataLists={dataLists}
          />
        )
      );

      act(() => {
        fireEvent.click(container.querySelector('button[type="submit"]'));
      });

      // values haven't changed, update should not be called
      expect(handlers.onUpdateFilter).not.toHaveBeenCalled();

      const nameField = container.querySelector(
        'input[type="text"][name="name"]'
      );

      act(() => {
        fireEvent.change(nameField, { target: { value: ' ' } });
      });

      act(() => {
        fireEvent.click(container.querySelector('button[type="submit"]'));
      });

      // trimmed field value is empty, update should not be called
      expect(handlers.onUpdateFilter).not.toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalled();

      act(() => {
        fireEvent.change(nameField, { target: { value: 'My changed filter' } });
      });

      act(() => {
        fireEvent.click(container.querySelector('button[type="submit"]'));
      });

      expect(handlers.onUpdateFilter).toHaveBeenCalled();

      window.alert.mockRestore();
    });
  });
});
