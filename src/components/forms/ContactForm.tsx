"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

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
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-green-800">Message Sent!</h3>
        <p className="mt-2 text-green-700">
          Thank you, {formData.name}. We have received your message and will get
          back to you within one business day.
        </p>
      </div>
    );
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
      <div className="pt-2">
        <Button type="submit" size="lg" className="w-full">
          Send Message
        </Button>
      </div>
    </form>
  );
}
