import React, { useEffect, useState } from 'react';
import './MemberInput.css';

const MemberInput = ({ members, onComplete, onBack }) => {
  const [loadedMembers, setLoadedMembers] = useState([]);
  const [memberData, setMemberData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // localStorage에서 멤버들 가져오기
    const storedMembers = localStorage.getItem('filteredMembers');
    if (storedMembers) {
      try {
        const parsedMembers = JSON.parse(storedMembers);
        setLoadedMembers(parsedMembers);
        setMemberData(
          parsedMembers.map((member) => ({
            userId: member.userId,
            name: member.name,
            birthYear: '',
            phoneNumber: '',
            birthYearError: '',
            phoneNumberError: '',
          }))
        );
      } catch (err) {
        console.error('Failed to parse stored members:', err);
      }
    }
  }, []);

  const handleBirthYearChange = (index, value) => {
    const newData = [...memberData];
    newData[index].birthYear = value;
    
    // 2자리 숫자 검증
    if (value && !/^\d{2}$/.test(value)) {
      newData[index].birthYearError = '두자리 숫자로만 적어주세요';
    } else {
      newData[index].birthYearError = '';
    }
    
    setMemberData(newData);
  };

  const handlePhoneNumberChange = (index, value) => {
    const newData = [...memberData];
    newData[index].phoneNumber = value;
    
    // 전화번호 패턴 검증 (010-0000-0000 또는 01000000000만 허용)
    const phonePattern1 = /^010-\d{4}-\d{4}$/; // 010-0000-0000
    const phonePattern2 = /^010\d{8}$/; // 01000000000
    if (value && !phonePattern1.test(value) && !phonePattern2.test(value)) {
      newData[index].phoneNumberError = '010-0000-0000 또는 01000000000 형식으로 입력해주세요';
    } else {
      newData[index].phoneNumberError = '';
    }
    
    setMemberData(newData);
  };

  const parseBirthYear = (birthYear) => {
    if (!birthYear) return '';
    
    // 2자리 숫자인지 확인
    if (!/^\d{2}$/.test(birthYear)) return '';
    
    // 0으로 시작하면 20xx, 아니면 19xx
    if (birthYear.startsWith('0')) {
      return `20${birthYear}-01-01`;
    } else {
      return `19${birthYear}-01-01`;
    }
  };

  const parsePhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';
    // 하이픈 제거
    return phoneNumber.replace(/-/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 에러가 있는지 확인
    const hasError = memberData.some(
      (member) => member.birthYearError || member.phoneNumberError
    );
    
    if (hasError) {
      return;
    }

    setLoading(true);

    try {
      const backendApi = process.env.REACT_APP_BACKEND_API || 'https://attendance-dev.icoramdeo.com/api';
      
      // 각 멤버마다 PUT 요청
      const updatePromises = memberData.map(async (member, index) => {
        const originalMember = loadedMembers[index];
        
        // 사용자가 입력한 값이 있으면 파싱, 없으면 기존 값 사용
        const birthDate = member.birthYear 
          ? parseBirthYear(member.birthYear) 
          : (originalMember.birth_date || originalMember.birthYear || '');
        
        const phoneNumber = member.phoneNumber 
          ? parsePhoneNumber(member.phoneNumber) 
          : (originalMember.phone_number || originalMember.phoneNumber || '');

        // body 객체 동적 생성 (null이나 빈 문자열이 아닌 경우만 포함)
        const body = {};
        if (birthDate && birthDate !== '') {
          body.birth_date = birthDate;
        }
        if (phoneNumber && phoneNumber !== '') {
          body.phone_number = phoneNumber;
        }

        const response = await fetch(`${backendApi}/users/${member.userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error(`멤버 ${member.name} 업데이트 실패`);
        }

        return response.json();
      });

      await Promise.all(updatePromises);
      
      // localStorage 초기화
      localStorage.removeItem('filteredMembers');
      
      onComplete();
    } catch (err) {
      alert(err.message || '업데이트 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    // localStorage 초기화
    localStorage.removeItem('filteredMembers');
    onBack();
  };

  if (loadedMembers.length === 0) {
    return (
      <div className="member-input-container">
        <button className="back-button" onClick={handleBackClick}>
          &lt;
        </button>
        <div className="no-members-message">
          <h1 className="no-members-title">보완이 필요한 그룹원이 없습니다!</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="member-input-container">
      <button className="back-button" onClick={handleBackClick}>
        &lt;
      </button>
      <h1 className="member-input-title">그룹원의 기수와 전화번호를 보완해주세요!</h1>
      
      <form onSubmit={handleSubmit} className="member-input-form">
        {memberData.map((member, index) => {
          const originalMember = loadedMembers[index];
          const birthYear = originalMember.birthYear || originalMember.birth_year || '';
          const phoneNumber = originalMember.phoneNumber || originalMember.phone_number || '';
          
          const needsBirthYear = !birthYear || birthYear === '' || birthYear === null;
          const needsPhoneNumber = !phoneNumber || phoneNumber === '' || phoneNumber === null;

          return (
            <div key={member.userId} className="member-card">
              <h2 className="member-name">{member.name}</h2>
              
              {needsBirthYear && (
                <div className="input-group">
                  <input
                    type="text"
                    value={member.birthYear}
                    onChange={(e) => handleBirthYearChange(index, e.target.value)}
                    placeholder="기수"
                    className={`member-input ${member.birthYearError ? 'error' : ''}`}
                    maxLength={2}
                  />
                  {member.birthYearError && (
                    <p className="error-text">{member.birthYearError}</p>
                  )}
                </div>
              )}
              
              {needsPhoneNumber && (
                <div className="input-group">
                  <input
                    type="text"
                    value={member.phoneNumber}
                    onChange={(e) => handlePhoneNumberChange(index, e.target.value)}
                    placeholder="전화번호"
                    className={`member-input ${member.phoneNumberError ? 'error' : ''}`}
                  />
                  {member.phoneNumberError && (
                    <p className="error-text">{member.phoneNumberError}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
        
        <button
          type="submit"
          className="member-submit-button"
          disabled={loading}
        >
          {loading ? '저장 중...' : '확인'}
        </button>
      </form>
    </div>
  );
};

export default MemberInput;

