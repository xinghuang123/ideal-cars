"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { carMakes, fuelTypes, transmissionTypes } from "@/data/makes";
import { submitSellCarEnquiry } from "@/app/sell/actions";

interface FormData {
  name: string;
  email: string;
  phone: string;
  make: string;
  model: string;
  year: string;
  mileage: string;
  fuelType: string;
  transmission: string;
  condition: string;
  description: string;
  expectedPrice: string;
}

interface FormErrors {
  [key: string]: string;
}

const currentYear = 2024;
const startYear = 2005;
const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) =>
  String(currentYear - i)
);

const conditions = ["Excellent", "Good", "Fair", "Poor"] as const;

export default function SellCarForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    make: "",
    model: "",
    year: "",
    mileage: "",
    fuelType: "",
    transmission: "",
    condition: "",
    description: "",
    expectedPrice: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
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
    if (!formData.make) errs.make = "Please select a make";
    if (!formData.model.trim()) errs.model = "Model is required";
    if (!formData.year) errs.year = "Please select a year";
    if (!formData.mileage.trim()) errs.mileage = "Mileage is required";
    else if (Number(formData.mileage) < 0)
      errs.mileage = "Mileage must be positive";
    if (!formData.fuelType) errs.fuelType = "Please select a fuel type";
    if (!formData.transmission)
      errs.transmission = "Please select a transmission";
    if (!formData.condition) errs.condition = "Please select a condition";
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

    const result = await submitSellCarEnquiry({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      make: formData.make,
      model: formData.model.trim(),
      year: Number(formData.year),
      mileage: Number(formData.mileage),
      fuelType: formData.fuelType,
      transmission: formData.transmission,
      condition: formData.condition,
      description: formData.description.trim() || null,
      expectedPrice: formData.expectedPrice
        ? Number(formData.expectedPrice)
        : null,
    });

    setSubmitting(false);

    if (result.error) {
      setSubmitError(result.error);
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
        <h3 className="text-xl font-bold text-green-800">
          Valuation Request Submitted!
        </h3>
        <p className="mt-2 text-green-700">
          Thank you, {formData.name}. We have received your vehicle details and
          will be in touch within 24 hours with a valuation for your{" "}
          {formData.year} {formData.make} {formData.model}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-10">
      {/* Section 1: Your Details */}
      <fieldset>
        <legend className="mb-4 text-xl font-bold text-navy">
          Your Details
        </legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        </div>
      </fieldset>

      {/* Section 2: Vehicle Details */}
      <fieldset>
        <legend className="mb-4 text-xl font-bold text-navy">
          Vehicle Details
        </legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            label="Make *"
            name="make"
            value={formData.make}
            onChange={handleChange}
            error={errors.make}
          >
            <option value="">Select make</option>
            {carMakes.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </Select>
          <Input
            label="Model *"
            name="model"
            placeholder="e.g. Corolla"
            value={formData.model}
            onChange={handleChange}
            error={errors.model}
          />
          <Select
            label="Year *"
            name="year"
            value={formData.year}
            onChange={handleChange}
            error={errors.year}
          >
            <option value="">Select year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
          <Input
            label="Mileage (km) *"
            name="mileage"
            type="number"
            min={0}
            placeholder="e.g. 85000"
            value={formData.mileage}
            onChange={handleChange}
            error={errors.mileage}
          />
          <Select
            label="Fuel Type *"
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
            error={errors.fuelType}
          >
            <option value="">Select fuel type</option>
            {fuelTypes.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
          <Select
            label="Transmission *"
            name="transmission"
            value={formData.transmission}
            onChange={handleChange}
            error={errors.transmission}
          >
            <option value="">Select transmission</option>
            {transmissionTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          <Select
            label="Condition *"
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            error={errors.condition}
          >
            <option value="">Select condition</option>
            {conditions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
      </fieldset>

      {/* Section 3: Additional Information */}
      <fieldset>
        <legend className="mb-4 text-xl font-bold text-navy">
          Additional Information
        </legend>
        <div className="grid gap-4">
          <Textarea
            label="Description"
            name="description"
            placeholder="Tell us more about your vehicle - any modifications, damage, service history, etc."
            value={formData.description}
            onChange={handleChange}
          />
          <div className="max-w-sm">
            <Input
              label="Expected Price (NZD, optional)"
              name="expectedPrice"
              type="number"
              min={0}
              placeholder="e.g. 15000"
              value={formData.expectedPrice}
              onChange={handleChange}
            />
          </div>
        </div>
      </fieldset>

      {submitError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {submitError}
        </div>
      )}
      <div>
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Submitting..." : "Request Valuation"}
        </Button>
      </div>
    </form>
  );
}
