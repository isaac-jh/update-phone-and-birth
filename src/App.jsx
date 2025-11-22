import React, { useState } from 'react';
import './App.css';
import NameInput from './components/NameInput';
import MemberInput from './components/MemberInput';
import Complete from './components/Complete';

function App() {
  const [step, setStep] = useState('name'); // 'name', 'member', 'complete'
  const [members, setMembers] = useState([]);

  const handleNameSubmit = (fetchedMembers) => {
    setMembers(fetchedMembers);
    setStep('member');
  };

  const handleComplete = () => {
    setStep('complete');
  };

  const handleBack = () => {
    setStep('name');
  };

  return (
    <div className="App">
      {step === 'name' && <NameInput onSubmit={handleNameSubmit} />}
      {step === 'member' && (
        <MemberInput 
          members={members} 
          onComplete={handleComplete}
          onBack={handleBack}
        />
      )}
      {step === 'complete' && <Complete onBack={handleBack} />}
    </div>
  );
}

export default App;

