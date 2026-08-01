-- DROP TABLE IF EXISTS users;

-- CREATE TABLE IF NOT EXISTS users (
--   id            INTEGER PRIMARY KEY AUTOINCREMENT,
--   username      TEXT UNIQUE NOT NULL,
--   passwordHash  TEXT NOT NULL,
--   realname      TEXT DEFAULT '',
--   birthdate     TEXT DEFAULT '',
--   admin         INTEGER DEFAULT 0,
--   description   TEXT DEFAULT '',
--   avatarUrl     TEXT DEFAULT '',
--   createdAt     TEXT DEFAULT (datetime('now'))
-- );

-- CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Example users (password: password123)

DROP TABLE IF EXISTS Messages;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Articles;
DROP TABLE IF EXISTS Comments;
DROP TABLE IF EXISTS Images;
DROP TABLE IF EXISTS ArticleImg;
DROP TABLE IF EXISTS ArticleLike;
DROP TABLE IF EXISTS ArticleTag;

-- Create messages table
CREATE TABLE Messages (
    id INTEGER NOT NULL PRIMARY KEY,
    message TEXT
);

-- Create users information table
CREATE TABLE Users (
    id INTEGER NOT NULL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    realname VARCHAR(100),
    birthdate TEXT DEFAULT '',
    admin BOOLEAN DEFAULT FALSE,
    description TEXT,
    avatarUrl TEXT,
    UNIQUE(username)
);

