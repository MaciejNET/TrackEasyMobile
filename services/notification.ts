// Notification service for handling push notifications
// Note: This assumes expo-notifications is installed. If not, it would need to be installed with:
// expo install expo-notifications

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { TicketArrival } from '@/schemas/city';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request permissions for notifications
const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for notification!');
    return false;
  }
  
  return true;
};

// Schedule a notification
const scheduleNotification = async (title: string, body: string, trigger: Notifications.NotificationTriggerInput) => {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });
    return id;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

// Schedule notifications for ticket arrivals
const scheduleArrivalNotifications = async (arrivals: TicketArrival[]) => {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    return { success: false, message: 'Notification permissions not granted' };
  }

  try {
    // Schedule a notification for today
    const todayNotificationId = await scheduleNotification(
      'Trip Notifications Enabled',
      'You will be notified when you arrive at each station.',
      { seconds: 5 } // Show notification 5 seconds after setting up
    );

    // Schedule notifications for each arrival
    const notificationIds = await Promise.all(
      arrivals.map(async (arrival) => {
        // Parse the arrival time
        const [hours, minutes] = arrival.arrivalTime.split(':').map(Number);
        
        // Create a Date object for the arrival time today
        const arrivalDate = new Date();
        arrivalDate.setHours(hours, minutes, 0, 0);
        
        // Only schedule if the arrival time is in the future
        if (arrivalDate > new Date()) {
          const id = await scheduleNotification(
            `Arriving at ${arrival.cityName}`,
            `You are arriving at ${arrival.cityName} at ${arrival.arrivalTime}`,
            { date: arrivalDate }
          );
          return { cityName: arrival.cityName, notificationId: id };
        }
        return null;
      })
    );

    return { 
      success: true, 
      todayNotificationId,
      arrivalNotificationIds: notificationIds.filter(Boolean)
    };
  } catch (error) {
    console.error('Error scheduling arrival notifications:', error);
    return { success: false, message: 'Failed to schedule notifications' };
  }
};

// Cancel all scheduled notifications
const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return true;
  } catch (error) {
    console.error('Error canceling notifications:', error);
    return false;
  }
};

const notificationService = {
  requestNotificationPermissions,
  scheduleNotification,
  scheduleArrivalNotifications,
  cancelAllNotifications,
};

export default notificationService;