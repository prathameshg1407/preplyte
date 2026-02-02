// prisma/seeds/lms-seed.ts

import { PrismaClient, DifficultyLevel, LmsCourseStatus, LmsModule } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedLmsData() {
  console.log('Seeding LMS data...');

  // Create Categories
  const categories = await Promise.all([
    prisma.lmsCategory.upsert({
      where: { slug: 'web-development' },
      update: {},
      create: {
        name: 'Web Development',
        slug: 'web-development',
        description: 'Learn to build modern web applications',
        order: 1,
        isActive: true,
      },
    }),
    prisma.lmsCategory.upsert({
      where: { slug: 'programming' },
      update: {},
      create: {
        name: 'Programming',
        slug: 'programming',
        description: 'Master programming fundamentals and DSA',
        order: 2,
        isActive: true,
      },
    }),
    prisma.lmsCategory.upsert({
      where: { slug: 'data-science' },
      update: {},
      create: {
        name: 'Data Science',
        slug: 'data-science',
        description: 'Learn data analysis and machine learning',
        order: 3,
        isActive: true,
      },
    }),
  ]);

  // Create a sample course
  const course = await prisma.lmsCourse.upsert({
    where: { slug: 'complete-web-development-bootcamp' },
    update: {},
    create: {
      categoryId: categories[0].id,
      title: 'Complete Web Development Bootcamp',
      slug: 'complete-web-development-bootcamp',
      shortDescription: 'Master HTML, CSS, JavaScript, React, and Node.js',
      description: `
        <h2>What you'll learn</h2>
        <ul>
          <li>Build responsive websites with HTML5 and CSS3</li>
          <li>Master JavaScript fundamentals and ES6+</li>
          <li>Create React applications from scratch</li>
          <li>Build backend APIs with Node.js and Express</li>
          <li>Work with databases (MongoDB, PostgreSQL)</li>
        </ul>
        <h2>Course Description</h2>
        <p>This comprehensive bootcamp takes you from complete beginner to professional web developer. 
        You'll learn by building real projects and gain hands-on experience with industry-standard tools.</p>
      `,
      thumbnailUrl: '/images/courses/web-dev.jpg',
      totalModules: 5,
      totalTopics: 25,
      totalPoints: 1000,
      totalHours: 40,
      price: 2999,
      discountPrice: 1999,
      currency: 'INR',
      status: LmsCourseStatus.PUBLISHED,
      isActive: true,
      certificateEnabled: true,
      passingPercentage: 60,
      tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
      difficulty: DifficultyLevel.MEDIUM,
      instructor: 'John Doe',
      language: 'English',
      publishedAt: new Date(),
    },
  });

  // Create Modules
  const modulesData = [
    {
      title: 'HTML & CSS Fundamentals',
      shortDescription: 'Learn the building blocks of web pages. Topics include HTML structure, CSS styling, flexbox, and grid.',
      description: '<p>Master the fundamentals of web development starting with HTML and CSS.</p>',
      order: 1,
      totalTopics: 5,
      points: 200,
      estimatedMinutes: 480,
    },
    {
      title: 'JavaScript Essentials',
      shortDescription: 'Master JavaScript programming. Covers variables, functions, DOM manipulation, and async programming.',
      description: '<p>Learn JavaScript from basics to advanced concepts.</p>',
      order: 2,
      totalTopics: 5,
      points: 200,
      estimatedMinutes: 600,
    },
    {
      title: 'React Fundamentals',
      shortDescription: 'Build modern UIs with React. Learn components, hooks, state management, and routing.',
      description: '<p>Create dynamic user interfaces with React.</p>',
      order: 3,
      totalTopics: 5,
      points: 200,
      estimatedMinutes: 540,
    },
    {
      title: 'Node.js & Express',
      shortDescription: 'Build backend APIs with Node.js. Topics include REST APIs, middleware, authentication.',
      description: '<p>Server-side JavaScript with Node.js and Express.</p>',
      order: 4,
      totalTopics: 5,
      points: 200,
      estimatedMinutes: 480,
    },
    {
      title: 'Database & Deployment',
      shortDescription: 'Work with databases and deploy applications. Covers MongoDB, PostgreSQL, and cloud deployment.',
      description: '<p>Data persistence and application deployment.</p>',
      order: 5,
      totalTopics: 5,
      points: 200,
      estimatedMinutes: 420,
    },
  ];

  // FIX 1: Properly type the modules array
  const modules: LmsModule[] = [];
  
  for (const moduleData of modulesData) {
    const module = await prisma.lmsModule.upsert({
      where: {
        courseId_order: {
          courseId: course.id,
          order: moduleData.order,
        },
      },
      update: moduleData,
      create: {
        courseId: course.id,
        ...moduleData,
        isActive: true,
      },
    });
    modules.push(module);
  }

  // Create Topics for first module
  const module1Topics = [
    {
      title: 'Introduction to HTML',
      description: 'Learn what HTML is and how it structures web content',
      order: 1,
      theoryContent: `
        <h1>Introduction to HTML</h1>
        <p>HTML (HyperText Markup Language) is the standard markup language for creating web pages.</p>
        <h2>What is HTML?</h2>
        <p>HTML describes the structure of a web page using markup. HTML elements tell the browser how to display content.</p>
        <h2>Basic HTML Document Structure</h2>
        <pre><code>
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;title&gt;Page Title&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;h1&gt;My First Heading&lt;/h1&gt;
    &lt;p&gt;My first paragraph.&lt;/p&gt;
&lt;/body&gt;
&lt;/html&gt;
        </code></pre>
        <h2>Key Concepts</h2>
        <ul>
          <li>HTML elements are represented by tags</li>
          <li>Tags usually come in pairs (opening and closing)</li>
          <li>The DOCTYPE declaration defines the document type</li>
        </ul>
      `,
      videoUrl: 'https://example.com/videos/intro-html.mp4',
      videoDuration: 900,
      estimatedMinutes: 30,
    },
    {
      title: 'HTML Elements and Attributes',
      description: 'Deep dive into HTML elements and their attributes',
      order: 2,
      theoryContent: `
        <h1>HTML Elements and Attributes</h1>
        <p>HTML elements can have attributes that provide additional information about the element.</p>
        <h2>Common HTML Elements</h2>
        <ul>
          <li><strong>&lt;h1&gt; to &lt;h6&gt;</strong> - Headings</li>
          <li><strong>&lt;p&gt;</strong> - Paragraph</li>
          <li><strong>&lt;a&gt;</strong> - Links</li>
          <li><strong>&lt;img&gt;</strong> - Images</li>
          <li><strong>&lt;div&gt;</strong> - Division/Container</li>
        </ul>
        <h2>Attributes</h2>
        <p>Attributes provide additional information about HTML elements:</p>
        <pre><code>&lt;a href="https://example.com" target="_blank"&gt;Click me&lt;/a&gt;</code></pre>
      `,
      videoUrl: 'https://example.com/videos/html-elements.mp4',
      videoDuration: 1200,
      estimatedMinutes: 45,
    },
    {
      title: 'CSS Basics',
      description: 'Learn how to style HTML elements with CSS',
      order: 3,
      theoryContent: `
        <h1>CSS Basics</h1>
        <p>CSS (Cascading Style Sheets) describes how HTML elements should be displayed.</p>
        <h2>CSS Syntax</h2>
        <pre><code>
selector {
    property: value;
}
        </code></pre>
        <h2>Ways to Add CSS</h2>
        <ol>
          <li>Inline CSS - using the style attribute</li>
          <li>Internal CSS - using &lt;style&gt; tag in head</li>
          <li>External CSS - linking external .css file</li>
        </ol>
      `,
      videoUrl: 'https://example.com/videos/css-basics.mp4',
      videoDuration: 1500,
      estimatedMinutes: 50,
    },
    {
      title: 'CSS Flexbox',
      description: 'Master flexible box layout for responsive designs',
      order: 4,
      theoryContent: `
        <h1>CSS Flexbox</h1>
        <p>Flexbox is a one-dimensional layout method for arranging items in rows or columns.</p>
        <h2>Flex Container Properties</h2>
        <pre><code>
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
}
        </code></pre>
      `,
      videoUrl: 'https://example.com/videos/css-flexbox.mp4',
      videoDuration: 1800,
      estimatedMinutes: 60,
    },
    {
      title: 'CSS Grid',
      description: 'Build complex layouts with CSS Grid',
      order: 5,
      theoryContent: `
        <h1>CSS Grid</h1>
        <p>CSS Grid Layout is a two-dimensional layout system for the web.</p>
        <h2>Grid Container</h2>
        <pre><code>
.grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}
        </code></pre>
      `,
      videoUrl: 'https://example.com/videos/css-grid.mp4',
      videoDuration: 1800,
      estimatedMinutes: 60,
    },
  ];

  for (const topicData of module1Topics) {
    await prisma.lmsTopic.upsert({
      where: {
        moduleId_order: {
          moduleId: modules[0].id,
          order: topicData.order,
        },
      },
      update: topicData,
      create: {
        moduleId: modules[0].id,
        ...topicData,
        isActive: true,
      },
    });
  }

  // Create Module Test for first module
  const moduleTest = await prisma.lmsModuleTest.upsert({
    where: { moduleId: modules[0].id },
    update: {},
    create: {
      moduleId: modules[0].id,
      title: 'HTML & CSS Fundamentals Test',
      instructions: 'Answer all questions. You need 60% to pass. You have 3 attempts.',
      totalQuestions: 10,
      passingScore: 60,
      timeLimitMinutes: 20,
      maxAttempts: 3,
      pointsPerQuestion: 10,
      totalPoints: 100,
      isActive: true,
    },
  });

  // Create Test Questions
  const questionsData = [
    {
      questionText: 'What does HTML stand for?',
      order: 1,
      points: 10,
      options: [
        { text: 'Hyper Text Markup Language', isCorrect: true, order: 1 },
        { text: 'High Tech Modern Language', isCorrect: false, order: 2 },
        { text: 'Hyper Transfer Markup Language', isCorrect: false, order: 3 },
        { text: 'Home Tool Markup Language', isCorrect: false, order: 4 },
      ],
    },
    {
      questionText: 'Which HTML element is used for the largest heading?',
      order: 2,
      points: 10,
      options: [
        { text: '<h1>', isCorrect: true, order: 1 },
        { text: '<h6>', isCorrect: false, order: 2 },
        { text: '<heading>', isCorrect: false, order: 3 },
        { text: '<head>', isCorrect: false, order: 4 },
      ],
    },
    {
      questionText: 'What is the correct CSS syntax?',
      order: 3,
      points: 10,
      options: [
        { text: 'body {color: black;}', isCorrect: true, order: 1 },
        { text: '{body:color=black;}', isCorrect: false, order: 2 },
        { text: 'body:color=black;', isCorrect: false, order: 3 },
        { text: '{body;color:black}', isCorrect: false, order: 4 },
      ],
    },
    {
      questionText: 'Which property is used to change the background color?',
      order: 4,
      points: 10,
      options: [
        { text: 'background-color', isCorrect: true, order: 1 },
        { text: 'bgcolor', isCorrect: false, order: 2 },
        { text: 'color-background', isCorrect: false, order: 3 },
        { text: 'bg-color', isCorrect: false, order: 4 },
      ],
    },
    {
      questionText: 'How do you add a comment in CSS?',
      order: 5,
      points: 10,
      options: [
        { text: '/* this is a comment */', isCorrect: true, order: 1 },
        { text: '// this is a comment', isCorrect: false, order: 2 },
        { text: '<!-- this is a comment -->', isCorrect: false, order: 3 },
        { text: '# this is a comment', isCorrect: false, order: 4 },
      ],
    },
    {
      questionText: 'Which HTML attribute specifies an alternate text for an image?',
      order: 6,
      points: 10,
      options: [
        { text: 'alt', isCorrect: true, order: 1 },
        { text: 'title', isCorrect: false, order: 2 },
        { text: 'src', isCorrect: false, order: 3 },
        { text: 'description', isCorrect: false, order: 4 },
      ],
    },
    {
      questionText: 'Which CSS property controls the text size?',
      order: 7,
      points: 10,
      options: [
        { text: 'font-size', isCorrect: true, order: 1 },
        { text: 'text-size', isCorrect: false, order: 2 },
        { text: 'text-style', isCorrect: false, order: 3 },
        { text: 'font-style', isCorrect: false, order: 4 },
      ],
    },
    {
      questionText: 'What is the default value of the position property?',
      order: 8,
      points: 10,
      options: [
        { text: 'static', isCorrect: true, order: 1 },
        { text: 'relative', isCorrect: false, order: 2 },
        { text: 'absolute', isCorrect: false, order: 3 },
        { text: 'fixed', isCorrect: false, order: 4 },
      ],
    },
    {
      questionText: 'Which display value makes an element a flex container?',
      order: 9,
      points: 10,
      options: [
        { text: 'flex', isCorrect: true, order: 1 },
        { text: 'block', isCorrect: false, order: 2 },
        { text: 'inline', isCorrect: false, order: 3 },
        { text: 'flexbox', isCorrect: false, order: 4 },
      ],
    },
    {
      questionText: 'Which property is used to change the font of an element?',
      order: 10,
      points: 10,
      options: [
        { text: 'font-family', isCorrect: true, order: 1 },
        { text: 'font-style', isCorrect: false, order: 2 },
        { text: 'font-weight', isCorrect: false, order: 3 },
        { text: 'font-type', isCorrect: false, order: 4 },
      ],
    },
  ];

  // FIX 2: Use findFirst + create/update pattern instead of upsert for questions without unique constraints
  for (const questionData of questionsData) {
    const { options, ...questionFields } = questionData;

    // Find existing question or create new one
    let question = await prisma.lmsTestQuestion.findFirst({
      where: {
        moduleTestId: moduleTest.id,
        order: questionData.order,
      },
    });

    if (question) {
      question = await prisma.lmsTestQuestion.update({
        where: { id: question.id },
        data: questionFields,
      });
    } else {
      question = await prisma.lmsTestQuestion.create({
        data: {
          moduleTestId: moduleTest.id,
          ...questionFields,
          isActive: true,
        },
      });
    }

    // Create/update options
    for (const optionData of options) {
      const existingOption = await prisma.lmsTestOption.findFirst({
        where: {
          questionId: question.id,
          order: optionData.order,
        },
      });

      if (existingOption) {
        await prisma.lmsTestOption.update({
          where: { id: existingOption.id },
          data: optionData,
        });
      } else {
        await prisma.lmsTestOption.create({
          data: {
            questionId: question.id,
            ...optionData,
          },
        });
      }
    }
  }

  // Create Final Test
  const finalTest = await prisma.lmsFinalTest.upsert({
    where: { courseId: course.id },
    update: {},
    create: {
      courseId: course.id,
      title: 'Web Development Final Assessment',
      instructions: 'This is your final test. You only have ONE attempt. Make sure you are ready before starting.',
      totalQuestions: 20,
      passingScore: 60,
      timeLimitMinutes: 45,
      maxAttempts: 1,
      pointsPerQuestion: 10,
      totalPoints: 200,
      isActive: true,
    },
  });

  // Create Final Test Questions
  const finalTestQuestions = [
    {
      questionText: 'What is the purpose of the DOCTYPE declaration?',
      order: 1,
      points: 10,
      options: [
        { text: 'To define the document type and HTML version', isCorrect: true, order: 1 },
        { text: 'To link CSS files', isCorrect: false, order: 2 },
        { text: 'To define the page title', isCorrect: false, order: 3 },
        { text: 'To import JavaScript', isCorrect: false, order: 4 },
      ],
    },
    {
      questionText: 'Which CSS property is used to create space between elements?',
      order: 2,
      points: 10,
      options: [
        { text: 'margin', isCorrect: true, order: 1 },
        { text: 'spacing', isCorrect: false, order: 2 },
        { text: 'border', isCorrect: false, order: 3 },
        { text: 'gap-size', isCorrect: false, order: 4 },
      ],
    },
  ];

  // FIX 3: Same pattern for final test questions
  for (const questionData of finalTestQuestions) {
    const { options, ...questionFields } = questionData;

    let question = await prisma.lmsTestQuestion.findFirst({
      where: {
        finalTestId: finalTest.id,
        order: questionData.order,
      },
    });

    if (question) {
      question = await prisma.lmsTestQuestion.update({
        where: { id: question.id },
        data: questionFields,
      });
    } else {
      question = await prisma.lmsTestQuestion.create({
        data: {
          finalTestId: finalTest.id,
          ...questionFields,
          isActive: true,
        },
      });
    }

    for (const optionData of options) {
      const existingOption = await prisma.lmsTestOption.findFirst({
        where: {
          questionId: question.id,
          order: optionData.order,
        },
      });

      if (existingOption) {
        await prisma.lmsTestOption.update({
          where: { id: existingOption.id },
          data: optionData,
        });
      } else {
        await prisma.lmsTestOption.create({
          data: {
            questionId: question.id,
            ...optionData,
          },
        });
      }
    }
  }

  console.log('LMS seed data created successfully!');
}