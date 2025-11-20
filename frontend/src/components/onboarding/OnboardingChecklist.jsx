import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Typography,
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { getOnboardingStatus, completeOnboardingStep } from '../../api/onboarding';

const CANONICAL_STEPS = [
  { key: 'complete_profile', label: 'Complete your profile' },
  { key: 'follow_first_author', label: 'Follow your first author' },
  { key: 'post_first_comment', label: 'Post your first comment' },
  { key: 'save_first_place', label: 'Save a favorite place' }
];

const OnboardingChecklist = () => {
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const syncFromResponse = (data) => {
    const completedMap = new Map((data.steps || []).map(s => [s.key, s.completed]));
    const mergedSteps = CANONICAL_STEPS.map(step => ({
      ...step,
      completed: completedMap.get(step.key) || false
    }));
    setSteps(mergedSteps);
    setProgress(data.progress || 0);

    const wasCompleted = isCompleted;
    const nowCompleted = !!data.isCompleted;
    setIsCompleted(nowCompleted);

    // Trigger celebration when onboarding just became complete
    if (!wasCompleted && nowCompleted) {
      setShowCelebration(true);
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await getOnboardingStatus();
        if (!isMounted) return;
        if (res.data && res.data.data) {
          syncFromResponse(res.data.data);
        }
      } catch (error) {
        console.error('Failed to load onboarding status', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const handleToggle = async (stepKey, checked) => {
    if (!checked) return; // We only support marking as done from here
    try {
      const res = await completeOnboardingStep(stepKey);
      if (res.data && res.data.data) {
        syncFromResponse(res.data.data);
      }
    } catch (error) {
      console.error('Failed to complete onboarding step', error);
    }
  };

  if (loading) return null;
  if (isCompleted) {
    return (
      <Card>
        <CardHeader title="Onboarding complete" />
        <CardContent>
          <Typography variant="body2" color="textSecondary">
            You’ve completed all getting-started steps. Enjoy exploring the platform!
          </Typography>
        </CardContent>
        <Snackbar
          open={showCelebration}
          autoHideDuration={5000}
          onClose={() => setShowCelebration(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setShowCelebration(false)} severity="success" sx={{ width: '100%' }}>
            🎉 Onboarding complete! You’ve unlocked a starter reward.
          </Alert>
        </Snackbar>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Getting started checklist"
        subheader={`Progress: ${progress}%`}
      />
      <CardContent>
        <Box mb={2}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
        <List>
          {steps.map(step => (
            <ListItem key={step.key} button onClick={() => !step.completed && handleToggle(step.key, true)}>
              <ListItemIcon>
                {step.completed ? (
                  <CheckCircleIcon color="success" />
                ) : (
                  <RadioButtonUncheckedIcon color="disabled" />
                )}
              </ListItemIcon>
              <ListItemText primary={step.label} />
              <Checkbox
                edge="end"
                tabIndex={-1}
                checked={step.completed}
                onChange={(e) => handleToggle(step.key, e.target.checked)}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
      <Snackbar
        open={showCelebration}
        autoHideDuration={5000}
        onClose={() => setShowCelebration(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setShowCelebration(false)} severity="success" sx={{ width: '100%' }}>
          🎉 Onboarding complete! You’ve unlocked a starter reward.
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default OnboardingChecklist;
