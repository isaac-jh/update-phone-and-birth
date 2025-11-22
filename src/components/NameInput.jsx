import React, { useState } from 'react';
import groupLeaders from '../groupLeader.json';
import './NameInput.css';

const NameInput = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('이름을 입력해주세요');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // groupLeader.json에서 이름으로 id 찾기
      const leader = groupLeaders.find(
        (l) => l.name === name.trim()
      );

      if (!leader) {
        setError('그룹장을 찾을 수 없습니다');
        setLoading(false);
        return;
      }

      // id가 배열인지 확인
      const idList = Array.isArray(leader.id) ? leader.id : [leader.id];

      // 백엔드 API 호출 - 각 id에 대해 요청
      const backendApi = process.env.REACT_APP_BACKEND_API || 'https://attendance-dev.icoramdeo.com/api';
      
      const requests = idList.map((id) =>
        fetch(`${backendApi}/organizations/${id}/members/roles`).then((response) => {
          if (!response.ok) {
            throw new Error(`멤버 정보를 가져오는데 실패했습니다 (ID: ${id})`);
          }
          return response.json();
        })
      );

      const responses = await Promise.all(requests);
      
      // 모든 응답에서 멤버들을 수집
      const allMembers = responses.flatMap((data) => data || []);
      
      // birthYear나 phoneNumber가 null 또는 빈스트링인 멤버만 필터링
      let filteredMembers = localStorage.getItem('filteredMembers')
      if (!filteredMembers) filteredMembers = []
      allMembers.filter((member) => {
        const birthYear = member.birthYear || member.birth_year || '';
        const phoneNumber = member.phoneNumber || member.phone_number || '';
        
        const hasNoBirthYear = !birthYear || birthYear === '' || birthYear === null;
        const hasNoPhoneNumber = !phoneNumber || phoneNumber === '' || phoneNumber === null;
        
        return hasNoBirthYear || hasNoPhoneNumber;
      }).map((member) => filteredMembers.push(member));

      // localStorage에 저장
      localStorage.setItem('filteredMembers', JSON.stringify(filteredMembers));
      
      onSubmit(filteredMembers);
    } catch (err) {
      setError(err.message || '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="name-input-container">
      <h1 className="name-input-title">이름을 알려주세요 그룹장님</h1>
      <form onSubmit={handleSubmit} className="name-input-form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 입력하세요"
          className="name-input-field"
          disabled={loading}
        />
        <button
          type="submit"
          className="name-input-button"
          disabled={loading}
        >
          {loading ? '확인 중...' : '확인'}
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default NameInput;

