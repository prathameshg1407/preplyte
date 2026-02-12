# Personalized Learning Roadmap

An AI-powered feature that creates customized learning paths based on user interests, skill levels, and career goals.

## Features

### 🎯 Smart Assessment System
- **Multi-step Assessment**: 6-step questionnaire covering interests, skills, goals, time commitment, and learning preferences
- **Interest Selection**: Choose from 8 tech domains (Web Dev, Mobile, Data Science, AI/ML, etc.)
- **Skill Level Evaluation**: From complete beginner to advanced developer
- **Goal-oriented Planning**: Career switch, job hunting, freelancing, skill upgrade, etc.
- **Time-based Customization**: Roadmaps adapt to available study time (5-40+ hours/week)
- **Learning Style Preferences**: Video tutorials, hands-on projects, reading, or interactive coding

### 🗺️ Dynamic Roadmap Generation
- **Personalized Curriculum**: AI-generated learning paths based on assessment results
- **Step-by-step Structure**: Organized learning phases with clear progression
- **Prerequisite Management**: Logical course sequencing and dependency tracking
- **Multiple Content Types**: Courses, projects, and practice exercises
- **Skill Mapping**: Clear skill outcomes for each learning phase
- **Milestone Tracking**: Achievement markers throughout the journey

### 📊 Progress Tracking
- **Visual Progress Bars**: Track completion across the entire roadmap
- **Step Completion**: Mark individual steps and courses as completed
- **Milestone Achievements**: Celebrate key learning milestones
- **Time Estimates**: Realistic duration expectations for each phase
- **Difficulty Indicators**: Clear labeling of beginner/intermediate/advanced content

## Sample Roadmaps

### Full-Stack Web Developer (6-8 months)
1. **Frontend Fundamentals** (4-6 weeks)
   - HTML & CSS Masterclass
   - JavaScript Fundamentals
   - Build Your First Portfolio

2. **Modern Frontend Framework** (6-8 weeks)
   - React.js Complete Guide
   - Advanced React Hooks
   - Build E-commerce App

3. **Backend Development** (6-8 weeks)
   - Node.js & Express.js
   - MongoDB & Database Design
   - Build REST API

4. **Full-Stack Integration** (4-6 weeks)
   - Full-Stack MERN Project
   - Deployment & DevOps
   - Testing & Quality Assurance

### Data Science Path (4-6 months)
1. **Python Programming Fundamentals**
2. **Statistics and Mathematics**
3. **Data Analysis with Pandas**
4. **Machine Learning Basics**
5. **Advanced ML and Deep Learning**

## Components

### 1. RoadmapAssessment (`roadmap-assessment.tsx`)
- **Interactive Questionnaire**: Step-by-step assessment with progress tracking
- **Interest Selection**: Visual cards for different tech domains
- **Skill Level Evaluation**: Radio button selection with descriptions
- **Goal Setting**: Multiple goal selection (job hunting, career switch, etc.)
- **Time Commitment**: Weekly hour commitment selection
- **Learning Preferences**: Preferred learning methods
- **Review Summary**: Final review before roadmap generation

### 2. PersonalizedRoadmap (`personalized-roadmap.tsx`)
- **Roadmap Overview**: Title, description, duration, and difficulty
- **Progress Tracking**: Visual progress bars and completion status
- **Milestone Display**: Key achievement markers
- **Step Details**: Expandable sections with courses and skills
- **Course Management**: Individual course tracking and actions
- **Interactive Elements**: Mark steps complete, expand/collapse details

### 3. Main Roadmap Page (`/lms/roadmap/page.tsx`)
- **Assessment Flow**: Manages the complete assessment process
- **Roadmap Generation**: AI-powered roadmap creation logic
- **State Management**: Handles user profile and generated roadmap
- **Statistics Display**: Success rates and platform metrics

## User Flow

1. **Start Assessment**: User clicks "Create Roadmap" from LMS page
2. **Complete Questionnaire**: 6-step assessment covering all aspects
3. **Review Selections**: Summary of all choices before generation
4. **Generate Roadmap**: AI creates personalized learning path
5. **View Roadmap**: Interactive roadmap with progress tracking
6. **Start Learning**: Begin with first step and track progress
7. **Track Progress**: Mark steps complete and celebrate milestones

## Technical Features

### Assessment Logic
- **Progressive Disclosure**: One question at a time with validation
- **Smart Validation**: Ensures required selections before proceeding
- **Data Collection**: Comprehensive user profile building
- **Responsive Design**: Works on all device sizes

### Roadmap Generation
- **Rule-based AI**: Generates roadmaps based on assessment data
- **Content Mapping**: Maps interests to relevant courses and skills
- **Difficulty Progression**: Ensures logical skill building sequence
- **Time Estimation**: Realistic duration calculations

### Progress Management
- **Local State**: Client-side progress tracking
- **Visual Feedback**: Immediate UI updates on completion
- **Milestone Calculation**: Automatic m