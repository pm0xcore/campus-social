/**
 * Mock data for UI testing
 * TODO: Remove this file once real data flow is working
 */

export const MOCK_USER = {
  id: 'mock-user-1',
  ocid: 'test.user',
  display_name: 'Alex Chen',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  bio: 'CS major, love building web apps',
  current_focus: 'Building my capstone project',
  university_id: 'univ-1',
};

export const MOCK_STATS = {
  points: 1250,
  level: 7,
  current_streak: 5,
  longest_streak: 12,
  total_posts: 23,
  total_friends: 8,
  achievements_unlocked: 6,
};

export const MOCK_DAILY_CHALLENGES = [
  {
    id: 'challenge-1',
    title: 'Make 3 New Friends',
    description: 'Send 3 friend requests to classmates',
    points: 100,
    progress: 1,
    target: 3,
    completed: false,
  },
  {
    id: 'challenge-2',
    title: 'Share Your Day',
    description: 'Create a post about your day',
    points: 50,
    progress: 0,
    target: 1,
    completed: false,
  },
  {
    id: 'challenge-3',
    title: 'Help Someone Out',
    description: 'Answer a question in a group',
    points: 75,
    progress: 0,
    target: 1,
    completed: false,
  },
];

export const MOCK_DISCOVERABLE_USERS = [
  {
    id: 'user-1',
    ocid: 'sarah.johnson',
    display_name: 'Sarah Johnson',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    bio: 'Biology major | Lab enthusiast 🧬',
    current_focus: 'Studying for biochem final',
  },
  {
    id: 'user-2',
    ocid: 'mike.rivera',
    display_name: 'Mike Rivera',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    bio: 'Engineering student | Coffee addict ☕',
    current_focus: 'Working on robotics project',
  },
  {
    id: 'user-3',
    ocid: 'emma.li',
    display_name: 'Emma Li',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    bio: 'Business major | Startup founder 🚀',
    current_focus: 'Preparing pitch deck',
  },
  {
    id: 'user-4',
    ocid: 'james.patel',
    display_name: 'James Patel',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    bio: 'Physics major | Space nerd 🌌',
    current_focus: 'Research paper on quantum mechanics',
  },
  {
    id: 'user-5',
    ocid: 'olivia.garcia',
    display_name: 'Olivia Garcia',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia',
    bio: 'Art major | Digital illustrator 🎨',
    current_focus: 'Portfolio for gallery show',
  },
  {
    id: 'user-6',
    ocid: 'david.kim',
    display_name: 'David Kim',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    bio: 'CS major | Game dev enthusiast 🎮',
    current_focus: 'Building an indie game',
  },
];

export const MOCK_POSTS = [
  {
    id: 'post-1',
    user_id: 'user-2',
    type: 'win',
    content: 'Just aced my algorithms midterm! 🎉 All those late nights studying paid off.',
    visibility: 'public',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    author: {
      display_name: 'Mike Rivera',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    },
    reactions: { fire: 12, clap: 8, heart: 5 },
    user_reacted: null,
  },
  {
    id: 'post-2',
    user_id: 'user-1',
    type: 'question',
    content: 'Anyone know a good spot on campus for group study sessions? Library is always packed.',
    visibility: 'public',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    author: {
      display_name: 'Sarah Johnson',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
    reactions: { fire: 3, clap: 0, heart: 2 },
    user_reacted: null,
  },
  {
    id: 'post-3',
    user_id: 'user-3',
    type: 'resource',
    content: 'Found this awesome free course on product management: coursera.org/product-basics. Highly recommend!',
    visibility: 'public',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    author: {
      display_name: 'Emma Li',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    },
    reactions: { fire: 15, clap: 10, heart: 7 },
    user_reacted: 'fire',
  },
  {
    id: 'post-4',
    user_id: 'user-6',
    type: 'post',
    content: 'Starting a new game dev project. Who wants to collaborate? Looking for artists and sound designers!',
    visibility: 'public',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    author: {
      display_name: 'David Kim',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    },
    reactions: { fire: 6, clap: 4, heart: 8 },
    user_reacted: null,
  },
  {
    id: 'post-5',
    user_id: 'user-5',
    type: 'win',
    content: 'My artwork got accepted into the spring gallery show! Dreams do come true ✨',
    visibility: 'public',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    author: {
      display_name: 'Olivia Garcia',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia',
    },
    reactions: { fire: 20, clap: 15, heart: 25 },
    user_reacted: 'heart',
  },
];

export const MOCK_LEADERBOARD = [
  {
    rank: 1,
    user: {
      id: 'user-1',
      display_name: 'Sarah Johnson',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
    points: 2850,
    level: 12,
  },
  {
    rank: 2,
    user: {
      id: 'user-3',
      display_name: 'Emma Li',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    },
    points: 2340,
    level: 10,
  },
  {
    rank: 3,
    user: {
      id: 'user-6',
      display_name: 'David Kim',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    },
    points: 2100,
    level: 9,
  },
  {
    rank: 4,
    user: {
      id: 'user-2',
      display_name: 'Mike Rivera',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    },
    points: 1890,
    level: 8,
  },
  {
    rank: 5,
    user: {
      id: 'mock-user-1',
      display_name: 'Alex Chen',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    },
    points: 1250,
    level: 7,
  },
  {
    rank: 6,
    user: {
      id: 'user-5',
      display_name: 'Olivia Garcia',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia',
    },
    points: 980,
    level: 5,
  },
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'friend_request',
    title: 'New Friend Request',
    message: 'Sarah Johnson wants to connect with you',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    is_read: false,
  },
  {
    id: 'notif-2',
    type: 'achievement',
    title: 'Achievement Unlocked!',
    message: 'You earned the "Social Butterfly" badge',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    is_read: false,
  },
  {
    id: 'notif-3',
    type: 'level_up',
    title: 'Level Up!',
    message: "You've reached Level 7",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    is_read: true,
  },
];

// Feature flag to enable/disable mock data
export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
