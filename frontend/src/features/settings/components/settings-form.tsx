"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSettings, useUpdateSettings } from "../hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Settings, Building, UploadCloud } from "lucide-react";
import { applyFieldErrors } from "@/lib/apply-field-errors";

const settingsSchema = z.object({
  portal_name: z.string().min(2, "Portal name must be at least 2 characters.").max(255),
  company_name: z.string().min(2, "Company name must be at least 2 characters.").max(255),
  contact_email: z.string().email("Enter a valid email address."),
  contact_phone: z.string().min(5, "Contact number is too short.").max(100).nullable().or(z.literal("")),
  max_file_size: z.coerce.number().min(1, "Max file size must be at least 1MB.").max(500, "Maximum allowed limit is 500MB."),
  allowed_extensions: z.string().min(1, "Enter at least one extension (e.g. pdf,docx)."),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function SettingsForm() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      portal_name: "",
      company_name: "",
      contact_email: "",
      contact_phone: "",
      max_file_size: 20,
      allowed_extensions: "pdf,docx,zip",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        portal_name: settings.portal_name,
        company_name: settings.company_name,
        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone || "",
        max_file_size: settings.max_file_size,
        allowed_extensions: settings.allowed_extensions,
      });
    }
  }, [settings, form]);

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      ...values,
      contact_phone: values.contact_phone || null,
    };

    updateSettings.mutate(payload, {
      onError: (error) => {
        applyFieldErrors(error, form.setError);
        if (!error.isValidationError) {
          form.setError("root", { message: error.message });
        }
      },
    });
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-muted-foreground text-sm font-medium">Loading system configurations...</span>
      </div>
    );
  }

  const { errors } = form.formState;

  return (
    <form onSubmit={onSubmit} noValidate>
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="general" className="gap-1.5">
            <Settings className="size-3.5" />
            General System
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-1.5">
            <Building className="size-3.5" />
            Company & Contact
          </TabsTrigger>
          <TabsTrigger value="limits" className="gap-1.5">
            <UploadCloud className="size-3.5" />
            File Upload limits
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure the branding, name, and visual layout details of the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="set-portal-name">Application Portal Name</Label>
                <Input
                  id="set-portal-name"
                  placeholder="Prossignment Portal"
                  aria-invalid={Boolean(errors.portal_name)}
                  {...form.register("portal_name")}
                />
                {errors.portal_name && (
                  <p className="text-destructive text-xs" role="alert">
                    {errors.portal_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="set-company-name">Standard System Company Name</Label>
                <Input
                  id="set-company-name"
                  placeholder="Prossignment Inc."
                  aria-invalid={Boolean(errors.company_name)}
                  {...form.register("company_name")}
                />
                {errors.company_name && (
                  <p className="text-destructive text-xs" role="alert">
                    {errors.company_name.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company and Contact */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company & Contact Info</CardTitle>
              <CardDescription>
                Provide reference details for automated email signatures and invoicing contacts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="set-email">Support Contact Email Address</Label>
                <Input
                  id="set-email"
                  type="email"
                  placeholder="support@company.com"
                  aria-invalid={Boolean(errors.contact_email)}
                  {...form.register("contact_email")}
                />
                {errors.contact_email && (
                  <p className="text-destructive text-xs" role="alert">
                    {errors.contact_email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="set-phone">Support Contact Telephone Number</Label>
                <Input
                  id="set-phone"
                  placeholder="+92 300 1234567"
                  aria-invalid={Boolean(errors.contact_phone)}
                  {...form.register("contact_phone")}
                />
                {errors.contact_phone && (
                  <p className="text-destructive text-xs" role="alert">
                    {errors.contact_phone.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upload limits */}
        <TabsContent value="limits">
          <Card>
            <CardHeader>
              <CardTitle>File Upload Constraints</CardTitle>
              <CardDescription>
                Define safety rules for document attachments submitted by clients and writers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="set-max-size">Maximum File Size Limit (MB)</Label>
                <Input
                  id="set-max-size"
                  type="number"
                  placeholder="20"
                  aria-invalid={Boolean(errors.max_file_size)}
                  {...form.register("max_file_size")}
                />
                {errors.max_file_size && (
                  <p className="text-destructive text-xs" role="alert">
                    {errors.max_file_size.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="set-extensions">Allowed Formats / Extensions (Comma separated)</Label>
                <Input
                  id="set-extensions"
                  placeholder="pdf,docx,zip,png,jpg"
                  aria-invalid={Boolean(errors.allowed_extensions)}
                  {...form.register("allowed_extensions")}
                />
                {errors.allowed_extensions && (
                  <p className="text-destructive text-xs" role="alert">
                    {errors.allowed_extensions.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {errors.root && (
          <div
            className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
            role="alert"
          >
            {errors.root.message}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button type="submit" className="gap-1.5" disabled={updateSettings.isPending}>
            {updateSettings.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save Configuration
          </Button>
        </div>
      </Tabs>
    </form>
  );
}