-- Create articles table
CREATE TABLE Articles (
    id INTEGER NOT NULL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    date DATETIME NOT NULL,
    content TEXT,
    userId INTEGER,
    headerUrl TEXT,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- Create comments table
CREATE TABLE Comments (
    id INTEGER NOT NULL PRIMARY KEY,
    date DATETIME NOT NULL,
    content TEXT,
    userId INTEGER,
    articleId INTEGER,
    parentCommentId INTEGER,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (articleId) REFERENCES Articles(id) ON DELETE CASCADE,
    FOREIGN KEY (parentCommentId) REFERENCES Comments(id) ON DELETE CASCADE
);

-- Create images table
CREATE TABLE Images (
    id INTEGER NOT NULL PRIMARY KEY,
    url TEXT
);

-- Create article and image relation table
CREATE TABLE ArticleImg (
    articleId INTEGER NOT NULL,
    imgUrl TEXT NOT NULL,
    PRIMARY KEY (articleId, imgUrl),
    FOREIGN KEY (articleId) REFERENCES Articles(id) ON DELETE CASCADE
);

-- Create article and like relation table
CREATE TABLE ArticleLike (
    articleId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    PRIMARY KEY (articleId, userId),
    FOREIGN KEY (articleId) REFERENCES Articles(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- Create article and tag relation table
CREATE TABLE ArticleTag (
    articleId INTEGER NOT NULL,
    tag VARCHAR(50) NOT NULL,
    color VARCHAR(20),
    PRIMARY KEY (articleId, tag),
    FOREIGN KEY (articleId) REFERENCES Articles(id) ON DELETE CASCADE
);

-- Dummy messages data
INSERT INTO Messages (message) VALUES
    ('Hello, world!'),
    ('Gotta catch ''em all!');

-- Seed user data. The admin, demo, and writer accounts use the local-only
-- development password "123456".
INSERT INTO Users (username, passwordHash, realname, admin, description, avatarUrl) VALUES
    ('admin', '$2b$10$F4aHD/tBLn4D/bhT76MjOunoTLzXMb6/iRf3B8heFtoMWTbnRbhiG', 'Admin User', TRUE, 'Administrator of the system.', '/avatars/doraemon1.png'),
    ('johndoe', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'John Doe', FALSE, 'Just a regular user.', 'https://i.pravatar.cc/150?img=2'),
    ('janedoe', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'Jane Doe', FALSE, 'Loves to read articles.', 'https://i.pravatar.cc/150?img=3'),
    ('alice', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'Alice Smith', FALSE, 'Enjoys writing comments.', 'https://i.pravatar.cc/150?img=4'),
    ('bob', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'Bob Johnson', FALSE, 'Avid article liker.', 'https://i.pravatar.cc/150?img=5'),
    ('charlie', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'Charlie Brown', FALSE, 'Tech enthusiast.', 'https://i.pravatar.cc/150?img=6'),
    ('david', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'David Wilson', FALSE, 'Travel lover.', 'https://i.pravatar.cc/150?img=7'),
    ('eve', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'Eve Davis', FALSE, 'Food blogger.', 'https://i.pravatar.cc/150?img=8'),
    ('frank', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'Frank Miller', FALSE, 'Sports fan.', 'https://i.pravatar.cc/150?img=9'),
    ('grace', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'Grace Lee', FALSE, 'Health and wellness advocate.', 'https://i.pravatar.cc/150?img=10'),
    ('demo', '$2b$10$F4aHD/tBLn4D/bhT76MjOunoTLzXMb6/iRf3B8heFtoMWTbnRbhiG', 'Demo User', FALSE, 'Demo account for local development.', '/avatars/doraemon2.png'),
    ('writer', '$2b$10$F4aHD/tBLn4D/bhT76MjOunoTLzXMb6/iRf3B8heFtoMWTbnRbhiG', 'Demo Writer', FALSE, 'Example article author.', '/avatars/doraemon3.png');

-- Dummy articles data with real content and THEMED Unsplash images (30 articles, dates within last week)
INSERT INTO Articles (title, date, content, userId, headerUrl) VALUES
    -- Technology (4 articles)
    ('Getting Started with Web Development', '2025-10-27 14:23:00', 'Web development is an exciting field that combines creativity with technical skills. In this article, we will explore the fundamentals of building modern web applications. From HTML and CSS basics to JavaScript frameworks, you will learn the essential tools and concepts needed to start your journey as a web developer.', 2, 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=600&fit=crop'),
    ('Cloud Computing Fundamentals', '2025-10-27 11:42:00', 'Cloud computing has revolutionized how businesses operate and how we store and access data. This comprehensive guide covers the basics of cloud infrastructure, different service models, and major cloud providers. Learn about scalability and security considerations.', 6, 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&fit=crop'),
    ('Cybersecurity Best Practices', '2025-10-29 17:52:00', 'In an increasingly connected world, protecting your digital assets is more important than ever. This comprehensive guide covers essential cybersecurity practices including password management, two-factor authentication, and securing your home network.', 5, 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=600&fit=crop'),
    ('Machine Learning for Everyone', '2025-11-01 10:38:00', 'Machine learning is not just for data scientists anymore. This accessible introduction explains core concepts, common algorithms, and real-world applications in simple terms. Discover how ML powers recommendation systems and voice assistants.', 5, 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&h=600&fit=crop'),
    -- Entertainment (7 articles)
    ('The Art of Photography', '2025-10-28 09:15:00', 'Photography is more than just pressing a button. It is about capturing moments, telling stories, and expressing emotions through images. Learn composition techniques, lighting principles, and post-processing tips that will take your photography skills to the next level.', 3, 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200&h=600&fit=crop'),
    ('Film Industry Insider: Behind the Scenes', '2025-10-30 15:21:00', 'Ever wondered what really happens behind the camera? This insider look at the film industry reveals the creative process, from script development to post-production. Learn about the roles of directors, cinematographers, and editors.', 3, 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&h=600&fit=crop'),
    ('Podcasting: Starting Your Own Show', '2025-10-28 12:58:00', 'Podcasting has exploded in popularity, offering everyone a platform to share their voice. This comprehensive guide covers everything from conceptualizing your show to recording equipment, editing software, and distribution platforms.', 10, 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1200&h=600&fit=crop'),
    ('Music Festivals: The Ultimate Guide', '2025-10-29 19:30:00', 'Music festivals are more than just concerts; they are immersive cultural experiences. This guide covers festival survival tips, what to pack, how to plan your schedule, and make the most of your festival experience. From Coachella to Glastonbury, get ready to dance!', 4, 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&h=600&fit=crop'),
    ('Video Game Design: From Concept to Reality', '2025-10-31 16:20:00', 'The world of video game design is incredibly creative and technical. This article explores the game development process, from initial concept and storytelling to character design, programming, and testing. Learn what it takes to create engaging gaming experiences.', 7, 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=600&fit=crop'),
    ('Stand-Up Comedy: Finding Your Voice', '2025-11-01 18:45:00', 'Stand-up comedy is one of the most challenging yet rewarding forms of entertainment. This guide helps aspiring comedians develop their unique voice, write material, and overcome stage fright. Learn from the pros about timing, delivery, and connecting with audiences.', 8, 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1200&h=600&fit=crop'),
    ('Streaming Culture: The New Entertainment Era', '2025-10-27 20:15:00', 'Streaming has revolutionized how we consume entertainment. From Netflix originals to Twitch gaming streams, this article examines the streaming phenomenon, its impact on traditional media, and what the future holds for content creators and viewers.', 9, 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=1200&h=600&fit=crop'),
    -- Health (5 articles)
    ('Healthy Living: A Complete Guide', '2025-10-29 16:45:00', 'Living a healthy lifestyle encompasses mental well-being, quality sleep, stress management, and building positive relationships. This article provides practical tips and evidence-based advice on how to improve your overall health and wellness.', 4, 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=600&fit=crop'),
    ('Fitness Journey: Building Strength and Endurance', '2025-10-29 10:25:00', 'Starting a fitness journey can be overwhelming, but it does not have to be. This comprehensive guide breaks down building strength, improving cardiovascular health, and developing sustainable exercise habits. Learn about training methods and proper form.', 2, 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=600&fit=crop'),
    ('Meditation and Mindfulness Practices', '2025-11-01 09:18:00', 'In our fast-paced world, finding moments of peace is essential for mental health. This article explores meditation techniques, mindfulness exercises, and breathing practices that help reduce stress and improve focus. Just minutes daily can transform your well-being.', 5, 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=600&fit=crop'),
    ('Yoga for Beginners: Finding Your Flow', '2025-11-01 15:33:00', 'Yoga is a holistic practice that unites mind, body, and spirit. This beginner-friendly guide introduces basic yoga poses, breathing techniques, and the philosophy behind this ancient practice. Discover the transformative power of yoga for flexibility and inner peace.', 2, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=600&fit=crop'),
    ('Mental Health Awareness and Support', '2025-10-31 14:15:00', 'Mental health is as important as physical health. This article discusses common mental health challenges, warning signs to watch for, and available resources for support. Learn about therapy options and self-care strategies. Breaking the stigma starts here.', 7, 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&h=600&fit=crop'),
    -- Travel (5 articles)
    ('Travel Adventures in Asia', '2025-10-30 11:20:00', 'Asia is a continent of incredible diversity, from bustling cities to serene temples, from tropical beaches to snow-capped mountains. Join me on a journey through fascinating destinations. We will explore hidden gems, taste exotic cuisines, and immerse in rich cultures.', 5, 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop'),
    ('Mountain Hiking: A Beginner''s Guide', '2025-10-31 12:05:00', 'Mountain hiking offers breathtaking views and physical challenges. This guide covers choosing equipment, planning routes, and staying safe on trails. Learn about altitude sickness prevention, weather preparation, and Leave No Trace principles.', 4, 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&h=600&fit=crop'),
    ('European Road Trip Essentials', '2025-10-31 10:45:00', 'Planning a road trip across Europe? This comprehensive guide covers route planning, must-visit destinations, accommodation options, and cultural etiquette. Discover hidden gems off the beaten path and learn about international driving requirements.', 10, 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=600&fit=crop'),
    ('Street Food Around the World', '2025-10-30 09:36:00', 'Street food offers an authentic taste of local culture without breaking the bank. This culinary journey takes you from Bangkok night markets to Mexico City taquerías, from Mumbai chaat stalls to Istanbul kebab shops. Your passport to global flavors!', 6, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=600&fit=crop'),
    ('Budget Travel: See More, Spend Less', '2025-11-01 11:47:00', 'Traveling on a budget does not mean sacrificing experiences. This practical guide shares strategies for finding cheap flights, affordable accommodations, and free attractions. Learn about house-sitting, work exchange programs, and off-season travel benefits.', 8, 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&h=600&fit=crop'),
    -- Lifestyle (5 articles)
    ('Cooking Basics: From Kitchen to Table', '2025-10-27 18:40:00', 'Cooking is a life skill everyone should master. This beginner-friendly guide covers essential cooking techniques, must-have kitchen tools, and simple recipes that will boost your confidence. Learn to prepare delicious meals from scratch and develop your culinary style.', 8, 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&h=600&fit=crop'),
    ('Home Décor: Creating Your Perfect Space', '2025-10-28 14:55:00', 'Your home should be a reflection of your personality and a sanctuary from the outside world. This article provides practical tips for interior design, from choosing color schemes to arranging furniture and selecting decorative elements.', 7, 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=1200&h=600&fit=crop'),
    ('Minimalist Living: Less is More', '2025-10-27 13:20:00', 'Minimalism is about intentionally choosing what adds value to your life. This article explores minimalist living principles, from decluttering your space to simplifying your schedule and finances. Learn how reducing clutter can lead to greater freedom and happiness.', 3, 'https://images.unsplash.com/photo-1564510182791-29645da7fac4?w=1200&h=600&fit=crop'),
    ('Organic Gardening: Growing Your Own Food', '2025-10-29 08:42:00', 'Growing your own food is rewarding, sustainable, and healthier than store-bought produce. This guide covers soil preparation, choosing the right plants, natural pest control, and harvesting tips. Even with limited space, you can enjoy fresh homegrown vegetables.', 2, 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&h=600&fit=crop'),
    ('Coffee Culture: From Bean to Cup', '2025-10-28 08:30:00', 'Coffee is more than a morning ritual; it is a global culture. This article explores coffee origins, different brewing methods, latte art, and the rise of specialty coffee shops. Learn to appreciate the craftsmanship behind your daily cup of joe.', 6, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&h=600&fit=crop'),
    -- News (4 articles)
    ('Breaking News: Climate Summit Outcomes', '2025-10-29 13:28:00', 'World leaders gathered at the latest climate summit to discuss urgent environmental challenges and commit to new sustainability goals. This article breaks down key agreements, country pledges, and what they mean for our planet future.', 8, 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1200&h=600&fit=crop'),
    ('The Rise of Electric Vehicles', '2025-10-27 16:29:00', 'Electric vehicles are transforming the automotive industry. This article examines the latest EV technology, charging infrastructure development, and government incentives. We compare popular models and discuss environmental benefits.', 9, 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1200&h=600&fit=crop'),
    ('Economic Forecast: What to Expect', '2025-10-31 17:04:00', 'Understanding economic trends is crucial for making informed financial decisions. This analysis examines current economic indicators, central bank policies, and inflation trends. We discuss potential scenarios for employment, housing markets, and global trade.', 4, 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=600&fit=crop'),
    ('Digital Privacy in 2025: What You Need to Know', '2025-10-30 14:20:00', 'As technology advances, protecting your digital privacy becomes increasingly important. This article examines new privacy regulations, data collection practices by tech companies, and practical steps you can take to safeguard your personal information online.', 3, 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=1200&h=600&fit=crop');

-- Dummy comments data
INSERT INTO Comments (date, content, userId, articleId, parentCommentId) VALUES
    -- Original comments for Article 1
    ('2024-01-01 12:00:00', 'Great article!', 3, 1, NULL),
    ('2024-01-01 12:30:00', 'Thanks for sharing.', 4, 1, NULL),
    ('2024-01-02 13:00:00', 'Interesting read.', 5, 1, 1),
    ('2024-01-02 13:15:00', 'I learned a lot.', 6, 1, 2),
    ('2024-01-03 15:00:00', 'Well written!', 7, 1, 3),
    ('2024-01-03 15:20:00', 'Looking forward to more.', 8, 1, 3),
    ('2024-01-04 10:30:00', 'Nice insights.', 9, 1, 5),
    ('2024-01-04 10:45:00', 'Appreciate the info.', 10, 1, 4),
    ('2024-01-05 17:00:00', 'Very helpful.', 2, 1, NULL),
    ('2024-01-05 17:15:00', 'Good job!', 3, 1, 2),
    ('2024-01-06 14:30:00', 'Excellent article.', 4, 1, 10),
    ('2024-01-06 14:45:00', 'Keep it up!', 5, 1, 11),
    ('2024-01-07 16:00:00', 'Loved it!', 6, 1, 10),
    ('2024-01-07 16:20:00', 'Very informative.', 7, 1, 12),
    ('2024-01-08 13:30:00', 'Great insights.', 8, 1, 11),
    -- New comments for articles 11-30 (randomly distributed)
    -- Article 11: Mountain Hiking
    ('2024-01-11 10:00:00', 'This guide is exactly what I needed!', 4, 11, NULL),
    ('2024-01-11 11:30:00', 'Can''t wait to try these tips on my next hike.', 6, 11, NULL),
    -- Article 12: Meditation
    ('2024-01-12 14:00:00', 'Meditation has changed my life.', 3, 12, NULL),
    ('2024-01-12 15:00:00', 'Great introduction for beginners!', 7, 12, NULL),
    ('2024-01-12 16:00:00', 'I agree! Very accessible.', 9, 12, 2),
    -- Article 13: Cloud Computing
    ('2024-01-13 12:00:00', 'Excellent explanation of cloud concepts.', 5, 13, NULL),
    -- Article 15: Climate Summit
    ('2024-01-15 14:00:00', 'Important coverage of this critical issue.', 4, 15, NULL),
    ('2024-01-15 15:00:00', 'We need more action, not just talk.', 8, 15, NULL),
    -- Article 16: Mobile App Development
    ('2024-01-16 16:00:00', 'Flutter or React Native? Hard choice!', 6, 16, NULL),
    ('2024-01-16 17:00:00', 'I prefer React Native personally.', 10, 16, 1),
    -- Article 18: Yoga
    ('2024-01-18 18:00:00', 'Yoga has been amazing for my flexibility.', 5, 18, NULL),
    ('2024-01-18 19:00:00', 'Which style would you recommend for stress relief?', 7, 18, NULL),
    ('2024-01-18 20:00:00', 'Try Yin Yoga or Restorative Yoga!', 9, 18, 2),
    -- Article 20: Tech Giants
    ('2024-01-20 19:00:00', 'Fascinating market analysis.', 3, 20, NULL),
    -- Article 21: Cybersecurity
    ('2024-01-21 20:00:00', 'Everyone should read this!', 4, 21, NULL),
    ('2024-01-21 21:00:00', 'Added 2FA to all my accounts after reading this.', 8, 21, NULL),
    -- Article 23: Mental Health
    ('2024-01-23 12:00:00', 'Thank you for addressing this important topic.', 6, 23, NULL),
    ('2024-01-23 13:00:00', 'Mental health matters. Let''s keep talking about it.', 9, 23, NULL),
    -- Article 25: Electric Vehicles
    ('2024-01-25 14:00:00', 'Just bought my first EV!', 5, 25, NULL),
    ('2024-01-25 15:00:00', 'How is the charging experience?', 7, 25, 1),
    ('2024-01-25 16:00:00', 'Much easier than I expected!', 5, 25, 2),
    -- Article 27: Organic Gardening
    ('2024-01-27 16:00:00', 'Started my first garden this year!', 4, 27, NULL),
    -- Article 30: Machine Learning
    ('2024-01-30 19:00:00', 'Clear explanation for non-technical readers.', 6, 30, NULL),
    ('2024-01-30 20:00:00', 'Are there any free courses you recommend?', 8, 30, NULL),
    ('2024-01-30 21:00:00', 'Check out Coursera and fast.ai!', 10, 30, 2);

-- Dummy images data
INSERT INTO Images (url) VALUES
    ('http://example.com/image1.jpg'),
    ('http://example.com/image2.jpg'),
    ('http://example.com/image3.jpg'),
    ('http://example.com/image4.jpg'),
    ('http://example.com/image5.jpg');

-- Dummy article-image relations with THEMED Unsplash images
-- Article content images (6 images per article, matching article themes)
INSERT INTO ArticleImg (articleId, imgUrl) VALUES
    -- Technology Articles (1-4)
    -- Article 1: Web Development
    (1, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop'),
    (1, 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop'),
    (1, 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop'),
    (1, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop'),
    (1, 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=600&fit=crop'),
    (1, 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=600&fit=crop'),
    -- Article 2: Cloud Computing
    (2, 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=600&fit=crop'),
    (2, 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop'),
    (2, 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop'),
    (2, 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&h=600&fit=crop'),
    (2, 'https://images.unsplash.com/photo-1560732488-6b0df240254a?w=800&h=600&fit=crop'),
    (2, 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=800&h=600&fit=crop'),
    -- Article 3: Cybersecurity
    (3, 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=600&fit=crop'),
    (3, 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop'),
    (3, 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=600&fit=crop'),
    (3, 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop'),
    (3, 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop'),
    (3, 'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=800&h=600&fit=crop'),
    -- Article 4: Machine Learning
    (4, 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=800&h=600&fit=crop'),
    (4, 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=600&fit=crop'),
    (4, 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop'),
    (4, 'https://images.unsplash.com/photo-1507146153580-69a1fe6d8aa1?w=800&h=600&fit=crop'),
    (4, 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=800&h=600&fit=crop'),
    (4, 'https://images.unsplash.com/photo-1535378620166-273708d44e4c?w=800&h=600&fit=crop'),
    -- Entertainment Articles (5-11)
    -- Article 5: Photography
    (5, 'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=800&h=600&fit=crop'),
    (5, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop'),
    (5, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop'),
    (5, 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&h=600&fit=crop'),
    (5, 'https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=800&h=600&fit=crop'),
    (5, 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=800&h=600&fit=crop'),
    -- Article 6: Film Industry
    (6, 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=600&fit=crop'),
    (6, 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600&fit=crop'),
    (6, 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=600&fit=crop'),
    (6, 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=600&fit=crop'),
    (6, 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=800&h=600&fit=crop'),
    (6, 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&h=600&fit=crop'),
    -- Article 7: Podcasting
    (7, 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&h=600&fit=crop'),
    (7, 'https://images.unsplash.com/photo-1590005354167-6da97870c757?w=800&h=600&fit=crop'),
    (7, 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=800&h=600&fit=crop'),
    (7, 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=600&fit=crop'),
    (7, 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=600&fit=crop'),
    (7, 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=600&fit=crop'),
    -- Article 8: Music Festivals
    (8, 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop'),
    (8, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop'),
    (8, 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=600&fit=crop'),
    (8, 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop'),
    (8, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop'),
    (8, 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop'),
    -- Article 9: Video Game Design
    (9, 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop'),
    (9, 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop'),
    (9, 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&h=600&fit=crop'),
    (9, 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=800&h=600&fit=crop'),
    (9, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop'),
    (9, 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800&h=600&fit=crop'),
    -- Article 10: Stand-Up Comedy
    (10, 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&h=600&fit=crop'),
    (10, 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop'),
    (10, 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=600&fit=crop'),
    (10, 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop'),
    (10, 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=800&h=600&fit=crop'),
    (10, 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600&fit=crop'),
    -- Article 11: Streaming Culture
    (11, 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&h=600&fit=crop'),
    (11, 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop'),
    (11, 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=600&fit=crop'),
    (11, 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop'),
    (11, 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&h=600&fit=crop'),
    (11, 'https://images.unsplash.com/photo-1584907797015-7554cd315667?w=800&h=600&fit=crop'),
    -- Health Articles (12-16)
    -- Article 12: Healthy Living
    (12, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop'),
    (12, 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&h=600&fit=crop'),
    (12, 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=600&fit=crop'),
    (12, 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&h=600&fit=crop'),
    (12, 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&h=600&fit=crop'),
    (12, 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800&h=600&fit=crop'),
    -- Article 13: Fitness Journey
    (13, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop'),
    (13, 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop'),
    (13, 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&h=600&fit=crop'),
    (13, 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&h=600&fit=crop'),
    (13, 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&h=600&fit=crop'),
    (13, 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop'),
    -- Article 14: Meditation
    (14, 'https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?w=800&h=600&fit=crop'),
    (14, 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&h=600&fit=crop'),
    (14, 'https://images.unsplash.com/photo-1603468620905-8de7d86b781e?w=800&h=600&fit=crop'),
    (14, 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&h=600&fit=crop'),
    (14, 'https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?w=800&h=600&fit=crop'),
    (14, 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&h=600&fit=crop'),
    -- Article 15: Yoga
    (15, 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop'),
    (15, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop'),
    (15, 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&h=600&fit=crop'),
    (15, 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&h=600&fit=crop'),
    (15, 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800&h=600&fit=crop'),
    (15, 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800&h=600&fit=crop'),
    -- Article 16: Mental Health
    (16, 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&h=600&fit=crop'),
    (16, 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&h=600&fit=crop'),
    (16, 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800&h=600&fit=crop'),
    (16, 'https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?w=800&h=600&fit=crop'),
    (16, 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop'),
    (16, 'https://images.unsplash.com/photo-1494959764136-6be9eb3c261e?w=800&h=600&fit=crop'),
    -- Travel Articles (17-21)
    -- Article 17: Travel Asia
    (17, 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=600&fit=crop'),
    (17, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'),
    (17, 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&h=600&fit=crop'),
    (17, 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop'),
    (17, 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800&h=600&fit=crop'),
    (17, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop'),
    -- Article 18: Mountain Hiking
    (18, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop'),
    (18, 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&h=600&fit=crop'),
    (18, 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=600&fit=crop'),
    (18, 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&h=600&fit=crop'),
    (18, 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&h=600&fit=crop'),
    (18, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'),
    -- Article 19: European Road Trip
    (19, 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop'),
    (19, 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&h=600&fit=crop'),
    (19, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop'),
    (19, 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop'),
    (19, 'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=800&h=600&fit=crop'),
    (19, 'https://images.unsplash.com/photo-1520106212299-d99c443e4568?w=800&h=600&fit=crop'),
    -- Article 20: Street Food
    (20, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop'),
    (20, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop'),
    (20, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop'),
    (20, 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&h=600&fit=crop'),
    (20, 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&h=600&fit=crop'),
    (20, 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop'),
    -- Article 21: Budget Travel
    (21, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop'),
    (21, 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&h=600&fit=crop'),
    (21, 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&h=600&fit=crop'),
    (21, 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop'),
    (21, 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop'),
    (21, 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&h=600&fit=crop'),
    -- Lifestyle Articles (22-26)
    -- Article 22: Cooking
    (22, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop'),
    (22, 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&h=600&fit=crop'),
    (22, 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=600&fit=crop'),
    (22, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop'),
    (22, 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop'),
    (22, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop'),
    -- Article 23: Home Decor
    (23, 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop'),
    (23, 'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800&h=600&fit=crop'),
    (23, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'),
    (23, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop'),
    (23, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop'),
    (23, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=600&fit=crop'),
    -- Article 24: Minimalist Living
    (24, 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&h=600&fit=crop'),
    (24, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop'),
    (24, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'),
    (24, 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&h=600&fit=crop'),
    (24, 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop'),
    (24, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop'),
    -- Article 25: Organic Gardening
    (25, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop'),
    (25, 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&h=600&fit=crop'),
    (25, 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=600&fit=crop'),
    (25, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop'),
    (25, 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&h=600&fit=crop'),
    (25, 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop'),
    -- Article 26: Coffee Culture
    (26, 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=600&fit=crop'),
    (26, 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&h=600&fit=crop'),
    (26, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop'),
    (26, 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&h=600&fit=crop'),
    (26, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&h=600&fit=crop'),
    (26, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=600&fit=crop'),
    -- News Articles (27-30)
    -- Article 27: Climate Summit
    (27, 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=600&fit=crop'),
    (27, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'),
    (27, 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800&h=600&fit=crop'),
    (27, 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop'),
    (27, 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=600&fit=crop'),
    (27, 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=600&fit=crop'),
    -- Article 28: Electric Vehicles
    (28, 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=600&fit=crop'),
    (28, 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&h=600&fit=crop'),
    (28, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop'),
    (28, 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop'),
    (28, 'https://images.unsplash.com/photo-1601935111741-ae98b2b230b0?w=800&h=600&fit=crop'),
    (28, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop'),
    -- Article 29: Economic Forecast
    (29, 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop'),
    (29, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'),
    (29, 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop'),
    (29, 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=600&fit=crop'),
    (29, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop'),
    (29, 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop'),
    -- Article 30: Digital Privacy
    (30, 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&h=600&fit=crop'),
    (30, 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop'),
    (30, 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=600&fit=crop'),
    (30, 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=600&fit=crop'),
    (30, 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop'),
    (30, 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=800&h=600&fit=crop');

-- Dummy article-like relations (multiple likes per article)
INSERT INTO ArticleLike (articleId, userId) VALUES
    -- Article 1: Web Development (8 likes)
    (1, 3),
    (1, 4),
    (1, 5),
    (1, 6),
    (1, 7),
    (1, 8),
    (1, 9),
    (1, 10),
    -- Article 2: Photography (7 likes)
    (2, 2),
    (2, 4),
    (2, 5),
    (2, 6),
    (2, 8),
    (2, 9),
    (2, 10),
    -- Article 3: Healthy Living (9 likes)
    (3, 2),
    (3, 3),
    (3, 4),
    (3, 5),
    (3, 6),
    (3, 7),
    (3, 8),
    (3, 9),
    (3, 10),
    -- Article 4: Travel (6 likes)
    (4, 2),
    (4, 3),
    (4, 5),
    (4, 7),
    (4, 9),
    (4, 10),
    -- Article 5: JavaScript (10 likes - most popular!)
    (5, 2),
    (5, 3),
    (5, 4),
    (5, 5),
    (5, 6),
    (5, 7),
    (5, 8),
    (5, 9),
    (5, 10),
    (5, 1),
    -- Article 6: AI (8 likes)
    (6, 2),
    (6, 3),
    (6, 4),
    (6, 5),
    (6, 7),
    (6, 8),
    (6, 9),
    (6, 10),
    -- Article 7: Cooking (5 likes)
    (7, 3),
    (7, 4),
    (7, 6),
    (7, 8),
    (7, 10),
    -- Article 8: Sustainable Living (7 likes)
    (8, 2),
    (8, 3),
    (8, 5),
    (8, 6),
    (8, 7),
    (8, 9),
    (8, 10),
    -- Article 9: Fitness (6 likes)
    (9, 3),
    (9, 4),
    (9, 5),
    (9, 7),
    (9, 8),
    (9, 10),
    -- Article 10: Digital Marketing (9 likes)
    (10, 2),
    (10, 3),
    (10, 4),
    (10, 5),
    (10, 6),
    (10, 7),
    (10, 8),
    (10, 9),
    (10, 10),
    -- Article 11-30: Random likes
    -- Article 11: Mountain Hiking (4 likes)
    (11, 3),
    (11, 5),
    (11, 7),
    (11, 9),
    -- Article 12: Meditation (7 likes)
    (12, 2),
    (12, 4),
    (12, 5),
    (12, 6),
    (12, 8),
    (12, 9),
    (12, 10),
    -- Article 13: Cloud Computing (5 likes)
    (13, 2),
    (13, 3),
    (13, 6),
    (13, 8),
    (13, 10),
    -- Article 14: Home Décor (3 likes)
    (14, 4),
    (14, 7),
    (14, 9),
    -- Article 15: Climate Summit (8 likes)
    (15, 2),
    (15, 3),
    (15, 4),
    (15, 5),
    (15, 7),
    (15, 8),
    (15, 9),
    (15, 10),
    -- Article 16: Mobile App Dev (6 likes)
    (16, 3),
    (16, 4),
    (16, 5),
    (16, 7),
    (16, 9),
    (16, 10),
    -- Article 17: European Road Trip (5 likes)
    (17, 2),
    (17, 5),
    (17, 6),
    (17, 8),
    (17, 10),
    -- Article 18: Yoga (9 likes)
    (18, 2),
    (18, 3),
    (18, 4),
    (18, 5),
    (18, 6),
    (18, 7),
    (18, 9),
    (18, 10),
    (18, 1),
    -- Article 19: Minimalist Living (4 likes)
    (19, 3),
    (19, 6),
    (19, 8),
    (19, 10),
    -- Article 20: Tech Giants (7 likes)
    (20, 2),
    (20, 4),
    (20, 5),
    (20, 6),
    (20, 7),
    (20, 9),
    (20, 10),
    -- Article 21: Cybersecurity (6 likes)
    (21, 2),
    (21, 3),
    (21, 5),
    (21, 7),
    (21, 8),
    (21, 10),
    -- Article 22: Street Food (5 likes)
    (22, 4),
    (22, 5),
    (22, 7),
    (22, 9),
    (22, 10),
    -- Article 23: Mental Health (8 likes)
    (23, 2),
    (23, 3),
    (23, 4),
    (23, 6),
    (23, 7),
    (23, 8),
    (23, 9),
    (23, 10),
    -- Article 24: Budget Travel (4 likes)
    (24, 3),
    (24, 5),
    (24, 8),
    (24, 9),
    -- Article 25: Electric Vehicles (9 likes)
    (25, 2),
    (25, 3),
    (25, 4),
    (25, 5),
    (25, 6),
    (25, 7),
    (25, 9),
    (25, 10),
    (25, 1),
    -- Article 26: Podcasting (5 likes)
    (26, 4),
    (26, 5),
    (26, 7),
    (26, 8),
    (26, 10),
    -- Article 27: Organic Gardening (6 likes)
    (27, 2),
    (27, 4),
    (27, 6),
    (27, 7),
    (27, 9),
    (27, 10),
    -- Article 28: Film Industry (3 likes)
    (28, 3),
    (28, 6),
    (28, 8),
    -- Article 29: Economic Forecast (7 likes)
    (29, 2),
    (29, 3),
    (29, 5),
    (29, 6),
    (29, 8),
    (29, 9),
    (29, 10),
    -- Article 30: Machine Learning (10 likes - most popular!)
    (30, 2),
    (30, 3),
    (30, 4),
    (30, 5),
    (30, 6),
    (30, 7),
    (30, 8),
    (30, 9),
    (30, 10),
    (30, 1);

-- Article-tag relations
INSERT INTO ArticleTag (articleId, tag, color) VALUES
    -- Technology (4 articles): 1, 2, 3, 4
    (1, 'Technology', 'blue'),      -- Article 1: Web Development
    (2, 'Technology', 'blue'),      -- Article 2: Cloud Computing
    (3, 'Technology', 'blue'),      -- Article 3: Cybersecurity
    (4, 'Technology', 'blue'),      -- Article 4: Machine Learning
    -- Entertainment (7 articles): 5, 6, 7, 8, 9, 10, 11
    (5, 'Entertainment', 'pink'),   -- Article 5: Photography
    (6, 'Entertainment', 'pink'),   -- Article 6: Film Industry
    (7, 'Entertainment', 'pink'),   -- Article 7: Podcasting
    (8, 'Entertainment', 'pink'),   -- Article 8: Music Festivals
    (9, 'Entertainment', 'pink'),   -- Article 9: Video Game Design
    (10, 'Entertainment', 'pink'),  -- Article 10: Stand-Up Comedy
    (11, 'Entertainment', 'pink'),  -- Article 11: Streaming Culture
    -- Health (5 articles): 12, 13, 14, 15, 16
    (12, 'Health', 'red'),          -- Article 12: Healthy Living
    (13, 'Health', 'red'),          -- Article 13: Fitness Journey
    (14, 'Health', 'red'),          -- Article 14: Meditation
    (15, 'Health', 'red'),          -- Article 15: Yoga
    (16, 'Health', 'red'),          -- Article 16: Mental Health
    -- Travel (5 articles): 17, 18, 19, 20, 21
    (17, 'Travel', 'orange'),       -- Article 17: Travel Asia
    (18, 'Travel', 'orange'),       -- Article 18: Mountain Hiking
    (19, 'Travel', 'orange'),       -- Article 19: European Road Trip
    (20, 'Travel', 'orange'),       -- Article 20: Street Food
    (21, 'Travel', 'orange'),       -- Article 21: Budget Travel
    -- Lifestyle (5 articles): 22, 23, 24, 25, 26
    (22, 'Lifestyle', 'green'),     -- Article 22: Cooking
    (23, 'Lifestyle', 'green'),     -- Article 23: Home Decor
    (24, 'Lifestyle', 'green'),     -- Article 24: Minimalist Living
    (25, 'Lifestyle', 'green'),     -- Article 25: Organic Gardening
    (26, 'Lifestyle', 'green'),     -- Article 26: Coffee Culture
    -- News (4 articles): 27, 28, 29, 30
    (27, 'News', 'gray'),           -- Article 27: Climate Summit
    (28, 'News', 'gray'),           -- Article 28: Electric Vehicles
    (29, 'News', 'gray'),           -- Article 29: Economic Forecast
    (30, 'News', 'gray');           -- Article 30: Digital Privacy
