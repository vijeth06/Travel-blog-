import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as blogAPI from '../api/blogs';

// Async thunks
export const fetchBlogs = createAsyncThunk(
  'blogs/fetchBlogs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await blogAPI.getBlogs(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch blogs');
    }
  }
);

export const fetchBlogById = createAsyncThunk(
  'blogs/fetchBlogById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await blogAPI.getBlogById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch blog');
    }
  }
);

export const createBlog = createAsyncThunk(
  'blogs/createBlog',
  async (blogData, { rejectWithValue }) => {
    try {
      const response = await blogAPI.createBlog(blogData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create blog');
    }
  }
);

export const updateBlog = createAsyncThunk(
  'blogs/updateBlog',
  async ({ id, blogData }, { rejectWithValue }) => {
    try {
      const response = await blogAPI.updateBlog(id, blogData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update blog');
    }
  }
);

export const deleteBlog = createAsyncThunk(
  'blogs/deleteBlog',
  async (id, { rejectWithValue }) => {
    try {
      await blogAPI.deleteBlog(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete blog');
    }
  }
);

export const fetchFeaturedBlogs = createAsyncThunk(
  'blogs/fetchFeaturedBlogs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await blogAPI.getFeaturedBlogs();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch featured blogs');
    }
  }
);

const initialState = {
  blogs: [],
  currentBlog: null,
  featuredBlogs: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalBlogs: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

const blogSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {
    clearCurrentBlog: (state) => {
      state.currentBlog = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateBlogInList: (state, action) => {
      const index = state.blogs.findIndex(blog => blog._id === action.payload._id);
      if (index !== -1) {
        state.blogs[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Blogs
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = action.payload.blogs;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalBlogs: action.payload.totalBlogs,
          hasNextPage: action.payload.hasNextPage,
          hasPrevPage: action.payload.hasPrevPage,
        };
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Blog by ID
      .addCase(fetchBlogById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBlog = action.payload;
      })
      .addCase(fetchBlogById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Blog
      .addCase(createBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs.unshift(action.payload);
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Blog
      .addCase(updateBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.blogs.findIndex(blog => blog._id === action.payload._id);
        if (index !== -1) {
          state.blogs[index] = action.payload;
        }
        if (state.currentBlog && state.currentBlog._id === action.payload._id) {
          state.currentBlog = action.payload;
        }
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Blog
      .addCase(deleteBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = state.blogs.filter(blog => blog._id !== action.payload);
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Featured Blogs
      .addCase(fetchFeaturedBlogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeaturedBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredBlogs = action.payload;
      })
      .addCase(fetchFeaturedBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentBlog, clearError, updateBlogInList } = blogSlice.actions;
export default blogSlice.reducer;