/*
 * // This file is part of Invenio-Communities
 * // Copyright (C) 2023-2024 CERN.
 * // Copyright (C) 2024 KTH Royal Institute of Technology.
 * //
 * // Invenio-App-Rdm is free software; you can redistribute it and/or modify it
 * // under the terms of the MIT License; see LICENSE file for more details.
 */

import { InvenioAdministrationCommunitiesApi } from "../api";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { NotificationContext } from "@js/invenio_administration";
import { withCancel, ErrorMessage } from "react-invenio-forms";
import { Button, Modal } from "semantic-ui-react";
import { i18next } from "@translations/invenio_communities/i18next";

export class RestoreConfirmation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: undefined,
    };
  }

  componentWillUnmount() {
    this.cancellableAction && this.cancellableAction.cancel();
  }

  static contextType = NotificationContext;

  handleSubmit = async (values) => {
    const { addNotification } = this.context;
    const { resource, actionSuccessCallback } = this.props;

    this.setState({ loading: true });

    this.cancellableAction = withCancel(
      InvenioAdministrationCommunitiesApi.restore(resource)
    );

    try {
      await this.cancellableAction.promise;
      this.setState({ loading: false, error: undefined });
      addNotification({
        title: i18next.t("Success"),
        content: i18next.t("Community {{id}} was restored.", { id: resource.slug }),
        type: "success",
      });
      actionSuccessCallback();
    } catch (error) {
      if (error === "UNMOUNTED") return;

      this.setState({
        error: error?.response?.data?.message || error?.message,
        loading: false,
      });
      console.error(error);
    }
  };
  handleModalClose = () => {
    const { actionCancelCallback } = this.props;
    actionCancelCallback();
  };

  render() {
    const { error, loading } = this.state;
    const { resource } = this.props;
    return (
      <>
        {error && (
          <ErrorMessage
            header={i18next.t("Unable to restore.")}
            content={error}
            icon="exclamation"
            className="text-align-left"
            negative
          />
        )}
        <Modal.Content>
          {i18next.t("Are you sure you want to restore community #{{id}}", {
            id: resource.slug,
          })}
          <b>"{resource.metadata.title}"</b> ?
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.handleModalClose} floated="left">
            {i18next.t("Close")}
          </Button>
          <Button
            size="small"
            labelPosition="left"
            icon="trash alternate"
            color="red"
            content={i18next.t("Restore community")}
            onClick={(event) => this.handleSubmit(event)}
            loading={loading}
            disabled={loading}
          />
        </Modal.Actions>
      </>
    );
  }
}

RestoreConfirmation.propTypes = {
  resource: PropTypes.object.isRequired,
  actionCancelCallback: PropTypes.func.isRequired,
  actionSuccessCallback: PropTypes.func.isRequired,
};
