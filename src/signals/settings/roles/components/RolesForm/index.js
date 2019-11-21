import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import {
  Label as FieldLabel,
  Button,
  themeSpacing,
} from '@datapunt/asc-ui';

import PageHeader from 'signals/settings/components/PageHeader';
import Input from 'components/Input';

const Label = styled(FieldLabel)`
  display: block;
  font-family: Avenir Next LT W01 Demi, arial, sans-serif;
  margin-bottom: ${themeSpacing(3)};
`;

const StyledInput = styled(Input)`
  margin-bottom: ${themeSpacing(8)};
`;

const StyledButton = styled(Button)`
  margin-top: ${themeSpacing(6)};
  margin-right: ${themeSpacing(2)};
`;

export const RolesForm = ({
  id,
  list,
  permissions,
  onPatchRole,
}) => {
  const history = useHistory();
  const role = list.find(item => item.id === id * 1);

  const handleSubmit = e => {
    e.preventDefault();
    const permission_ids = [];
    permissions.forEach(permission => {
      if (e.target.elements[`permission${permission.id}`].checked) {
        permission_ids.push(permission.id);
      }
    });

    const payload = {
      id: role.id,
      patch: {
        id: role.id,
        name: e.target.elements.name.value,
        permission_ids,
      },
    };

    onPatchRole(payload);
    history.push('/instellingen/rollen');
  }

  const handleCancel = () => {
    history.push('/instellingen/rollen');
  };

  return (
    <div>
      <PageHeader title="Rol instellingen" />

      {role &&
        (
          <form
            onSubmit={handleSubmit}
          >
            <StyledInput
              label="Naam"
              name="name"
              type="text"
              defaultValue={role.name}
            />

            <Label label="Rechten" />
            {permissions.map(permission =>
              <div key={permission.id} className="antwoord">
                <input
                  name={`permission${permission.id}`}
                  id={`permission${permission.id}`}
                  type="checkbox"
                  defaultChecked={role.permissions.find(item => item.id === permission.id)}
                />
                <label htmlFor={`permission${permission.id}`}>{permission.name}</label>
              </div>)}

            <div>
              <StyledButton
                variant="secondary"
                type="submit"
              >
                Opslaan
              </StyledButton>

              <StyledButton
                variant="tertiary"
                type="button"
                onClick={handleCancel}
              >
                Annuleren
              </StyledButton>
            </div>
          </form>

        )
      }

    </div>
  )
};

RolesForm.defaultProps = {
  list: [],
  permissions: [],
};

RolesForm.propTypes = {
  id: PropTypes.string.isRequired,
  list: PropTypes.array,
  permissions: PropTypes.array,
  onPatchRole: PropTypes.func.isRequired,
};

export default RolesForm;
