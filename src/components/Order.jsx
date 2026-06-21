import { useEffect, useState } from 'react';

import { get } from '@/utils/request';

import HospitalList from './HospitalList/HospitalList';

const Order = () => {
  const [list, setList] = useState([]);

  const getList = async () => {
    const res = await get('/api/hospitals/');
    setList(res);
  };
  useEffect(() => {
    getList();
  }, []);

  return (
    <div>
      <HospitalList list={list} />
    </div>
  );
};

export default Order;
