const RealMobileOptimizationService = require('../services/realMobileOptimizationService');
const MobileOptimization = require('../models/MobileOptimization');
const User = require('../models/User');

class RealMobileOptimizationController {

  /**
   * @route   POST /api/mobile/optimize/init
   * @desc    Initialize mobile optimization for user
   * @access  Private
   */
  async initializeOptimization(req, res) {
    try {
      const deviceInfo = req.body;
      
      const optimization = await RealMobileOptimizationService.initializeUserOptimization(
        req.user._id,
        deviceInfo
      );
      
      res.status(201).json({
        success: true,
        message: 'Mobile optimization initialized successfully',
        data: {
          optimizationId: optimization._id,
          performanceScore: optimization.performanceScore,
          optimizationStatus: optimization.optimizationStatus,
          recommendations: optimization.getRecommendations().slice(0, 3) // Top 3 recommendations
        }
      });
      
    } catch (error) {
      console.error('❌ MOBILE: Initialize optimization failed:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to initialize optimization',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }

  /**
   * @route   GET /api/mobile/optimize/status
   * @desc    Get current optimization status
   * @access  Private
   */
  async getOptimizationStatus(req, res) {
    try {
      const optimization = await MobileOptimization.findOne({ user: req.user._id });
      
      if (!optimization) {
        return res.status(404).json({
          success: false,
          message: 'Optimization profile not found'
        });
      }
      
      const status = {
        optimizationId: optimization._id,
        performanceScore: optimization.performanceScore,
        optimizationStatus: optimization.optimizationStatus,
        lastOptimizationCheck: optimization.lastOptimizationCheck,
        deviceInfo: optimization.deviceInfo,
        isOptimizationNeeded: optimization.needsOptimization(),
        
        // Current settings summary
        currentSettings: {
          imageCompression: optimization.performanceSettings.imageOptimization.compressionLevel,
          contentCaching: optimization.performanceSettings.contentOptimization.enableContentCaching,
          batteryOptimization: optimization.performanceSettings.batteryOptimization.enableBatterySaver,
          offlineMode: optimization.mobileFeatures.offlineCapabilities.enableOfflineReading,
          darkMode: optimization.uxSettings.displayOptimization.enableDarkMode,
          fontSize: optimization.uxSettings.displayOptimization.fontSizeMultiplier
        },
        
        // Quick metrics
        quickMetrics: {
          loadTime: optimization.performanceMetrics.pageLoadMetrics?.firstContentfulPaint || 0,
          batteryUsage: optimization.performanceMetrics.resourceMetrics?.batteryUsage || 0,
          memoryUsage: optimization.performanceMetrics.resourceMetrics?.memoryUsage || 0,
          bounceRate: optimization.performanceMetrics.interactionMetrics?.bounceRate || 0
        },
        
        // Recent optimizations
        recentOptimizations: optimization.optimizationHistory.slice(-3)
      };
      
      res.json({
        success: true,
        message: 'Optimization status retrieved successfully',
        data: status
      });
      
    } catch (error) {
      console.error('❌ MOBILE: Get optimization status failed:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve optimization status',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * @route   PUT /api/mobile/optimize/device
   * @desc    Update device information
   * @access  Private
   */
  async updateDeviceInfo(req, res) {
    try {
      const deviceInfo = req.body;
      
      const result = await RealMobileOptimizationService.updateDeviceInfo(
        req.user._id,
        deviceInfo
      );
      
      res.json({
        success: true,
        message: 'Device information updated successfully',
        data: {
          reOptimized: result.reOptimized,
          performanceScore: result.optimization.performanceScore,
          optimizationStatus: result.optimization.optimizationStatus,
          updatedSettings: {
            imageCompression: result.optimization.performanceSettings.imageOptimization.compressionLevel,
            contentCaching: result.optimization.performanceSettings.contentOptimization.enableContentCaching,
            batteryOptimization: result.optimization.performanceSettings.batteryOptimization.enableBatterySaver
          }
        }
      });
      
    } catch (error) {
      console.error('❌ MOBILE: Update device info failed:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update device information',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }

  /**
   * @route   POST /api/mobile/optimize/metrics
   * @desc    Record performance metrics
   * @access  Private
   */
  async recordMetrics(req, res) {
    try {
      const metrics = req.body;
      
      // Validate metrics structure
      if (!metrics || typeof metrics !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Valid metrics object is required'
        });
      }
      
      const result = await RealMobileOptimizationService.recordPerformanceMetrics(
        req.user._id,
        metrics
      );
      
      res.json({
        success: true,
        message: 'Performance metrics recorded successfully',
        data: {
          performanceScore: result.performanceScore,
          recommendations: result.recommendations.slice(0, 5) // Top 5 recommendations
        }
      });
      
    } catch (error) {
      console.error('❌ MOBILE: Record metrics failed:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to record metrics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }

  /**
   * @route   POST /api/mobile/optimize/content
   * @desc    Get optimized content for mobile device
   * @access  Private
   */
  async getOptimizedContent(req, res) {
    try {
      const { contentType, content } = req.body;
      
      if (!contentType || !content) {
        return res.status(400).json({
          success: false,
          message: 'Content type and content are required'
        });
      }
      
      const optimizedContent = await RealMobileOptimizationService.getOptimizedContent(
        req.user._id,
        contentType,
        content
      );
      
      res.json({
        success: true,
        message: 'Content optimized successfully',
        data: {
          originalContent: content,
          optimizedContent,
          contentType,
          optimizationsApplied: this.getOptimizationsApplied(content, optimizedContent)
        }
      });
      
    } catch (error) {
      console.error('❌ MOBILE: Optimize content failed:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to optimize content',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }

  /**
   * @route   GET /api/mobile/optimize/analytics
   * @desc    Get performance analytics
   * @access  Private
   */
  async getAnalytics(req, res) {
    try {
      const { period = '30d' } = req.query;
      
      const result = await RealMobileOptimizationService.getPerformanceAnalytics(
        req.user._id,
        period
      );
      
      res.json({
        success: true,
        message: 'Performance analytics retrieved successfully',
        data: result.analytics
      });
      
    } catch (error) {
      console.error('❌ MOBILE: Get analytics failed:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to retrieve analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }

  /**
   * @route   PUT /api/mobile/optimize/settings
   * @desc    Update optimization settings
   * @access  Private
   */
  async updateSettings(req, res) {
    try {
      const settings = req.body;
      
      const result = await RealMobileOptimizationService.applyOptimizationSettings(
        req.user._id,
        settings
      );
      
      res.json({
        success: true,
        message: result.message,
        data: {
          performanceScore: result.optimization.performanceScore,
          optimizationStatus: result.optimization.optimizationStatus,
          appliedSettings: settings,
          lastOptimizationCheck: result.optimization.lastOptimizationCheck
        }
      });
      
    } catch (error) {
      console.error('❌ MOBILE: Update settings failed:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update settings',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }

  /**
   * @route   GET /api/mobile/optimize/recommendations
   * @desc    Get optimization recommendations
   * @access  Private
   */
  async getRecommendations(req, res) {
    try {
      const result = await RealMobileOptimizationService.getOptimizationRecommendations(
        req.user._id
      );
      
      res.json({
        success: true,
        message: 'Optimization recommendations retrieved successfully',
        data: {
          recommendations: result.recommendations,
          performanceScore: result.performanceScore,
          optimizationStatus: result.optimizationStatus,
          totalRecommendations: result.recommendations.length,
          highPriorityCount: result.recommendations.filter(r => r.priority === 'high').length
        }
      });
      
    } catch (error) {
      console.error('❌ MOBILE: Get recommendations failed:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get recommendations',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }

  /**
   * @route   POST /api/mobile/optimize/auto
   * @desc    Apply automatic optimizations
   * @access  Private
   */
  async applyAutoOptimizations(req, res) {
    try {
      const optimization = await MobileOptimization.findOne({ user: req.user._id });
      
      if (!optimization) {
        return res.status(404).json({
          success: false,
          message: 'Optimization profile not found'
        });
      }
      
      const autoOptimizations = optimization.applyAutoOptimizations();
      
      optimization.optimizationHistory.push({
        action: 'Automatic Optimization',
        reason: 'User-requested automatic optimization',
        settings: { autoOptimizations },
        date: new Date()
      });
      
      optimization.lastOptimizationCheck = new Date();
      await optimization.save();
      
      res.json({
        success: true,
        message: 'Automatic optimizations applied successfully',
        data: {
          appliedOptimizations: autoOptimizations,
          performanceScore: optimization.performanceScore,
          optimizationStatus: optimization.optimizationStatus,
          newRecommendations: optimization.getRecommendations().slice(0, 3)
        }
      });
      
    } catch (error) {
      console.error('❌ MOBILE: Auto optimization failed:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to apply auto optimizations',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }

  /**
   * @route   GET /api/mobile/optimize/presets
   * @desc    Get optimization presets for different scenarios
   * @access  Private
   */
  async getOptimizationPresets(req, res) {
    try {
      const presets = {
        battery_saver: {
          name: 'Battery Saver',
          description: 'Optimize for maximum battery life',
          settings: {
            performanceSettings: {
              imageOptimization: {
                compressionLevel: 'high',
                enableLazyLoading: true,
                enableWebP: true
              },
              batteryOptimization: {
                enableBatterySaver: true,
                reducedAnimations: true,
                reducedBackgroundActivity: true
              },
              contentOptimization: {
                enableMinification: true,
                enableGzipCompression: true
              }
            },
            uxSettings: {
              displayOptimization: {
                enableDarkMode: true
              },
              notificationSettings: {
                notificationFrequency: 'daily'
              }
            }
          },
          expectedImpact: {
            batteryLife: '+40%',
            loadTime: '+10%',
            dataUsage: '-30%'
          }
        },
        
        speed_boost: {
          name: 'Speed Boost',
          description: 'Optimize for fastest loading times',
          settings: {
            performanceSettings: {
              imageOptimization: {
                compressionLevel: 'max',
                enableLazyLoading: true,
                enableAdaptiveImages: true
              },
              contentOptimization: {
                enableMinification: true,
                enableGzipCompression: true,
                enableBrotliCompression: true,
                enableContentCaching: true
              },
              loadingOptimization: {
                enableProgressiveLoading: true,
                enablePreloading: true,
                enableCodeSplitting: true
              }
            }
          },
          expectedImpact: {
            loadTime: '-50%',
            dataUsage: '-25%',
            batteryLife: '-5%'
          }
        },
        
        data_saver: {
          name: 'Data Saver',
          description: 'Minimize data usage',
          settings: {
            performanceSettings: {
              imageOptimization: {
                compressionLevel: 'max',
                maxImageWidth: 600,
                maxImageHeight: 400
              }
            },
            adaptiveBehavior: {
              bandwidthManagement: {
                enableDataSaver: true,
                prioritizeContent: 'text_first'
              }
            },
            mobileFeatures: {
              offlineCapabilities: {
                enableOfflineReading: true,
                offlineStorageLimit: 50
              }
            }
          },
          expectedImpact: {
            dataUsage: '-60%',
            loadTime: '+15%',
            batteryLife: '+20%'
          }
        },
        
        balanced: {
          name: 'Balanced',
          description: 'Optimal balance of performance, battery, and data usage',
          settings: {
            performanceSettings: {
              imageOptimization: {
                compressionLevel: 'medium',
                enableLazyLoading: true,
                enableWebP: true
              },
              contentOptimization: {
                enableMinification: true,
                enableContentCaching: true
              },
              batteryOptimization: {
                enableBatterySaver: false,
                optimizedPolling: true
              }
            }
          },
          expectedImpact: {
            loadTime: '-20%',
            dataUsage: '-20%',
            batteryLife: '+15%'
          }
        },
        
        accessibility: {
          name: 'Accessibility',
          description: 'Optimize for accessibility and readability',
          settings: {
            uxSettings: {
              displayOptimization: {
                fontSizeMultiplier: 1.2,
                lineHeightMultiplier: 1.3,
                enableHighContrast: true
              },
              touchOptimization: {
                touchTargetSize: 48,
                gestureThreshold: 15
              },
              navigationOptimization: {
                enableBreadcrumbs: true,
                showBackButton: true
              }
            }
          },
          expectedImpact: {
            readability: '+40%',
            navigation: '+30%',
            touchAccuracy: '+25%'
          }
        }
      };
      
      res.json({
        success: true,
        message: 'Optimization presets retrieved successfully',
        data: {
          presets,
          totalPresets: Object.keys(presets).length,
          description: 'Choose a preset that matches your priorities, or use custom settings for fine-tuned control'
        }
      });
      
    } catch (error) {
      console.error('❌ MOBILE: Get presets failed:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve optimization presets',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * @route   POST /api/mobile/optimize/preset/:presetName
   * @desc    Apply optimization preset
   * @access  Private
   */
  async applyPreset(req, res) {
    try {
      const { presetName } = req.params;
      
      // Get preset settings (this would normally come from the presets above)
      const presetResponse = await this.getOptimizationPresets({ user: req.user }, { json: (data) => data });
      const preset = presetResponse.data.presets[presetName];
      
      if (!preset) {
        return res.status(404).json({
          success: false,
          message: 'Optimization preset not found'
        });
      }
      
      const result = await RealMobileOptimizationService.applyOptimizationSettings(
        req.user._id,
        preset.settings
      );
      
      res.json({
        success: true,
        message: `${preset.name} preset applied successfully`,
        data: {
          presetName: preset.name,
          presetDescription: preset.description,
          expectedImpact: preset.expectedImpact,
          performanceScore: result.optimization.performanceScore,
          optimizationStatus: result.optimization.optimizationStatus
        }
      });
      
    } catch (error) {
      console.error('❌ MOBILE: Apply preset failed:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to apply preset',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }

  /**
   * @route   POST /api/mobile/optimize/feedback
   * @desc    Submit user feedback on optimization
   * @access  Private
   */
  async submitFeedback(req, res) {
    try {
      const { 
        performanceRating, 
        usabilityRating, 
        batteryRating, 
        comments 
      } = req.body;
      
      const optimization = await MobileOptimization.findOne({ user: req.user._id });
      
      if (!optimization) {
        return res.status(404).json({
          success: false,
          message: 'Optimization profile not found'
        });
      }
      
      // Update feedback
      optimization.feedback = {
        performanceRating: performanceRating || optimization.feedback.performanceRating,
        usabilityRating: usabilityRating || optimization.feedback.usabilityRating,
        batteryRating: batteryRating || optimization.feedback.batteryRating,
        lastFeedbackDate: new Date(),
        comments: comments ? [...(optimization.feedback.comments || []), comments] : optimization.feedback.comments
      };
      
      await optimization.save();
      
      res.json({
        success: true,
        message: 'Feedback submitted successfully',
        data: {
          averageRating: ((performanceRating || 0) + (usabilityRating || 0) + (batteryRating || 0)) / 3,
          submittedAt: new Date(),
          totalFeedbacks: optimization.feedback.comments?.length || 0
        }
      });
      
    } catch (error) {
      console.error('❌ MOBILE: Submit feedback failed:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to submit feedback',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }

  /**
   * @route   GET /api/mobile/optimize/compare
   * @desc    Compare optimization settings and their impact
   * @access  Private
   */
  async compareOptimizations(req, res) {
    try {
      const optimization = await MobileOptimization.findOne({ user: req.user._id });
      
      if (!optimization) {
        return res.status(404).json({
          success: false,
          message: 'Optimization profile not found'
        });
      }
      
      // Get recent optimization history for comparison
      const recentHistory = optimization.optimizationHistory.slice(-5);
      
      const comparison = {
        currentScore: optimization.performanceScore,
        currentStatus: optimization.optimizationStatus,
        
        history: recentHistory.map(h => ({
          date: h.date,
          action: h.action,
          reason: h.reason,
          beforeScore: h.performanceImpact?.before ? this.calculateScoreFromMetrics(h.performanceImpact.before) : null,
          afterScore: h.performanceImpact?.after ? this.calculateScoreFromMetrics(h.performanceImpact.after) : null,
          improvement: h.performanceImpact ? 
            this.calculateScoreFromMetrics(h.performanceImpact.after) - this.calculateScoreFromMetrics(h.performanceImpact.before) : null
        })),
        
        trends: {
          performanceTrend: this.calculatePerformanceTrend(recentHistory),
          batteryTrend: this.calculateBatteryTrend(recentHistory),
          loadTimeTrend: this.calculateLoadTimeTrend(recentHistory)
        },
        
        recommendations: optimization.getRecommendations().slice(0, 3)
      };
      
      res.json({
        success: true,
        message: 'Optimization comparison retrieved successfully',
        data: comparison
      });
      
    } catch (error) {
      console.error('❌ MOBILE: Compare optimizations failed:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to compare optimizations',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Get optimizations applied to content
   */
  getOptimizationsApplied(original, optimized) {
    const optimizations = [];
    
    if (optimized.quality !== original.quality) {
      optimizations.push(`Image quality adjusted to ${optimized.quality}%`);
    }
    
    if (optimized.lazyLoad && !original.lazyLoad) {
      optimizations.push('Lazy loading enabled');
    }
    
    if (optimized.minified && !original.minified) {
      optimizations.push('Content minification applied');
    }
    
    if (optimized.cacheable && !original.cacheable) {
      optimizations.push('Content caching enabled');
    }
    
    return optimizations;
  }

  /**
   * Calculate score from performance metrics
   */
  calculateScoreFromMetrics(metrics) {
    let score = 100;
    
    if (metrics.loadTime > 3000) score -= 20;
    if (metrics.batteryUsage > 10) score -= 15;
    if (metrics.memoryUsage > 100) score -= 15;
    
    return Math.max(0, score);
  }

  /**
   * Calculate performance trends
   */
  calculatePerformanceTrend(history) {
    if (history.length < 2) return 'stable';
    
    const scores = history.map(h => h.performanceImpact?.after ? 
      this.calculateScoreFromMetrics(h.performanceImpact.after) : 0
    );
    
    const avgRecentScore = scores.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const avgOldScore = scores.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
    
    if (avgRecentScore > avgOldScore + 5) return 'improving';
    if (avgRecentScore < avgOldScore - 5) return 'degrading';
    return 'stable';
  }

  calculateBatteryTrend(history) {
    if (history.length < 2) return 'stable';
    
    const batteryUsages = history.map(h => h.performanceImpact?.after?.batteryUsage || 0);
    const recent = batteryUsages.slice(-2).reduce((a, b) => a + b, 0) / 2;
    const old = batteryUsages.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
    
    if (recent < old - 2) return 'improving';
    if (recent > old + 2) return 'degrading';
    return 'stable';
  }

  calculateLoadTimeTrend(history) {
    if (history.length < 2) return 'stable';
    
    const loadTimes = history.map(h => h.performanceImpact?.after?.loadTime || 0);
    const recent = loadTimes.slice(-2).reduce((a, b) => a + b, 0) / 2;
    const old = loadTimes.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
    
    if (recent < old - 500) return 'improving';
    if (recent > old + 500) return 'degrading';
    return 'stable';
  }
}

module.exports = new RealMobileOptimizationController();