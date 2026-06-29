import { useState, useEffect, useCallback } from 'react';
import { leaveAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useLeaveData = (userId, role) => {
  const [balance, setBalance] = useState(null);
  const [requests, setRequests] = useState([]);
  const [teamRequests, setTeamRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBalance = useCallback(async () => {
    try {
      const response = await leaveAPI.getMyBalance();
      setBalance(response.data);
    } catch (err) {
      setError('Failed to fetch balance');
      toast.error('Failed to fetch leave balance');
    }
  }, []);

  const fetchMyRequests = useCallback(async () => {
    try {
      const response = await leaveAPI.getMyRequests();
      setRequests(response.data);
    } catch (err) {
      setError('Failed to fetch requests');
      toast.error('Failed to fetch leave requests');
    }
  }, []);

  const fetchTeamRequests = useCallback(async () => {
    if (role !== 'intern') {
      try {
        const response = await leaveAPI.getTeamRequests();
        setTeamRequests(response.data);
      } catch (err) {
        setError('Failed to fetch team requests');
        toast.error('Failed to fetch team requests');
      }
    }
  }, [role]);

  const submitRequest = useCallback(async (requestData) => {
    try {
      const response = await leaveAPI.submitRequest(requestData);
      toast.success('Leave request submitted successfully');
      await fetchMyRequests();
      await fetchBalance();
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit request');
      throw err;
    }
  }, [fetchMyRequests, fetchBalance]);

  const updateRequestStatus = useCallback(async (requestId, status, comments) => {
    try {
      const response = await leaveAPI.updateRequestStatus(requestId, status, comments);
      toast.success(`Request ${status}`);
      await fetchTeamRequests();
      return response.data;
    } catch (err) {
      toast.error('Failed to update request status');
      throw err;
    }
  }, [fetchTeamRequests]);

  const adjustBalance = useCallback(async (adjustmentData) => {
    try {
      const response = await leaveAPI.adjustBalance(adjustmentData);
      toast.success('Balance adjusted successfully');
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to adjust balance');
      throw err;
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchBalance(),
      fetchMyRequests(),
      fetchTeamRequests(),
    ]);
    setLoading(false);
  }, [fetchBalance, fetchMyRequests, fetchTeamRequests]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return {
    balance,
    requests,
    teamRequests,
    loading,
    error,
    submitRequest,
    updateRequestStatus,
    adjustBalance,
    refreshAll,
  };
};