# Demo Data Seeder

This seeder creates comprehensive, realistic demo data for the Travel Blog application.

## What Gets Created

### 👥 Users (11 Total)

#### 10 Regular Users:
1. **Sarah Mitchell** (Author) - Adventure photographer from San Francisco
2. **James Rodriguez** (Author) - Food enthusiast from Barcelona
3. **Priya Sharma** (Author) - Wellness traveler from Mumbai
4. **Marcus Chen** (Author) - Digital nomad from Singapore
5. **Emma Thompson** (Visitor) - Architecture student from London
6. **Ahmed Al-Rashid** (Visitor) - Family traveler from Dubai
7. **Lucia Fernandez** (Visitor) - Wildlife photographer from Buenos Aires
8. **David Kim** (Visitor) - Cultural explorer from Seoul
9. **Olivia Williams** (Visitor) - Surf instructor from Sydney
10. **Mohamed Hassan** (Visitor) - History teacher from Cairo

#### 1 Demo Showcase Account:
- **Alexandra Sterling** (Admin)
- Email: `demo@travelapp.com`
- Password: `Demo@123`
- Complete profile with all features enabled
- Sample data for every module

### 📝 Content Created

- **Blog Posts**: 15+ travel articles with real content
- **Categories**: 8 travel categories
- **Comments**: 25+ realistic comments
- **Likes**: 100+ post likes
- **Follow Relationships**: 20+ connections
- **Bookmarks**: Sample saved posts
- **Notifications**: Recent activity notifications

### 🎯 Showcase Account Features

Alexandra Sterling's account demonstrates:
- ✅ Verified author status
- ✅ Complete profile information
- ✅ Multiple high-quality blog posts
- ✅ Engagement (followers, likes, comments)
- ✅ Bookmarked content
- ✅ Notifications
- ✅ Full travel preferences
- ✅ Social media connections
- ✅ Admin permissions

## How to Use

### 1. Run the Seeder

```bash
cd backend
npm run seed:demo
```

### 2. Login Credentials

**Demo Showcase Account:**
- Email: `demo@travelapp.com`
- Password: `Demo@123`

**All Other Accounts:**
- Use the email from the user list above
- Password: `Demo@123`

Example:
- Email: `sarah.mitchell@example.com`
- Password: `Demo@123`

## Sample Blog Posts

The showcase account includes 5 featured posts:

1. **The Ultimate Guide to Sustainable Travel in 2025**
   - 15,420 views, 892 likes
   - Tags: sustainable travel, eco-tourism

2. **Hidden Gems of Kyoto: Beyond the Tourist Trail**
   - 12,340 views, 756 likes
   - Location: Kyoto, Japan

3. **Luxury Safari Experience in Tanzania**
   - 9,870 views, 623 likes
   - Location: Serengeti, Tanzania

4. **Digital Nomad Guide: Working from Lisbon**
   - 18,920 views, 1,045 likes
   - Location: Lisbon, Portugal

5. **Antarctica Expedition: Journey to the White Continent**
   - 21,450 views, 1,523 likes
   - Location: Antarctic Peninsula

## Data Characteristics

### Realistic Details
- ✅ Varied user profiles with different nationalities
- ✅ Authentic travel preferences and styles
- ✅ Professional bios and social media links
- ✅ Realistic engagement metrics
- ✅ Timestamps spread over 6 months
- ✅ Geographic diversity

### User Roles
- **Authors**: Can create blog posts
- **Visitors**: Can read, comment, like
- **Admin**: Full platform access

## Clearing Demo Data

To remove all demo data:

```javascript
// In MongoDB shell or script
db.users.deleteMany({ email: { $regex: '@example.com|demo@travelapp.com' }})
```

Or use the seeder again - it automatically clears previous demo data before seeding.

## Customization

Edit `seeds/demoData.js` to:
- Add more users
- Create different blog posts
- Modify user profiles
- Adjust engagement metrics
- Change password (default: `Demo@123`)

## Testing Scenarios

With this demo data, you can test:

1. **User Profiles**: View different user types and roles
2. **Blog Posts**: Browse, search, filter content
3. **Social Features**: Follow/unfollow, like, comment
4. **Search**: Find posts by location, tags, author
5. **Admin Features**: Full platform management
6. **Notifications**: Activity tracking
7. **Bookmarks**: Save favorite posts
8. **User Stats**: Engagement metrics

## Notes

- All user passwords are set to `Demo@123` for easy testing
- Showcase account has admin privileges
- Data includes realistic timestamps (last 6 months)
- Photos use placeholder URLs (randomuser.me, unsplash.com)
- Geographic data includes coordinates for mapping features

## Support

If you encounter any issues:
1. Check MongoDB connection
2. Ensure all required models exist
3. Review console output for specific errors
4. Verify environment variables are set

Happy testing! 🚀
