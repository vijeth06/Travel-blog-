import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import './HighImpactFeatures.css';

// Context for real-time collaboration
const CollaborationContext = React.createContext();

// Real-time Collaboration Component
const CollaborationEditor = ({ blogId, sessionId }) => {
    const [session, setSession] = useState(null);
    const [document, setDocument] = useState({ content: '', version: 0 });
    const [collaborators, setCollaborators] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [socket, setSocket] = useState(null);
    const [userRole, setUserRole] = useState('viewer');

    useEffect(() => {
        const newSocket = io('/collaboration');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setIsConnected(true);
            newSocket.emit('join-session', { sessionId });
        });

        newSocket.on('session-updated', (updatedSession) => {
            setSession(updatedSession);
            setCollaborators(updatedSession.collaborators);
        });

        newSocket.on('document-updated', (updatedDocument) => {
            setDocument(updatedDocument);
        });

        newSocket.on('collaborator-joined', (collaborator) => {
            setCollaborators(prev => [...prev, collaborator]);
        });

        newSocket.on('collaborator-left', (collaboratorId) => {
            setCollaborators(prev => prev.filter(c => c._id !== collaboratorId));
        });

        return () => {
            newSocket.close();
        };
    }, [sessionId]);

    const handleTextChange = (newContent) => {
        if (userRole === 'viewer') return;

        const operation = {
            type: 'insert',
            position: 0, // Simplified - would calculate actual position
            content: newContent
        };

        socket?.emit('document-operation', { sessionId, operation });
    };

    const inviteCollaborator = async (email, role = 'viewer') => {
        try {
            const response = await fetch(`/api/high-impact/collaboration/sessions/${sessionId}/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ email, role })
            });

            if (response.ok) {
                // Handle success
                console.log('Invitation sent successfully');
            }
        } catch (error) {
            console.error('Failed to invite collaborator:', error);
        }
    };

    return (
        <div className="collaboration-editor">
            <div className="collaboration-header">
                <div className="connection-status">
                    <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                    </span>
                </div>
                
                <div className="collaborators-list">
                    {collaborators.map(collaborator => (
                        <div key={collaborator._id} className="collaborator-avatar">
                            <img 
                                src={collaborator.user.avatar || '/default-avatar.png'} 
                                alt={collaborator.user.username}
                                title={`${collaborator.user.username} (${collaborator.role})`}
                            />
                            <div className={`online-indicator ${collaborator.isOnline ? 'online' : 'offline'}`} />
                        </div>
                    ))}
                </div>

                <button 
                    className="invite-button"
                    onClick={() => {/* Open invite modal */}}
                >
                    Invite Collaborator
                </button>
            </div>

            <div className="editor-container">
                <textarea
                    value={document.content}
                    onChange={(e) => handleTextChange(e.target.value)}
                    disabled={userRole === 'viewer'}
                    className="collaborative-editor"
                    placeholder="Start writing your travel story..."
                />
                
                <div className="editor-info">
                    <span>Version: {document.version}</span>
                    <span>Role: {userRole}</span>
                </div>
            </div>
        </div>
    );
};

// Emergency Assistance Component
const EmergencyAssistance = () => {
    const [contacts, setContacts] = useState([]);
    const [isEmergency, setIsEmergency] = useState(false);
    const [location, setLocation] = useState(null);
    const [emergencyType, setEmergencyType] = useState('');

    useEffect(() => {
        fetchEmergencyContacts();
        getCurrentLocation();
    }, []);

    const fetchEmergencyContacts = async () => {
        try {
            const response = await fetch('/api/high-impact/emergency/contacts', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setContacts(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch emergency contacts:', error);
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Geolocation error:', error);
                }
            );
        }
    };

    const triggerEmergencyAlert = async () => {
        if (!emergencyType || !location) {
            alert('Please select emergency type and enable location');
            return;
        }

        try {
            const response = await fetch('/api/high-impact/emergency/alerts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    type: emergencyType,
                    severity: 'high',
                    title: 'Emergency Assistance Needed',
                    description: `Emergency situation requiring immediate assistance. Type: ${emergencyType}`,
                    location: {
                        coordinates: location,
                        address: 'Current location'
                    }
                })
            });

            if (response.ok) {
                setIsEmergency(true);
                alert('Emergency alert sent to your contacts!');
            }
        } catch (error) {
            console.error('Failed to send emergency alert:', error);
        }
    };

    const addEmergencyContact = async (contactData) => {
        try {
            const response = await fetch('/api/high-impact/emergency/contacts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(contactData)
            });

            if (response.ok) {
                fetchEmergencyContacts();
            }
        } catch (error) {
            console.error('Failed to add emergency contact:', error);
        }
    };

    return (
        <div className="emergency-assistance">
            <div className="emergency-header">
                <h2>🆘 Emergency Assistance</h2>
                <div className="location-status">
                    {location ? '📍 Location enabled' : '❌ Location disabled'}
                </div>
            </div>

            {!isEmergency ? (
                <div className="emergency-controls">
                    <div className="emergency-types">
                        <h3>Select Emergency Type:</h3>
                        <div className="emergency-buttons">
                            {['medical', 'safety', 'transportation', 'theft', 'other'].map(type => (
                                <button
                                    key={type}
                                    className={`emergency-type-btn ${emergencyType === type ? 'selected' : ''}`}
                                    onClick={() => setEmergencyType(type)}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        className="emergency-alert-btn"
                        onClick={triggerEmergencyAlert}
                        disabled={!emergencyType || !location}
                    >
                        🚨 SEND EMERGENCY ALERT
                    </button>
                </div>
            ) : (
                <div className="emergency-active">
                    <div className="emergency-status">
                        <h3>🚨 Emergency Alert Active</h3>
                        <p>Your emergency contacts have been notified</p>
                        <div className="emergency-actions">
                            <button onClick={() => setIsEmergency(false)}>
                                Cancel Alert
                            </button>
                            <button onClick={() => window.open('tel:911')}>
                                Call Emergency Services
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="emergency-contacts">
                <h3>Emergency Contacts ({contacts.length})</h3>
                <div className="contacts-list">
                    {contacts.map(contact => (
                        <div key={contact._id} className="contact-card">
                            <div className="contact-info">
                                <strong>{contact.name}</strong>
                                <span>{contact.type}</span>
                            </div>
                            <div className="contact-details">
                                <span>📞 {contact.phone}</span>
                                {contact.email && <span>✉️ {contact.email}</span>}
                            </div>
                            {contact.isPrimary && <span className="primary-badge">Primary</span>}
                        </div>
                    ))}
                </div>
                
                <button 
                    className="add-contact-btn"
                    onClick={() => {/* Open add contact modal */}}
                >
                    + Add Emergency Contact
                </button>
            </div>
        </div>
    );
};

// Blockchain Certificate Component
const BlockchainCertificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            const response = await fetch('/api/high-impact/certificates', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setCertificates(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch certificates:', error);
        } finally {
            setLoading(false);
        }
    };

    const mintCertificate = async (certificateId) => {
        try {
            const response = await fetch(`/api/high-impact/certificates/${certificateId}/mint`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                fetchCertificates();
                alert('Certificate minted to blockchain successfully!');
            }
        } catch (error) {
            console.error('Failed to mint certificate:', error);
        }
    };

    const downloadCertificate = (certificate) => {
        // Generate and download certificate image/PDF
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 800;
        canvas.height = 600;
        
        // Draw certificate background
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add certificate content
        ctx.fillStyle = '#333';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Travel Achievement Certificate', canvas.width / 2, 100);
        
        ctx.font = '20px Arial';
        ctx.fillText(certificate.title, canvas.width / 2, 200);
        
        ctx.font = '16px Arial';
        ctx.fillText(certificate.description, canvas.width / 2, 250);
        
        if (certificate.isMinted) {
            ctx.fillText(`Blockchain Hash: ${certificate.blockchain.transactionHash}`, canvas.width / 2, 400);
        }
        
        // Download
        const link = document.createElement('a');
        link.download = `certificate-${certificate._id}.png`;
        link.href = canvas.toDataURL();
        link.click();
    };

    if (loading) return <div className="loading">Loading certificates...</div>;

    return (
        <div className="blockchain-certificates">
            <div className="certificates-header">
                <h2>🏆 Travel Certificates</h2>
                <p>Blockchain-verified achievements and milestones</p>
            </div>

            <div className="certificates-grid">
                {certificates.map(certificate => (
                    <motion.div
                        key={certificate._id}
                        className="certificate-card"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <div className="certificate-image">
                            <img 
                                src={certificate.metadata.image || '/certificate-placeholder.png'} 
                                alt={certificate.title}
                            />
                            {certificate.isMinted && (
                                <div className="blockchain-badge">
                                    ⛓️ Minted
                                </div>
                            )}
                        </div>

                        <div className="certificate-content">
                            <h3>{certificate.title}</h3>
                            <p>{certificate.description}</p>
                            
                            <div className="certificate-attributes">
                                {certificate.metadata.attributes?.map(attr => (
                                    <span key={attr.trait_type} className="attribute">
                                        {attr.trait_type}: {attr.value}
                                    </span>
                                ))}
                            </div>

                            <div className="certificate-stats">
                                <span>👁️ {certificate.stats.viewCount}</span>
                                <span>📤 {certificate.stats.shareCount}</span>
                                <span>⬇️ {certificate.stats.downloadCount}</span>
                            </div>
                        </div>

                        <div className="certificate-actions">
                            <button onClick={() => downloadCertificate(certificate)}>
                                Download
                            </button>
                            
                            {!certificate.isMinted && (
                                <button 
                                    className="mint-btn"
                                    onClick={() => mintCertificate(certificate._id)}
                                >
                                    Mint to Blockchain
                                </button>
                            )}
                            
                            {certificate.isMinted && (
                                <a 
                                    href={`https://polygonscan.com/tx/${certificate.blockchain.transactionHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="verify-btn"
                                >
                                    Verify on Blockchain
                                </a>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {certificates.length === 0 && (
                <div className="no-certificates">
                    <h3>No certificates yet</h3>
                    <p>Complete travel milestones to earn blockchain certificates!</p>
                </div>
            )}
        </div>
    );
};

// AI Recommendations Component
const AIRecommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [preferences, setPreferences] = useState({
        budget: 'medium',
        travelStyle: 'adventure',
        interests: []
    });

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        try {
            const response = await fetch('/api/high-impact/ai/recommendations', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setRecommendations(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        }
    };

    const generateRecommendations = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/high-impact/ai/recommendations/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ preferences })
            });

            if (response.ok) {
                fetchRecommendations();
            }
        } catch (error) {
            console.error('Failed to generate recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const provideFeedback = async (recommendationId, feedback) => {
        try {
            await fetch(`/api/high-impact/ai/recommendations/${recommendationId}/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',   
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(feedback)
            });

            fetchRecommendations();
        } catch (error) {
            console.error('Failed to provide feedback:', error);
        }
    };

    return (
        <div className="ai-recommendations">
            <div className="recommendations-header">
                <h2>🤖 AI Travel Recommendations</h2>
                <button 
                    onClick={generateRecommendations}
                    disabled={loading}
                    className="generate-btn"
                >
                    {loading ? 'Generating...' : 'Generate New Recommendations'}
                </button>
            </div>

            <div className="preferences-panel">
                <h3>Preferences</h3>
                <div className="preference-controls">
                    <select 
                        value={preferences.budget}
                        onChange={(e) => setPreferences(prev => ({ ...prev, budget: e.target.value }))}
                    >
                        <option value="low">Budget Travel</option>
                        <option value="medium">Mid-range</option>
                        <option value="high">Luxury</option>
                    </select>

                    <select 
                        value={preferences.travelStyle}
                        onChange={(e) => setPreferences(prev => ({ ...prev, travelStyle: e.target.value }))}
                    >
                        <option value="adventure">Adventure</option>
                        <option value="relaxation">Relaxation</option>
                        <option value="cultural">Cultural</option>
                        <option value="business">Business</option>
                    </select>
                </div>
            </div>

            <div className="recommendations-list">
                {recommendations.map(rec => (
                    <motion.div
                        key={rec._id}
                        className="recommendation-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="recommendation-header">
                            <h3>{rec.title}</h3>
                            <div className="confidence-score">
                                Confidence: {Math.round(rec.confidence * 100)}%
                            </div>
                        </div>

                        <p>{rec.description}</p>

                        <div className="recommendation-reasoning">
                            <h4>Why this recommendation?</h4>
                            <ul>
                                {rec.reasoning.map((reason, index) => (
                                    <li key={index}>{reason}</li>
                                ))}
                            </ul>
                        </div>

                        {rec.data.location && (
                            <div className="location-info">
                                📍 {rec.data.location.city}, {rec.data.location.country}
                            </div>
                        )}

                        {rec.data.priceRange && (
                            <div className="price-range">
                                💰 {rec.data.priceRange.min} - {rec.data.priceRange.max} {rec.data.priceRange.currency}
                            </div>
                        )}

                        <div className="recommendation-actions">
                            <button onClick={() => provideFeedback(rec._id, { wasHelpful: true, rating: 5 })}>
                                👍 Helpful
                            </button>
                            <button onClick={() => provideFeedback(rec._id, { wasHelpful: false, rating: 2 })}>
                                👎 Not Helpful
                            </button>
                            <button onClick={() => provideFeedback(rec._id, { wasUsed: true })}>
                                ✅ Used This
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {recommendations.length === 0 && (
                <div className="no-recommendations">
                    <h3>No recommendations yet</h3>
                    <p>Click "Generate New Recommendations" to get personalized travel suggestions!</p>
                </div>
            )}
        </div>
    );
};

// Gamification Component
const GamificationDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGamificationData();
    }, []);

    const fetchGamificationData = async () => {
        try {
            const [profileRes, achievementsRes] = await Promise.all([
                fetch('/api/high-impact/gamification/profile', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                fetch('/api/high-impact/gamification/achievements?completed=true', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
            ]);

            const profileData = await profileRes.json();
            const achievementsData = await achievementsRes.json();

            if (profileData.success) setProfile(profileData.data);
            if (achievementsData.success) setAchievements(achievementsData.data);
        } catch (error) {
            console.error('Failed to fetch gamification data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading gamification data...</div>;

    return (
        <div className="gamification-dashboard">
            <div className="profile-overview">
                <h2>🎮 Travel Gamification</h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Level {profile?.level || 1}</h3>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{ 
                                    width: `${((profile?.totalPoints || 0) % 1000) / 10}%` 
                                }}
                            ></div>
                        </div>
                        <span>{profile?.nextLevelPoints || 1000} points to next level</span>
                    </div>

                    <div className="stat-card">
                        <h3>Total Points</h3>
                        <div className="big-number">{profile?.totalPoints || 0}</div>
                    </div>

                    <div className="stat-card">
                        <h3>Achievements</h3>
                        <div className="big-number">{achievements.length}</div>
                    </div>
                </div>
            </div>

            <div className="category-breakdown">
                <h3>Points by Category</h3>
                <div className="categories-grid">
                    {Object.entries(profile?.categoryBreakdown || {}).map(([category, points]) => (
                        <div key={category} className="category-card">
                            <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                            <span>{points} points</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="achievements-section">
                <h3>🏆 Your Achievements</h3>
                <div className="achievements-grid">
                    {achievements.map(userAchievement => (
                        <motion.div
                            key={userAchievement._id}
                            className="achievement-card"
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className="achievement-icon">
                                <img 
                                    src={userAchievement.achievement.icon || '/achievement-icon.png'} 
                                    alt={userAchievement.achievement.title}
                                />
                            </div>
                            <div className="achievement-info">
                                <h4>{userAchievement.achievement.title}</h4>
                                <p>{userAchievement.achievement.description}</p>
                                <div className="achievement-meta">
                                    <span className={`rarity ${userAchievement.achievement.rarity}`}>
                                        {userAchievement.achievement.rarity}
                                    </span>
                                    <span>+{userAchievement.achievement.rewards.points} points</span>
                                </div>
                                <div className="completion-date">
                                    Earned: {new Date(userAchievement.completedAt).toLocaleDateString()}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {achievements.length === 0 && (
                <div className="no-achievements">
                    <h3>No achievements yet</h3>
                    <p>Start exploring, writing blogs, and engaging with the community to earn achievements!</p>
                </div>
            )}
        </div>
    );
};

// Main High Impact Features Component
const HighImpactFeatures = () => {
    const [activeTab, setActiveTab] = useState('collaboration');

    const tabs = [
        { id: 'collaboration', label: 'Collaboration', icon: '👥' },
        { id: 'emergency', label: 'Emergency', icon: '🆘' },
        { id: 'certificates', label: 'Certificates', icon: '🏆' },
        { id: 'ai', label: 'AI Recommendations', icon: '🤖' },
        { id: 'gamification', label: 'Achievements', icon: '🎮' }
    ];

    const renderActiveComponent = () => {
        switch (activeTab) {
            case 'collaboration':
                return <CollaborationEditor blogId="example-blog-id" sessionId="example-session-id" />;
            case 'emergency':
                return <EmergencyAssistance />;
            case 'certificates':
                return <BlockchainCertificates />;
            case 'ai':
                return <AIRecommendations />;
            case 'gamification':
                return <GamificationDashboard />;
            default:
                return <div>Select a feature to explore</div>;
        }
    };

    return (
        <div className="high-impact-features">
            <div className="features-header">
                <h1>🚀 High-Impact Travel Features</h1>
                <p>Advanced capabilities for the modern traveler</p>
            </div>

            <div className="features-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="tab-label">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="features-content">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderActiveComponent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default HighImpactFeatures;