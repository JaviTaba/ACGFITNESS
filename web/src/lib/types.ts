export interface ProfileOverview {
  displayName: string;
  username: string;
  joinDate: string;
  goals: Array<{ title: string; progress: number; target: string }>;
  streakDays: number;
  badges: Array<{ id: string; label: string; description: string }>;
}
