const fs = require('fs').promises;
const path = require('path');

class UploadOrganizer {
  constructor() {
    this.baseUploadPath = path.join(__dirname, '../uploads');
  }

  // Create country-specific directories
  async createCountryDirectories(countryCode, countryName) {
    try {
      const countryPath = path.join(this.baseUploadPath, 'countries', countryCode.toLowerCase());
      
      // Create main country directory
      await this.ensureDirectoryExists(countryPath);
      
      // Create subdirectories
      const subdirs = ['blogs', 'packages', 'avatars', 'flags', 'destinations'];
      
      for (const subdir of subdirs) {
        await this.ensureDirectoryExists(path.join(countryPath, subdir));
      }
      
      console.log(`Created directory structure for ${countryName} (${countryCode})`);
      return countryPath;
    } catch (error) {
      console.error('Error creating country directories:', error);
      throw error;
    }
  }

  // Organize blog images by country
  async organizeBlogImage(imagePath, countryCode, blogId) {
    try {
      if (!countryCode) return imagePath;
      
      const countryDir = path.join(this.baseUploadPath, 'countries', countryCode.toLowerCase(), 'blogs');
      await this.ensureDirectoryExists(countryDir);
      
      const fileName = path.basename(imagePath);
      const newPath = path.join(countryDir, `${blogId}_${fileName}`);
      
      // Move file if it exists and is different
      if (imagePath !== newPath) {
        try {
          await fs.rename(imagePath, newPath);
          return newPath;
        } catch (error) {
          // If rename fails, copy and delete original
          await fs.copyFile(imagePath, newPath);
          await fs.unlink(imagePath);
          return newPath;
        }
      }
      
      return imagePath;
    } catch (error) {
      console.error('Error organizing blog image:', error);
      return imagePath; // Return original path if organization fails
    }
  }

  // Organize package images by country
  async organizePackageImage(imagePath, countryCode, packageId) {
    try {
      if (!countryCode) return imagePath;
      
      const countryDir = path.join(this.baseUploadPath, 'countries', countryCode.toLowerCase(), 'packages');
      await this.ensureDirectoryExists(countryDir);
      
      const fileName = path.basename(imagePath);
      const newPath = path.join(countryDir, `${packageId}_${fileName}`);
      
      if (imagePath !== newPath) {
        try {
          await fs.rename(imagePath, newPath);
          return newPath;
        } catch (error) {
          await fs.copyFile(imagePath, newPath);
          await fs.unlink(imagePath);
          return newPath;
        }
      }
      
      return imagePath;
    } catch (error) {
      console.error('Error organizing package image:', error);
      return imagePath;
    }
  }

  // Store country flag
  async storeCountryFlag(flagUrl, countryCode) {
    try {
      const countryDir = path.join(this.baseUploadPath, 'countries', countryCode.toLowerCase(), 'flags');
      await this.ensureDirectoryExists(countryDir);
      
      const flagPath = path.join(countryDir, `flag.png`);
      
      // If it's a URL, download it
      if (flagUrl.startsWith('http')) {
        // In a real implementation, you would download the flag
        // For now, just return the URL
        return flagUrl;
      }
      
      return flagPath;
    } catch (error) {
      console.error('Error storing country flag:', error);
      return flagUrl;
    }
  }

  // Get country upload statistics
  async getCountryUploadStats(countryCode) {
    try {
      const countryPath = path.join(this.baseUploadPath, 'countries', countryCode.toLowerCase());
      
      const stats = {
        blogs: 0,
        packages: 0,
        avatars: 0,
        flags: 0,
        destinations: 0,
        totalSize: 0
      };
      
      for (const [key] of Object.entries(stats)) {
        if (key === 'totalSize') continue;
        
        const dirPath = path.join(countryPath, key);
        try {
          const files = await fs.readdir(dirPath);
          stats[key] = files.length;
          
          // Calculate total size
          for (const file of files) {
            const filePath = path.join(dirPath, file);
            const fileStat = await fs.stat(filePath);
            stats.totalSize += fileStat.size;
          }
        } catch (error) {
          // Directory doesn't exist or is empty
          stats[key] = 0;
        }
      }
      
      return stats;
    } catch (error) {
      console.error('Error getting country upload stats:', error);
      return null;
    }
  }

  // Clean up empty directories
  async cleanupEmptyDirectories() {
    try {
      const countriesPath = path.join(this.baseUploadPath, 'countries');
      
      try {
        const countries = await fs.readdir(countriesPath);
        
        for (const country of countries) {
          const countryPath = path.join(countriesPath, country);
          const stat = await fs.stat(countryPath);
          
          if (stat.isDirectory()) {
            await this.cleanupEmptyCountryDirectory(countryPath);
          }
        }
      } catch (error) {
        // Countries directory doesn't exist
        console.log('Countries directory does not exist');
      }
    } catch (error) {
      console.error('Error cleaning up directories:', error);
    }
  }

  // Helper method to ensure directory exists
  async ensureDirectoryExists(dirPath) {
    try {
      await fs.access(dirPath);
    } catch (error) {
      // Directory doesn't exist, create it
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  // Helper method to clean up empty country directory
  async cleanupEmptyCountryDirectory(countryPath) {
    try {
      const subdirs = await fs.readdir(countryPath);
      
      for (const subdir of subdirs) {
        const subdirPath = path.join(countryPath, subdir);
        const stat = await fs.stat(subdirPath);
        
        if (stat.isDirectory()) {
          const files = await fs.readdir(subdirPath);
          if (files.length === 0) {
            await fs.rmdir(subdirPath);
            console.log(`Removed empty directory: ${subdirPath}`);
          }
        }
      }
      
      // Check if country directory is now empty
      const remainingItems = await fs.readdir(countryPath);
      if (remainingItems.length === 0) {
        await fs.rmdir(countryPath);
        console.log(`Removed empty country directory: ${countryPath}`);
      }
    } catch (error) {
      console.error('Error cleaning up country directory:', error);
    }
  }

  // Initialize country directories for all countries
  async initializeAllCountryDirectories(countries) {
    try {
      console.log('Initializing country directories...');
      
      for (const country of countries) {
        await this.createCountryDirectories(country.code, country.name);
      }
      
      console.log(`Initialized directories for ${countries.length} countries`);
    } catch (error) {
      console.error('Error initializing country directories:', error);
    }
  }

  // Get upload path for a specific country and type
  getCountryUploadPath(countryCode, type = 'general') {
    return path.join(this.baseUploadPath, 'countries', countryCode.toLowerCase(), type);
  }

  // Get relative URL for uploaded files
  getRelativeUploadUrl(fullPath) {
    const uploadsIndex = fullPath.indexOf('uploads');
    if (uploadsIndex !== -1) {
      return '/' + fullPath.substring(uploadsIndex).replace(/\\/g, '/');
    }
    return fullPath;
  }
}

module.exports = new UploadOrganizer();