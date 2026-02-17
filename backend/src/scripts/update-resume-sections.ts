import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script to update existing resumes with missing sections
 * This ensures all resumes have the complete set of sections available
 */
async function updateResumeSections() {
  console.log('🔄 Starting resume sections update...\n');

  try {
    // Get all resumes
    const resumes = await prisma.userResume.findMany({
      include: {
        template: true,
      },
    });

    console.log(`Found ${resumes.length} resumes to check\n`);

    let updatedCount = 0;

    for (const resume of resumes) {
      const currentSectionOrder = resume.sectionOrder as string[];
      const currentHiddenSections = resume.hiddenSections as string[];
      
      // Define all standard sections
      const allSections = [
        'personalInfo',
        'summary',
        'experience',
        'education',
        'skills',
        'projects',
        'certifications',
        'achievements',
        'languages',
      ];

      // Get template's default visible sections
      const templateLayout = resume.template.layout as any;
      const templateSections = templateLayout.sections || [];
      const defaultVisibleSections = templateSections
        .filter((s: any) => s.defaultVisible)
        .map((s: any) => s.type);

      // Find missing sections
      const allExistingSections = [...currentSectionOrder, ...currentHiddenSections];
      const missingSections = allSections.filter(
        (section) => !allExistingSections.includes(section)
      );

      if (missingSections.length > 0) {
        console.log(`Resume: ${resume.title} (${resume.id})`);
        console.log(`  Template: ${resume.template.name}`);
        console.log(`  Missing sections: ${missingSections.join(', ')}`);

        // Determine which missing sections should be visible vs hidden
        const newVisibleSections: string[] = [];
        const newHiddenSections: string[] = [];

        missingSections.forEach((section) => {
          // Check if this section should be visible by default in the template
          if (defaultVisibleSections.includes(section)) {
            newVisibleSections.push(section);
          } else {
            newHiddenSections.push(section);
          }
        });

        // Update section order and hidden sections
        const updatedSectionOrder = [
          ...currentSectionOrder,
          ...newVisibleSections,
        ];
        const updatedHiddenSections = [
          ...currentHiddenSections,
          ...newHiddenSections,
        ];

        await prisma.userResume.update({
          where: { id: resume.id },
          data: {
            sectionOrder: updatedSectionOrder,
            hiddenSections: updatedHiddenSections,
          },
        });

        console.log(`  ✓ Added ${newVisibleSections.length} visible sections`);
        console.log(`  ✓ Added ${newHiddenSections.length} hidden sections`);
        console.log('');

        updatedCount++;
      }
    }

    console.log(`\n✅ Update complete!`);
    console.log(`   Total resumes checked: ${resumes.length}`);
    console.log(`   Resumes updated: ${updatedCount}`);
    console.log(`   Resumes already up-to-date: ${resumes.length - updatedCount}`);
  } catch (error) {
    console.error('❌ Error updating resume sections:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
updateResumeSections()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
