package org.nasweo.member.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberImportResult {
    private int totalRecords;
    private int successfulRecords;
    private int failedRecords;
    private int updatedRecords;
    
    @Builder.Default
    private List<String> errorMessages = new ArrayList<>();
    
    @Builder.Default
    private List<String> warnings = new ArrayList<>();
}
