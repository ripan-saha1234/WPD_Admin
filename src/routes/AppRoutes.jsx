import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout/AppLayout';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import Cms from '../pages/cms/cms';
import AllBlogsPage from '../pages/cms/blogs/all-blogs/AllBlogsPage';
import BlogCategoriesPage from '../pages/cms/blogs/blog-categories/BlogCategoriesPage';
import AddBlogPage from '../pages/cms/blogs/add-blogs/AddBlogPage';
import HomePageCms from '../pages/cms/pages/home/HomePageCms';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<LoginPage />} />
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="cms" element={<Cms />} />
        <Route path="cms/pages/home" element={<HomePageCms />} />
        <Route path="cms/blogs" element={<AllBlogsPage />} />
        <Route path="cms/blogs/blog-categories" element={<BlogCategoriesPage />} />
        <Route path="cms/blogs/add-blogs" element={<AddBlogPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
