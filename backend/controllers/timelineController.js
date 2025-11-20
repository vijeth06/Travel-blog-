const Blog = require('../models/Blog');
const FavoritePlace = require('../models/FavoritePlace');
const Booking = require('../models/Booking');
const Comment = require('../models/Comment');

// Build a normalized timeline item
function makeItem({ type, title, description, date, icon, link, meta = {} }) {
  return { type, title, description, date, icon, link, meta };
}

// GET /api/timeline
// Returns recent travel-related activities for the authenticated user
exports.getUserTimeline = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit, 10) || 20;

    const [blogs, places, bookings, comments] = await Promise.all([
      Blog.find({ author: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      FavoritePlace.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Booking.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Comment.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('blog', 'title slug')
        .lean(),
    ]);

    const items = [];

    blogs.forEach((blog) => {
      items.push(
        makeItem({
          type: 'blog',
          title: blog.title || 'New travel story',
          description: blog.excerpt || (blog.content || '').slice(0, 120),
          date: blog.createdAt,
          icon: 'FlightTakeoff',
          link: blog.slug ? `/blogs/${blog.slug}` : `/blogs/${blog._id}`,
          meta: { views: blog.views || 0, likes: blog.likesCount || 0 },
        })
      );
    });

    places.forEach((place) => {
      items.push(
        makeItem({
          type: 'favorite_place',
          title: place.placeName || place.city || 'Saved a place',
          description: place.description || `${place.city || ''} ${place.country || ''}`.trim(),
          date: place.createdAt,
          icon: 'Place',
          link: place.slug ? `/favorite-places/${place.slug}` : '/favorite-places',
          meta: { continent: place.continent, country: place.country },
        })
      );
    });

    bookings.forEach((booking) => {
      items.push(
        makeItem({
          type: 'booking',
          title: booking.packageName || 'Trip booked',
          description: booking.status ? `Status: ${booking.status}` : 'New booking created',
          date: booking.createdAt,
          icon: 'CardTravel',
          link: '/bookings',
          meta: { startDate: booking.startDate, endDate: booking.endDate },
        })
      );
    });

    comments.forEach((comment) => {
      items.push(
        makeItem({
          type: 'comment',
          title: comment.blog?.title || 'Commented on a story',
          description: comment.content?.slice(0, 120),
          date: comment.createdAt,
          icon: 'Comment',
          link: comment.blog?.slug ? `/blogs/${comment.blog.slug}` : `/blogs/${comment.blog?._id}`,
          meta: { blogId: comment.blog?._id },
        })
      );
    });

    const sorted = items
      .filter((item) => item.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);

    res.json({ success: true, data: sorted });
  } catch (error) {
    console.error('Timeline error:', error);
    res.status(500).json({ success: false, message: 'Failed to load timeline' });
  }
};
