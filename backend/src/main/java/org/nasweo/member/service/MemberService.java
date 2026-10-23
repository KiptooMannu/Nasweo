package org.nasweo.member.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nasweo.common.enums.EmploymentCategory;
import org.nasweo.common.enums.MemberStatus;
import org.nasweo.member.dto.MemberDto;
import org.nasweo.member.model.Member;
import org.nasweo.member.repository.MemberRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;

    @Transactional
    public MemberDto createMember(MemberDto dto) {
        if (memberRepository.existsByPayrollNo(dto.getPayrollNo())) {
            throw new IllegalArgumentException("Payroll Number already exists: " + dto.getPayrollNo());
        }
        if (memberRepository.existsByNationalId(dto.getNationalId())) {
            throw new IllegalArgumentException("National ID already exists: " + dto.getNationalId());
        }

        Member member = Member.builder()
                .payrollNo(dto.getPayrollNo())
                .nationalId(dto.getNationalId())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .otherNames(dto.getOtherNames())
                .email(dto.getEmail())
                .phoneNumber(dto.getPhoneNumber())
                .dob(dto.getDob())
                .employmentCategory(dto.getEmploymentCategory())
                .employmentDate(dto.getEmploymentDate())
                .department(dto.getDepartment())
                .designation(dto.getDesignation())
                .station(dto.getStation() != null ? dto.getStation() : "NARL Kabete")
                .status(dto.getStatus() != null ? dto.getStatus() : MemberStatus.ACTIVE)
                .nextOfKins(dto.getNextOfKins() != null ? dto.getNextOfKins() : List.of())
                .build();

        // Calculate retirement date: Scientists at 65, Non-scientists at 60
        member.computeRetirementDate();

        Member saved = memberRepository.save(member);
        return mapToDto(saved);
    }

    @Transactional
    public MemberDto updateMember(Long id, MemberDto dto) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Member not found with ID: " + id));

        member.setFirstName(dto.getFirstName());
        member.setLastName(dto.getLastName());
        member.setOtherNames(dto.getOtherNames());
        member.setEmail(dto.getEmail());
        member.setPhoneNumber(dto.getPhoneNumber());
        member.setDob(dto.getDob());
        member.setEmploymentCategory(dto.getEmploymentCategory());
        member.setDepartment(dto.getDepartment());
        member.setDesignation(dto.getDesignation());
        if (dto.getStation() != null) member.setStation(dto.getStation());
        if (dto.getStatus() != null) member.setStatus(dto.getStatus());
        if (dto.getNextOfKins() != null) member.setNextOfKins(dto.getNextOfKins());

        member.computeRetirementDate();

        Member updated = memberRepository.save(member);
        return mapToDto(updated);
    }

    public MemberDto getMemberById(Long id) {
        return memberRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new IllegalArgumentException("Member not found with ID: " + id));
    }

    public MemberDto getMemberByPayrollNo(String payrollNo) {
        return memberRepository.findByPayrollNo(payrollNo)
                .map(this::mapToDto)
                .orElseThrow(() -> new IllegalArgumentException("Member not found with Payroll No: " + payrollNo));
    }

    public Page<MemberDto> searchMembers(String query, MemberStatus status, EmploymentCategory category, Pageable pageable) {
        return memberRepository.searchMembers(query, status, category, pageable)
                .map(this::mapToDto);
    }

    public List<MemberDto> getUpcomingRetirements(int months) {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusMonths(months);

        return memberRepository.findByStatusAndRetirementDateBetween(MemberStatus.ACTIVE, startDate, endDate)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getMembershipStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMembers", memberRepository.count());
        stats.put("activeMembers", memberRepository.countByStatus(MemberStatus.ACTIVE));
        stats.put("retiredMembers", memberRepository.countByStatus(MemberStatus.RETIRED));
        stats.put("scientists", memberRepository.countByEmploymentCategory(EmploymentCategory.SCIENTIST));
        stats.put("nonScientists", memberRepository.countByEmploymentCategory(EmploymentCategory.NON_SCIENTIST));

        // Upcoming retirements within 12 months
        List<MemberDto> retiringSoon = getUpcomingRetirements(12);
        stats.put("retiringWithin12Months", retiringSoon.size());

        return stats;
    }

    public MemberDto mapToDto(Member member) {
        return MemberDto.builder()
                .id(member.getId())
                .payrollNo(member.getPayrollNo())
                .nationalId(member.getNationalId())
                .firstName(member.getFirstName())
                .lastName(member.getLastName())
                .otherNames(member.getOtherNames())
                .email(member.getEmail())
                .phoneNumber(member.getPhoneNumber())
                .dob(member.getDob())
                .employmentCategory(member.getEmploymentCategory())
                .employmentDate(member.getEmploymentDate())
                .retirementDate(member.getRetirementDate())
                .currentAge(member.getCurrentAge())
                .yearsToRetirement(member.getYearsToRetirement())
                .department(member.getDepartment())
                .designation(member.getDesignation())
                .station(member.getStation())
                .status(member.getStatus())
                .nextOfKins(member.getNextOfKins())
                .build();
    }
}
