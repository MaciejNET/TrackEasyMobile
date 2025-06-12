import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { TicketArrival } from '@/schemas/city';
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
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

const scheduleArrivalNotifications = async (arrivals: TicketArrival[]) => {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    return { success: false, message: 'Notification permissions not granted' };
  }

  try {
    const todayNotificationId = await scheduleNotification(
      'Trip Notifications Enabled',
      'You will be notified when you arrive at each station.',
      { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5 }
    );

    const notificationIds = await Promise.all(
      arrivals.map(async (arrival) => {
        const [hours, minutes] = arrival.arrivalTime.split(':').map(Number);

        const arrivalDate = new Date();
        arrivalDate.setHours(hours, minutes, 0, 0);
        if (arrivalDate > new Date()) {
          const id = await scheduleNotification(
            `Arriving at ${arrival.cityName}`,
            `You are arriving at ${arrival.cityName} at ${arrival.arrivalTime}`,
            { type: Notifications.SchedulableTriggerInputTypes.DATE, date: arrivalDate }
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
