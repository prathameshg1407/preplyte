'use client';

import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Resume, CertificationItem } from '@/types/resume-builder.types';
import { useResumeStore } from '@/lib/store/resume-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Loader2,
  Save,
  Plus,
  Trash2,
  Award,
  Link,
  ExternalLink,
} from 'lucide-react';

const certificationItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Certification name is required').max(100),
  issuer: z.string().min(1, 'Issuer is required').max(100),
  date: z.string().min(1, 'Date is required'),
  expiryDate: z.string().optional().or(z.literal('')),
  credentialId: z.string().max(50).optional().or(z.literal('')),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

const certificationsFormSchema = z.object({
  certifications: z.array(certificationItemSchema).max(20),
});

type CertificationsFormData = z.infer<typeof certificationsFormSchema>;

interface CertificationsEditorProps {
  resume: Resume;
  onSave: (data: CertificationItem[]) => Promise<void>;
}

export function CertificationsEditor({ resume, onSave }: CertificationsEditorProps) {
  const { updateContent, isSaving } = useResumeStore();
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const defaultCertifications: CertificationItem[] = resume.content.certifications || [];

  const form = useForm<CertificationsFormData>({
    resolver: zodResolver(certificationsFormSchema),
    defaultValues: {
      certifications: defaultCertifications,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'certifications',
  });

  const addCertification = () => {
    append({
      id: uuidv4(),
      name: '',
      issuer: '',
      date: '',
      expiryDate: '',
      credentialId: '',
      url: '',
    });
  };

  const handleDelete = () => {
    if (deleteIndex !== null) {
      remove(deleteIndex);
      setDeleteIndex(null);
    }
  };

  const onSubmit = async (data: CertificationsFormData) => {
    const cleanedData = data.certifications.map((cert) => ({
      ...cert,
      expiryDate: cert.expiryDate || undefined,
      credentialId: cert.credentialId || undefined,
      url: cert.url || undefined,
    }));

    updateContent({ certifications: cleanedData });
    await onSave(cleanedData);
  };

  const popularCertifications = [
    { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services' },
    { name: 'Google Cloud Professional', issuer: 'Google Cloud' },
    { name: 'Microsoft Azure Administrator', issuer: 'Microsoft' },
    { name: 'Certified Kubernetes Administrator', issuer: 'CNCF' },
    { name: 'PMP', issuer: 'Project Management Institute' },
    { name: 'Scrum Master Certified', issuer: 'Scrum Alliance' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Certifications</h2>
          <p className="text-muted-foreground">
            Add your professional certifications and licenses
          </p>
        </div>
        <Button onClick={addCertification} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Certification
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {fields.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Award className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-semibold">No certifications added</h3>
                <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                  Add your professional certifications to validate your expertise
                </p>
                <Button onClick={addCertification} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Certification
                </Button>

                {/* Quick Add Popular Certifications */}
                <div className="mt-8 w-full max-w-md">
                  <p className="text-sm text-muted-foreground text-center mb-3">
                    Or quick add a popular certification:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {popularCertifications.slice(0, 4).map((cert) => (
                      <Button
                        key={cert.name}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          append({
                            id: uuidv4(),
                            name: cert.name,
                            issuer: cert.issuer,
                            date: '',
                            expiryDate: '',
                            credentialId: '',
                            url: '',
                          });
                        }}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        {cert.name.length > 20 ? `${cert.name.slice(0, 20)}...` : cert.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        <span className="font-medium">
                          {form.watch(`certifications.${index}.name`) || `Certification ${index + 1}`}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteIndex(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`certifications.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel>Certification Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="AWS Certified Solutions Architect" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`certifications.${index}.issuer`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Issuing Organization *</FormLabel>
                            <FormControl>
                              <Input placeholder="Amazon Web Services" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`certifications.${index}.credentialId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Credential ID</FormLabel>
                            <FormControl>
                              <Input placeholder="ABC123XYZ" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`certifications.${index}.date`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Issue Date *</FormLabel>
                            <FormControl>
                              <Input type="month" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`certifications.${index}.expiryDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Date</FormLabel>
                            <FormControl>
                              <Input type="month" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`certifications.${index}.url`}
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel className="flex items-center gap-2">
                              <Link className="h-4 w-4" />
                              Credential URL
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="https://credential.example.com/verify/..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {fields.length > 0 && (
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </Form>

      <AlertDialog open={deleteIndex !== null} onOpenChange={() => setDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Certification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this certification?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}