package org.nasweo.loan.service;

import org.nasweo.common.enums.InterestType;
import org.nasweo.loan.dto.AmortizationScheduleDto;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class AmortizationCalculator {

    private static final MathContext MC = new MathContext(10, RoundingMode.HALF_EVEN);

    public AmortizationScheduleDto calculateSchedule(
            BigDecimal principal,
            BigDecimal annualRate,
            int months,
            InterestType interestType,
            LocalDate startDate) {

        if (interestType == null) {
            interestType = InterestType.REDUCING_BALANCE;
        }
        if (startDate == null) {
            startDate = LocalDate.now();
        }

        if (interestType == InterestType.FLAT_RATE) {
            return calculateFlatRate(principal, annualRate, months, startDate);
        } else {
            return calculateReducingBalance(principal, annualRate, months, startDate);
        }
    }

    private AmortizationScheduleDto calculateReducingBalance(
            BigDecimal principal, BigDecimal annualRate, int months, LocalDate startDate) {

        // Monthly interest rate = (annualRate / 100) / 12
        BigDecimal monthlyRate = annualRate.divide(BigDecimal.valueOf(1200), 8, RoundingMode.HALF_EVEN);

        BigDecimal monthlyPayment;
        if (monthlyRate.compareTo(BigDecimal.ZERO) == 0) {
            monthlyPayment = principal.divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_EVEN);
        } else {
            // Formula: M = P * [ r(1+r)^n ] / [ (1+r)^n - 1 ]
            BigDecimal onePlusR = BigDecimal.ONE.add(monthlyRate);
            BigDecimal onePlusRPowerN = onePlusR.pow(months, MC);

            BigDecimal numerator = monthlyRate.multiply(onePlusRPowerN, MC);
            BigDecimal denominator = onePlusRPowerN.subtract(BigDecimal.ONE, MC);

            monthlyPayment = principal.multiply(numerator.divide(denominator, 8, RoundingMode.HALF_EVEN))
                    .setScale(2, RoundingMode.HALF_EVEN);
        }

        List<AmortizationScheduleDto.ScheduleItem> items = new ArrayList<>();
        BigDecimal balance = principal.setScale(2, RoundingMode.HALF_EVEN);
        BigDecimal totalInterest = BigDecimal.ZERO;
        BigDecimal totalRepayable = BigDecimal.ZERO;

        for (int i = 1; i <= months; i++) {
            LocalDate dueDate = startDate.plusMonths(i);
            BigDecimal interestPortion = balance.multiply(monthlyRate).setScale(2, RoundingMode.HALF_EVEN);
            BigDecimal principalPortion;
            BigDecimal installmentAmount;

            if (i == months) {
                // Last installment: clear remaining balance to avoid rounding dust
                principalPortion = balance;
                installmentAmount = principalPortion.add(interestPortion);
                balance = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_EVEN);
            } else {
                principalPortion = monthlyPayment.subtract(interestPortion);
                installmentAmount = monthlyPayment;
                balance = balance.subtract(principalPortion).setScale(2, RoundingMode.HALF_EVEN);
            }

            totalInterest = totalInterest.add(interestPortion);
            totalRepayable = totalRepayable.add(installmentAmount);

            items.add(AmortizationScheduleDto.ScheduleItem.builder()
                    .installmentNo(i)
                    .dueDate(dueDate)
                    .openingBalance(balance.add(principalPortion))
                    .principalAmount(principalPortion)
                    .interestAmount(interestPortion)
                    .totalInstallment(installmentAmount)
                    .closingBalance(balance)
                    .paidAmount(BigDecimal.ZERO)
                    .status("PENDING")
                    .build());
        }

        return AmortizationScheduleDto.builder()
                .principalAmount(principal)
                .annualInterestRate(annualRate)
                .repaymentMonths(months)
                .interestType(InterestType.REDUCING_BALANCE.name())
                .monthlyPayment(monthlyPayment)
                .totalInterest(totalInterest)
                .totalRepayable(totalRepayable)
                .scheduleItems(items)
                .build();
    }

    private AmortizationScheduleDto calculateFlatRate(
            BigDecimal principal, BigDecimal annualRate, int months, LocalDate startDate) {

        // Total interest = Principal * (Rate / 100) * (Months / 12)
        BigDecimal rateFraction = annualRate.divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_EVEN);
        BigDecimal timeYears = BigDecimal.valueOf(months).divide(BigDecimal.valueOf(12), 6, RoundingMode.HALF_EVEN);
        BigDecimal totalInterest = principal.multiply(rateFraction).multiply(timeYears).setScale(2, RoundingMode.HALF_EVEN);
        BigDecimal totalRepayable = principal.add(totalInterest);

        BigDecimal monthlyPrincipal = principal.divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_EVEN);
        BigDecimal monthlyInterest = totalInterest.divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_EVEN);
        BigDecimal monthlyPayment = monthlyPrincipal.add(monthlyInterest);

        List<AmortizationScheduleDto.ScheduleItem> items = new ArrayList<>();
        BigDecimal balance = principal.setScale(2, RoundingMode.HALF_EVEN);

        for (int i = 1; i <= months; i++) {
            LocalDate dueDate = startDate.plusMonths(i);
            BigDecimal principalPortion = (i == months) ? balance : monthlyPrincipal;
            balance = balance.subtract(principalPortion).setScale(2, RoundingMode.HALF_EVEN);

            items.add(AmortizationScheduleDto.ScheduleItem.builder()
                    .installmentNo(i)
                    .dueDate(dueDate)
                    .openingBalance(balance.add(principalPortion))
                    .principalAmount(principalPortion)
                    .interestAmount(monthlyInterest)
                    .totalInstallment(monthlyPayment)
                    .closingBalance(balance)
                    .paidAmount(BigDecimal.ZERO)
                    .status("PENDING")
                    .build());
        }

        return AmortizationScheduleDto.builder()
                .principalAmount(principal)
                .annualInterestRate(annualRate)
                .repaymentMonths(months)
                .interestType(InterestType.FLAT_RATE.name())
                .monthlyPayment(monthlyPayment)
                .totalInterest(totalInterest)
                .totalRepayable(totalRepayable)
                .scheduleItems(items)
                .build();
    }
}
