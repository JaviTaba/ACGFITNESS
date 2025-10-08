export const sampleFriends = [
  {
    id: "friend-1",
    name: "Jordan Michaels",
    goal: "Cutting phase",
    avatar: "https://i.pravatar.cc/150?img=52",
    streak: 9,
    latestPost: {
      title: "Crushed a tempo run",
      excerpt: "Negative splits and a new PR over 10k tonight!",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
    },
    posts: Array.from({ length: 8 }, (_, index) => ({
      id: `post-${index}`,
      title: index % 2 ? "Strength day" : "Meal prep magic",
      content: "Dialed into the plan and feeling strong.",
      createdAt: new Date(Date.now() - (index + 1) * 1000 * 60 * 60 * 24)
    }))
  },
  {
    id: "friend-2",
    name: "Sydney Ray",
    goal: "Half marathon",
    avatar: "https://i.pravatar.cc/150?img=49",
    streak: 4,
    latestPost: {
      title: "Fueling up",
      excerpt: "Macros on point for the week.",
      createdAt: new Date(Date.now() - 1000 * 60 * 45)
    },
    posts: Array.from({ length: 6 }, (_, index) => ({
      id: `post-s-${index}`,
      title: index % 2 ? "Yoga recovery" : "Threshold intervals",
      content: "Structured training block dialed in.",
      createdAt: new Date(Date.now() - (index + 1) * 1000 * 60 * 60 * 12)
    }))
  }
];

export const sampleWorkouts = [
  {
    title: "Tempo run",
    duration: 42,
    intensity: "Hard",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18)
  },
  {
    title: "Upper push",
    duration: 55,
    intensity: "Moderate",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26)
  }
];

export const sampleWeights = [
  { date: "2024-03-01", value: 182 },
  { date: "2024-03-02", value: 181.4 },
  { date: "2024-03-03", value: 181.1 },
  { date: "2024-03-04", value: 180.7 },
  { date: "2024-03-05", value: 180.2 },
  { date: "2024-03-06", value: 179.9 },
  { date: "2024-03-07", value: 179.6 }
];

export const sampleCalories = [
  { label: "Protein", value: 142 },
  { label: "Carbs", value: 210 },
  { label: "Fats", value: 64 }
];

export const sampleFeed = [
  {
    id: "feed-1",
    author: sampleFriends[0],
    content: "Logged 8 workouts in a row and finally hit that runner's high again!",
    attachedLogs: ["workout"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3)
  },
  {
    id: "feed-2",
    author: sampleFriends[1],
    content: "Meal prep Sunday. Rainbow bowls to keep the macros balanced.",
    attachedLogs: ["calories", "note"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8)
  }
];
