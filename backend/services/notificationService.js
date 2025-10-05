const { createNotification } = require('../controllers/notificationController');

class NotificationService {
  // Create notification for new comment
  async createCommentNotification(comment, blogAuthor, commenter) {
    if (blogAuthor._id.toString() === commenter._id.toString()) {
      return; // Don't notify if user comments on their own blog
    }

    const notificationData = {
      recipient: blogAuthor._id,
      sender: commenter._id,
      type: 'comment',
      title: 'New Comment',
      message: `${commenter.name} commented on your blog post`,
      link: `/blogs/${comment.blog}`,
      data: {
        blogId: comment.blog,
        commentId: comment._id
      }
    };

    return await createNotification(notificationData);
  }

  // Create notification for new like
  async createLikeNotification(blog, liker) {
    if (blog.author._id.toString() === liker._id.toString()) {
      return; // Don't notify if user likes their own blog
    }

    const notificationData = {
      recipient: blog.author._id,
      sender: liker._id,
      type: 'like',
      title: 'New Like',
      message: `${liker.name} liked your blog post`,
      link: `/blogs/${blog._id}`,
      data: {
        blogId: blog._id
      }
    };

    return await createNotification(notificationData);
  }

  // Create notification for new follower
  async createFollowNotification(followedUser, follower) {
    const notificationData = {
      recipient: followedUser._id,
      sender: follower._id,
      type: 'follow',
      title: 'New Follower',
      message: `${follower.name} started following you`,
      link: `/profile/${follower._id}`,
      data: {
        followerId: follower._id
      }
    };

    return await createNotification(notificationData);
  }

  // Create notification for booking status change
  async createBookingNotification(booking, status) {
    const statusMessages = {
      confirmed: 'Your booking has been confirmed',
      cancelled: 'Your booking has been cancelled',
      completed: 'Your booking has been completed'
    };

    const notificationData = {
      recipient: booking.user,
      type: 'booking',
      title: 'Booking Update',
      message: statusMessages[status] || 'Your booking status has been updated',
      link: `/bookings/${booking._id}`,
      data: {
        bookingId: booking._id,
        status: status
      }
    };

    return await createNotification(notificationData);
  }

  // Create system notification
  async createSystemNotification(userId, title, message, link = null) {
    const notificationData = {
      recipient: userId,
      type: 'system',
      title: title,
      message: message,
      link: link
    };

    return await createNotification(notificationData);
  }
}

module.exports = new NotificationService();