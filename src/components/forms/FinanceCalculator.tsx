"use client";

import { useState, useMemo } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

export default function FinanceCalculator() {
  const [vehiclePrice, setVehiclePrice] = useState(25000);
  const [deposit, setDeposit] = useState(5000);
  const [loanTerm, setLoanTerm] = useState(3);
  const [interestRate, setInterestRate] = useState(9.95);

  const results = useMemo(() => {
    const principal = vehiclePrice - deposit;
    if (principal <= 0) {
      return { monthlyPayment: 0, totalInterest: 0, totalAmount: 0 };
    }

    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    if (monthlyRate === 0) {
      const monthlyPayment = principal / numberOfPayments;
      return {
        monthlyPayment,
        totalInterest: 0,
        totalAmount: principal,
      };
    }

    const monthlyPayment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalAmount = monthlyPayment * numberOfPayments;
    const totalInterest = totalAmount - principal;

    return {
      monthlyPayment,
      totalInterest,
      totalAmount,
    };
  }, [vehiclePrice, deposit, loanTerm, interestRate]);

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-NZ", {
      style: "currency",
      currency: "NZD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-silver bg-white shadow-lg">
      <div className="grid md:grid-cols-2">
        {/* Input Panel */}
        <div className="p-6 sm:p-8">
          <h3 className="mb-6 text-xl font-bold text-navy">
            Calculate Your Repayments
          </h3>
          <div className="space-y-4">
            <Input
              label="Vehicle Price (NZD)"
              name="vehiclePrice"
              type="number"
              min={0}
              value={vehiclePrice}
              onChange={(e) => setVehiclePrice(Number(e.target.value))}
            />
            <Input
              label="Deposit (NZD)"
              name="deposit"
              type="number"
              min={0}
              value={deposit}
              onChange={(e) => setDeposit(Number(e.target.value))}
            />
            <Select
              label="Loan Term"
              name="loanTerm"
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
            >
              <option value={1}>1 Year</option>
              <option value={2}>2 Years</option>
              <option value={3}>3 Years</option>
              <option value={4}>4 Years</option>
              <option value={5}>5 Years</option>
            </Select>
            <Input
              label="Interest Rate (%)"
              name="interestRate"
              type="number"
              min={0}
              max={30}
              step={0.05}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Results Panel */}
        <div className="flex flex-col justify-center bg-navy p-6 sm:p-8">
          <h3 className="mb-6 text-xl font-bold text-white">Your Estimate</h3>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-silver">Monthly Payment</p>
              <p className="text-3xl font-bold text-accent">
                {formatCurrency(results.monthlyPayment)}
              </p>
            </div>
            <div className="h-px bg-navy-light" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-silver">Total Interest</p>
                <p className="text-lg font-semibold text-white">
                  {formatCurrency(results.totalInterest)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-silver">Total Amount</p>
                <p className="text-lg font-semibold text-white">
                  {formatCurrency(results.totalAmount)}
                </p>
              </div>
            </div>
            <div className="h-px bg-navy-light" />
            <div>
              <p className="text-sm font-medium text-silver">Loan Amount</p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(Math.max(vehiclePrice - deposit, 0))}
              </p>
            </div>
          </div>
          <p className="mt-6 text-xs text-silver-dark">
            This calculator is for estimation purposes only. Actual rates may vary.
          </p>
        </div>
      </div>
    </div>
  );
}
