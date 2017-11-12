import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Alert } from 'modules/common/utils';
import { Loading } from 'modules/common/components';
import { mutations, queries } from '../graphql';
import { CompaniesList } from '../components';

class CompanyListContainer extends React.Component {
  render() {
    const {
      companiesQuery,
      companiesListConfigQuery,
      companyCountsQuery,
      companiesAdd
    } = this.props;

    if (
      companiesQuery.loading ||
      companyCountsQuery.loading ||
      companiesListConfigQuery.loading
    ) {
      return <Loading title="Companies" />;
    }

    let columnsConfig = companiesListConfigQuery.fieldsDefaultColumnsConfig;

    // load config from local storage
    const localConfig = localStorage.getItem('erxes_company_columns_config');

    if (localConfig) {
      columnsConfig = JSON.parse(localConfig);
    }

    // add customer
    const addCompany = ({ doc, callback }) => {
      companiesAdd({
        variables: doc
      })
        .then(() => {
          companiesQuery.refetch();
          Alert.success('Success');
          callback();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      ...this.props,
      columnsConfig,

      counts: companyCountsQuery.companyCounts,
      companies: companiesQuery.companies,
      addCompany
    };

    return <CompaniesList {...updatedProps} />;
  }
}

CompanyListContainer.propTypes = {
  queryParams: PropTypes.object,
  companiesQuery: PropTypes.object,
  companyCountsQuery: PropTypes.object,
  companiesListConfigQuery: PropTypes.object,
  companiesAdd: PropTypes.func
};

export default compose(
  graphql(gql(queries.companies), {
    name: 'companiesQuery',
    options: ({ queryParams }) => ({
      variables: {
        page: queryParams.page,
        perPage: queryParams.perPage || 20,
        segment: queryParams.segment,
        tag: queryParams.tag,
        ids: queryParams.ids
      }
    })
  }),
  graphql(gql(queries.companyCounts), {
    name: 'companyCountsQuery',
    options: ({ queryParams }) => ({
      variables: {
        page: queryParams.page,
        perPage: queryParams.perPage || 20,
        segment: queryParams.segment,
        tag: queryParams.tag,
        ids: queryParams.ids
      }
    })
  }),
  graphql(gql(queries.companiesListConfig), {
    name: 'companiesListConfigQuery'
  }),
  // mutations
  graphql(gql(mutations.companiesAdd), {
    name: 'companiesAdd'
  })
)(CompanyListContainer);
