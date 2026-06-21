import { Cell, CellGroup, Empty } from '@nutui/nutui-react-taro';
import { ScrollView, Text, View } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { APP_NAME, COLORS } from '@/constants';
import useAuthStore, { useIsLoggedIn } from '@/store/useAuthStore';
import { del, get } from '@/utils/request';
import './patientList.scss';

// 样式常量 — 避免每次渲染创建新对象
const CELL_STYLE = {
  padding: '24rpx 30rpx',
  borderRadius: '12rpx',
  fontSize: '28rpx',
  color: COLORS.TEXT_PRIMARY,
  backgroundColor: COLORS.WHITE,
  boxShadow: '0 2rpx 10rpx rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease',
  border: 'none',
  marginBottom: '20rpx',
  position: 'relative',
  overflow: 'hidden',
  animation: 'cardFadeIn 0.5s ease forwards',
  opacity: 0,
  transform: 'translateY(20rpx)',
};

const TITLE_STYLE = { display: 'flex', alignItems: 'center', gap: '10rpx' };
const NAME_STYLE = { fontWeight: 'bold', color: COLORS.TEXT_PRIMARY, marginRight: '30rpx' };
const INFO_STYLE = { fontSize: '26rpx', color: COLORS.TEXT_SECONDARY };
const DELETE_STYLE = {
  color: COLORS.WHITE,
  backgroundColor: COLORS.DANGER,
  fontSize: '24rpx',
  padding: '8rpx 24rpx',
  borderRadius: '20rpx',
  transition: 'all 0.2s ease',
};
const EXTRA_STYLE = { display: 'flex', alignItems: 'center' };

// 虚拟滚动配置
const ITEM_HEIGHT = 120; // rpx，每个 Cell 的预估高度
const BUFFER_COUNT = 5; // 视口外额外渲染的条目数

