import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const NoDataPage = ({ message, link }) => {
  return (
    <div className="no-data-page">
      <div className="no-data-message">
        <h2>{message}</h2>
        {link ? (
            <p>Click <Link to={link}>Here</Link></p>
        ) : (<></>)}
      </div>
    </div>
  );
};

NoDataPage.propTypes = {
  message: PropTypes.string.isRequired, // Enforce passing a custom message
};

export default NoDataPage;
