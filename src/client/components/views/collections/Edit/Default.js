import React from 'react';
import PropTypes from 'prop-types';
import { useRouteMatch } from 'react-router-dom';
import moment from 'moment';
import config from 'payload/config';
import Eyebrow from '../../../elements/Eyebrow';
import Form from '../../../forms/Form';
import PreviewButton from '../../../elements/PreviewButton';
import FormSubmit from '../../../forms/Submit';
import RenderFields from '../../../forms/RenderFields';
import CopyToClipboard from '../../../elements/CopyToClipboard';
import * as fieldTypes from '../../../forms/field-types';

import './index.scss';

const { serverURL, routes: { api } } = config;

const baseClass = 'collection-edit';

const DefaultEditView = (props) => {
  const { params: { id } = {} } = useRouteMatch();

  const {
    collection, isEditing, data, onSave,
  } = props;

  const {
    slug,
    fields,
    labels: {
      singular: singularLabel,
    },
    useAsTitle,
    timestamps,
    preview,
  } = collection;

  const apiURL = `${serverURL}${api}/${slug}/${id}`;

  return (
    <div className={baseClass}>
      <Form
        className={`${baseClass}__form`}
        method={id ? 'put' : 'post'}
        action={`${serverURL}${api}/${slug}${id ? `/${id}` : ''}`}
        handleAjaxResponse={onSave}
      >
        <div className={`${baseClass}__main`}>
          <Eyebrow actions={
            isEditing ? (
              <ul className={`${baseClass}__collection-actions`}>
                <li>Add New</li>
                <li>Duplicate</li>
                <li>Delete</li>
              </ul>
            ) : undefined}
          />
          <div className={`${baseClass}__edit`}>
            <header className={`${baseClass}__header`}>
              {isEditing && (
                <h1>
                  Edit
                  {' '}
                  {Object.keys(data).length > 0
                    && (data[useAsTitle || 'id'] ? data[useAsTitle || 'id'] : '[Untitled]')
                  }
                </h1>
              )}
              {!isEditing
                && (
                  <h1>
                    Create New
                    {' '}
                    {singularLabel}
                  </h1>
                )
              }
            </header>
            <RenderFields
              filter={field => (!field.position || (field.position && field.position !== 'sidebar'))}
              fieldTypes={fieldTypes}
              fieldSchema={fields}
              initialData={data}
              customComponentsPath={`${slug}.fields.`}
            />
          </div>
        </div>
        <div className={`${baseClass}__sidebar`}>
          <div className={`${baseClass}__document-actions${preview ? ` ${baseClass}__document-actions--with-preview` : ''}`}>
            <PreviewButton generatePreviewURL={preview} />
            <FormSubmit>Save</FormSubmit>
          </div>
          {isEditing && (
            <div className={`${baseClass}__api-url`}>
              <span className={`${baseClass}__label`}>
                API URL
                {' '}
                <CopyToClipboard value={apiURL} />
              </span>
              <a
                href={apiURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {apiURL}
              </a>
            </div>
          )}
          <div className={`${baseClass}__sidebar-fields`}>
            <RenderFields
              filter={field => field.position === 'sidebar'}
              position="sidebar"
              fieldTypes={fieldTypes}
              fieldSchema={fields}
              initialData={data}
              customComponentsPath={`${slug}.fields.`}
            />
          </div>
          {isEditing && (
            <ul className={`${baseClass}__meta`}>
              <li>
                <div className={`${baseClass}__label`}>ID</div>
                <div>{id}</div>
              </li>
              {timestamps && (
                <>
                  <li>
                    <div className={`${baseClass}__label`}>Last Modified</div>
                    <div>{moment(data.updatedAt).format('MMMM Do YYYY, h:mma')}</div>
                  </li>
                  <li>
                    <div className={`${baseClass}__label`}>Created</div>
                    <div>{moment(data.createdAt).format('MMMM Do YYYY, h:mma')}</div>
                  </li>
                </>
              )}

            </ul>
          )}
        </div>
      </Form>
    </div>
  );
};

DefaultEditView.defaultProps = {
  isEditing: false,
  data: undefined,
  onSave: null,
};

DefaultEditView.propTypes = {
  collection: PropTypes.shape({
    labels: PropTypes.shape({
      plural: PropTypes.string,
      singular: PropTypes.string,
    }),
    slug: PropTypes.string,
    useAsTitle: PropTypes.string,
    fields: PropTypes.arrayOf(PropTypes.shape({})),
    preview: PropTypes.func,
    timestamps: PropTypes.bool,
  }).isRequired,
  isEditing: PropTypes.bool,
  data: PropTypes.shape({
    updatedAt: PropTypes.string,
    createdAt: PropTypes.string,
  }),
  onSave: PropTypes.func,
};

export default DefaultEditView;