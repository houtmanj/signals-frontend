import React, { memo } from 'react';

import Label from 'components/Label';
import CheckboxList from '../CheckboxList';

const CheckboxGroup = props => {
  const categories = props.categories.toJS();
  const filterSlugs = props.filterSlugs.toJS();

  return Object.keys(categories.mainToSub)
    .filter(key => !!key) // remove elements without 'key' prop
    .sort()
    .map(mainCategory => {
      const mainCatObj = categories.main.find(
        ({ slug }) => slug === mainCategory
      );
      const options = categories.mainToSub[mainCategory];
      const defaultValue = filterSlugs.filter(({ key }) =>
        new RegExp(`/terms/categories/${mainCatObj.slug}`).test(key)
      );

      return (
        <CheckboxList
          defaultValue={defaultValue}
          groupId={mainCatObj.key}
          groupName="maincategory_slug"
          groupValue={mainCatObj.slug}
          hasToggle
          key={mainCategory}
          name={`${mainCatObj.slug}_category_slug`}
          onChange={props.onChange}
          onToggle={props.onToggle}
          options={options}
          title={<Label as="span">{mainCatObj.value}</Label>}
        />
      );
    });
};

export default memo(CheckboxGroup);
