"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { submitContactEnquiry } from "@/app/contact/actions";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  [key: string]: string;
}

const subjects = [
  "General Inquiry",
  "Buy a Car",
  "Sell a Car",
  "Finance",
  "Service",
  "Other",
] as const;

export default function ContactForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = "Please enter a valid email";
    if (!formData.phone.trim()) errs.phone = "Phone number is required";
    if (!formData.subject) errs.subject = "Please select a subject";
    if (!formData.message.trim()) errs.message = "Message is required";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const result = await submitContactEnquiry({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      subject: formData.subject,
      message: formData.message.trim(),
    });

    if (result.error) {
      setSubmitting(false);
      setSubmitError(result.error);
      return;
    }

    // Hand the name off via sessionStorage so it never appears in the URL,
    // then navigate to the dedicated confirmation page (a stable URL used for
    // Google Ads conversion tracking). Keep the button disabled meanwhile.
    sessionStorage.setItem("contactName", formData.name.trim());
    router.push("/contact/thank-you");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input
        label="Name *"
        name="name"
        placeholder="John Smith"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
      />
      <Input
        label="Email *"
        name="email"
        type="email"
        placeholder="john@example.co.nz"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
      />
      <Input
        label="Phone *"
        name="phone"
        type="tel"
        placeholder="021 123 4567"
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
      />
      <Select
        label="Subject *"
        name="subject"
        value={formData.subject}
        onChange={handleChange}
        error={errors.subject}
      >
        <option value="">Select a subject</option>
        {subjects.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>
      <Textarea
        label="Message *"
        name="message"
        placeholder="How can we help you?"
        value={formData.message}
        onChange={handleChange}
        error={errors.message}
      />
      {submitError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {submitError}
        </div>
      )}
      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? "Sending..." : "Send Message"}
        </Button>
      </div>
    </form>
  );
}
