package org.nasweo;

import lombok.extern.slf4j.Slf4j;
import org.nasweo.auth.model.User;
import org.nasweo.auth.repository.UserRepository;
import org.nasweo.common.enums.*;
import org.nasweo.contribution.model.Contribution;
import org.nasweo.contribution.model.MemberContributionBalance;
import org.nasweo.contribution.repository.ContributionRepository;
import org.nasweo.contribution.repository.MemberContributionBalanceRepository;
import org.nasweo.loan.dto.LoanApplicationRequest;
import org.nasweo.loan.model.LoanProduct;
import org.nasweo.loan.repository.LoanProductRepository;
import org.nasweo.loan.repository.LoanRepository;
import org.nasweo.loan.service.LoanService;
import org.nasweo.member.model.Member;
import org.nasweo.member.model.NextOfKin;
import org.nasweo.member.repository.MemberRepository;
import org.nasweo.welfare.model.BenevolenceRecord;
import org.nasweo.welfare.repository.BenevolenceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Slf4j
@SpringBootApplication
public class NasweoApplication {

    public static void main(String[] args) {
        SpringApplication.run(NasweoApplication.class, args);
    }

    @Bean
    CommandLineRunner initializeWelfareData(
            UserRepository userRepo,
            PasswordEncoder passwordEncoder,
            MemberRepository memberRepo,
            ContributionRepository contributionRepo,
            MemberContributionBalanceRepository balanceRepo,
            LoanProductRepository productRepo,
            LoanRepository loanRepo,
            LoanService loanService,
            BenevolenceRepository welfareRepo) {

        return args -> {
            log.info("Checking and initializing NASWEO Welfare Organization seed data...");

            // 1. Seed Users
            if (userRepo.count() == 0) {
                userRepo.save(User.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin123"))
                        .fullName("System Administrator")
                        .email("admin@nasweo.or.ke")
                        .roles(Set.of(Role.ROLE_ADMIN))
                        .enabled(true)
                        .build());

                userRepo.save(User.builder()
                        .username("treasurer")
                        .password(passwordEncoder.encode("treasurer123"))
                        .fullName("Welfare Treasurer")
                        .email("treasurer@nasweo.or.ke")
                        .roles(Set.of(Role.ROLE_TREASURER))
                        .enabled(true)
                        .build());

                userRepo.save(User.builder()
                        .username("welfare_officer")
                        .password(passwordEncoder.encode("welfare123"))
                        .fullName("Welfare Manager")
                        .email("welfare@nasweo.or.ke")
                        .roles(Set.of(Role.ROLE_WELFARE_OFFICER))
                        .enabled(true)
                        .build());

                userRepo.save(User.builder()
                        .username("auditor")
                        .password(passwordEncoder.encode("auditor123"))
                        .fullName("Internal Auditor")
                        .email("auditor@nasweo.or.ke")
                        .roles(Set.of(Role.ROLE_AUDITOR))
                        .enabled(true)
                        .build());

                userRepo.save(User.builder()
                        .username("member001")
                        .password(passwordEncoder.encode("member123"))
                        .fullName("Dr. Patrick Mwangi")
                        .email("pmwangi@kalro.org")
                        .payrollNo("NARL-1001")
                        .roles(Set.of(Role.ROLE_MEMBER))
                        .enabled(true)
                        .build());
                log.info("Default security accounts created (admin, treasurer, welfare_officer, auditor, member001).");
            }

            // 2. Seed Members (Scientist at 65, Non-Scientist at 60)
            if (memberRepo.count() == 0) {
                Member m1 = Member.builder()
                        .payrollNo("NARL-1001")
                        .nationalId("11223344")
                        .firstName("Patrick")
                        .lastName("Mwangi")
                        .otherNames("Kamau")
                        .email("pmwangi@kalro.org")
                        .phoneNumber("+254711000101")
                        .dob(LocalDate.of(1965, 8, 14))
                        .employmentCategory(EmploymentCategory.SCIENTIST)
                        .employmentDate(LocalDate.of(1995, 3, 1))
                        .department("Soils & Plant Nutrition")
                        .designation("Principal Research Scientist")
                        .station("NARL Kabete")
                        .status(MemberStatus.ACTIVE)
                        .nextOfKins(List.of(
                                NextOfKin.builder()
                                        .fullName("Grace Wanjiku Mwangi")
                                        .relationship("Spouse")
                                        .phoneNumber("+254722000201")
                                        .nationalId("22334455")
                                        .allocationPercentage(100.0)
                                        .build()
                        ))
                        .build();
                m1.computeRetirementDate();
                memberRepo.save(m1);

                Member m2 = Member.builder()
                        .payrollNo("NARL-1002")
                        .nationalId("33445566")
                        .firstName("Mary")
                        .lastName("Otieno")
                        .otherNames("Akoth")
                        .email("motieno@kalro.org")
                        .phoneNumber("+254733000302")
                        .dob(LocalDate.of(1968, 5, 20))
                        .employmentCategory(EmploymentCategory.NON_SCIENTIST)
                        .employmentDate(LocalDate.of(2001, 7, 15))
                        .department("Accounts & Finance")
                        .designation("Senior Accountant")
                        .station("NARL Kabete")
                        .status(MemberStatus.ACTIVE)
                        .build();
                m2.computeRetirementDate();
                memberRepo.save(m2);

                Member m3 = Member.builder()
                        .payrollNo("NARL-1003")
                        .nationalId("55667788")
                        .firstName("George")
                        .lastName("Kipkorir")
                        .otherNames("Cheruiyot")
                        .email("gkipkorir@kalro.org")
                        .phoneNumber("+254720112233")
                        .dob(LocalDate.of(1962, 11, 2))
                        .employmentCategory(EmploymentCategory.SCIENTIST)
                        .employmentDate(LocalDate.of(1992, 1, 10))
                        .department("Crop Protection")
                        .designation("Senior Scientist - Entomology")
                        .station("NARL Kabete")
                        .status(MemberStatus.ACTIVE)
                        .build();
                m3.computeRetirementDate();
                memberRepo.save(m3);
                log.info("Sample members seeded with statutory retirement age calculations.");
            }

            // 3. Seed Contributions & Balances
            if (contributionRepo.count() == 0) {
                Contribution c1 = Contribution.builder()
                        .payrollNo("NARL-1001")
                        .memberName("Dr. Patrick Mwangi")
                        .periodMonth(1)
                        .periodYear(2026)
                        .shareAmount(new BigDecimal("10000.00"))
                        .benevolenceAmount(new BigDecimal("1500.00"))
                        .paymentMode(PaymentMode.EMPLOYER_CHECKOFF)
                        .referenceNo("CHK-2026-01-1001")
                        .paymentDate(LocalDate.of(2026, 1, 15))
                        .reconciled(true)
                        .build();
                c1.computeTotal();
                contributionRepo.save(c1);

                Contribution c2 = Contribution.builder()
                        .payrollNo("NARL-1001")
                        .memberName("Dr. Patrick Mwangi")
                        .periodMonth(2)
                        .periodYear(2026)
                        .shareAmount(new BigDecimal("10000.00"))
                        .benevolenceAmount(new BigDecimal("1500.00"))
                        .paymentMode(PaymentMode.EMPLOYER_CHECKOFF)
                        .referenceNo("CHK-2026-02-1001")
                        .paymentDate(LocalDate.of(2026, 2, 15))
                        .reconciled(true)
                        .build();
                c2.computeTotal();
                contributionRepo.save(c2);

                MemberContributionBalance b1 = MemberContributionBalance.builder()
                        .payrollNo("NARL-1001")
                        .totalShares(new BigDecimal("420000.00"))
                        .totalBenevolence(new BigDecimal("36000.00"))
                        .cumulativeTotal(new BigDecimal("456000.00"))
                        .lastContributionDate(LocalDate.of(2026, 2, 15))
                        .build();
                balanceRepo.save(b1);

                Contribution c3 = Contribution.builder()
                        .payrollNo("NARL-1002")
                        .memberName("Mary Otieno")
                        .periodMonth(2)
                        .periodYear(2026)
                        .shareAmount(new BigDecimal("7000.00"))
                        .benevolenceAmount(new BigDecimal("1500.00"))
                        .paymentMode(PaymentMode.EMPLOYER_CHECKOFF)
                        .referenceNo("CHK-2026-02-1002")
                        .paymentDate(LocalDate.of(2026, 2, 15))
                        .reconciled(true)
                        .build();
                c3.computeTotal();
                contributionRepo.save(c3);

                MemberContributionBalance b2 = MemberContributionBalance.builder()
                        .payrollNo("NARL-1002")
                        .totalShares(new BigDecimal("280000.00"))
                        .totalBenevolence(new BigDecimal("30000.00"))
                        .cumulativeTotal(new BigDecimal("310000.00"))
                        .lastContributionDate(LocalDate.of(2026, 2, 15))
                        .build();
                balanceRepo.save(b2);
                log.info("Initial member contribution records and balances initialized.");
            }

            // 4. Seed Loan Products & Active Loan
            if (productRepo.count() == 0) {
                productRepo.save(LoanProduct.builder()
                        .code("DEV-01")
                        .name("Development Loan")
                        .description("Long term development loan for assets and projects")
                        .annualInterestRate(new BigDecimal("12.00"))
                        .interestType(InterestType.REDUCING_BALANCE)
                        .maxRepaymentMonths(48)
                        .minAmount(new BigDecimal("50000.00"))
                        .maxAmount(new BigDecimal("2000000.00"))
                        .sharesMultiplier(new BigDecimal("3.0"))
                        .active(true)
                        .build());

                productRepo.save(LoanProduct.builder()
                        .code("EMERG-01")
                        .name("Emergency Loan")
                        .description("Quick emergency assistance processed within 24 hours")
                        .annualInterestRate(new BigDecimal("10.00"))
                        .interestType(InterestType.FLAT_RATE)
                        .maxRepaymentMonths(12)
                        .minAmount(new BigDecimal("10000.00"))
                        .maxAmount(new BigDecimal("150000.00"))
                        .sharesMultiplier(new BigDecimal("1.5"))
                        .active(true)
                        .build());

                productRepo.save(LoanProduct.builder()
                        .code("SCH-01")
                        .name("School Fees Loan")
                        .description("Education financing for members and dependants")
                        .annualInterestRate(new BigDecimal("11.00"))
                        .interestType(InterestType.REDUCING_BALANCE)
                        .maxRepaymentMonths(24)
                        .minAmount(new BigDecimal("20000.00"))
                        .maxAmount(new BigDecimal("400000.00"))
                        .sharesMultiplier(new BigDecimal("2.0"))
                        .active(true)
                        .build());

                productRepo.save(LoanProduct.builder()
                        .code("INST-01")
                        .name("Instant Welfare Loan")
                        .description("Immediate short-term financial bridge")
                        .annualInterestRate(new BigDecimal("12.00"))
                        .interestType(InterestType.FLAT_RATE)
                        .maxRepaymentMonths(6)
                        .minAmount(new BigDecimal("5000.00"))
                        .maxAmount(new BigDecimal("50000.00"))
                        .sharesMultiplier(new BigDecimal("1.0"))
                        .active(true)
                        .build());

                LoanApplicationRequest app = LoanApplicationRequest.builder()
                        .payrollNo("NARL-1001")
                        .memberName("Dr. Patrick Mwangi")
                        .productCode("DEV-01")
                        .principalAmount(new BigDecimal("300000.00"))
                        .repaymentMonths(24)
                        .requestedDisbursementDate(LocalDate.now().minusMonths(3))
                        .build();

                loanService.applyLoan(app, "treasurer");
                log.info("Loan products catalog and initial sample loan initialized.");
            }

            // 5. Seed Benevolence Records
            if (welfareRepo.count() == 0) {
                welfareRepo.save(BenevolenceRecord.builder()
                        .payrollNo("NARL-1001")
                        .memberName("Dr. Patrick Mwangi")
                        .benevolenceType(BenevolenceType.DEATH_OF_DEPENDANT)
                        .beneficiaryName("Late James Mwangi (Father)")
                        .relationship("Father")
                        .occasionDescription("Funeral and condolence support for the passing on of member's late father")
                        .amountProvided(new BigDecimal("40000.00"))
                        .eventDate(LocalDate.now().minusMonths(4))
                        .disbursedDate(LocalDate.now().minusMonths(4).plusDays(2))
                        .paymentMode(PaymentMode.DIRECT_BANK)
                        .voucherReference("WELF-VCH-2025-089")
                        .approvedBy("welfare_officer")
                        .status("DISBURSED")
                        .build());

                welfareRepo.save(BenevolenceRecord.builder()
                        .payrollNo("NARL-1002")
                        .memberName("Mary Otieno")
                        .benevolenceType(BenevolenceType.MEMBER_ILLNESS)
                        .beneficiaryName("Mary Otieno (Self)")
                        .relationship("Self")
                        .occasionDescription("Medical welfare assistance during admission at Nairobi Hospital")
                        .amountProvided(new BigDecimal("25000.00"))
                        .eventDate(LocalDate.now().minusMonths(2))
                        .disbursedDate(LocalDate.now().minusMonths(2).plusDays(3))
                        .paymentMode(PaymentMode.MPESA)
                        .voucherReference("WELF-VCH-2026-012")
                        .approvedBy("welfare_officer")
                        .status("DISBURSED")
                        .build());
                log.info("Benevolence seed records initialized.");
            }

            log.info("===============================================================");
            log.info("NASWEO Welfare Data Management System Unified Backend Ready!");
            log.info("Listening on: http://localhost:8080");
            log.info("H2 Console:   http://localhost:8080/h2-console");
            log.info("===============================================================");
        };
    }
}
