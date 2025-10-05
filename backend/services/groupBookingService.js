const GroupBooking = require('../models/GroupBooking');
const Package = require('../models/Package');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

class GroupBookingService {
  async createGroupBooking(organizerId, groupBookingData) {
    try {
      const organizer = await User.findById(organizerId);
      const package = await Package.findById(groupBookingData.packageId);
      
      if (!package) {
        throw new Error('Package not found');
      }

      // Calculate group pricing
      const pricing = this.calculateGroupPricing(package, groupBookingData);
      
      const groupBooking = new GroupBooking({
        organizer: organizerId,
        title: groupBookingData.title || `${package.title} - Group Trip`,
        description: groupBookingData.description,
        package: groupBookingData.packageId,
        groupDetails: {
          maxParticipants: groupBookingData.maxParticipants,
          minParticipants: groupBookingData.minParticipants || 2,
          registrationDeadline: new Date(groupBookingData.registrationDeadline),
          depositRequired: groupBookingData.depositRequired !== false,
          depositPercentage: groupBookingData.depositPercentage || 20
        },
        pricing,
        policies: groupBookingData.policies || {},
        sharing: {
          isPublic: groupBookingData.isPublic || false,
          socialMediaSharing: groupBookingData.socialMediaSharing !== false
        }
      });

      // Set deposit amount
      if (groupBooking.groupDetails.depositRequired) {
        groupBooking.groupDetails.depositAmount = 
          pricing.finalPricePerPerson * (groupBooking.groupDetails.depositPercentage / 100);
      }

      await groupBooking.save();
      return await GroupBooking.findById(groupBooking._id)
        .populate('organizer', 'name email avatar')
        .populate('package');

    } catch (error) {
      console.error('Create group booking error:', error);
      throw new Error('Failed to create group booking');
    }
  }

  calculateGroupPricing(package, groupBookingData) {
    const basePrice = package.price;
    let groupDiscount = 0;

    // Apply group discounts based on group size
    const maxParticipants = groupBookingData.maxParticipants;
    if (maxParticipants >= 10) {
      groupDiscount = 15; // 15% discount for 10+ people
    } else if (maxParticipants >= 6) {
      groupDiscount = 10; // 10% discount for 6+ people
    } else if (maxParticipants >= 4) {
      groupDiscount = 5; // 5% discount for 4+ people
    }

    const discountAmount = basePrice * (groupDiscount / 100);
    const finalPricePerPerson = basePrice - discountAmount;

    return {
      originalPrice: basePrice,
      groupDiscount: {
        percentage: groupDiscount,
        amount: discountAmount
      },
      finalPricePerPerson,
      currency: package.currency?.code || 'USD'
    };
  }

  async joinGroupBooking(groupBookingId, userId, participantData) {
    try {
      const groupBooking = await GroupBooking.findById(groupBookingId)
        .populate('organizer', 'name email')
        .populate('package');

      if (!groupBooking) {
        throw new Error('Group booking not found');
      }

      // Check if group is still accepting participants
      if (groupBooking.status === 'full') {
        throw new Error('Group booking is full');
      }

      if (groupBooking.status === 'cancelled') {
        throw new Error('Group booking has been cancelled');
      }

      if (new Date() > groupBooking.groupDetails.registrationDeadline) {
        throw new Error('Registration deadline has passed');
      }

      // Check if user already joined
      const existingParticipant = groupBooking.participants.find(
        p => p.user.toString() === userId
      );

      if (existingParticipant) {
        throw new Error('User already joined this group booking');
      }

      // Add participant
      groupBooking.participants.push({
        user: userId,
        status: 'pending',
        emergencyContact: participantData.emergencyContact,
        specialRequests: participantData.specialRequests,
        dietaryRestrictions: participantData.dietaryRestrictions,
        medicalConditions: participantData.medicalConditions
      });

      await groupBooking.save();

      // Send notification to organizer
      await this.sendJoinNotification(groupBooking, userId);

      return await GroupBooking.findById(groupBookingId)
        .populate('participants.user', 'name email avatar')
        .populate('organizer', 'name email avatar')
        .populate('package');

    } catch (error) {
      console.error('Join group booking error:', error);
      throw new Error(error.message || 'Failed to join group booking');
    }
  }

  async updateParticipantStatus(groupBookingId, participantId, status, organizerId) {
    try {
      const groupBooking = await GroupBooking.findById(groupBookingId);

      if (!groupBooking) {
        throw new Error('Group booking not found');
      }

      // Check if user is organizer
      if (groupBooking.organizer.toString() !== organizerId) {
        throw new Error('Only organizer can update participant status');
      }

      const participant = groupBooking.participants.id(participantId);
      if (!participant) {
        throw new Error('Participant not found');
      }

      participant.status = status;
      await groupBooking.save();

      // Send status update notification
      await this.sendStatusUpdateNotification(groupBooking, participant, status);

      return groupBooking;

    } catch (error) {
      console.error('Update participant status error:', error);
      throw new Error(error.message || 'Failed to update participant status');
    }
  }

  async sendGroupMessage(groupBookingId, senderId, message, type = 'message') {
    try {
      const groupBooking = await GroupBooking.findById(groupBookingId)
        .populate('participants.user', 'name email')
        .populate('organizer', 'name email');

      if (!groupBooking) {
        throw new Error('Group booking not found');
      }

      // Check if sender is part of the group
      const isOrganizer = groupBooking.organizer._id.toString() === senderId;
      const isParticipant = groupBooking.participants.some(
        p => p.user._id.toString() === senderId
      );

      if (!isOrganizer && !isParticipant) {
        throw new Error('Only group members can send messages');
      }

      // Add message
      groupBooking.communication.messages.push({
        sender: senderId,
        message,
        type
      });

      await groupBooking.save();

      // Send email notifications to all participants
      if (type === 'announcement') {
        await this.sendAnnouncementNotifications(groupBooking, message);
      }

      return groupBooking;

    } catch (error) {
      console.error('Send group message error:', error);
      throw new Error(error.message || 'Failed to send message');
    }
  }

