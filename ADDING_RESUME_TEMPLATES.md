# How to Add New Resume Templates

This guide explains how to add new resume templates to the resume builder.

## Quick Steps

1. **Add template definition** to `backend/src/module/resume-builder/seeds/templates.seed.ts`
2. **Run the seed command** to add it to the database
3. **Add thumbnail image** (optional but recommended)
4. **Test the template** in the resume builder

---

## Detailed Guide

### Step 1: Define Your Template

Open `backend/src/module/resume-builder/seeds/templates.seed.ts` and add a new template object to the `templates` array:

```typescript
{
  name: 'Your Template Name',           // Display name
  slug: 'your-template-slug',           // URL-friendly identifier (unique)
  description: 'Template description',   // Short description
  thumbnail: '/templates/your-template.png',  // Path to thumbnail image
  category: ResumeTemplateCategory.PROFESSIONAL,  // Category
  isPremium: false,                     // Free or premium
  
  layout: {
    columns: 1,                         // 1 or 2 columns
    headerStyle: 'centered',            // 'centered', 'left', or 'split'
    sections: [
      // Define which sections to include
      { 
        id: 'personal', 
        name: 'Personal Information', 
        type: 'personalInfo', 
        required: true, 
        defaultVisible: true 
      },
      { 
        id: 'summary', 
        name: 'Summary', 
        type: 'summary', 
        required: false, 
        defaultVisible: true 
      },
      // Add more sections...
    ],
  },
  
  styles: {
    // Colors
    primaryColor: '#1e40af',            // Main heading color
    secondaryColor: '#3b82f6',          // Subheading color
    textColor: '#1f2937',               // Body text color
    backgroundColor: '#ffffff',          // Background color
    accentColor: '#60a5fa',             // Link/accent color
    
    // Fonts
    fontFamily: {
      heading: 'Georgia, serif',        // Font for headings
      body: 'Arial, sans-serif',        // Font for body text
    },
    
    // Font Sizes
    fontSize: {
      name: '32px',                     // Name/title size
      sectionTitle: '18px',             // Section heading size
      body: '13px',                     // Body text size
      small: '11px',                    // Small text size
    },
    
    // Spacing
    spacing: {
      sectionGap: '28px',               // Space between sections
      itemGap: '14px',                  // Space between items
      padding: '48px',                  // Page padding
    },
    
    borderRadius: '0px',                // Border radius for elements
    lineHeight: '1.6',                  // Line height for text
  },
}
```

### Step 2: Template Configuration Options

#### **Categories** (ResumeTemplateCategory)
- `PROFESSIONAL` - Traditional corporate templates
- `CREATIVE` - Artistic, design-focused templates
- `MODERN` - Contemporary, trendy templates
- `MINIMAL` - Simple, clean templates
- `ACADEMIC` - For academic/research positions
- `TECHNICAL` - For tech/engineering roles

#### **Layout Options**

**Columns:**
- `1` - Single column layout
- `2` - Two column layout (with sidebar)

**Header Styles:**
- `'centered'` - Name and contact centered
- `'left'` - Name and contact left-aligned
- `'split'` - Name on left, contact on right

**Sidebar Position** (for 2-column layouts):
- `'left'` - Sidebar on left
- `'right'` - Sidebar on right

#### **Section Types**
Available section types:
- `'personalInfo'` - Contact information
- `'summary'` - Professional summary
- `'experience'` - Work experience
- `'education'` - Education history
- `'skills'` - Skills and competencies
- `'projects'` - Projects portfolio
- `'certifications'` - Certifications and licenses
- `'languages'` - Language proficiency
- `'achievements'` - Awards and achievements
- `'customSections'` - User-defined sections

### Step 3: Run the Seed Command

After adding your template, run the seed command to add it to the database:

```bash
# Navigate to backend directory
cd backend

# Run the seed command
npm run seed
# or
npx ts-node prisma/seed.ts
```

### Step 4: Add Thumbnail Image (Optional)

1. Create a thumbnail image (recommended size: 850px × 1100px - A4 ratio)
2. Save it to `frontend/public/templates/your-template.png`
3. The path in your template definition should match: `/templates/your-template.png`

**Tip:** You can use a screenshot of the template preview or create a mockup.

### Step 5: Test Your Template

1. Start your application
2. Go to Resume Builder → Create New
3. Your new template should appear in the gallery
4. Select it and create a test resume
5. Verify all sections render correctly
6. Test the PDF download

---

## Template Examples

### Example 1: Simple One-Column Template

