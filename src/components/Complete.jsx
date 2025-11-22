import React from 'react';
import './Complete.css';

const Complete = ({ onBack }) => {
  return (
    <div className="complete-container" onClick={onBack}>
      <div className="complete-icon">✅</div>
      <h1 className="complete-message">완료되었습니다</h1>
    </div>
  );
};

export default Complete;

