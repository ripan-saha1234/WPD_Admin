import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuthToken, getStoredUser, mapUserFromApi } from '../utils/auth';

export const globalContext = createContext();

export function GlobalContextProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [breadcrums, setBreadcrums] = useState([]);
  const [pageTitle, setPageTitle] = useState('');
  const [buttonList, setButtonList] = useState([]);
  const [subTitle, setSubTitle] = useState({});
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const [user, setUser] = useState({
    id: null,
    name: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    const userData = getStoredUser();
    if (userData) {
      setUser(mapUserFromApi(userData));
    }
  }, []);

  useEffect(() => {
    const path = location.pathname;
    const token = getAuthToken();

    if (!path) return;

    if (path !== '/auth') {
      if (!token) navigate('/auth');
    } else if (token) {
      navigate('/dashboard');
    }
  }, [location.pathname, navigate]);

  const showToast = useCallback((message, severity = 'info') => {
    if (!message) return;

    setToast({
      open: true,
      message,
      severity,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({
      ...prev,
      open: false,
    }));
  }, []);

  const value = useMemo(
    () => ({
      breadcrums,
      setBreadcrums,
      pageTitle,
      setPageTitle,
      user,
      setUser,
      buttonList,
      setButtonList,
      subTitle,
      setSubTitle,
      toast,
      showToast,
      hideToast,
    }),
    [
      breadcrums,
      pageTitle,
      user,
      buttonList,
      subTitle,
      toast,
      showToast,
      hideToast,
    ]
  );

  return (
    <globalContext.Provider value={value}>{children}</globalContext.Provider>
  );
}