  async getGroupBookings(filters = {}, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const query = {};

      // Apply filters
      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.destination) {
        // Search in package location
        const packages = await Package.find({
          'location.country': new RegExp(filters.destination, 'i')
        }).select('_id');
        query.package = { $in: packages.map(p => p._id) };
      }

      if (filters.maxPrice) {
        query['pricing.finalPricePerPerson'] = { $lte: filters.maxPrice };
      }

      if (filters.minPrice) {
        query['pricing.finalPricePerPerson'] = { 
          ...query['pricing.finalPricePerPerson'],
          $gte: filters.minPrice 
        };
      }

      if (filters.availableSpots) {
        query.$expr = {
          $lt: ['$groupDetails.currentParticipants', '$groupDetails.maxParticipants']
        };
      }

      if (filters.registrationOpen) {
        query['groupDetails.registrationDeadline'] = { $gt: new Date() };
      }

      const groupBookings = await GroupBooking.find(query)
        .populate('organizer', 'name avatar')
        .populate('package', 'title location images duration')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await GroupBooking.countDocuments(query);

      return {
        groupBookings,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: groupBookings.length,
          totalItems: total
        }
      };

    } catch (error) {
      console.error('Get group bookings error:', error);
      throw new Error('Failed to get group bookings');
    }
  }

  async sendJoinNotification(groupBooking, newUserId) {
    try {
      const newUser = await User.findById(newUserId);
      
      await sendEmail({
        to: groupBooking.organizer.email,
        subject: `New member joined your group trip: ${groupBooking.title}`,
        template: 'group-join-notification',
        data: {
          organizerName: groupBooking.organizer.name,
          participantName: newUser.name,
          groupTitle: groupBooking.title,
          packageTitle: groupBooking.package.title,
          currentParticipants: groupBooking.participants.length + 1,
          maxParticipants: groupBooking.groupDetails.maxParticipants
        }
      });

    } catch (error) {
      console.error('Send join notification error:', error);
    }
  }

  async sendStatusUpdateNotification(groupBooking, participant, status) {
    try {
      const user = await User.findById(participant.user);
      
      let subject, template;
      switch (status) {
        case 'confirmed':
          subject = `Your group trip booking confirmed: ${groupBooking.title}`;
          template = 'group-booking-confirmed';
          break;
        case 'cancelled':
          subject = `Group trip booking cancelled: ${groupBooking.title}`;
          template = 'group-booking-cancelled';
          break;
        default:
          return; // No notification for other statuses
      }

      await sendEmail({
        to: user.email,
        subject,
        template,
        data: {
          userName: user.name,
          groupTitle: groupBooking.title,
          packageTitle: groupBooking.package.title,
          organizerName: groupBooking.organizer.name
        }
      });

    } catch (error) {
      console.error('Send status update notification error:', error);
    }
  }

  async sendAnnouncementNotifications(groupBooking, announcement) {
    try {
      const allMembers = [
        groupBooking.organizer,
        ...groupBooking.participants.map(p => p.user)
      ];

      const emailPromises = allMembers.map(member => 
        sendEmail({
          to: member.email,
          subject: `Group Trip Announcement: ${groupBooking.title}`,
          template: 'group-announcement',
          data: {
            userName: member.name,
            groupTitle: groupBooking.title,
            announcement,
            organizerName: groupBooking.organizer.name
          }
        })
      );

      await Promise.all(emailPromises);

    } catch (error) {
      console.error('Send announcement notifications error:', error);
    }
  }

  async cancelGroupBooking(groupBookingId, organizerId, reason) {
    try {
      const groupBooking = await GroupBooking.findById(groupBookingId)
        .populate('participants.user', 'name email')
        .populate('organizer', 'name email');

      if (!groupBooking) {
        throw new Error('Group booking not found');
      }

      if (groupBooking.organizer._id.toString() !== organizerId) {
        throw new Error('Only organizer can cancel group booking');
      }

      groupBooking.status = 'cancelled';
      
      // Add cancellation announcement
      groupBooking.communication.announcements.push({
        title: 'Group Trip Cancelled',
        content: reason || 'The organizer has cancelled this group trip.',
        createdBy: organizerId,
        important: true
      });

      await groupBooking.save();

      // Send cancellation notifications
      await this.sendCancellationNotifications(groupBooking, reason);

      return groupBooking;

    } catch (error) {
      console.error('Cancel group booking error:', error);
      throw new Error(error.message || 'Failed to cancel group booking');
    }
  }

  async sendCancellationNotifications(groupBooking, reason) {
    try {
      const emailPromises = groupBooking.participants.map(participant => 
        sendEmail({
          to: participant.user.email,
          subject: `Group Trip Cancelled: ${groupBooking.title}`,
          template: 'group-booking-cancelled',
          data: {
            userName: participant.user.name,
            groupTitle: groupBooking.title,
            reason: reason || 'No reason provided',
            organizerName: groupBooking.organizer.name
          }
        })
      );

      await Promise.all(emailPromises);

    } catch (error) {
      console.error('Send cancellation notifications error:', error);
    }
  }
}

module.exports = new GroupBookingService();