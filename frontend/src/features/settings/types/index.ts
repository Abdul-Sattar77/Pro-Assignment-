export interface ProfileSettings {
  name: string;
  email: string;
}

export interface PasswordSettings {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface NotificationSettings {
  email_new_assignment: boolean;
  email_new_message: boolean;
  email_payment_received: boolean;
  email_deadline_reminder: boolean;
  inapp_new_assignment: boolean;
  inapp_new_message: boolean;
}
