const Comment = require('../models/Comment');
const Blog = require('../models/Blog');
const OnboardingService = require('../services/onboardingService');

// @desc    Create a new comment
// @route   POST /api/comments
// @access  Private
exports.createComment = async (req, res) => {
  try {
    const { blog, content, parentComment } = req.body;

    // Verify blog exists and comments are enabled
    const blogPost = await Blog.findById(blog);
    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    if (!blogPost.commentsEnabled) {
      return res.status(403).json({ message: 'Comments are disabled for this post' });
    }

    // Create comment with moderation
    const comment = new Comment({
      blog,
      user: req.user.id,
      content: content.trim(),
      parentComment: parentComment || null,
      status: req.user.role === 'admin' ? 'approved' : 'pending', // Auto-approve admin comments
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await comment.save();

    // Update parent comment if this is a reply
    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, {
        $push: { replies: comment._id }
      });
    }

    // Update blog comment count
    const approvedCommentsCount = await Comment.countDocuments({
      blog,
      status: 'approved'
    });
    await Blog.findByIdAndUpdate(blog, { commentsCount: approvedCommentsCount });

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name avatar role')
      .populate('parentComment', 'content user');

    // Emit real-time comment update if approved
    if (comment.status === 'approved') {
      const io = req.app.get('io');
      if (io) {
        io.to(`blog-${blog}`).emit('comment-added', {
          blogId: blog,
          comment: populatedComment
        });
      }
      
      // Create notification for blog author
      if (blogPost.author.toString() !== req.user.id.toString()) {
        try {
          const Notification = require('../models/Notification');
          await Notification.create({
            recipient: blogPost.author,
            sender: req.user.id,
            type: parentComment ? 'reply' : 'comment',
            title: parentComment ? 'New Reply' : 'New Comment',
            message: `${req.user.name} ${parentComment ? 'replied to' : 'commented on'} your blog: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
            link: `/blogs/${blog}#comment-${comment._id}`,
            data: {
              blogId: blog,
              commentId: comment._id
            }
          });
          
          // Emit notification via Socket.IO
          if (io) {
            io.to(`user_${blogPost.author}`).emit('notification', {
              type: parentComment ? 'reply' : 'comment',
              message: `${req.user.name} ${parentComment ? 'replied to' : 'commented on'} your blog`
            });
          }
        } catch (error) {
          console.error('Error creating comment notification:', error);
        }
      }
    }

    // Mark onboarding step when user posts first comment (regardless of moderation status)
    try {
      if (req.user && req.user.id) {
        await OnboardingService.markStepCompleted(req.user.id, 'post_first_comment');
      }
    } catch (err) {
      console.error('Onboarding post_first_comment hook error:', err.message);
    }

    res.status(201).json({
      comment: populatedComment,
      message: req.user.role === 'admin'
        ? 'Comment posted successfully'
        : 'Comment submitted for moderation'
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get comments for a blog post
// @route   GET /api/comments/blog/:blogId
// @access  Public
exports.getCommentsByBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    const skip = (page - 1) * limit;

    // Only show approved comments to public
    const filter = {
      blog: blogId,
      status: 'approved',
      parentComment: null // Only top-level comments, replies are populated
    };

    let sortOption = { createdAt: -1 }; // newest first
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'popular') sortOption = { likesCount: -1, createdAt: -1 };

    const comments = await Comment.find(filter)
      .populate('user', 'name avatar role')
      .populate({
        path: 'replies',
        match: { status: 'approved' },
        populate: {
          path: 'user',
          select: 'name avatar role'
        },
        options: { sort: { createdAt: 1 } } // Replies oldest first
      })
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments(filter);

    res.json({
      comments,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalComments: total,
      sort
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment or is admin
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove from parent's replies if it's a reply
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: comment._id }
      });
    }

    // Delete all replies to this comment
    await Comment.deleteMany({ parentComment: comment._id });

    await Comment.findByIdAndDelete(req.params.id);

    // Update blog comment count
    const approvedCommentsCount = await Comment.countDocuments({
      blog: comment.blog,
      status: 'approved'
    });
    await Blog.findByIdAndUpdate(comment.blog, { commentsCount: approvedCommentsCount });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Moderate comment (Admin only)
// @route   PUT /api/comments/:id/moderate
// @access  Private (Admin)
exports.moderateComment = async (req, res) => {
  try {
    const { status, reason } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.status = status;
    comment.moderatedBy = req.user.id;
    comment.moderatedAt = new Date();
    if (reason) comment.moderationReason = reason;

    await comment.save();

    // Update blog comment count
    const approvedCommentsCount = await Comment.countDocuments({
      blog: comment.blog,
      status: 'approved'
    });
    await Blog.findByIdAndUpdate(comment.blog, { commentsCount: approvedCommentsCount });

    res.json({
      message: `Comment ${status} successfully`,
      comment
    });
  } catch (error) {
    console.error('Moderate comment error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Flag comment as spam
// @route   POST /api/comments/:id/flag
// @access  Private
exports.flagComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user already flagged this comment
    if (comment.flaggedBy.includes(req.user.id)) {
      return res.status(400).json({ message: 'You have already flagged this comment' });
    }

    comment.flaggedBy.push(req.user.id);
    comment.flagCount += 1;

    // Auto-moderate if too many flags
    if (comment.flagCount >= 5) {
      comment.status = 'spam';
      comment.moderatedAt = new Date();
      comment.moderationReason = 'Auto-moderated due to multiple flags';
    }

    await comment.save();

    res.json({
      message: 'Comment flagged successfully',
      flagCount: comment.flagCount
    });
  } catch (error) {
    console.error('Flag comment error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get pending comments for moderation (Admin only)
// @route   GET /api/comments/pending
// @access  Private (Admin)
exports.getPendingComments = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ status: 'pending' })
      .populate('user', 'name avatar email')
      .populate('blog', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments({ status: 'pending' });

    res.json({
      comments,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalPending: total
    });
  } catch (error) {
    console.error('Get pending comments error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