```typescript
{
  name: 'Basic Professional',
  slug: 'basic-professional',
  description: 'A simple, professional template for any job application.',
  thumbnail: '/templates/basic-professional.png',
  category: ResumeTemplateCategory.PROFESSIONAL,
  isPremium: false,
  layout: {
    columns: 1,
    headerStyle: 'left',
    sections: [
      { id: 'personal', name: 'Contact', type: 'personalInfo', required: true, defaultVisible: true },
      { id: 'summary', name: 'Summary', type: 'summary', required: false, defaultVisible: true },
      { id: 'experience', name: 'Experience', type: 'experience', required: false, maxItems: 10, defaultVisible: true },
      { id: 'education', name: 'Education', type: 'education', required: false, maxItems: 5, defaultVisible: true },
      { id: 'skills', name: 'Skills', type: 'skills', required: false, defaultVisible: true },
    ],
  },
  styles: {
    primaryColor: '#000000',
    secondaryColor: '#333333',
    textColor: '#000000',
    backgroundColor: '#ffffff',
    accentColor: '#666666',
    fontFamily: {
      heading: 'Arial, sans-serif',
      body: 'Arial, sans-serif',
    },
    fontSize: {
      name: '24px',
      sectionTitle: '14px',
      body: '11px',
      small: '10px',
    },
    spacing: {
      sectionGap: '20px',
      itemGap: '10px',
      padding: '40px',
    },
    borderRadius: '0px',
    lineHeight: '1.5',
  },
}
```

### Example 2: Two-Column Creative Template

```typescript
{
  name: 'Creative Designer',
  slug: 'creative-designer',
  description: 'A bold, creative template for designers and artists.',
  thumbnail: '/templates/creative-designer.png',
  category: ResumeTemplateCategory.CREATIVE,
  isPremium: true,
  layout: {
    columns: 2,
    headerStyle: 'centered',
    sidebarPosition: 'left',
    sections: [
      { id: 'personal', name: 'Contact', type: 'personalInfo', required: true, defaultVisible: true },
      { id: 'skills', name: 'Skills', type: 'skills', required: false, defaultVisible: true },
      { id: 'summary', name: 'About', type: 'summary', required: false, defaultVisible: true },
      { id: 'experience', name: 'Experience', type: 'experience', required: false, maxItems: 8, defaultVisible: true },
      { id: 'projects', name: 'Portfolio', type: 'projects', required: false, maxItems: 6, defaultVisible: true },
      { id: 'education', name: 'Education', type: 'education', required: false, maxItems: 3, defaultVisible: true },
    ],
  },
  styles: {
    primaryColor: '#8b5cf6',
    secondaryColor: '#a78bfa',
    textColor: '#1f2937',
    backgroundColor: '#faf5ff',
    accentColor: '#c084fc',
    fontFamily: {
      heading: 'Playfair Display, serif',
      body: 'Nunito, sans-serif',
    },
    fontSize: {
      name: '36px',
      sectionTitle: '18px',
      body: '12px',
      small: '10px',
    },
    spacing: {
      sectionGap: '28px',
      itemGap: '14px',
      padding: '48px',
    },
    borderRadius: '8px',
    lineHeight: '1.7',
  },
}
```

---

## Tips for Creating Great Templates

### Design Tips:
1. **Keep it readable** - Use clear fonts and good contrast
2. **Balance white space** - Don't overcrowd the page
3. **Consistent spacing** - Use uniform gaps between sections
4. **Professional colors** - Avoid overly bright or distracting colors
5. **ATS-friendly** - Simple layouts work better with ATS systems

### Technical Tips:
1. **Test with real content** - Create a full resume to test the template
2. **Check PDF output** - Ensure it prints correctly
3. **Mobile preview** - Verify it looks good at different zoom levels
4. **Section order** - Put most important sections first
5. **Font availability** - Use web-safe fonts or system fonts

### Color Schemes:
- **Professional**: Blues, grays, blacks
- **Creative**: Purples, teals, warm colors
- **Modern**: Bold colors with good contrast
- **Minimal**: Black, white, one accent color
- **Academic**: Conservative colors (navy, burgundy)

---

## Troubleshooting

### Template not appearing?
- Check that the slug is unique
- Verify the seed command ran successfully
- Refresh the browser cache

### Styling issues?
- Check font names are correct
- Verify color codes are valid hex values
- Ensure spacing values include units (px, rem, etc.)

### PDF alignment problems?
- Test with different content lengths
- Adjust padding and spacing values
- Check that fonts are web-safe

---

## File Locations

- **Template definitions**: `backend/src/module/resume-builder/seeds/templates.seed.ts`
- **Seed script**: `backend/prisma/seed.ts`
- **Thumbnail images**: `frontend/public/templates/`
- **Template types**: `backend/src/module/resume-builder/resume.types.ts`

---

## Need Help?

If you encounter issues:
1. Check the console for errors
2. Verify your template definition matches the schema
3. Test with a simple template first
4. Review existing templates for reference

Happy template creating! 🎨
