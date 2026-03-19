"use client";

import { useState } from "react";
import { BasicConditionGuide, BcgCategory, BcgItemStatus } from "@/types/car";

interface BcgSectionProps {
  bcg?: BasicConditionGuide;
}

const statusColors: Record<BcgItemStatus, string> = {
  OK: "bg-green-100 text-green-700",
  "Requires Attention": "bg-amber-100 text-amber-700",
  "N/A": "bg-gray-100 text-gray-500",
};

const categoryOrder: BcgCategory[] = [
  "Engine",
  "Transmission",
  "Brakes",
  "Tyres",
  "Suspension",
  "Air Conditioning / Heater",
  "Electrical / Accessories",
];

export default function BcgSection({ bcg }: BcgSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <button
        onClick={() => bcg && setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <ClipboardIcon />
          <h2 className="text-xl font-bold text-navy">
            Basic Condition Guide
          </h2>
        </div>
        {bcg && (
          <ChevronIcon
            className={`h-5 w-5 text-silver-dark transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {!bcg ? (
        <p className="mt-4 text-sm text-silver-dark italic">
          BCG information is not yet available for this vehicle.
        </p>
      ) : (
        isOpen && (
          <div className="mt-6 space-y-6">
            {/* Inspection info */}
            <div className="grid grid-cols-1 gap-3 rounded-lg bg-gray-50 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-silver-dark">Inspection Date</p>
                <p className="text-sm font-medium text-navy">
                  {bcg.inspectionDate}
                </p>
              </div>
              <div>
                <p className="text-xs text-silver-dark">Inspected By</p>
                <p className="text-sm font-medium text-navy">
                  {bcg.inspectorName}
                </p>
              </div>
              <div>
                <p className="text-xs text-silver-dark">Published By</p>
                <p className="text-sm font-medium text-navy">
                  {bcg.publisherName}
                </p>
              </div>
            </div>

            {/* Checklist table */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-navy uppercase tracking-wide">
                Inspection Checklist
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-2 pr-4 text-left text-xs font-semibold text-silver-dark">
                        Item
                      </th>
                      <th className="py-2 text-right text-xs font-semibold text-silver-dark">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryOrder.map((category) => {
                      const items = bcg.checklist.filter(
                        (item) => item.category === category
                      );
                      if (items.length === 0) return null;
                      return (
                        <CategoryGroup
                          key={category}
                          category={category}
                          items={items}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tyre depths */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-navy uppercase tracking-wide">
                Tyre Tread Depths
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <TyreCell label="Front Left" value={bcg.tyreDepths.frontLeft} />
                <TyreCell
                  label="Front Right"
                  value={bcg.tyreDepths.frontRight}
                />
                <TyreCell label="Rear Left" value={bcg.tyreDepths.rearLeft} />
                <TyreCell label="Rear Right" value={bcg.tyreDepths.rearRight} />
                <TyreCell
                  label="Spare"
                  value={bcg.tyreDepths.spare}
                />
              </div>
            </div>

            {/* Interior condition */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-navy uppercase tracking-wide">
                Interior Condition
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Object.entries(bcg.interiorCondition).map(([key, value]) => (
                  <div key={key} className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs capitalize text-silver-dark">{key}</p>
                    <p className="text-sm font-medium text-navy">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments */}
            {bcg.bodyComments && (
              <CommentBlock label="Body Inspection Comments" text={bcg.bodyComments} />
            )}
            {bcg.underCarriageComments && (
              <CommentBlock
                label="Under Carriage & Under Bonnet Comments"
                text={bcg.underCarriageComments}
              />
            )}
            {bcg.generalComments && (
              <CommentBlock label="General Comments" text={bcg.generalComments} />
            )}

            {/* Conditions & timing */}
            <div className="divide-y divide-gray-100 rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-silver-dark">
                  Conditions During Body Inspection
                </span>
                <span className="text-sm font-medium text-navy">
                  {bcg.bodyConditions}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-silver-dark">
                  Road Conditions During Test Drive
                </span>
                <span className="text-sm font-medium text-navy">
                  {bcg.roadConditions}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-silver-dark">
                  Engine Timing Mechanism
                </span>
                <span className="text-sm font-medium text-navy">
                  {bcg.engineTimingMechanism}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-silver-dark">
                  Cam Belt Replaced
                </span>
                <span className="text-sm font-medium text-navy">
                  {bcg.camBeltReplaced === null
                    ? "N/A"
                    : bcg.camBeltReplaced
                    ? `Yes${bcg.camBeltReplacedKms ? ` at ${bcg.camBeltReplacedKms.toLocaleString()} km` : ""}`
                    : "No"}
                </span>
              </div>
            </div>

            <p className="text-xs text-silver-dark">
              This report is not a warranty. It is a guide only, with consideration
              made for age and mileage. The vendor recommends a full mechanical
              inspection prior to purchase.
            </p>
          </div>
        )
      )}
    </div>
  );
}

function CategoryGroup({
  category,
  items,
}: {
  category: string;
  items: { item: string; status: BcgItemStatus; comment?: string }[];
}) {
  return (
    <>
      <tr>
        <td
          colSpan={2}
          className="pt-4 pb-1 text-sm font-semibold text-navy"
        >
          {category}
        </td>
      </tr>
      {items.map((item) => (
        <tr key={item.item} className="border-b border-gray-50">
          <td className="py-2 pr-4 text-silver-dark">
            {item.item}
            {item.comment && (
              <span className="ml-2 text-xs italic text-silver-dark">
                ({item.comment})
              </span>
            )}
          </td>
          <td className="py-2 text-right">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                statusColors[item.status]
              }`}
            >
              {item.status}
            </span>
          </td>
        </tr>
      ))}
    </>
  );
}

function TyreCell({
  label,
  value,
}: {
  label: string;
  value?: number;
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-3 text-center">
      <p className="text-xs text-silver-dark">{label}</p>
      <p className="text-lg font-semibold text-navy">
        {value != null ? `${value} mm` : "N/A"}
      </p>
    </div>
  );
}

function CommentBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-navy uppercase tracking-wide">
        {label}
      </h3>
      <p className="text-sm leading-relaxed text-silver-dark">{text}</p>
    </div>
  );
}

function ClipboardIcon() {
  return (
    <svg
      className="h-6 w-6 text-accent"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
      />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
      />
    </svg>
  );
}
