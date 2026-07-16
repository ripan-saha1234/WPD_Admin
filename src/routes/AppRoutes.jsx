import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout/AppLayout';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import AllBlogsPage from '../pages/cms/blogs/all-blogs/AllBlogsPage';
import AddBlogsPage from '../pages/cms/blogs/add-blogs/AddBlogsPage';
import EditBlogPage from '../pages/cms/blogs/edit-blogs/EditBlogPage';
import BlogCategoriesPage from '../pages/cms/blogs/blog-categories/BlogCategoriesPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<LoginPage />} />
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        <Route path="cms/blogs" element={<Outlet />}>
          <Route index element={<AllBlogsPage />} />
          <Route path="add-blogs" element={<AddBlogsPage />} />
          <Route path="edit-blog/:id" element={<EditBlogPage />} />
          <Route path="blog-categories" element={<BlogCategoriesPage />} />
        </Route>

        <Route path="blog" element={<Navigate to="/cms/blogs" replace />} />
        <Route path="blog/add" element={<Navigate to="/cms/blogs/add-blogs" replace />} />
        <Route path="blog-category" element={<Navigate to="/cms/blogs/blog-categories" replace />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
