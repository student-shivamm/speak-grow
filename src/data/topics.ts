// Speech Topics Dataset - 60+ prompts
export const speechTopics = [
  // Personal Growth
  "A challenge I overcame that made me stronger",
  "The biggest lesson I learned from failure",
  "A moment that completely changed my perspective",
  "The most important habit I've ever developed",
  "What success means to me",
  "A lesson I learned from childhood",
  "The person who influenced my life the most",
  "How I handle stress and pressure",
  "My greatest personal achievement",
  "A time I had to make a difficult decision",

  // Future & Technology
  "The future of Artificial Intelligence",
  "How technology is changing education",
  "Will robots replace human jobs?",
  "The importance of digital privacy",
  "How social media shapes our identity",
  "The next big breakthrough in medicine",
  "Should we fear or embrace AI?",
  "The future of remote work",
  "Electric vehicles and sustainable transportation",
  "Space exploration: Is it worth the cost?",

  // Society & Culture
  "Why kindness is underrated",
  "The importance of mental health awareness",
  "How reading books changes the brain",
  "Why empathy is a superpower",
  "The value of cultural diversity",
  "How climate change affects everyday life",
  "The power of community",
  "Why we should travel more",
  "The impact of music on human emotions",
  "What makes a great leader?",

  // Communication & Speaking
  "Why public speaking is a life skill",
  "The art of listening well",
  "How storytelling builds connections",
  "The difference between confidence and arrogance",
  "Why words matter more than we think",
  "How body language communicates",
  "The power of a well-timed pause",
  "How to speak with authority",
  "The importance of feedback",
  "Learning to say no",

  // Education & Career
  "Why curiosity is more valuable than intelligence",
  "The future of higher education",
  "How mentorship changes careers",
  "Why failure is the best teacher",
  "The skills schools don't teach",
  "How to learn anything faster",
  "Why lifelong learning matters",
  "The importance of soft skills in the workplace",
  "How to negotiate effectively",
  "Building resilience in your career",

  // Philosophy & Mindset
  "What does happiness really mean?",
  "The power of a growth mindset",
  "Why gratitude transforms your life",
  "The difference between being busy and being productive",
  "How to find your purpose",
  "Why patience is a competitive advantage",
  "The importance of solitude",
  "How fear holds us back",
  "The meaning of true friendship",
  "Why we should embrace uncertainty",
];

export const getRandomTopic = (): string => {
  return speechTopics[Math.floor(Math.random() * speechTopics.length)];
};
