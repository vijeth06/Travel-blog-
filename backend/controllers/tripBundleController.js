const Package = require('../models/Package');
const User = require('../models/User');

function scorePackageForBundle(pkg, bundleKey, userPreferences = {}) {
  let score = 0;

  const keywords = (pkg.keywords || []).map(k => k.toLowerCase());
  const features = (pkg.features || []).map(f => f.toLowerCase());
  const title = (pkg.title || '').toLowerCase();

  const pushIfIncludes = (arr, words, amount) => {
    if (!arr) return;
    for (const w of words) {
      if (arr.some(x => x.includes(w))) score += amount;
    }
  };

  switch (bundleKey) {
    case 'adventure_week':
      pushIfIncludes(keywords, ['adventure', 'hike', 'trek', 'kayak'], 2);
      pushIfIncludes(features, ['trek', 'rafting', 'hiking'], 2);
      if (title.includes('adventure')) score += 3;
      break;
    case 'romantic_weekend':
      pushIfIncludes(keywords, ['romantic', 'honeymoon', 'couple'], 2);
      if (pkg.type === 'Couple') score += 3;
      break;
    case 'budget_explorer':
      if (pkg.price && pkg.price < 800) score += 3;
      if (pkg.discount && pkg.discount.percentage > 0) score += 2;
      break;
    case 'family_getaway':
      if (pkg.type === 'Family') score += 3;
      pushIfIncludes(features, ['kids', 'family'], 2);
      break;
    default:
      break;
  }

  const prefs = userPreferences.travelPreferences || {};
  if (prefs.travelStyle) {
    const style = prefs.travelStyle.toLowerCase();
    if (bundleKey === 'adventure_week' && style === 'adventure') score += 2;
    if (bundleKey === 'romantic_weekend' && style === 'relaxation') score += 2;
  }

  return score;
}

exports.getSmartBundles = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).lean();

    const packages = await Package.find({ status: 'active', availability: true })
      .limit(60)
      .lean();

    if (!packages.length) {
      return res.json({ success: true, data: [] });
    }

    const bundleDefs = [
      {
        key: 'adventure_week',
        title: 'Adventure Week',
        description: 'High-energy trips packed with hikes, outdoor fun, and activities.',
      },
      {
        key: 'romantic_weekend',
        title: 'Romantic Weekend',
        description: 'Cozy escapes perfect for couples and short getaways.',
      },
      {
        key: 'budget_explorer',
        title: 'Budget Explorer',
        description: 'Smart picks that maximise experience while keeping costs low.',
      },
      {
        key: 'family_getaway',
        title: 'Family Getaway',
        description: 'Family-friendly trips with comfort, safety, and fun for all ages.',
      },
    ];

    const bundles = bundleDefs.map(def => {
      const scored = packages
        .map(pkg => ({
          pkg,
          score: scorePackageForBundle(pkg, def.key, user || {}),
        }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);

      return {
        key: def.key,
        title: def.title,
        description: def.description,
        score: scored[0]?.score || 0,
        packages: scored.map(x => ({
          _id: x.pkg._id,
          title: x.pkg.title,
          description: x.pkg.description,
          price: x.pkg.price,
          currency: x.pkg.currency,
          duration: x.pkg.duration,
          location: x.pkg.location,
          rating: x.pkg.rating,
          featured: x.pkg.featured,
          keywords: x.pkg.keywords,
          images: x.pkg.images,
        })),
      };
    }).filter(b => b.packages.length > 0);

    res.json({ success: true, data: bundles });
  } catch (error) {
    console.error('Trip bundles error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate trip bundles' });
  }
};