const PatientList = () => {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(600);
  const pageSize = 10;
  const loadingRef = useRef(false);

  const { initAuth, checkAuth } = useAuthStore();
  const isLoggedIn = useIsLoggedIn();

  // 虚拟滚动：计算可见范围
  const { startIndex, endIndex } = useMemo(() => {
    const ratio = 2; // rpx -> px 转换比例
    const itemHeightPx = ITEM_HEIGHT / ratio;
    const start = Math.max(0, Math.floor(scrollTop / itemHeightPx) - BUFFER_COUNT);
    const visibleCount = Math.ceil(viewportHeight / itemHeightPx);
    const end = Math.min(patients.length, start + visibleCount + BUFFER_COUNT * 2);
    return { startIndex: start, endIndex: end };
  }, [scrollTop, viewportHeight, patients.length]);

  // 虚拟滚动：仅渲染可见项
  const visiblePatients = useMemo(() => {
    return patients.slice(startIndex, endIndex).map((patient, i) => ({
      patient,
      index: startIndex + i,
    }));
  }, [patients, startIndex, endIndex]);

  // 列表总高度（用于占位）
  const totalHeight = useMemo(() => {
    return patients.length * ITEM_HEIGHT;
  }, [patients.length]);

  const handleScroll = useCallback(e => {
    setScrollTop(e.detail.scrollTop);
  }, []);

  const fetchPatients = useCallback(async (currentPage, isRefresh = false) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    try {
      const response = await get('/api/timeline/patients/my-list', {
        page: currentPage,
        page_size: pageSize,
      });

      if (response) {
        const newPatients = response.patients || [];
        setPatients(prev =>
          currentPage === 1 || isRefresh ? newPatients : [...prev, ...newPatients]
        );
        setHasMore(newPatients.length >= pageSize);
      } else {
        Taro.showToast({ title: response.message || '加载失败', icon: 'none' });
      }
    } catch (error) {
      Taro.showToast({ title: '网络异常', icon: 'none' });
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useDidShow(() => {
    initAuth();

    if (!checkAuth()) {
      Taro.showModal({
        title: '提示',
        content: '如果要使用患者管理功能，请先登录',
        showCancel: false,
        success: () => {
          Taro.switchTab({ url: '/pages/profile/profile' });
        },
      });
      return;
    }

    setPage(1);
    setHasMore(true);
    fetchPatients(1, true);
  });

  useEffect(() => {
    if (page > 1) {
      fetchPatients(page);
    }
  }, [page, fetchPatients]);

  const onRefresh = () => {
    if (checkAuth()) {
      setPage(1);
      setHasMore(true);
      fetchPatients(1, true);
    } else {
      Taro.stopPullDownRefresh();
    }
  };

  const loadMore = () => {
    if (isLoggedIn && !loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const goToPatientDetail = patientId => {
    if (checkAuth()) {
      Taro.navigateTo({
        url: `/pages/patientDetail/patientDetail?id=${patientId}`,
      });
    }
  };

  const goToCreatePatient = () => {
    if (checkAuth()) {
      Taro.navigateTo({
        url: '/pages/createPatient/createPatient',
      });
    }
  };

  const deletePatient = async patientId => {
    try {
      await del(`/api/timeline/patients/${patientId}`);
      setPatients(prevPatients => prevPatients.filter(patient => patient.id !== patientId));
      Taro.showToast({ title: '删除成功', icon: 'success' });
    } catch (error) {
      console.error('删除患者失败:', error);
      throw error;
    }
  };

  const handleDelete = async (e, patientId) => {
    e.stopPropagation();

    try {
      const result = await Taro.showModal({
        title: '删除确认',
        content: '确定要删除该患者吗？删除后数据不可恢复！',
        confirmColor: '#ff4d4f',
        cancelColor: '#666666',
      });

      if (result.confirm) {
        await deletePatient(patientId);
      }
    } catch (error) {
      console.error('删除操作失败:', error);
      Taro.showToast({ title: '删除失败', icon: 'none' });
    }
  };

  // 渲染单个患者卡片
  const renderPatientCard = useCallback(
    (patient, _index) => {
      return (
        <Cell
          key={patient.id}
          onClick={() => goToPatientDetail(patient.id)}
          style={CELL_STYLE}
          title={
            <View style={TITLE_STYLE}>
              <Text style={NAME_STYLE}>{patient.name}</Text>
              <Text style={INFO_STYLE}>{patient.age}岁 | </Text>
              <Text style={INFO_STYLE}>{patient.gender === 1 ? '男' : '女'}</Text>
            </View>
          }
          extra={
            <View style={EXTRA_STYLE}>
              <Text style={DELETE_STYLE} onClick={e => handleDelete(e, patient.id)}>
                删除
              </Text>
            </View>
          }
        />
      );
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <View className='patient-list-page'>
      <ScrollView
        className='patient-scroll'
        scrollY
        enablePullDownRefresh
        onPullDownRefresh={onRefresh}
        onReachBottom={loadMore}
        onScroll={handleScroll}
        scrollWithAnimation
      >
        <CellGroup className='patient-list'>
          {patients.length > 0 ? (
            <View style={{ height: `${totalHeight}rpx`, position: 'relative' }}>
              {visiblePatients.map(({ patient, index }) => (
                <View
                  key={patient.id}
                  style={{
                    position: 'absolute',
                    top: `${index * ITEM_HEIGHT}rpx`,
                    width: '100%',
                    height: `${ITEM_HEIGHT}rpx`,
                  }}
                >
                  {renderPatientCard(patient, index)}
                </View>
              ))}
            </View>
          ) : (
            <Empty description='暂无患者信息' />
          )}
        </CellGroup>
        {loading && patients.length > 0 && <View className='loading'>加载中...</View>}
      </ScrollView>
      <View className='add-patient-btn-container'>
        <View className='add-patient-btn' onClick={goToCreatePatient}>
          <Text className='add-btn-text'>+</Text>
        </View>
      </View>
      <View className='function-tip'>
        <Text className='tip-text'>点击右边的+号可以新增患者，可以在每个患者页面录入详细的治疗数据</Text>
      </View>
    </View>
  );
};

// 分享给好友
PatientList.onShareAppMessage = function () {
  return {
    title: `${APP_NAME} - 患者管理`,
    desc: '便捷管理患者信息，记录医疗数据',
    path: '/pages/patientList/patientList',
  };
};

// 分享到朋友圈
PatientList.onShareTimeline = function () {
  return {
    title: `${APP_NAME} - 患者管理`,
    path: '/pages/patientList/patientList',
  };
};

export default PatientList;
